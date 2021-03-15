<template>
 <!-- css3滤镜 -->
 <!-- style="-webkit-filter:sepia(100%) invert(90%) opacity(0.9) saturate(1)" -->
    <div :id="mapId" class = "map">
      <slot ></slot>
    </div>
</template>

<script>
import initArcgis from './js/arcgis_map';
import {settingTemplate} from '@/config/defaultSetting';
export default {
  props:["mapId"],
  data(){
    return {
      // mapId:"Map"
    }
  },
  watch:{
    mapId:{
      handler:function(id){
        this.mapId = id;
      },
      deep:true
    }
  },
  methods: {},
  mounted() {
    var that = this;
    initArcgis.init(that.mapId,function(map) {
      if(map){
        // initArcgis.loadDynamicLayer(settingTemplate.dynamicLayers[0].url,false,settingTemplate.dynamicLayers[0].id);
      }
    });
  }
}
</script>
<style scoped>
.map{
    width:100%;
    height:calc(100vh - 60PX);;
    /* position: absolute; */
    z-index: 1;
    margin: 0 !important;
}
</style>
<style>
.map .esriMapContainer{
  overflow: visible !important;
}
.map .esriPopup .titlePane{
    background-color: #ffffff !important;
    color: #000000 !important;
    line-height: 30px !important;
    font-weight: bold;
    font-size: 14px;
}
.map .esriPopup .titlePane .window-title-bk{
    width: 23%;
    border-bottom: 5px solid rgb(0,210,177);
    margin-top: -10px;
}
.map .esriPopup .titlePane .el-icon-close{
    float: right;
    margin-right: 10px;
    margin-top: 8px;
    cursor: pointer;
}
.map .esriPopup .titlePane .titleButton {
    display: none;
}
.map .content .contentPane{
  background: #ffffff !important;
}
.map .content .contentPane .window-name{
  color: #666666;
  font-weight: bold;
}
.map .content .contentPane .window-row{
  color: #333333;
  height: 30px;
  line-height: 30px;
  font-size: 14px;
}

</style>