import { loadCss, loadModules } from 'esri-loader'
import { settingTemplate } from '@/config/defaultSetting'
import bus from '@/assets/js/eventBus.js'
import axios from 'axios'
import moment from 'moment'
// import common from './common.js'
import { Message, MessageBox } from 'element-ui'
// import { getEmergencyPersonByState } from '@/api/Emergency.js'
// import { getAllPlanRoad } from '@/api/Dredge.js'
// import { getPatrolGpsHistory, getEvnetInfoByCode } from '@/api/RoadWatch.js'
export default {
  name: 'ArcgisMap',
  gisConstructor: {}, //gis 构造函数
  gisInst: {
    visibleLayers: [],
    ztvisibleLayers: [],
    searchLayers: [],
    displayField: [],
    interface: [],
    drawLayers: []
  }, // gis 实例
  map: {}, //地图
  // mapLayers:{},
  // mapEvent:{},
  // gisModules: [],
  // mapLibs:{},
  // defaultSetting:{},
  checkedLayer: [], //图层控制已选的图层集合
  layerConfigData: [], //保存图层控制中设施图层的数据
  layerQueryParam: {}, //保存当前选中的参数条件
  layerQueryParamArray: [], //保存每个图层的查询sql,
  clickEventArray: [],
  arcgisConfig: {
    url: settingTemplate.arcgisApiURL,
    dojoConfig: {
      parseOnLoad: false,
      async: true,
      tlmSiblingOfDojo: false,
      packages: [
        //window.configs.dojoConfigPackages
      ]
    }
  },
  initModule() {
    var that = this
    // 加载css;
    loadCss(settingTemplate.arcgisCssURL)
    // 加载模块
    loadModules(settingTemplate.gisModules, that.arcgisConfig).then(args => {
      // 注意大小写，3.x 的API感觉有点乱，API文件的开头有大写有小写，注意一定对应起来，
      for (let k in args) {
        let name = settingTemplate.gisModules[k].split('/').pop()
        that.gisConstructor[name] = args[k]
      }
    })
  },
  init(mapId, f) {
    var that = this
    // 加载css;
    loadCss(settingTemplate.arcgisCssURL);
    // 加载模块
    loadModules(settingTemplate.gisModules, that.arcgisConfig).then(function(args) {
      // 注意大小写，3.x 的API感觉有点乱，API文件的开头有大写有小写，注意一定对应起来，
      for (let k in args) {
        let name = settingTemplate.gisModules[k].split('/').pop()

        that.gisConstructor[name] = args[k]
      }
      if (that.gisInst.map) {
        that.gisInst.map.removeAllLayers()
        that.gisInst.map.destroy()
        that.gisInst.map = {}
      }
      that.gisConstructor.parser.parse()

      let map = new that.gisConstructor.map(mapId, {
        center: [settingTemplate.x, settingTemplate.y],
        zoom: settingTemplate.level,
        slider: false,
        logo: false,
        isClickRecenter: true,
        showLabels: true
      })
      that.gisInst.map = map
      var layers = settingTemplate.baseMapLayers
      layers.forEach(layer => {
        if (layer.type == 'tile') {
          let tiledLayer = new that.gisConstructor.ArcGISTiledMapServiceLayer(layer.url, { id: layer.id })
          that.gisInst.map.addLayer(tiledLayer)
        } else if (layer.type == 'dynamic') {
          var dynamicLayer = new that.gisConstructor.ArcGISDynamicMapServiceLayer(layer.url, {
            id: layer.id,
            visible: layer.visible
          })
          dynamicLayer.setImageFormat('png32')
          dynamicLayer.setImageTransparency(true)
          that.gisInst.map.addLayer(dynamicLayer, 3)
        }
      })

      if (f) {
        f(map)
      }
    })
  },
  /**
   * 展示动态图层
   * @param {*} layerIds 要展示的图层
   */
  loadDynamicLayer(layerurl, isvisible, layerId) {
    let that = this
    var dynamicLayer = new that.gisConstructor.ArcGISDynamicMapServiceLayer(layerurl, {
      id: layerId,
      visible: isvisible
    })
    // dynamicLayer.setVisibleLayers(layerIds);
    dynamicLayer.setImageFormat('png32')
    dynamicLayer.setImageTransparency(true)
    that.gisInst.map.addLayer(dynamicLayer, 3)
    that.gisInst[layerId] = dynamicLayer
  },
  loadCheckedLayerOnMap(val, checked, tableId) {
    var that = this
    if (checked) {
      if (val.includes(',')) {
        val.split(',').forEach(element => {
          if (that.checkedLayer.length > 0) {
            that.checkedLayer.forEach(item => {
              if (!that.checkedLayer.includes(element)) {
                that.checkedLayer.push(element)
              }
            })
          } else {
            that.checkedLayer.push(element)
          }
        })
      } else {
        if (that.checkedLayer.length > 0) {
          that.checkedLayer.forEach(item => {
            if (!that.checkedLayer.includes(val)) {
              that.checkedLayer.push(val)
            }
          })
        } else {
          that.checkedLayer.push(val)
        }
      }
    } else {
      if (val.includes(',')) {
        val.split(',').forEach(item => {
          that.checkedLayer.splice(
            that.checkedLayer.findIndex((element, index) => {
              return element == item
            }),
            1
          )
        })
      } else {
        that.checkedLayer.splice(
          that.checkedLayer.findIndex((element, index) => {
            return element == val
          }),
          1
        )
      }
    }
    if (that.layerQueryParamArray.length > 0) {
      that.setMapvisibleLayer(that.checkedLayer, 'YP_RoadService_DynamicMapServiceLayer', that.layerQueryParamArray)
    } else {
      that.setMapvisibleLayer(that.checkedLayer, 'YP_RoadService_DynamicMapServiceLayer')
    }

    // var identifyTaskParams = {
    //     layerUrl: _global.mapService.newyxjgGWSB,
    //     qGeometry: 'point',
    //     clickEvent: 'mapClickEvent2_leftAction'
    // }

    // console.log("layerQueryParamArray:  ",that.layerQueryParamArray);

    // identifyTaskParams['layerIds'] = that.checkedLayer
    // identifyTaskParams['resultFun'] = identifyTaskResultFun
    // identifyTaskParams['layerDefinitions'] = that.layerQueryParamArray
    // that.getDataByIdentifyTask(identifyTaskParams)

    // function identifyTaskResultFun (response) {
    //     if (response.length > 0) {
    //         if(response[0]['layerName'] == '污水片区'){
    //             var pqCode = response[0].feature.attributes['片区编码']
    //             that.getPQFile(pqCode)
    //         }else{
    //             bus.$emit('identifyTaskResultBack', response)
    //         }
    //     }
    // }
  },
  /**
   *
   * @param {*} layerIds [1,2,3,4,5]
   * @param {*} layerId 加载ArcGISDynamicMapServiceLayer定义的id
   * @param {*} layerDefinitions 查询图层自定义layerDefinitions[layerid] = 'sql语句'
   */
  setMapvisibleLayer(layerIds, layerId, layerDefinitions) {
    var that = this
    var interval = setInterval(function() {
      if (that.gisInst.map) {
        window.clearInterval(interval)
        var layer = that.gisInst.map.getLayer(layerId)
        if (layer) {
          if (layerIds.length > 0) {
            if (layerDefinitions) {
              layer.setVisibility(true)
              layer.setVisibleLayers(layerIds)
              layer.setLayerDefinitions(layerDefinitions)
            } else {
              layer.setVisibility(true)
              layer.setVisibleLayers(layerIds)
            }
          } else {
            layer.setVisibility(false)
            layer.setVisibleLayers(layerIds)
            layer.setLayerDefinitions([])
          }
        }
      } else {
        return
      }
    }, 500)
  },
  keyWordSearch(queryString, f) {
    var that = this
    var IdentifyParameters = {
      layerUrl: settingTemplate.dynamicLayers[0].url,
      layerIds: that.checkedLayer,
      qGeometry: that.gisInst.map.extent,
      resultFun: identifyTaskResultFun,
      layerDefinitions: that.layerQueryParamArray
    }

    that.getIdentifyTaskDataByGeometry(IdentifyParameters)

    function identifyTaskResultFun(response) {
      var len = response.length
      if (len > 0) {
        var newresponse = response.filter(item => {
          return item.value.includes(queryString)
        })
        console.log('newresponse:  ', newresponse)
        f(newresponse)
      } else {
        f([])
      }
    }
  },
  /**
   * 地图绘制图形查询
   * @param {*} Params
   * @param {*} f
   */
  getIdentifyTaskDataByGeometry(Params, options) {
    var that = this
    var defaultOptions = {
      resultParam: null,
      fault: function() {},
      faultParam: null,
      tolerance: 5,
      taskType: that.gisConstructor.IdentifyParameters.LAYER_OPTION_VISIBLE,
      returnGeometry: true,
      spatialReference: that.gisInst.map.spatialReference,
      hasInfoWin: false,
      returnFieldName: true
    }
    if (options) {
      for (var o in options) {
        defaultOptions[o] = options[o]
      }
    }
    options = defaultOptions
    var identifyParams = new that.gisConstructor.IdentifyParameters()
    identifyParams.layerOption = options.taskType
    identifyParams.layerIds = Params.layerIds
    identifyParams.returnGeometry = options.returnGeometry
    identifyParams.width = that.gisInst.map.width
    identifyParams.height = that.gisInst.map.height
    identifyParams.tolerance = options.tolerance
    identifyParams.geometry = Params.qGeometry
    identifyParams.mapExtent = that.gisInst.map.extent
    identifyParams.spatialReference = options.spatialReference
    identifyParams.returnFieldName = options.returnFieldName
    if (Params.layerDefinitions) {
      identifyParams.layerDefinitions = Params.layerDefinitions
    }
    var identifyTask = new that.gisConstructor.IdentifyTask(Params.layerUrl)
    identifyTask.execute(
      identifyParams,
      function(event) {
        if (options.resultParam != null && options.resultParam != '') {
          Params.resultFun(event, options.resultParam)
        } else {
          Params.resultFun(event)
        }
      },
      function(error) {
        if (options.fault) {
          if (options.faultParam != null && options.faultParam != '') {
            options.fault(error, options.faultParam)
          } else {
            options.fault(error)
          }
        }
      }
    )
  },
  /**
     * 接口名称：findTask
		功能描述：查询图层
		方法名称：findTask
		必选参数：1.map 地图对象
		         2.Params:({layerUrl:"http://139.196.77.103:6080/arcgis/rest/services/mh/mhappmaplayer/MapServer",
		                       qText:stext,layerIds:[0,1,2],resultFun:resultEvent,searchFields:["STATE_NAME","STATE_FIPS"]
		                       })
		可选参数：options:({contains:true,fault:faultEvent,faultParam:faultParam,
                       geometryPrecision:3,returnGeometry:false})
    * @param layerUrl 图层地址 所要查询的地图图层地址
	* @param searchText 在图层和searchFields参数中指定的图层和字段中搜索的搜索字符串文本。
	* @param searchFields 要搜索的图层的字段名称。
	* @param geometryPrecision 指定查询操作返回的几何的小数位数，可选
    * @param layerIds 图层id 所要查询的地图图层id
	* @param resultFun 查询成功后要执行的方法
	* @param resultParam 要对查询成功后执行的方法传递的额外参数，可选
	* @param fault 查询失败后要执行的方法，可选
	* @param faultParam 要对查询失败后执行的方法传递的额外参数，可选
	* @param returnGeometry 是否返回几何图形，默认为true，可选
	* @param outSpatialReference 输出几何的空间参考，可选
	* @param contains 确定是否查找搜索文本的完全匹配
    */
  getDataByFindTask(Params, options) {
    var that = this
    var defaultOptions = {
      resultParam: null,
      fault: function() {},
      faultParam: null,
      returnGeometry: true,
      geometryPrecision: 3,
      outSpatialReference: null,
      contains: true,
      layerDefinitions: []
    }
    if (options) {
      for (var o in options) {
        defaultOptions[o] = options[o]
      }
    }
    options = defaultOptions
    var find = new that.gisConstructor.FindTask(Params.layerUrl)
    var params = new that.gisConstructor.FindParameters()
    params.searchText = Params.qText
    params.layerIds = Params.layerIds
    params.searchFields = Params.searchFields
    params.contains = options.contains
    params.returnGeometry = options.returnGeometry
    params.outSpatialReference = options.outSpatialReference
    if (Params.layerDefinitions) {
      params.layerDefinitions = Params.layerDefinitions
    }
    find.execute(
      params,
      function(event) {
        if (options.resultParam != null && options.resultParam != '') {
          Params.resultFun(event, options.resultParam)
        } else {
          Params.resultFun(event)
        }
      },
      function(error) {
        if (options.fault) {
          if (options.faultParam != null && options.faultParam != '') {
            options.fault(error, options.faultParam)
          } else {
            options.fault(error)
          }
        }
      }
    )
  },
  /*
	接口名称：图层查询IdentifyTask
	功能描述：查询图层
	方法名称：identifyTask
	必选参数：1.map 地图对象
	         2.Params:({layerUrl:"http://139.196.77.103:6080/arcgis/rest/services/mh/mhappmaplayer/MapServer",
	            qGeometry:point,layerIds:[0,1,2],resultFun:resultEvent
	        })
	可选参数：options:({resultParam:resultParam,fault:faultEvent,faultParam:faultParam,
              tolerance:0.3,taskType:"LAYER_OPTION_VISIBLE",
            returnGeometry:false,spatialRelationship:null})
	* 
	* @param layerUrl 图层地址 所要查询的地图图层地址
	* @param qGeometry 图形查询条件 参数为 Geometry 格式的图形
	* @param layerIds 图层id 所要查询的地图图层id
	* @param resultFun 查询成功后要执行的方法
	* @param resultParam 要对查询成功后执行的方法传递的额外参数，可选
	* @param fault 查询失败后要执行的方法，可选
	* @param faultParam 要对查询失败后执行的方法传递的额外参数，可选
	* @param tolerance IdentifyTask查询图层的容差，可选
	* @param taskType IdentifyTask查询图层的模式， LAYER_OPTION_ALL("all")为查询所有图层 LAYER_OPTION_TOP("top")为查询当前比例最上面的显示图层 LAYER_OPTION_VISIBLE("visible")为查询当前比例显示的所有图层，可选
	* @param returnGeometry 是否返回几何图形，默认为true，可选
	* @param spatialReference 几何图形查询时的空间关系,默认为空，可选
	* @param hasInfoWin 是否弹出窗口,默认为false，可选
    */
  getDataByIdentifyTask(Params, options) {
    var that = this
    that.clickEventArray.forEach((item, index) => {
      for (const key in item) {
        if (key == Params.clickEvent) {
          if (item[key] != null) {
            item[key].remove()
            that.clickEventArray.splice(that.clickEventArray.findIndex(index1 => index1 === parseInt(index)), 1)
          }
        }
      }
    })
    var event = {}
    if (Params.layerIds.length == 0) return
    event[Params.clickEvent] = that.gisInst.map.on('click', function(evt) {
      var defaultOptions = {
        resultParam: null,
        fault: function() {},
        faultParam: null,
        tolerance: 5,
        taskType: that.gisConstructor.IdentifyParameters.LAYER_OPTION_VISIBLE,
        returnGeometry: true,
        spatialReference: that.gisInst.map.spatialReference,
        hasInfoWin: false,
        returnFieldName: true
      }
      if (options) {
        for (var o in options) {
          defaultOptions[o] = options[o]
        }
      }
      options = defaultOptions
      var identifyParams = new that.gisConstructor.IdentifyParameters()
      identifyParams.layerOption = options.taskType
      identifyParams.layerIds = Params.layerIds
      identifyParams.returnGeometry = options.returnGeometry
      identifyParams.width = that.gisInst.map.width
      identifyParams.height = that.gisInst.map.height
      identifyParams.tolerance = options.tolerance
      identifyParams.geometry = evt.mapPoint
      identifyParams.mapExtent = that.gisInst.map.extent
      identifyParams.spatialReference = options.spatialReference
      identifyParams.returnFieldName = options.returnFieldName
      if (Params.layerDefinitions) {
        identifyParams.layerDefinitions = Params.layerDefinitions
      }
      var identifyTask = new that.gisConstructor.IdentifyTask(Params.layerUrl)
      if (options.hasInfoWin) {
        var deferred = identifyTask.execute(identifyParams).addCallback(function(response) {
          bus.$emit('identifyTaskResultBack', response)
          if (options.resultParam != null && options.resultParam != '') {
            return Params.resultFun(response, InfoTemplate, arrayUtils, options.resultParam)
          } else {
            return Params.resultFun(response, InfoTemplate, arrayUtils)
          }
        })
        that.gisInst.map.infoWindow.setFeatures([deferred])
        if (Params.qGeometry.type == 'point') {
          that.gisInst.map.infoWindow.show(Params.qGeometry)
        }
      } else {
        identifyTask.execute(
          identifyParams,
          function(event) {
            if (options.resultParam != null && options.resultParam != '') {
              Params.resultFun(event, options.resultParam)
            } else {
              Params.resultFun(event)
            }
          },
          function(error) {
            if (options.fault) {
              if (options.faultParam != null && options.faultParam != '') {
                options.fault(error, options.faultParam)
              } else {
                options.fault(error)
              }
            }
          }
        )
      }
    })
    that.clickEventArray.push(event)
  },
  /**
   *
   * @param {*} serviceUrl 要查询的服务地址(备注：此方法只能查询单个图层服务)
   * @param {*} resultFun 接收查询返回的结果函数
   * @param {*} options 查询的参数条件
   * queryTask的查询方式
   */
  getDataByMapService(serviceUrl, resultFun, options) {
    var that = this
    var defaultOptions = {
      qWhere: '1=1',
      outField: ['*'],
      qGeometry: null,
      returnGeometry: true,
      distance: 0,
      resultParam: null,
      fault: function() {},
      faultParam: null,
      spatialReference: null,
      spatialRelationship: that.gisConstructor.query.SPATIAL_REL_CONTAINS
    }
    if (options) {
      for (var o in options) {
        defaultOptions[o] = options[o]
      }
    }
    options = defaultOptions
    if (serviceUrl == null || serviceUrl == '') {
      alert('错误：传入的图层地址为空')
      return
    }

    var queryParam = getQuery(options)
    var queryTask = new that.gisConstructor.QueryTask(serviceUrl)

    queryTask.execute(
      queryParam,
      function(event) {
        if (options.resultParam != null && options.resultParam != '') {
          resultFun(event, options.resultParam)
        } else {
          resultFun(event)
        }
      },
      function(error) {
        if (options.faultParam != null && options.faultParam != '') {
          options.fault(event, options.faultParam)
        } else {
          options.fault(event)
        }
      }
    )

    function getQuery(qOptions) {
      var query = new that.gisConstructor.query()
      //查询条件
      query.where = qOptions.qWhere
      //查询图形
      if (qOptions.qGeometry) {
        query.geometry = qOptions.qGeometry
      }
      //输出字段
      query.outFields = qOptions.outField
      //返回geometry
      query.returnGeometry = qOptions.returnGeometry
      //坐标系
      if (qOptions.spatialReference) {
        query.spatialReference = qOptions.spatialReference
      }
      //空间关系
      query.spatialRelationship = qOptions.spatialRelationship
      return query
    }
  },
  /**
   * 要素图形地图定位
   * @param {*} geometry 要定位的要素(point,polyline,polygon)
   * @param {*} isShow true 显示symbol false 不显示 只定位
   */
  mapLocation(geometry, isShow) {
    var that = this
    var type = geometry.type
    var graphicLayerId = type + '_geometryLocaltion_GraphicsLayer'
    that.clearMapLayer(graphicLayerId, 'GraphicsLayer')
    var tempLayer = new that.gisConstructor.GraphicsLayer({
      id: graphicLayerId
    })
    that.gisInst.map.addLayer(tempLayer, 3)
    that.gisInst[graphicLayerId] = tempLayer
    switch (type) {
      case 'point':
        var point = new that.gisConstructor.Point(geometry, that.gisConstructor.spatialReference)
        var sps = new that.gisConstructor.PictureMarkerSymbol(require('@/assets/images/icon_td.gif'), 20, 50)
        sps.setOffset(15, 15)
        var graphic = new that.gisConstructor.graphic(point, sps)
        tempLayer.add(graphic)
        that.gisInst.map.centerAndZoom(geometry, that.gisInst.map.getMaxZoom())
        break
      case 'polyline':
        var sls = new that.gisConstructor.SimpleLineSymbol(that.gisConstructor.SimpleLineSymbol.STYLE_SOLID, new that.gisConstructor.Color('#f29a1a'), 5)
        var graphic = new that.gisConstructor.graphic(geometry, sls)
        if (isShow) {
          tempLayer.add(graphic)
        }
        var extent = geometry.getExtent()
        that.gisInst.map.centerAt(extent.getCenter())
        //that.gisInst.map.setExtent(geometry.getExtent(), true)
        break
      case 'polygon':
        var sls = new that.gisConstructor.SimpleLineSymbol(that.gisConstructor.SimpleLineSymbol.STYLE_SOLID, new that.gisConstructor.Color('#F55353'), 3)
        var graphic = new that.gisConstructor.graphic(geometry, sls)
        if (isShow) {
          tempLayer.add(graphic)
        }
        that.gisInst.map.setExtent(geometry.getExtent(), true)
        break
      default:
        break
    }
  },
  /**
   * @param {*} layerId 每个图层定义的对应的layerId
   * @param {*} type GraphicsLayer：图形图层 ArcGISDynamicMapServiceLayer：动态图层
   */
  clearMapLayer(layerId, type) {
    var that = this
    var layer = that.gisInst.map.getLayer(layerId)
    if (layerId) {
      if (layer) {
        switch (type) {
          case 'GraphicsLayer':
            layer.clear()
            that.gisInst.map.removeLayer(layer)
            break
          case 'ArcGISDynamicMapServiceLayer':
            that.gisInst.map.removeLayer(layer)
            break
          default:
            break
        }
      }
    } else {
      for (const key in that.gisInst) {
        if (that.gisInst.hasOwnProperty(key)) {
          const layer = that.gisInst[key]
          if (layer && key.includes('_geometryLocaltion_GraphicsLayer')) {
            layer.clear()
            that.gisInst.map.removeLayer(layer)
          }
        }
      }
    }
  },
  /**
   * 图层的显示
   */
  showLayer(prop, layerId) {
    var that = this
    that.clearMapLayer()
    var layers = settingTemplate.baseMapLayers
    layers.forEach(layer => {
      if (layer.id == layerId) {
        prop['layerUrl'] = layer.url
        axios.get(layer.url + '/?f=pjson').then(res => {
          if (res.status == 200) {
            res.data.layers.forEach(item => {
              if (item.name == prop.name) {
                if (prop.checked) {
                  if (item.subLayerIds && item.subLayerIds.length > 0) {
                    that.gisInst.visibleLayers = that.gisInst.visibleLayers.concat(item.subLayerIds)
                  } else {
                    that.gisInst.visibleLayers.push(item.id)
                  }
                  prop['layerInfo'] = item
                  prop['type'] = 'ssgl'
                  that.gisInst.searchLayers.push(prop)
                } else {
                  if (item.subLayerIds && item.subLayerIds.length > 0) {
                    item.subLayerIds.forEach(ele => {
                      that.gisInst.visibleLayers.splice(that.gisInst.visibleLayers.findIndex(index1 => index1 == ele), 1)
                    })
                  } else {
                    that.gisInst.visibleLayers.splice(that.gisInst.visibleLayers.findIndex(index1 => index1 == item.id), 1)
                  }
                  that.gisInst.searchLayers.splice(that.gisInst.searchLayers.findIndex(ele => ele.name == item.name), 1)
                }
              }
            })
            var layer = that.gisInst.map.getLayer(layerId)
            layer.setVisibility(true)
            layer.setVisibleLayers(that.gisInst.visibleLayers)

            var identifyTaskParams = {
              layerUrl: layer.url,
              qGeometry: 'point',
              clickEvent: 'ss_dynamiclayer_event'
            }
            identifyTaskParams['layerIds'] = that.gisInst.visibleLayers
            identifyTaskParams['resultFun'] = identifyTaskResultFun
            that.getDataByIdentifyTask(identifyTaskParams)

            function identifyTaskResultFun(response) {
              that.callBack(response)
            }

            //查询表格数据
            var layerIdArray = []
            that.gisInst.searchLayers.forEach(item => {
              if (item.layerInfo.subLayerIds) {
                layerIdArray = layerIdArray.concat(item.layerInfo.subLayerIds)
              } else {
                layerIdArray.push(item.layerInfo.id)
              }
            })
            that.gisInst.drawLayers = layerIdArray
            var identifyTaskParams1 = {
              layerUrl: layer.url,
              qGeometry: 'point',
              clickEvent: 'ss_dynamiclayer_event',
              type: '1'
            }
            identifyTaskParams1['layerIds'] = layerIdArray
            identifyTaskParams1['resultFun'] = allIdentifyTaskResultFun
            that.getAllDataByIdentifyTask(identifyTaskParams1)

            function allIdentifyTaskResultFun(response) {
              bus.$emit('getAllSSData', response)
            }
          }
        })
      }
    })
  },
  callBack(response) {
    var that = this
    if (response.length > 0) {
      var result = response.filter(item => {
        return item.geometryType == 'esriGeometryPoint'
      })
      var newResult
      if (result && result.length > 0) {
        newResult = result[0]
      } else {
        newResult = response[0]
      }
      var obj = {
        show: true,
        width: '30%',
        geotype: newResult.feature.geometry.type,
        data: newResult.feature,
        type: newResult.layerName,
        targetLayer: ''
      }
      if (newResult.layerName != '道路' && newResult.layerName != '护栏' && newResult.layerName != '排水系统') {
        if (newResult.layerName == '排水泵站' || newResult.layerName.includes('积水点')) {
          bus.$emit('identifyTaskResult', obj)
        } else {
          bus.$emit('featureLayerClick', obj)
        }
        that.mapLocation(newResult.feature.geometry, true)
      }
    }
  },
  /**
   * 专题图层的显示(泵站 积水点)
   */
  showZTLayer(prop, layerId) {
    var that = this
    that.clearMapLayer()
    var layers = settingTemplate.baseMapLayers
    layers.forEach(layer => {
      if (layer.id == layerId) {
        prop['layerUrl'] = layer.url
        axios.get(layer.url + '/?f=pjson').then(res => {
          if (res.status == 200) {
            res.data.layers.forEach(item => {
              if (item.name == prop.name) {
                if (prop.checked) {
                  that.gisInst.ztvisibleLayers.push(item.id)
                  prop['layerInfo'] = item
                  prop['type'] = 'zttc'
                  that.gisInst.searchLayers.push(prop)
                } else {
                  that.gisInst.ztvisibleLayers.splice(that.gisInst.ztvisibleLayers.findIndex(index1 => index1 == item.id), 1)
                  that.gisInst.searchLayers.splice(that.gisInst.searchLayers.findIndex(ele => ele.name == item.name), 1)
                }
              }
            })
            var layer = that.gisInst.map.getLayer(layerId)
            layer.setVisibility(true)
            layer.setVisibleLayers(that.gisInst.ztvisibleLayers)

            var identifyTaskParams = {
              layerUrl: layer.url,
              qGeometry: 'point',
              clickEvent: 'zt_dynamiclayer_event'
            }
            identifyTaskParams['layerIds'] = that.gisInst.ztvisibleLayers
            identifyTaskParams['resultFun'] = identifyTaskResultFun
            that.getDataByIdentifyTask(identifyTaskParams)

            function identifyTaskResultFun(response) {
              that.callBack(response)
            }

            var identifyTaskParams = {
              layerUrl: layer.url,
              qGeometry: 'point',
              clickEvent: 'zt_dynamiclayer_event'
            }
            identifyTaskParams['layerIds'] = that.gisInst.ztvisibleLayers
            identifyTaskParams['resultFun'] = allIdentifyTaskResultFun

            function allIdentifyTaskResultFun(response) {
              that.callBack(response)
            }
          }
        })
      }
    })
  },
  /**
   * 加载轨迹图层
   */
  showTrajectoryLayer(prop, layerId, param) {
    var that = this
    var layer = that.gisInst.map.getLayer(layerId)
    if (prop.checked) {
      if (param) {
        var layerDefinitions = []
        layerDefinitions[0] = "UPLAOD_DATE >= timestamp '" + moment(param[0]).format('YYYY-MM-DD') + "' and " + "UPLAOD_DATE <= timestamp '" + moment(param[1]).format('YYYY-MM-DD') + "'"
        layer.setVisibility(true)
        layer.setLayerDefinitions(layerDefinitions)
      }
    } else {
      layer.setVisibility(false)
      for (const key in that.gisInst) {
        if (that.gisInst.hasOwnProperty(key) && key == 'gpsTrack_GraphicsLayer') {
          const elementLayer = that.gisInst[key]
          elementLayer.clear()
          that.gisInst.map.removeLayer(elementLayer)
          delete that.gisInst[key]
        }
      }
      common.clearMapLayer('Event1')
    }
  },
  /**
   * 通过接口加载图层
   */
  showInterfaceLayer(prop) {
    var that = this
    if (prop.checked) {
      if (prop.name == '应急人员') {
        getEmergencyPersonByState().then(res => {
          if (res.code == 200) {
            var json = res.data.map(element => {
              element['x1'] = element['y'] ? element['y'] : 0
              element['y1'] = element['x'] ? element['x'] : 0
              element['x'] = element['x1']
              element['y'] = element['y1']
              element['type1'] = element['type']
              element['type'] = element['state']

              that.gisInst.interface.push({
                id: element.personCode,
                name: element.company,
                type: '在线人员',
                geometry: that.getPoint(element.x, element.y)
              })
              return element
            })
            common.loadMarkeronMap('EmergencyHandle', json)
            var timer = setInterval(() => {
              common.loadMarkeronMap('EmergencyHandle', json)
            }, 15000)
            that.gisInst['timer'] = timer
          }
        })
      }
    } else {
      if (prop.name == '应急人员') {
        common.clearMapLayer('EmergencyHandle')
        if (that.gisInst['timer']) {
          clearInterval(that.gisInst['timer'])
          that.gisInst['timer'] = null
        }
      } else if (prop.name == '养护') {
        common.clearMapLayer('Event')
      } else if (prop.name == '疏通') {
        common.clearMapLayer('ssgl_dynamicLayer')
        that.clearMapLayer('localtion_GraphicsLayer', 'GraphicsLayer')
      } else if (prop.name == '应急事件') {
        common.clearMapLayer('yingji')
      } else if (prop.name == '历年应急抢险') {
        common.clearMapLayer('emergency_heatmap_FeatureLayer')
      } else if (prop.name == '历年道路病害') {
        common.clearMapLayer('road_heatmap_FeatureLayer')
      }
      that.gisInst.interface = that.gisInst.interface.filter(item => {
        return item.type != prop.name
      })
    }
  },
  loadRoadLayer(type, data, time) {
    var that = this
    var roadIdArray = []
    data.forEach(item => {
      roadIdArray.push(item.roadSectionCode)
    })
    //去重后的数组
    var uniqueRoadArray = [...new Set(roadIdArray)]
    common.clearMapLayer(type)
    var graphicLayerId = type + '_GraphicsLayer'
    var graphicLayer = new that.gisConstructor.GraphicsLayer({
      id: graphicLayerId
    })
    that.gisInst.map.addLayer(graphicLayer, 6)
    that.gisInst[graphicLayerId] = graphicLayer
    var layers = settingTemplate.baseMapLayers
    layers.forEach(layer => {
      if (layer.id == type) {
        axios.get(layer.furl + '/?f=pjson').then(res => {
          if (res.status == 200) {
            res.data.layers.forEach(item => {
              if (item.name == '道路') {
                var featurelayer = new that.gisConstructor.FeatureLayer(layer.furl + '/' + item.id, {
                  mode: that.gisConstructor.FeatureLayer.MODE_ONDEMAND,
                  outFields: ['*']
                })
                var query1 = new that.gisConstructor.query()
                if (time) {
                  var param = '?month=' + moment(time).format('M') + '&year=' + moment(time).format('YYYY')
                  getAllPlanRoad(param).then(response => {
                    if (response.code == 200) {
                      var array = []
                      response.data.forEach(item => {
                        item['ztype'] = 0
                        data.forEach(ele => {
                          if (ele.roadSectionCode == item.roadSectionCode) {
                            item['ztype'] = 1
                          }
                        })
                        array.push("'" + item.roadSectionCode + "'")
                      })
                      query1.where = 'S_ROAD_ID in (' + array.join() + ')'
                      featurelayer.queryFeatures(query1, function(featureSet) {
                        if (featureSet.features.length > 0) {
                          featureSet.features.forEach(ele => {
                            var roadObj = response.data.find(k => {
                              return k.roadSectionCode == ele.attributes['S_ROAD_ID']
                            })
                            var color = '#C1C1C1'
                            if (roadObj.ztype == 1) {
                              if (roadObj.curingState == '已完成') {
                                color = '#4FC341'
                              }
                              if (roadObj.curingState == '已审核') {
                                color = '#F68715'
                              }
                              if (roadObj.curingState == '执行中') {
                                color = '#0892FB'
                              }
                            }
                            var sls = new that.gisConstructor.SimpleLineSymbol(that.gisConstructor.SimpleLineSymbol.STYLE_SOLID, new that.gisConstructor.Color(color), 5)
                            var graphic = new that.gisConstructor.graphic(ele.geometry, sls)
                            graphicLayer.add(graphic)
                          })
                        }
                      })
                    }
                  })
                }
                var query = new that.gisConstructor.query()
              }
            })
          }
        })
      }
    })
  },
  getRoadData(splate, f) {
    var that = this
    var layers = settingTemplate.baseMapLayers
    layers.forEach(layer => {
      if (layer.id == 'ssgl_dynamicLayer') {
        axios.get(layer.furl + '/?f=pjson').then(res => {
          if (res.status == 200) {
            res.data.layers.forEach(item => {
              if (item.name == '道路') {
                var featurelayer = new that.gisConstructor.FeatureLayer(layer.furl + '/' + item.id, {
                  mode: that.gisConstructor.FeatureLayer.MODE_ONDEMAND,
                  outFields: ['*']
                })
                var query = new that.gisConstructor.query()
                query.where = "S_PLATE = '" + splate + "'"
                featurelayer.queryFeatures(
                  query,
                  function(featureSet) {
                    var array = []
                    if (featureSet.features.length > 0) {
                      featureSet.features.forEach(ele => {
                        array.push(ele.attributes)
                      })
                      f(array)
                    }
                  },
                  function(error) {
                    console.log(error)
                  }
                )
              }
            })
          }
        })
      }
    })
  },
  layerSearch(queryString, f) {
    var that = this
    if (that.gisInst.searchLayers.length > 0) {
      var queryParam = {}
      that.gisInst.searchLayers.forEach(item => {
        var params = {
          layerUrl: '',
          qText: queryString,
          layerIds: [],
          resultFun: resultEvent,
          searchFields: []
        }
        params.layerUrl = item.layerUrl
        if (item.layerInfo.subLayerIds && item.layerInfo.subLayerIds.length > 0) {
          params.layerIds = params.layerIds.concat(item.layerInfo.subLayerIds)
        } else {
          params.layerIds.push(item.layerInfo.id)
        }
        that.getLayerDisplayField(item, function(data) {
          params.searchFields.push(data.name)
        })
        queryParam[item.type] = params
      })
      for (const key in queryParam) {
        if (queryParam.hasOwnProperty(key)) {
          const param = queryParam[key]
          that.getDataByFindTask(param)
        }
      }
      // params.searchFields = Array.from(new Set(params.searchFields));
      var lastResult = []

      function resultEvent(result) {
        lastResult = lastResult.concat(result)
      }
      var timer = window.setInterval(function() {
        if (lastResult.length > 0) {
          window.clearInterval(timer)
          f(lastResult)
        }
      }, 100)
    } else {
      //alert("没有可查询的图层,请在图层控制里面选择相应的图层后再进行查询。");
      f([])
    }
  },
  getLayerDisplayField(data, f) {
    var that = this
    var layerId = ''
    if (data.layerInfo.subLayerIds && data.layerInfo.subLayerIds.length > 0) {
      layerId = data.layerInfo.subLayerIds[0]
    } else {
      layerId = data.layerInfo.id
    }
    axios.get(data.layerUrl + '/' + layerId + '?f=pjson').then(res => {
      if (res.status == 200) {
        var json = res.data.fields.find(item => {
          return item.name == res.data.displayField
        })
        that.gisInst.displayField.push(json)
        f(json)
      }
    })
  },
  getPoint(x, y) {
    if (x && y) {
      return new this.gisConstructor.Point(parseFloat(x), parseFloat(y), this.gisInst.map.spatialReference)
    } else {
      return ''
    }
  },
  getRoadById(code, f) {
    var that = this
    var layers = settingTemplate.baseMapLayers
    layers.forEach(layer => {
      if (layer.id == 'ssgl_dynamicLayer') {
        axios.get(layer.furl + '/?f=pjson').then(res => {
          if (res.status == 200) {
            res.data.layers.forEach(item => {
              if (item.name == '道路') {
                var featurelayer = new that.gisConstructor.FeatureLayer(layer.furl + '/' + item.id, {
                  mode: that.gisConstructor.FeatureLayer.MODE_ONDEMAND,
                  outFields: ['*']
                })
                var query = new that.gisConstructor.query()
                query.where = "S_ROAD_ID = '" + code + "'"
                featurelayer.queryFeatures(
                  query,
                  function(featureSet) {
                    // common.locationOnMap();
                    if (featureSet.features.length > 0) {
                      that.clearMapLayer('localtion_GraphicsLayer', 'GraphicsLayer')
                      var tempLayer = new that.gisConstructor.GraphicsLayer({
                        id: 'localtion_GraphicsLayer'
                      })
                      that.gisInst.map.addLayer(tempLayer, 3)
                      that.gisInst['localtion_GraphicsLayer'] = tempLayer
                      var lineArray = []
                      featureSet.features.forEach(item => {
                        var sls = new that.gisConstructor.SimpleLineSymbol(that.gisConstructor.SimpleLineSymbol.STYLE_SOLID, new that.gisConstructor.Color('#f29a1a'), 5)
                        var graphic = new that.gisConstructor.graphic(item.geometry, sls)
                        tempLayer.add(graphic)
                        lineArray.push(item.geometry)
                      })
                      var unionLine = that.gisConstructor.geometryEngine.union(lineArray)
                      // that.gisInst.map.setExtent(unionLine.getExtent(), true);
                      // that.gisInst.map.centerAndZoom(unionLine.getExtent().getCenter(), 10);
                    }
                  },
                  function(error) {
                    console.log(error)
                  }
                )
              }
            })
          }
        })
      }
    })
  },
  getBZJSDById(id, data, f) {
    var that = this
    var layers = settingTemplate.baseMapLayers
    layers.forEach(layer => {
      if (layer.id == id) {
        axios.get(layer.url + '/?f=pjson').then(res => {
          console.log('rererer: ', res)
          if (res.status == 200) {
            res.data.layers.forEach(item => {
              if (item.name == data.type) {
                if (item.subLayerIds && item.subLayerIds.length > 0) {
                  item.subLayerIds.forEach(subitem => {
                    var featurelayer = new that.gisConstructor.FeatureLayer(layer.url + '/' + subitem, {
                      mode: that.gisConstructor.FeatureLayer.MODE_ONDEMAND,
                      outFields: ['*']
                    })
                    var query = new that.gisConstructor.query()
                    query.where = "G_JiShui.S_NO = '" + data.data.sno + "'"
                    featurelayer.queryFeatures(
                      query,
                      function(featureSet) {
                        // target = featureSet.features[0].geometry;
                        if (featureSet.features.length > 0) {
                          that.mapLocation(featureSet.features[0].geometry)
                          if (f) {
                            f(featureSet.features[0])
                          }
                        }
                      },
                      function(error) {
                        console.log(error)
                      }
                    )
                  })
                } else {
                  var featurelayer = new that.gisConstructor.FeatureLayer(layer.url + '/' + item.id, {
                    mode: that.gisConstructor.FeatureLayer.MODE_ONDEMAND,
                    outFields: ['*']
                  })
                  var query = new that.gisConstructor.query()
                  query.where = "G_DrainPump.S_XTBM = '" + data.data.xtbm + "'"
                  featurelayer.queryFeatures(
                    query,
                    function(featureSet) {
                      that.mapLocation(featureSet.features[0].geometry)
                    },
                    function(error) {
                      console.log(error)
                    }
                  )
                }
              }
            })
          }
        })
      }
    })
  },
  publicLocaltion(data) {
    var that = this
    that.clearMapLayer('localtion_GraphicsLayer', 'GraphicsLayer')
    var tempLayer = new that.gisConstructor.GraphicsLayer({
      id: 'localtion_GraphicsLayer'
    })
    that.gisInst.map.addLayer(tempLayer, 3)
    that.gisInst['localtion_GraphicsLayer'] = tempLayer
    if (data.type == 1) {
      that.getRoadById(data.code)
    } else if (data.type == 2) {
      if (data.data.x && data.data.y) {
        var x = data.data.x || data.data.eventX
        var y = data.data.y || data.data.eventY
        var point = new that.gisConstructor.Point(parseFloat(data.data.x), parseFloat(data.data.y), that.gisConstructor.spatialReference)
        var sps = new that.gisConstructor.PictureMarkerSymbol(require('@/assets/images/ico_map_active.png'), 32, 48)
        // sps.setOffset(15, 15)
        var graphic = new that.gisConstructor.graphic(point, sps)
        tempLayer.add(graphic)
        that.gisInst.map.centerAndZoom(point, 9)
      }
    } else if (data.type == 3) {
      if (data.data.eventX && data.data.eventY) {
        var x = data.data.eventX
        var y = data.data.eventY
        var point = new that.gisConstructor.Point(parseFloat(data.data.eventX), parseFloat(data.data.eventY), that.gisConstructor.spatialReference)
        var sps = new that.gisConstructor.PictureMarkerSymbol(require('@/assets/images/ico_map_active.png'), 32, 48)
        // sps.setOffset(15, 15)
        var graphic = new that.gisConstructor.graphic(point, sps)
        tempLayer.add(graphic)
        that.gisInst.map.centerAndZoom(point, 9)
      } else {
        if (data.data.x && data.data.y) {
          var point = new that.gisConstructor.Point(parseFloat(data.data.y), parseFloat(data.data.x), that.gisConstructor.spatialReference)
          var sps = new that.gisConstructor.PictureMarkerSymbol(require('@/assets/images/ico_map_active.png'), 32, 48)
          // sps.setOffset(15, 15)
          var graphic = new that.gisConstructor.graphic(point, sps)
          tempLayer.add(graphic)
          that.gisInst.map.centerAndZoom(point, 9)
        }
      }
    } else if (data.type == 4) {
      var params = {
        current: 1,
        keyword: '',
        orders: [],
        patrolCode: data.data.patrolCode,
        size: 500
      }
      getPatrolGpsHistory(params).then(res => {
        var state = res.code
        if (state == 200) {
          var datalist = res.data.records
          if (datalist.length > 0) {
            common.loadGpsTrack(datalist)
            var param = '?proCode=' + data.data.patrolCode
            getEvnetInfoByCode(param).then(res => {
              if (res.code == 200) {
                common.loadMarkeronMap('Event1', res.data)
              }
            })
          } else {
            Message({
              message: '无轨迹坐标信息',
              type: 'warning',
              duration: 3 * 1000
            })
          }
        }
      })
    } else if (data.type == 5) {
      that.getRoadById(data.data.roadSectionCode)
    }
  },
  loadHeatMapLayer(type, data) {
    var that = this
    if (that.gisInst[type + '_heatmap_FeatureLayer']) {
      that.gisInst.map.removeLayer(that.gisInst[type + '_heatmap_FeatureLayer'])
      delete that.gisInst[type + '_heatmap_FeatureLayer']
    }
    var layerDefinition = {
      geometryType: 'esriGeometryPoint',
      fields: [
        {
          name: 'ID',
          type: 'esriFieldTypeInteger',
          alias: 'ID'
        }
      ]
    }
    var featureCollection = {
      layerDefinition: layerDefinition,
      featureSet: null
    }
    var featureLayer = new that.gisConstructor.FeatureLayer(featureCollection, {
      mode: that.gisConstructor.FeatureLayer.MODE_SNAPSHOT,
      outFields: ['*'],
      opacity: 1
    })

    var heatmapRenderer = new that.gisConstructor.HeatmapRenderer({
      colors: ['rgba(255, 0, 0, 0)', 'rgb(0, 255, 0)', 'rgb(255, 255, 0)', 'rgb(255, 0, 0)'],
      // colorStops: [
      //     { ratio: 0, color: "rgba(250, 0, 0, 0)" },
      //     { ratio: 0.6, color: "rgb(250, 0, 0)" },
      //     { ratio: 0.85, color: "rgb(250, 150, 0)" },
      //     { ratio: 0.95, color: "rgb(255, 255, 0)" }
      // ],
      blurRadius: 10, //每个点的大部分值分布在其上的圆的半径（以像素为单位）。
      maxPixelIntensity: 230, //在色带中为最终颜色分配的像素强度值。
      minPixelIntensity: 10 //在色带中为初始强度分配的像素强度值。
    })
    featureLayer.setRenderer(heatmapRenderer)
    that.gisInst.map.addLayer(featureLayer)

    that.gisInst[type + '_heatmap_FeatureLayer'] = featureLayer

    data.forEach((item, index) => {
      if (item.x && item.y) {
        var point
        if (type == 'road') {
          point = new that.gisConstructor.Point(parseFloat(item.x), parseFloat(item.y), that.gisInst.map.spatialReference)
        } else {
          point = new that.gisConstructor.Point(parseFloat(item.y), parseFloat(item.x), that.gisInst.map.spatialReference)
        }
        featureLayer.add(new that.gisConstructor.graphic(point))
      }
    })
  },
  getAllDataByIdentifyTask(Params, options) {
    var that = this
    if (Params.layerIds.length == 0) return
    var defaultOptions = {
      resultParam: null,
      fault: function() {},
      faultParam: null,
      tolerance: 5,
      taskType: that.gisConstructor.IdentifyParameters.LAYER_OPTION_VISIBLE,
      returnGeometry: true,
      spatialReference: that.gisInst.map.spatialReference,
      hasInfoWin: false,
      returnFieldName: true
    }
    if (options) {
      for (var o in options) {
        defaultOptions[o] = options[o]
      }
    }
    options = defaultOptions
    var identifyParams = new that.gisConstructor.IdentifyParameters()
    identifyParams.layerOption = options.taskType
    identifyParams.layerIds = Params.layerIds
    identifyParams.returnGeometry = options.returnGeometry
    identifyParams.width = that.gisInst.map.width
    identifyParams.height = that.gisInst.map.height
    identifyParams.tolerance = options.tolerance
    if (Params.type == 1) {
      identifyParams.geometry = that.gisInst.map.extent
    } else if (Params.type == 2) {
      identifyParams.geometry = Params.geometry
    }
    identifyParams.mapExtent = that.gisInst.map.extent
    identifyParams.spatialReference = options.spatialReference
    identifyParams.returnFieldName = options.returnFieldName
    if (Params.layerDefinitions) {
      identifyParams.layerDefinitions = Params.layerDefinitions
    }
    var identifyTask = new that.gisConstructor.IdentifyTask(Params.layerUrl)
    if (options.hasInfoWin) {
      var deferred = identifyTask.execute(identifyParams).addCallback(function(response) {
        bus.$emit('identifyTaskResultBack', response)
        if (options.resultParam != null && options.resultParam != '') {
          return Params.resultFun(response, InfoTemplate, arrayUtils, options.resultParam)
        } else {
          return Params.resultFun(response, InfoTemplate, arrayUtils)
        }
      })
      that.gisInst.map.infoWindow.setFeatures([deferred])
      if (Params.qGeometry.type == 'point') {
        that.gisInst.map.infoWindow.show(Params.qGeometry)
      }
    } else {
      identifyTask.execute(
        identifyParams,
        function(event) {
          if (options.resultParam != null && options.resultParam != '') {
            Params.resultFun(event, options.resultParam)
          } else {
            Params.resultFun(event)
          }
        },
        function(error) {
          if (options.fault) {
            if (options.faultParam != null && options.faultParam != '') {
              options.fault(error, options.faultParam)
            } else {
              options.fault(error)
            }
          }
        }
      )
    }
  },
  /**
   * 图形绘制 并查询数据
   * @param {*} drawtype
   */
  drawGeometryAndQueryData(drawtype, layerId) {
    var that = this
    if (that.gisInst.drawLayers.length == 0) {
      alert('请先勾选相应的设施图层。')
      return
    }
    that.clearDrawLayerAndEvent()
    //图形符号
    var symbol = new that.gisConstructor.SimpleFillSymbol(
      that.gisConstructor.SimpleFillSymbol.STYLE_SOLID,
      new that.gisConstructor.SimpleLineSymbol(that.gisConstructor.SimpleLineSymbol.STYLE_DASHDOT, new that.gisConstructor.Color([255, 0, 0]), 2),
      new that.gisConstructor.Color([255, 255, 0, 0.25])
    )
    var toolbar = new that.gisConstructor.draw(that.gisInst.map)
    that.gisInst['drawtoolbar'] = toolbar
    var editToolbar = new that.gisConstructor.edit(that.gisInst.map)
    that.gisInst['editToolbar'] = editToolbar

    toolbar.activate(that.gisConstructor.draw[drawtype])

    toolbar.on('draw-end', function(evt) {
      toolbar.deactivate()
      if (evt.geometry.isSelfIntersecting(evt.geometry)) {
        alert('绘制的图形不能自相交,请重新绘制。')
        return
      }
      var layer = that.gisConstructor.GraphicsLayer()
      var graphic = new that.gisConstructor.graphic(evt.geometry, symbol)
      layer.add(graphic)
      that.gisInst.map.addLayer(layer)
      that.gisInst['draw_GraphicsLayer'] = layer
      //绘制结束开始查询
      that.getLayerDataByDrawGeometry(layerId, evt.geometry)

      //图形移动结束开始查询
      editToolbar.on('graphic-move-stop', function(event) {
        that.getLayerDataByDrawGeometry(layerId, event.graphic.geometry)
      })

      var layer_click = layer.on('click', function() {
        editToolbar.activate(that.gisConstructor.edit['MOVE'], graphic)
      })

      var map_dbl_click = that.gisInst.map.on('dbl-click', function() {
        editToolbar.deactivate()
      })

      that.gisInst['layer_click'] = layer_click
      that.gisInst['map_dbl_click'] = map_dbl_click
    })
  },
  /**
   * 通过绘制的图形查询
   * @param {*} layerId
   * @param {*} geometry
   */
  getLayerDataByDrawGeometry(layerId, geometry) {
    var that = this
    var layers = settingTemplate.baseMapLayers
    layers.forEach(layer => {
      if (layer.id == layerId) {
        var identifyTaskParams1 = {
          layerUrl: layer.url,
          qGeometry: 'point',
          clickEvent: 'ss_dynamiclayer_event',
          type: '2',
          geometry: geometry
        }
        identifyTaskParams1['layerIds'] = that.gisInst.drawLayers
        identifyTaskParams1['resultFun'] = allIdentifyTaskResultFun
        that.getAllDataByIdentifyTask(identifyTaskParams1)

        function allIdentifyTaskResultFun(response) {
          console.log('response:::::  ', response)
          bus.$emit('getAllSSData', response)
        }
      }
    })
  },
  /**
   * 清除绘制的图形和点击事件
   */
  clearDrawLayerAndEvent() {
    var that = this
    if (that.gisInst['drawtoolbar'] || that.gisInst['editToolbar']) {
      that.gisInst['drawtoolbar'].deactivate()
      that.gisInst['editToolbar'].deactivate()
      delete that.gisInst['drawtoolbar']
      delete that.gisInst['editToolbar']
    }
    if (that.gisInst['draw_GraphicsLayer']) {
      //清除上次绘制的图形
      that.gisInst['draw_GraphicsLayer'].clear()
      that.gisInst.map.removeLayer(that.gisInst['draw_GraphicsLayer'])
      //清除点击事件
      that.gisInst['layer_click'].remove()
      that.gisInst['map_dbl_click'].remove()

      delete that.gisInst['draw_GraphicsLayer']
      delete that.gisInst['layer_click']
      delete that.gisInst['layer_click']
    }
  },
  //地图打印
  printMap() {
    var that = this
    //创建地图打印对象
    var printMap = new that.gisConstructor.PrintTask(settingTemplate.gpserver_print)
    //创建地图打印模版
    var template = new that.gisConstructor.PrintTemplate()
    //创建地图的打印参数，参数里面包括：模版和地图
    var params = new that.gisConstructor.PrintParameters()
    //输出图片的空间参考
    printMap.outSpatialReference = that.gisInst.map.SpatialReference
    //打印图片的各种参数
    template.exportOptions = {
      width: 1200,
      height: 1200,
      dpi: 96
    }
    //打印输出的格式
    template.format = 'PDF'
    //输出地图的布局
    template.layout = 'MAP_ONLY'
    // PrintTemplate
    //设置参数地图
    params.map = that.gisInst.map
    //设置参数模版
    params.template = template
    //运行结果
    printMap.execute(params, function(result) {
      if (result != null) {
        //网页打开生成的地图
        window.open(result.url)
      }
    })
  },
  //泵站统计
  getBZCount(fun) {
    axios.get(settingTemplate.arcgisServiceUrl + '/ZT_BZJSD/MapServer/0/query?where=1%3D1&outFields=*&f=pjson').then(res => {
      if (res.status == 200) {
        return fun(res.data)
      }
    })
  },
  //积水点统计
  async getJSDCount(type, fun) {
    var ddd = await axios.get(settingTemplate.arcgisServiceUrl + '/ZT_BZJSD/MapServer/' + type + '/query?where=1%3D1&outFields=*&f=pjson')
    if (ddd.status == 200) {
      //console.log("nnnnnn");
      return fun(ddd.data)
    }
  }
}
