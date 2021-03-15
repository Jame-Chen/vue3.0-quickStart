import { settingTemplate } from '@/config/defaultSetting';
import bus from '@/assets/js/eventBus.js'
import initArcgis from '@/components/ArcgisMap/js/arcgis_map';
import axios from 'axios'
import qs from 'qs';
import tool from '@/assets/js/tool.js';
import { Message, MessageBox } from 'element-ui'
import { getEmergencyPersonInfo } from "@/api/Emergency.js"
import moment from "moment";
export default {
    name: "common",
    mapEvent: {},
    isMapLocation: false,
    imagesList: [{
        name: "",
        type: "路面",
        width: 32,
        height: 48,
        url: require("@/assets/images/Map/ico_map_daol.png")
    }, {
        name: "",
        type: "桥梁",
        width: 32,
        height: 48,
        url: require("@/assets/images/Map/ico_map_qiaol.png")
    }, {
        name: "",
        type: "护栏",
        width: 32,
        height: 48,
        url: require("@/assets/images/Map/ico_map_weil.png")
    }, {
        name: "空闲",
        type: "0",
        width: 32,
        height: 48,
        url: require("@/assets/images/Map/ico_map_yingjcz_kogx.png")
    }, {
        name: "空闲",
        type: "1",
        width: 32,
        height: 48,
        url: require("@/assets/images/Map/ico_map_shutry.png")
    }, {
        name: "执行",
        type: "2",
        width: 32,
        height: 48,
        url: require("@/assets/images/Map/ico_map_yingjcz_zix.png")
    }, {
        name: "应急",
        type: "yingji",
        width: 32,
        height: 48,
        url: require("@/assets/images/Map/ico_map_yingjcz_shij.png")
    }],
    /**
     * 根据地图服务获取数据
     * @param {*} querysql 查询条件
     * @param {*} 返回数据接收的方法
     * @param {*} islocation 是否是定位
     */
    getRoadData(querysql, f, islocation) {
        initArcgis.getDataByMapService(settingTemplate.dynamicLayers[0].url + "/0", function(response) {
            if (response.features.length > 0) {
                f(response.features)
                initArcgis.mapLocation(response.features[0].geometry, islocation);
            }
        }, { qWhere: querysql, outField: ["S_NAME", "S_QD_ROAD", "S_ZD_ROAD", "S_ROAD_ID", "S_ROAD_ZID"] });
    },
    /**
     * 杨浦设施图层控制
     * @param {*} layerId 图层编码
     * @param {*} checked 选中状态
     * @param {*} tableId 对应的表
     * @param {*} layerUrl 设施服务地址
     */
    loadCheckedFeatureLayerOnMap(layerId, checked, tableId, layerUrl, layerDefinitions) {
        var that = this;
        if (checked) {
            if (layerUrl.includes("FeatureServer")) {
                if (layerId.includes(",")) {
                    layerId.split(",").forEach(item => {
                        var layerurl = settingTemplate.arcgisServiceUrl + layerUrl + "/" + item;
                        var fearturLayer = new initArcgis.gisConstructor.FeatureLayer(layerurl, {
                            id: tableId + "_" + item + "_FeatureLayer_layerControl",
                            mode: initArcgis.gisConstructor.FeatureLayer.MODE_ONDEMAND,
                            outFields: ["*"],
                            showLabels: true
                        });

                        initArcgis.gisInst[tableId + "_" + item + "_FeatureLayer_layerControl"] = fearturLayer;
                        initArcgis.gisInst.map.addLayer(fearturLayer);
                    });
                } else {
                    var layerurl = settingTemplate.arcgisServiceUrl + layerUrl + "/" + layerId;
                    var fearturLayer = new initArcgis.gisConstructor.FeatureLayer(layerurl, {
                        id: tableId + "_" + layerId + "_FeatureLayer_layerControl",
                        mode: initArcgis.gisConstructor.FeatureLayer.MODE_ONDEMAND,
                        outFields: ["*"],
                        showLabels: true
                    });

                    initArcgis.gisInst[tableId + "_" + layerId + "_FeatureLayer_layerControl"] = fearturLayer;
                    initArcgis.gisInst.map.addLayer(fearturLayer);

                    if (tableId === "Enclosure") {
                        that.startDrawFence(fearturLayer, layerurl);
                    }
                }

                for (const key in initArcgis.gisInst) {
                    if (initArcgis.gisInst.hasOwnProperty(key)) {
                        if (key.includes("FeatureLayer_layerControl")) {
                            const elementLayer = initArcgis.gisInst[key];
                            var eventName = "event_" + key;
                            eventName = elementLayer.on("click", function(evt) {
                                console.log("evt: ", evt);
                                var obj = {
                                    show: true,
                                    width: "30%",
                                    geotype: evt.graphic.geometry.type,
                                    type: key.split("_FeatureLayer_layerControl")[0],
                                    data: evt.graphic,
                                    targetLayer: elementLayer
                                }
                                bus.$emit("featureLayerClick", obj);
                            });
                            that.mapEvent["event_" + key] = eventName;
                        }
                    }
                }
            } else {
                var layerIdArray = [];
                if (layerId.includes(",")) {
                    layerIdArray = layerId.split(",");
                } else {
                    layerIdArray.push(layerId);
                }
                if (initArcgis.gisInst[tableId + "_DynamicMapServiceLayer_layerControl"]) {
                    that.clearDynamicMapServiceLayer(tableId);
                }
                var layerurl = settingTemplate.arcgisServiceUrl + layerUrl;
                var dynamicLayer = new initArcgis.gisConstructor.ArcGISDynamicMapServiceLayer(layerurl, {
                    id: tableId + "_DynamicMapServiceLayer_layerControl"
                });

                dynamicLayer.setImageFormat('png32');
                dynamicLayer.setImageTransparency(true);
                dynamicLayer.setRefreshInterval(0.05) //以分钟为单位0.05分钟
                dynamicLayer.setVisibility(true);
                dynamicLayer.setVisibleLayers(layerIdArray);
                if (layerDefinitions) {
                    dynamicLayer.setLayerDefinitions(layerDefinitions);
                    that.isMapLocation = false;
                } else {
                    that.isMapLocation = true;
                }
                initArcgis.gisInst.map.addLayer(dynamicLayer, 3);
                initArcgis.gisInst[tableId + "_DynamicMapServiceLayer_layerControl"] = dynamicLayer;

                var identifyTaskParams = { layerUrl: layerurl, qGeometry: "point", clickEvent: "event_" + tableId + "_DynamicMapServiceLayer_layerControl" };
                identifyTaskParams["layerIds"] = layerIdArray;
                identifyTaskParams["resultFun"] = identifyTaskResultFun;
                initArcgis.getDataByIdentifyTask(identifyTaskParams);

                function identifyTaskResultFun(response) {
                    console.log("response:  ", response);
                    if (response.length > 0) {
                        var obj = {
                            show: true,
                            width: "30%",
                            geotype: response[0].feature.geometry.type,
                            type: tableId,
                            data: response[0].feature,
                            targetLayer: ""
                        }
                        if (response[0].layerName == "排水泵站" || response[0].layerName.includes("积水点")) {
                            bus.$emit("identifyTaskResult", obj);
                        } else {
                            bus.$emit("featureLayerClick", obj);
                        }
                        initArcgis.mapLocation(response[0].feature.geometry, true);
                    } else {
                        Message({
                            message: "点击处没有查询到结果。",
                            type: 'warning',
                            customClass: 'usermessage'
                        });
                    }
                }
            }
        } else {
            if (layerUrl.includes("FeatureServer")) {
                if (layerId.includes(",")) {
                    layerId.split(",").forEach(item => {
                        var layer = initArcgis.gisInst.map.getLayer(tableId + "_" + item + "_FeatureLayer_layerControl");
                        initArcgis.gisInst.map.removeLayer(layer)

                        delete initArcgis.gisInst[tableId + "_" + item + "_FeatureLayer_layerControl"]

                        that.mapEvent["event_" + tableId + "_" + item + "_FeatureLayer_layerControl"].remove();
                    });
                } else {
                    var layer = initArcgis.gisInst.map.getLayer(tableId + "_" + layerId + "_FeatureLayer_layerControl");
                    initArcgis.gisInst.map.removeLayer(layer)

                    delete initArcgis.gisInst[tableId + "_" + layerId + "_FeatureLayer_layerControl"]

                    that.mapEvent["event_" + tableId + "_" + layerId + "_FeatureLayer_layerControl"].remove();
                }

                for (const key in that.mapEvent) {
                    if (that.mapEvent.hasOwnProperty(key)) {
                        if (key.includes("menu")) {
                            that.mapEvent[key].destroy();
                        } else {
                            that.mapEvent[key].remove();
                        }
                    }
                }
            } else {
                var layer = initArcgis.gisInst.map.getLayer(tableId + "_DynamicMapServiceLayer_layerControl");
                initArcgis.gisInst.map.removeLayer(layer);
                delete initArcgis.gisInst[tableId + "_DynamicMapServiceLayer_layerControl"];

                initArcgis.clickEventArray.forEach((item, index) => {
                    for (const key in item) {
                        if (key == ("event_" + tableId + "_DynamicMapServiceLayer_layerControl")) {
                            if (item[key] != null) {
                                item[key].remove()
                                initArcgis.clickEventArray.splice(initArcgis.clickEventArray.findIndex(index1 => index1 === parseInt(index)), 1)
                            }
                        }
                    }
                })
            }

            for (const key in initArcgis.gisInst) {
                if (initArcgis.gisInst.hasOwnProperty(key)) {
                    if (key.includes("GraphicsLayer")) {
                        const elementLayer = initArcgis.gisInst[key];
                        elementLayer.clear();
                        initArcgis.gisInst.map.removeLayer(elementLayer);
                    }
                }
            }
        }
    },
    clearDynamicMapServiceLayer(tableId) {
        var layer = initArcgis.gisInst.map.getLayer(tableId + "_DynamicMapServiceLayer_layerControl");
        initArcgis.gisInst.map.removeLayer(layer);
        delete initArcgis.gisInst[tableId + "_DynamicMapServiceLayer_layerControl"];

        initArcgis.clickEventArray.forEach((item, index) => {
            for (const key in item) {
                if (key == ("event_" + tableId + "_DynamicMapServiceLayer_layerControl")) {
                    if (item[key] != null) {
                        item[key].remove()
                        initArcgis.clickEventArray.splice(initArcgis.clickEventArray.findIndex(index1 => index1 === parseInt(index)), 1)
                    }
                }
            }
        })

        for (const key in initArcgis.gisInst) {
            if (initArcgis.gisInst.hasOwnProperty(key)) {
                if (key.includes("GraphicsLayer")) {
                    const elementLayer = initArcgis.gisInst[key];
                    elementLayer.clear();
                    initArcgis.gisInst.map.removeLayer(elementLayer);
                }
            }
        }
    },
    //绘制围栏
    startDrawFence(fenceFeatureLayer, layerUrl, tableId) {
        var that = this;

        var sls = new initArcgis.gisConstructor.SimpleLineSymbol(initArcgis.gisConstructor.SimpleLineSymbol.STYLE_SOLID, new initArcgis.gisConstructor.Color([255, 0, 0]), 5);

        var toolbar = new initArcgis.gisConstructor.draw(initArcgis.gisInst.map);
        initArcgis.gisInst["drawtoolbar"] = toolbar;

        var editToolbar = new initArcgis.gisConstructor.edit(initArcgis.gisInst.map);

        initArcgis.gisInst["edittoolbar"] = editToolbar;

        createGraphicsMenu();
        var selected;

        function createGraphicsMenu() {
            var ctxMenuForGraphics = new initArcgis.gisConstructor.Menu({});
            ctxMenuForGraphics.addChild(new initArcgis.gisConstructor.MenuItem({
                label: "Edit",
                onClick: function() {
                    if (selected.geometry.type !== "point") {
                        editToolbar.activate(initArcgis.gisConstructor.edit.EDIT_VERTICES, selected);
                    } else {
                        alert("Not implemented");
                    }
                }
            }))
            ctxMenuForGraphics.addChild(new initArcgis.gisConstructor.MenuItem({
                label: "Move",
                onClick: function() {
                    editToolbar.activate(initArcgis.gisConstructor.edit.MOVE, selected);
                }
            }));

            ctxMenuForGraphics.addChild(new initArcgis.gisConstructor.MenuItem({
                label: "Rotate/Scale",
                onClick: function() {
                    if (selected.geometry.type !== "point") {
                        editToolbar.activate(initArcgis.gisConstructor.edit.ROTATE | initArcgis.gisConstructor.edit.SCALE, selected);
                    } else {
                        alert("Not implemented");
                    }
                }
            }));
            ctxMenuForGraphics.addChild(new initArcgis.gisConstructor.MenuItem({
                label: "删除护栏",
                onClick: function() {
                    var data = {
                        f: "json",
                        deletes: selected.attributes.OBJECTID
                    }
                    tool.featureLayerEditApi(layerUrl, qs.stringify(data), "deleteResults", function(success) {
                        if (success) {
                            fenceFeatureLayer.refresh();
                        }
                    });
                    if (editToolbar) {
                        editToolbar.deactivate();
                    }
                }
            }));
            ctxMenuForGraphics.addChild(new initArcgis.gisConstructor.MenuItem({
                label: "保存",
                onClick: function() {
                    console.log("selected: ", selected);
                    // fenceFeatureLayer.applyEdits(null,[selected],null);

                    var addgraphic = {
                        "geometry": { "paths": selected.geometry.paths, "spatialReference": selected.geometry.spatialReference },
                        "attributes": selected.attributes
                    }

                    var data = {
                        f: "json",
                        updates: JSON.stringify([addgraphic])
                    }
                    tool.featureLayerEditApi(layerUrl, qs.stringify(data), "updateResults", function(success) {
                        if (success) {
                            fenceFeatureLayer.refresh();
                        }
                    });

                    if (editToolbar) {
                        editToolbar.deactivate();
                    }
                }
            }));
            ctxMenuForGraphics.addChild(new initArcgis.gisConstructor.MenuItem({
                label: "属性信息",
                onClick: function() {
                    var obj = {
                        show: true,
                        data: selected,
                        layer: fenceFeatureLayer,
                        layerurl: layerUrl
                    }
                    bus.$emit("fenceAttributeShow", obj);
                    if (editToolbar) {
                        editToolbar.deactivate();
                    }
                }
            }));
            ctxMenuForGraphics.startup();

            that.mapEvent["menu_featureLayer_mouseover"] = ctxMenuForGraphics;

            var event_featureLayer_mouseover = fenceFeatureLayer.on("mouse-over", function(evt) {
                initArcgis.gisInst.map.setMapCursor("pointer");
                // We'll use this "selected" graphic to enable editing tools
                // on this graphic when the user click on one of the tools
                // listed in the menu.
                selected = evt.graphic;

                // Let's bind to the graphic underneath the mouse cursor           
                ctxMenuForGraphics.bindDomNode(evt.graphic.getDojoShape().getNode());
            });

            var event_featureLayer_mouseout = fenceFeatureLayer.on("mouse-out", function(evt) {
                initArcgis.gisInst.map.setMapCursor("default");
                ctxMenuForGraphics.unBindDomNode(evt.graphic.getDojoShape().getNode());
            });

            that.mapEvent["event_featureLayer_mouseout"] = event_featureLayer_mouseout;
            that.mapEvent["event_featureLayer_mouseover"] = event_featureLayer_mouseover;

            var ctxMenu = new initArcgis.gisConstructor.Menu({
                targetNodeIds: ["SewerDredging_map"]
            });
            ctxMenu.addChild(new initArcgis.gisConstructor.MenuItem({
                label: "新增护栏",
                onClick: function() {
                    toolbar.activate(initArcgis.gisConstructor.draw["POLYLINE"]);
                    toolbar.on("draw-end", function(evt) {
                        toolbar.deactivate();
                        var incidentAttributes = {
                            S_Enclosure_ID: new Date().getTime(),
                            S_Enclosure_SUBTYPE: '中心护栏',
                            N_Enclosure_Len: 20
                        };

                        var graphic = new initArcgis.gisConstructor.graphic(evt.geometry, sls, incidentAttributes);
                        // layer.add(graphic);
                        // fenceFeatureLayer.applyEdits([graphic],null,null);
                        // fenceFeatureLayer.refresh();

                        var data = {
                            f: "json",
                            adds: JSON.stringify([graphic])
                        }
                        tool.featureLayerEditApi(layerUrl, qs.stringify(data), "addResults", function(success) {
                            if (success) {
                                fenceFeatureLayer.refresh();
                            }
                        });
                    })

                    if (editToolbar) {
                        editToolbar.deactivate();
                    }

                    if (editToolbar) {
                        editToolbar.deactivate();
                    }
                }
            }))
            var event_map_mouseover = initArcgis.gisInst.map.on('mouse-move', function(evt) {
                ctxMenu.startup();
            });
            that.mapEvent["event_map_mouseover"] = event_map_mouseover;
            that.mapEvent["menu_map_mouseover"] = ctxMenu;
        };
    },
    /**
     * 清除图层
     */
    clearLocationLayer() {
        var that = this;
        for (const key in initArcgis.gisInst) {
            if (initArcgis.gisInst.hasOwnProperty(key)) {
                if (key.includes("GraphicsLayer")) {
                    const layer = initArcgis.gisInst[key];
                    if (layer) {
                        layer.clear();
                        initArcgis.gisInst.map.removeLayer(layer);
                        delete initArcgis.gisInst[key];
                    }

                    if (key.includes("geometryLocaltion_GraphicsLayer")) {
                        initArcgis.gisInst.map.centerAndZoom(new initArcgis.gisConstructor.Point(settingTemplate.x, settingTemplate.y, initArcgis.gisInst.map.spatialReference), settingTemplate.level)
                    }
                }
            }
        }
    },
    /**
     * 计划新增 在地图上选取路段
     */
    selectRoadOnMap(f) {
        var that = this;

        that.clearLocationLayer();

        var layer = initArcgis.gisInst.map.getLayer("YPRoad_FeatureLayer");
        if (layer) {
            initArcgis.gisInst.map.removeLayer(layer);
            delete initArcgis.gisInst["YPRoad_FeatureLayer"];
            for (const key in that.mapEvent) {
                if (that.mapEvent.hasOwnProperty(key)) {
                    if (key.includes("roadselect")) {
                        that.mapEvent[key].remove();
                    }
                }
            }
        }

        var layerUrl = settingTemplate.FeatureLayers[1].url + "/0";
        console.log("layerUrl: ", layerUrl);
        var fearturLayer = new initArcgis.gisConstructor.FeatureLayer(layerUrl, {
            id: "YPRoad_FeatureLayer",
            mode: initArcgis.gisConstructor.FeatureLayer.MODE_SNAPSHOT,
            outFields: ["*"],
            showLabels: true
        });

        initArcgis.gisInst["YPRoad_FeatureLayer"] = fearturLayer;
        initArcgis.gisInst.map.addLayer(fearturLayer);

        var event_featureLayer_roadselect_mouseover = fearturLayer.on("mouse-over", function(evt) {
            initArcgis.gisInst.map.setMapCursor("pointer");
        })
        var event_featureLayer_roadselect_mouseout = fearturLayer.on("mouse-out", function(evt) {
            initArcgis.gisInst.map.setMapCursor("default");
        })

        var event_featureLayer_roadselect_click = fearturLayer.on("click", function(evt) {

            that.clearLocationLayer();

            var layer = new initArcgis.gisConstructor.GraphicsLayer({ id: "roadTempLayer" });
            var sls = new initArcgis.gisConstructor.SimpleLineSymbol(initArcgis.gisConstructor.SimpleLineSymbol.STYLE_SOLID, new initArcgis.gisConstructor.Color([255, 0, 0]), 5);
            var graphic = new initArcgis.gisConstructor.graphic(evt.graphic.geometry, sls);
            layer.add(graphic);
            initArcgis.gisInst.map.addLayer(layer);

            initArcgis.gisInst["roadTempLayer_GraphicsLayer"] = layer;

            f(evt.graphic.attributes);
        })

        that.mapEvent["event_featureLayer_roadselect_mouseover"] = event_featureLayer_roadselect_mouseover;
        that.mapEvent["event_featureLayer_roadselect_mouseout"] = event_featureLayer_roadselect_mouseout;
        that.mapEvent["event_featureLayer_roadselect_click"] = event_featureLayer_roadselect_click;
    },
    /**
     * 根据地图服务获取数据
     * @param {*} querysql 查询条件
     * @param {*} 返回数据接收的方法
     * @param {*} islocation 是否是定位
     */
    getPOIData(querysql, f, islocation) {
        initArcgis.getDataByMapService(settingTemplate.dynamicLayers[1].url + "/0", function(response) {
            if (response.features.length > 0) {
                f(response.features)
                if (islocation) {
                    initArcgis.mapLocation(response.features[0].geometry, true);
                }
            }
        }, { qWhere: querysql });
    },
    /**
     * 通过天地图接口根据地址获取该地址所处的坐标
     * @param {*} address 当前地址
     * @param {*} f 返回的结果
     */
    getXYByAddress(address, f) {
        if (!address.includes("上海")) {
            address = "上海市" + address;
        }
        var url = 'http://api.tianditu.gov.cn/geocoder?ds={keyWord:"' + address.trim() + '"}&tk=64f596e46064c26f65ad068b949a32b8'
        axios.get(url).then(function(response) {
            f(response.data);
        });
    },
    /**
     * 通过天地图接口根据坐标获取该坐标所处的地址
     * @param {*} point 当前坐标
     * @param {*} f 返回结果
     */
    getAddressByXY(point, f) {
        var url = "http://api.tianditu.gov.cn/geocoder?postStr={'lon':" + point.x + ",'lat':" + point.y + ",'ver':1}&type=geocode&tk=64f596e46064c26f65ad068b949a32b8";
        axios.get(url).then(function(response) {
            f(response.data);
        });
    },
    /**
     * 根据关键字查询天地图的POI数据
     * @param {*} querystring 查询结果
     * @param {*} f 结果返回值
     */
    getTDTPOIData(querystring, f) {
        if (!querystring.includes("上海")) {
            querystring = "上海市" + querystring;
        }
        var url = 'http://api.tianditu.gov.cn/search?postStr={"keyWord":"' + querystring + '","level":"15","mapBound":"116.40569,39.91088,116.45119,39.93542","queryType":"7","count":"100","start":"0","queryTerminal":"10000"}&type=query&tk=64f596e46064c26f65ad068b949a32b8';
        axios.get(url).then(function(response) {
            f(response.data);
        });
    },
    /**
     * 关键字搜索
     * @param {*} querystring 
     */
    keyWordSearch(querystring, f) {
        var that = this;
        var layerurl = settingTemplate.arcgisServiceUrl;
        var layerArray = settingTemplate.fuzzyQueryServe;
        if (layerArray.length == 0) return;

        var resultJosn = [];

        var tableId = layerArray[0].id;
        layerArray.forEach(item => {
            var fearturLayerId = item.id + "_" + item.searchField;
            var newlayerurl = layerurl + item.url + "/" + item.layerId
            var fearturLayer = new initArcgis.gisConstructor.FeatureLayer(newlayerurl, {
                id: fearturLayerId,
                mode: initArcgis.gisConstructor.FeatureLayer.MODE_ONDEMAND,
                outFields: item.showFields,
                visible: false
            });
            initArcgis.gisInst[fearturLayerId] = fearturLayer;
            initArcgis.gisInst.map.addLayer(fearturLayer);

            that.fearturLayerQuery(querystring, item.searchField, item.layerName, item.clickabled, fearturLayer, resultJosn);

        });
        window.setTimeout(function() {
            resultJosn = resultJosn.map((item, index) => {
                item["id"] = index + 1;
                return item;
            });
            f(resultJosn)
        }, 1000);
    },
    /**
     * featureLayer查询
     * @param {*} querystring  关键字
     * @param {*} field 要显示的字段
     * @param {*} layerName 图层名称
     * @param {*} clickabled 是否加载点击事件
     * @param {*} elementLayer 当前要素图层
     * @param {*} resultJosn 接收查询结果返回的数组
     */
    fearturLayerQuery(querystring, field, layerName, clickabled, elementLayer, resultJosn) {
        var query = new initArcgis.gisConstructor.query();
        query.where = field + " like '%" + querystring + "%'";
        query.outFields = ["*"];
        query.returnGeometry = true;
        query.outSpatialReference = initArcgis.gisInst.map.spatialReference;
        elementLayer.queryFeatures(query, function(result) {
            if (result.features.length > 0) {
                result.features.forEach((item, index) => {
                    resultJosn.push({
                        name: field == "S_DRAI_PIPE_NAME_ROAD" ? item.attributes.S_DRAI_PIPE_NAME_ROAD + "(" + item.attributes.S_DRAI_PIPE_BROAD_NAME + "--" + item.attributes.S_DRAI_PIPE_EROAD_NAME + ")" : item.attributes[field],
                        geometry: item.geometry,
                        objectid: item.attributes["OBJECTID"],
                        type: layerName,
                        currentLayer: elementLayer,
                        isclick: clickabled
                    });
                });
            }
        }, function(error) {
            console.log("error:  ", error);
        });
    },
    locationOnMap(type, data) {
        var that = this;
        // that.clearMapLayer(type);
        var graphicLayerId = type + "_GraphicsLayer";
        var graphicLayer = new initArcgis.gisConstructor.GraphicsLayer({ id: graphicLayerId });

        initArcgis.gisInst[graphicLayerId] = graphicLayer;
        var point = new initArcgis.gisConstructor.Point(data.x, data.y, initArcgis.gisInst.map.spatialReference);
        //根据泵车所属区县和泵车状态获取泵车相应的地图符号
        var symbolObj = that.imagesList.find(item => { return data.type == item.type });

        var sps = new initArcgis.gisConstructor.PictureMarkerSymbol(symbolObj.url, symbolObj.width, symbolObj.height);
        var graphic = new initArcgis.gisConstructor.graphic(point, sps, data);
        graphicLayer.add(graphic)
            // initArcgis.gisInst.map.addLayer(graphicLayer);
            // initArcgis.gisInst.map.centerAndZoom(point, initArcgis.gisInst.map.getMaxZoom());
        initArcgis.gisInst.map.centerAt(point);

        that.loadInfoWindow(graphicLayer, type);
    },
    loadMarkeronMap(type, data) {
        console.log("data:  ", data);
        var that = this;
        that.clearMapLayer(type);
        var graphicLayerId = type + "_GraphicsLayer";
        var graphicLayer = new initArcgis.gisConstructor.GraphicsLayer({ id: graphicLayerId });
        initArcgis.gisInst.map.addLayer(graphicLayer);
        initArcgis.gisInst[graphicLayerId] = graphicLayer;
        data.forEach(element => {
            if (element.x && element.y) {
                var point;
                if (element.type == "yingji") {
                    point = new initArcgis.gisConstructor.Point(parseFloat(element.y), parseFloat(element.x), initArcgis.gisInst.map.spatialReference);
                } else {
                    point = new initArcgis.gisConstructor.Point(parseFloat(element.x), parseFloat(element.y), initArcgis.gisInst.map.spatialReference);
                }
                //根据泵车所属区县和泵车状态获取泵车相应的地图符号
                if (type.includes("Event")) {
                    var sps;
                    if (element.source == "巡查发现") {
                        if (element.eventState == "已完成" || element.eventState == "已审核") {
                            sps = new initArcgis.gisConstructor.PictureMarkerSymbol(require("@/assets/images/Map/ico_map_shij_xcfx_yiwc.png"), 32, 48);
                        } else {
                            sps = new initArcgis.gisConstructor.PictureMarkerSymbol(require("@/assets/images/Map/ico_map_shij_xcfx_weiwc.png"), 32, 48);
                        }

                    } else {
                        if (element.eventState == "已完成" || element.eventState == "已审核") {
                            sps = new initArcgis.gisConstructor.PictureMarkerSymbol(require("@/assets/images/Map/ico_map_wanggd_wc.png"), 32, 48);
                        } else {
                            if (element.endTime) {
                                var t1 = moment(element.endTime);
                                var t2 = moment(new Date());
                                var diff = t2.diff(t1, 'day');
                                if (element.twoHours == 1) {
                                    sps = new initArcgis.gisConstructor.PictureMarkerSymbol(require("@/assets/images/Map/ico_map_wanggd_gengyz.png"), 32, 48);
                                } else {
                                    if (diff > 0 && diff < 1) {
                                        sps = new initArcgis.gisConstructor.PictureMarkerSymbol(require("@/assets/images/Map/ico_map_wanggd_hong.png"), 32, 48);
                                    } else if (diff == 1) {
                                        sps = new initArcgis.gisConstructor.PictureMarkerSymbol(require("@/assets/images/Map/ico_map_wanggd_huang.png"), 32, 48);
                                    } else if (diff > 1) {
                                        sps = new initArcgis.gisConstructor.PictureMarkerSymbol(require("@/assets/images/Map/ico_map_wanggd_lan.png"), 32, 48);
                                    }
                                }

                            }
                        }
                    }
                    var graphic = new initArcgis.gisConstructor.graphic(point, sps, element);
                    graphicLayer.add(graphic)
                } else {
                    var symbolObj = that.imagesList.find(item => { return element.type == item.type });
                    var sps = new initArcgis.gisConstructor.PictureMarkerSymbol(symbolObj.url, symbolObj.width, symbolObj.height);
                    var graphic = new initArcgis.gisConstructor.graphic(point, sps, element);
                    graphicLayer.add(graphic)
                }
            }

        });
        that.loadInfoWindow(graphicLayer, type);
    },
    loadInfoWindow(graphicLayer, type) {
        var that = this;
        console.log("1222:", type);
        var mouse_over_graphicLayer = graphicLayer.on("mouse-over", function() {
            initArcgis.gisInst.map.setMapCursor("pointer");
        });
        var mouse_out_graphicLayer = graphicLayer.on("mouse-out", function() {
            initArcgis.gisInst.map.setMapCursor("default");
        });
        var mouse_click_graphicLayer = graphicLayer.on("click", function(evt) {
            if (type == "EmergencyHandle") {
                getEmergencyPersonInfo("?userCode=" + evt.graphic.attributes["personCode"]).then(res => {
                    if (res.code == 200) {
                        var html = "<div>";
                        html += "<div class='window-row'><span class='window-name'>人员姓名：</span>" + (res.data[0]["userName"] ? res.data[0]["userName"] : "") + "</div>";
                        html += "<div class='window-row'><span class='window-name'>所属板块：</span>" + (res.data[0]["town"] ? res.data[0]["town"] : "") + "</div>";
                        html += "<div class='window-row'><span class='window-name'>联系方式：</span>" + (res.data[0]["phone"] ? res.data[0]["phone"] : "") + "</div>";
                        html += "<div class='window-row'><span class='window-name'>业务类型：</span>" + (res.data[0]["type1"] ? res.data[0]["type1"] : "") + "</div>";
                        html += "<div class='window-row'><span class='window-name'>养护公司：</span>" + (res.data[0]["company"] ? res.data[0]["company"] : "") + "</div>";
                        initArcgis.gisInst.map.infoWindow.resize(260);
                        initArcgis.gisInst.map.infoWindow.setTitle("<div><div>人员信息<i onClick='window.closeWindow()' class='el-icon-close'></i></div><div class='window-title-bk'></div></div>");
                        initArcgis.gisInst.map.infoWindow.setContent(html);
                        initArcgis.gisInst.map.infoWindow.show(evt.mapPoint);

                        window.closeWindow = closeWindow;

                        function closeWindow() {
                            if (initArcgis.gisInst.map.infoWindow.isShowing) {
                                initArcgis.gisInst.map.infoWindow.hide();
                            }
                        }
                    }
                });
            } else {
                if (type == "Event" || type == "Event1") {
                    var obj = {
                        data: { EventDetailCode: evt.graphic.attributes["eventCode"] },
                        type: "event",
                        component: "EventDetail"
                    }
                    bus.$emit("DDialog", obj);
                } else if (type == "yingji") {
                    var obj = {
                        data: evt.graphic.attributes,
                        type: "emergency",
                        component: "NewDetail"
                    }
                    bus.$emit("DDialog", obj);
                }

            }
        });
        that.mapEvent["mouse_over_graphicLayer_" + type] = mouse_over_graphicLayer;
        that.mapEvent["mouse_out_graphicLayer" + type] = mouse_out_graphicLayer;
        that.mapEvent["mouse_click_graphicLayer" + type] = mouse_click_graphicLayer;
    },
    clearMapLayer(type) {
        var that = this;
        for (const key in initArcgis.gisInst) {
            if (initArcgis.gisInst.hasOwnProperty(key) && key.includes(type)) {
                const elementLayer = initArcgis.gisInst[key];
                if (key.toLocaleLowerCase().includes("featurelayer")) {

                } else {
                    elementLayer.clear();
                }
                initArcgis.gisInst.map.removeLayer(elementLayer);
                delete initArcgis.gisInst[key];
            }
        }
        for (const key in that.mapEvent) {
            if (that.mapEvent.hasOwnProperty(key) && key.includes(type)) {
                const elementEvent = that.mapEvent[key];
                if (elementEvent) {
                    elementEvent.remove();
                    delete that.mapEvent[key];
                }
            }
        }
        if (initArcgis.gisInst.map.infoWindow.isShowing) {
            initArcgis.gisInst.map.infoWindow.hide();
        }
    },
    loadGpsTrack(data) {
        var that = this;
        for (const key in initArcgis.gisInst) {
            if (initArcgis.gisInst.hasOwnProperty(key) && key == "gpsTrack_GraphicsLayer") {
                const elementLayer = initArcgis.gisInst[key];
                elementLayer.clear();
                initArcgis.gisInst.map.removeLayer(elementLayer);
                delete initArcgis.gisInst[key];
            }
        }
        var polylineJson = {
            paths: [],
            spatialReference: initArcgis.gisInst.map.spatialReference
        };
        var lineArray = [];
        data.forEach(item => {
            lineArray.push([item.x, item.y])
        });
        polylineJson.paths = [lineArray];
        var sls = new initArcgis.gisConstructor.SimpleLineSymbol(initArcgis.gisConstructor.SimpleLineSymbol.STYLE_SOLID, new initArcgis.gisConstructor.Color("#1c3197"), 5);

        var polyline = new initArcgis.gisConstructor.Polyline(polylineJson);

        var graphicLayer = new initArcgis.gisConstructor.GraphicsLayer({ id: "gpsTrack_GraphicsLayer" });

        var graphic = new initArcgis.gisConstructor.graphic(polyline, sls);
        graphicLayer.add(graphic);
        initArcgis.gisInst.map.addLayer(graphicLayer);

        initArcgis.gisInst.map.setExtent(polyline.getExtent(), true);

        initArcgis.gisInst["gpsTrack_GraphicsLayer"] = graphicLayer;
    },
    /**
     * 右侧告警信息定位
     * @param {*} type 
     * @param {*} name 
     */
    warningDataLocation(data, type) {
        type = type == "bz" ? "排水泵站" : '积水点';
        initArcgis.getBZJSDById('ZT_BZJSD_dynamicLayer', { type: type, data: data });
        // var that = this
        // var querylayerDefinitions = []
        // var searchFields = []
        // var layerids = []
        // var name = "";
        // var tableId = "";
        // var layerId = "";
        // switch (type) {
        //     case 'bz':
        //         layerId = "0";
        //         layerids = [0];
        //         searchFields = ['S_XTBM'];
        //         name = data.xtbm;
        //         tableId = "G_DrainPump";
        //         querylayerDefinitions[0] = "G_DrainPump.S_XTBM = '" + data.xtbm + "'";

        //         initArcgis.getDataByMapService(settingTemplate.arcgisServiceUrl + "/ZT_BZJSD/MapServer/0", function(result) {
        //             console.log("result:  ", result);
        //             if (result.features.length > 0) {
        //                 initArcgis.mapLocation(result.features[0].geometry, true);
        //             }
        //         }, { qWhere: "G_DrainPump.S_XTBM = '" + data.xtbm + "'" });
        //         break;
        //     case 'jsd':
        //         layerId = "2,3,4,5";
        //         layerids = [2, 3, 4, 5]
        //         searchFields = ['G_JiShui.S_NO']
        //         tableId = "G_JiShui";
        //         name = data.sno;
        //         layerids.forEach(item => {
        //             querylayerDefinitions[item] = "G_JiShui.S_NO =  '" + data.sno + "'";
        //         });

        //         var Params = { layerUrl: settingTemplate.arcgisServiceUrl + "/ZT_BZJSD/MapServer", qText: name, layerIds: layerids, resultFun: callback, searchFields: searchFields }
        //         initArcgis.getDataByFindTask(Params)
        //             // initArcgis.getDataByMapService();

        //         break;
        //     default:
        //         break
        // }
        // if (!that.isMapLocation) {
        //     that.loadCheckedFeatureLayerOnMap(layerId, true, tableId, "/ZT_BZJSD/MapServer", querylayerDefinitions);
        // }

        // function callback(result) {
        //     if (result.length > 0) {
        //         var json = result[0]
        //             // initArcgis.gisInst.map.centerAndZoom(json.feature.geometry, 9)
        //         initArcgis.mapLocation(json.feature.geometry, true);
        //     }
        // }

    }
}