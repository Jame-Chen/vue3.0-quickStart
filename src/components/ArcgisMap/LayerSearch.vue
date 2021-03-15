<template>
    <div>
        <div class="TopLeftMenu" >
            <!-- :popper-append-to-body="false" -->
            <el-autocomplete
                popper-class="my-autocomplete"
                v-model="searchValue"
                :fetch-suggestions="querySearch"
                placeholder="请输入查询的关键字"
                @select="handleSelect"
                :trigger-on-focus="false"
                style="width:389px;float: left;"
            >
                <template slot-scope="{ item }">
                  <table style="width:100%;">
                      <tr v-if="item.index == 0">
                        <td colspan="4">{{item.name}}</td>
                      </tr>
                      <tr v-else>
                        <td align="left">{{item.index}}</td>
                        <td align="left" :title="item.name">{{item.name}}</td>
                        <td align="right">{{item.type}}</td>
                      </tr>
                  </table>
                </template>
                <el-button slot="append" icon="el-icon-search"></el-button>
            </el-autocomplete>
            <i class="sxImg_active" id="sxImg" @click="showOrHideLayerControl($event)" style="width:72px;height:44px;"></i>
        </div>
    </div>
</template>
<script>
import $ from 'jquery'
import bus from '@/assets/js/eventBus.js'
import initArcgis from '@/components/ArcgisMap/js/arcgis_map';
import Tool from '@/assets/js/tool.js'
import common from "@/components/ArcgisMap/js/common.js";
import {settingTemplate} from '@/config/defaultSetting';
export default {
    data(){
        return{
            searchValue:"",
            activeName: "",
            indeterminate: false,
            legendVisible:false,
            isCollapseVisible:true,
            layerItemList:[{
                id:0,
                layerId:0,
                field:"S_NAME",//
                tableName:"YP_GDYHJGPT.DBO.G_Road"
            }],
            searchJson:[],
            currentLayerClick:null
        }
    },
    methods:{
        querySearch(queryString, cb){
          var that = this;
          if(that.isCollapseVisible){
            that.$gisApi.layerSearch(queryString,function(data){
              var json = [];
              if(data.length > 0){
                data.forEach((item,index)=>{
                  var obj = {
                      id:index+1,
                      type:item.layerName,
                      geometry:item.feature.geometry
                  };
                  if(item.layerName.includes("积水点")){
                    obj["name"] = item.value;
                  }else{
                    obj["name"] = [1,2,4,5,6,7,8].includes(parseInt(item.layerId)) ? item.feature.attributes["所在道路名称"] + "("+item.feature.attributes["起点道路名称"]+"--"+item.feature.attributes["终点道路名称"]+")":(item.layerId == 9?item.feature.attributes["道路名称"] + "("+item.feature.attributes["起点道路"]+"--"+item.feature.attributes["终点道路"]+")":item.value);
                  }
                  json.push(obj);
                });
              }
              var array = that.$gisApi.gisInst.interface;
              if(array.length > 0){
                if(queryString){
                  array = array.filter(item=>{return item.name.includes(queryString)});
                }
                json = json.concat(array);
              }
              if(json.length == 0){
                json.push({
                    index:0,
                    name:"没有查询到相应的结果"
                });
              }else{
                json = json.map((ele,index)=>{ ele["index"] = index+1; return ele;});
              }
              cb(json);
            });
          } else{
            var json = [{
              index:0,
              name:"请在图层控制里面选择相应的图层后再查询。"
            }]
            cb(json);
          }
        },
        collapseChange(activeNames) {
          console.log(activeNames);
        },
        checkboxChange(val, checked, tableId,layerUrl) {
            // initArcgis.loadCheckedLayerOnMap(val, checked, tableId);
            common.loadCheckedFeatureLayerOnMap(val, checked, tableId,layerUrl);
            //加载图例
            // initArcgis.loadLegend(val, checked, tableId);
        },
        showOrHideLayerControl(obj){
            var that = this;
            var idName = $(obj.target).attr("id");
            var className = $(obj.target).attr("class");
            if (className.includes("active")) {
                that.isCollapseVisible = false;
                $(obj.target).removeClass(idName + "_active").addClass(idName);
            } else {
                that.isCollapseVisible = true;
                $(obj.target).addClass(idName + "_active").removeClass(idName);
            }

            that.$emit("callback", "searchClick", that.isCollapseVisible);
        },
        handleSelect(item){
          var that = this;
          if(that.currentLayerClick){
            that.currentLayerClick = null;
          }
          that.searchValue = item.name;
          if(item.geometry){
            var type = item.geometry.type;
            switch (type) {
              case "point":
                initArcgis.gisInst.map.centerAndZoom(item.geometry,initArcgis.gisInst.map.getMaxZoom());
                break;
              case "polyline":
                initArcgis.gisInst.map.setExtent(item.geometry.getExtent(),true);
              case "polygon":
                initArcgis.gisInst.map.setExtent(item.geometry.getExtent(),true);
                break;
              default:
                break;
            }
          }else{
            alert("坐标信息不存在。");
          }
          
          // if(item.currentLayer){
          //   item.currentLayer.setVisibility(true);
          //   // console.log("OBJECTID: ","OBJECTID = '" + item.objectid + "'");
          //   item.currentLayer.setDefinitionExpression("OBJECTID = " + item.objectid);
          //   item.currentLayer.refresh();
          //   console.log("currentLayer:  ",item.currentLayer);
          //   if(item.isclick){
          //     that.currentLayerClick = item.currentLayer.on("click",function(evt){
          //       var obj = {
          //             show:true,
          //             width:"30%",
          //             geotype:evt.graphic.geometry.type,
          //             type:item.type,
          //             data:evt.graphic,
          //             targetLayer:item.currentLayer
          //       }
          //       bus.$emit("featureLayerClick",obj);
          //     });
          //   }
          // }
        },
        getLayerConfigData() {
          var that = this;
          initArcgis.layerConfigData = that.layerList;
          that.layerList.forEach(item=>{
            initArcgis.layerQueryParam[item.sLayerEn] = {};
          });
        }
    },
    mounted(){
      var that = this;
      // that.getLayerConfigData();
    }
}
</script>
<style>
.TopLeftMenu .el-input--suffix {
  background: #ffffff;
}
.TopLeftMenu .el-input-group__append,
.TopLeftMenu .el-input-group__prepend {
  border: none !important;
  background: #ffffff;
}
.TopLeftMenu .el-input__inner {
  border: none !important;
  height: 44Px;
  line-height: 44Px;
  font-size:14Px;
}
.TopLeftMenu .el-icon-search {
  font-weight: bold;
  color: #4e95ff;
  font-size: 16Px;
}
.TopLeftMenu_layerControl .el-collapse-item__header {
  padding-left: 10px;
}
/*---------------------------autocomplete样式start------------------------*/
.TopLeftMenu .el-autocomplete {
  display: block !important;
}
.my-autocomplete {
  width: 389px !important;
  /* left: 0rem !important; */
  margin-top: 7px !important;
}
/* .my-autocomplete .el-autocomplete-suggestion__wrap {
  max-height: 5rem;
} */
.my-autocomplete table {
  width: 100%;
}
.my-autocomplete table tr td {
  height: 40px;
  line-height: 40px;
  cursor: pointer;
  font-size: 16px;
  font-family: "Microsoft YaHei";
}
.my-autocomplete table tr:hover {
  background: #f1f5fc;
  /* color: #ffffff; */
}
.my-autocomplete table tr td:nth-child(1) {
  width: 20px;
  /* text-align: center; */
}
.my-autocomplete table tr td:nth-child(2) {
  /* width: 20%; */
  text-align: left;
  /* color: #999999; */
}
.my-autocomplete table tr td:nth-child(1) > img {
  margin-top: -0.18rem;
  position: absolute;
  z-index: 1;
  margin-left: 0.3rem;
}
.my-autocomplete table tr td:nth-child(1) > span {
  margin-top: -0.32rem;
  margin-left: 0.43rem;
  position: absolute;
  color: #ffffff;
  z-index: 2;
}
/*---------------------------autocomplete样式end--------------------------*/
.TopLeftMenu_layerControl .el-collapse-item__header{
  height: 44Px;
  line-height: 44Px;
}
.TopLeftMenu_legend_content .el-card__body,.TopLeftMenu_legend_content .el-card__header{
  padding: 10px !important;
}
</style>
<style scoped>
.TopLeftMenu{
  margin-top: 13px;
  margin-left: 11px;
  position: absolute;
  background:rgba(255,255,255,1);
  box-shadow:0px 1px 7px 0px rgba(183,183,183,0.51);
  z-index:2;
}
#sxImg {
  background-size: 100% 100%;
  -moz-background-size: 100% 100%;
  margin-left:5PX;
  position: absolute;
  z-index: 2;
  cursor: pointer;
  box-shadow: 0PX 1PX 7PX 0PX rgba(183, 183, 183, 0.51);
}
.sxImg {
  background: url("../../assets/images/SewerDredging/LayerSearch/btn_tc_normal.png")
    no-repeat;
}
.sxImg_active {
  background: url("../../assets/images/SewerDredging/LayerSearch/btn_tc_active.png")
    no-repeat;
}
.TopLeftMenu_layerControl {
  width: 429Px;
  margin-top: 70Px;
  margin-left: 20Px;
  position: absolute;
  z-index: 2;
  background: #ffffff;
  display: none;
  box-shadow: 0px 1px 7px 0px rgba(183, 183, 183, 0.51);
}
.select-img {
  background-size: 100% 100%;
  -moz-background-size: 100% 100%;
  width: 0.3335rem;
  height: 0.3335rem;
  margin-top: 0.15rem;
  margin-right: 0.2rem;
  margin-left: 0.1rem;
}
.TopLeftMenu_legend{
  width: 50px;
  height: 50px;
  background: url("../../assets/images/Map/legend_tul.png") no-repeat;
  background-size: 50px 50px;
  bottom: 5px;
  margin-left: 20Px;
  position: absolute;
  z-index: 2;
  cursor: pointer;
}
.TopLeftMenu_legend_content{
  bottom: 10px;
  margin-left: 75Px;
  position: absolute;
  z-index: 2;
}
.legend_jsd{
  width: 335px;
  height: 137px;
  background: url("../../assets/images/Map/legend_tul_jsd.png") no-repeat;
  background-size: 335px 137px;
}
.legend_bz{
  width: 279px;
  height: 193px;
  background: url("../../assets/images/Map/legend_tul_bz.png") no-repeat;
  background-size: 279px 193px;
  margin-top: 10px;
}
</style>