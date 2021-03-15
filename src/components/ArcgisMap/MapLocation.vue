<template>
    <div class="MapLocation">
         <el-dialog title="地图选址"  :visible.sync="mapLocationDialogVisible" custom-class="mapLocation-dialog"  :trigger-on-focus="false" :popper-append-to-body="false" style="margin:0 auto 10px">
            <div id="MapLocation_map">
               <el-autocomplete
                    class="inline-input"
                    width="60%"
                    popper-class="maplocation-autocomplete"
                    v-model="searchValue"
                    :fetch-suggestions="querySearch"
                    placeholder="请输入查询的关键字"
                    @select="handleSelect"
                    :trigger-on-focus="false"
                    :popper-append-to-body="false"
                    style="width:350px;float: left;z-index:2;top: 10px;left: 10px;"
                >
                    <template slot-scope="{ item }">
                        <table style="width:100%;">
                            <tr v-if="item.id == 0">
                                <td colspan="4">{{item.name}}</td>
                            </tr>
                            <tr v-else>
                                <td align="left">{{item.id}}</td>
                                <td align="left" :title="item.name" style="text-overflow: ellipsis;">
                                    <div style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;word-break: break-all;"> {{item.name}}</div>
                                </td>
                                 <!-- <td align="left" style="width:10%;">{{item.type}}</td> -->
                            </tr>
                        </table>
                    </template>
                    <el-button slot="append" icon="el-icon-search"></el-button>
                </el-autocomplete>
            </div>
            <el-button type="info" round size="small" class="bottomBtn" @click="handleBack">取消</el-button>
            <el-button type="primary" round size="small" class="bottomBtn" @click="handleClose">确定</el-button>
        </el-dialog>
    </div>
</template>
<script>
import bus from '@/assets/js/eventBus.js'
import common from "@/components/ArcgisMap/js/common.js";
import initArcgis from '@/components/ArcgisMap/js/arcgis_map';
import {settingTemplate} from '@/config/defaultSetting';
export default {
    data(){
        return{
            mapLocationDialogVisible:false,
            searchValue:'',
            map:null,
            locationImg:require('../../assets/images/icon_td.gif')
        }
    },
    methods:{
        initMap(){
            var that = this;
            that.$nextTick(()=>{
                
                if(that.map){
                    that.map.destroy();
                    that.map = null;
                }
                console.log("initArcgis:  ",initArcgis.gisConstructor);
                if(!initArcgis.gisConstructor.map){
                    initArcgis.init("MapLocation_map",function(map){
                        that.map = map;
                    });
                }else{
                    that.map = new initArcgis.gisConstructor.map("MapLocation_map", {
                        center: [settingTemplate.x,settingTemplate.y],
                        zoom: settingTemplate.level,
                        slider: false,
                        logo: false,
                        isClickRecenter:true
                    });
                    let tiledLayer = new initArcgis.gisConstructor.ArcGISTiledMapServiceLayer(settingTemplate.baseMapLayers[0].url,{id:settingTemplate.baseMapLayers[0].id});
                    that.map.addLayer(tiledLayer);
                }
                var timer = window.setInterval(function(){
                    if(that.map){
                        window.clearInterval(timer);
                        that.map.on("click",function(evt){
                            common.getAddressByXY(evt.mapPoint,function(data){
                                console.log("xy::  ",data);
                                var obj = {
                                    name:data.result.formatted_address,
                                    geometry:data.result.location.lon + " " + data.result.location.lat
                                }
                                that.handleSelect(obj);
                            });
                        });
                    }
                },100);
            });
        },
        querySearch(querystring,cb){
            var that = this;

            common.getTDTPOIData(querystring,function(data){
                console.log("data: ",data);
                if(data.pois.length > 0){
                    var json = [];
                    data.pois.forEach((item,index) => {
                         json.push({
                            id:index+1,
                            name:item.address+item.name,
                            type:item.hotPointID,
                            geometry:item.lonlat
                        });
                    });
                    cb(json);
                }
            });
            //获取道路数据
            // common.getPOIData("CHINAME like '%" + querystring + "%'",function(data){
            //     var json = [];
            //     data.forEach((item,index)=>{
            //         json.push({
            //             id:index+1,
            //             name:item.attributes["CHINAME"],
            //             type:item.attributes["CATEGORY"],
            //             geometry:item.geometry
            //         });
            //     });
            //     cb(json);
            // });
        },
        handleSelect(item){
            var that = this;
            console.log("item: ",item);
            that.searchValue = item.name;

            if(that.map.getLayer("poilayer_GraphicsLayer")){
                that.map.getLayer("poilayer_GraphicsLayer").clear();
                that.map.removeLayer(that.map.getLayer("poilayer_GraphicsLayer"));
            }
 
            var tempLayer = new initArcgis.gisConstructor.GraphicsLayer({
                id: "poilayer_GraphicsLayer"
            })

            that.map.addLayer(tempLayer, 3)
            var point = new initArcgis.gisConstructor.Point([parseFloat(item.geometry.split(" ")[0]),parseFloat(item.geometry.split(" ")[1])], that.map.spatialReference)
			var sps = new initArcgis.gisConstructor.PictureMarkerSymbol(that.locationImg, 20, 50)
			sps.setOffset(15, 15)
            var graphic = new initArcgis.gisConstructor.graphic(point, sps);
            console.log("graphic:  ",graphic);
			tempLayer.add(graphic)
            that.map.centerAndZoom(point,that.map.getMaxZoom());
            item["X"]=item.geometry.split(" ")[0];
            item["Y"]=item.geometry.split(" ")[1];
            bus.$emit("mapLocationBack",item);
        },
        handleClose(){
            this.mapLocationDialogVisible=false;
        },
        handleBack(){
            bus.$emit("mapLocationBack",{name:'',X:0,Y:0});
            this.mapLocationDialogVisible=false;
        }
    },
    mounted(){
        var that = this;
        bus.$on("mapLocation",function(show){
            that.searchValue = "";
            that.mapLocationDialogVisible = show;
            that.initMap();
        })
    }
}
</script>
<style scoped>
#MapLocation_map{
    width: 100%;
    height: calc(60vh);
}
.MapLocation .bottomBtn{margin:10px;}
</style>
<style>
.MapLocation .el-input-group__append,
.MapLocation .el-input-group__prepend {
  display: none;
}
.maplocation-autocomplete{
    position: relative !important;
    top: 0 !important;
}
.mapLocation-dialog .el-dialog__header{
    text-align: left;
    border-bottom: 1px solid #cccccc;
}
.mapLocation-dialog .el-dialog__body{
    padding: 0;
}
.maplocation-autocomplete {
  width: 350px !important;
  left: 0rem !important;
}
.maplocation-autocomplete .el-autocomplete-suggestion__wrap {
  max-height: 5rem;
}
.maplocation-autocomplete table {
  width: 100%;
}
.maplocation-autocomplete table tr td {
  height: 40px;
  line-height: 40px;
  cursor: pointer;
  font-size: 16px;
  font-family: "Microsoft YaHei";
}
.maplocation-autocomplete table tr:hover {
  background: #f1f5fc;
  /* color: #ffffff; */
}
.maplocation-autocomplete table tr td:nth-child(1) {
  width: 20px;
  /* text-align: center; */
}
.maplocation-autocomplete table tr td:nth-child(2) {
  /* width: 20%; */
  text-align: left;
  /* color: #999999; */
}
/*---------------------------autocomplete样式end--------------------------*/
.MapLocation .el-dialog{   margin-top:7vh !important;}
</style>