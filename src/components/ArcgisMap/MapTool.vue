<template>
    <div class="MapTool" >
        <!-- <div>
            <el-button type="primary" @click="addFence">围栏新增</el-button>
        </div> -->
        <div>
            <el-drawer
                title="我是标题"
                :visible.sync="drawer"
                :modal=false
                ref="drawer"
                size="350px"
            >
                <template slot="title">
                    <div>
                        <el-row>
                            <el-col :span="20">
                                <div style="font-size:16px;font-family:MicrosoftYaHei-Bold,MicrosoftYaHei;font-weight:bold;color:rgba(81,90,110,1);line-height:21px;text-align: left;">新增/编辑围栏信息</div>
                            </el-col>
                        </el-row>
                    </div>
                </template>
                <el-row>
                    <el-col :span="24">
                        <div style="padding:5px 15px;">
                            <el-form :model="ruleForm" ref="ruleForm" label-width="80px" class="demo-ruleForm" >
                                <el-form-item label="围栏编码" prop="code">
                                    <el-input v-model="ruleForm.code" size="small" style="width: 100%;" disabled></el-input>
                                </el-form-item>
                                <el-form-item label="围栏类型" prop="type">
                                    <el-select v-model="ruleForm.type" placeholder="请选择" size="small" style="width: 100%;" :opper-append-to-body=false clearable> 
                                        <el-option label="中心护栏" value="0"></el-option>
                                        <el-option label="机非护栏" value="1"></el-option>
                                        <el-option label="人非护栏" value="2"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="围栏长度" prop="len">
                                    <el-input v-model="ruleForm.len" size="small" style="width: 100%;" clearable></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="submitForm('ruleForm')" size="mini">{{!isdisabled ? "保存":"更新"}}</el-button>
                                    <el-button @click="resetForm('ruleForm')" size="mini">重置</el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                    </el-col>
                </el-row>
            </el-drawer>
        </div>
    </div>
    
</template>
<script>
import initArcgis from './js/arcgis_map';
import bus from '@/assets/js/eventBus.js'
import common from "@/components/ArcgisMap/js/common.js";
import tool from '@/assets/js/tool.js';
import qs from 'qs';
export default {
    data(){
        return{
            drawer:false,
            isdisabled:false,
            ruleForm:{
               code:'',
               type:'',
               len:''
            },
            targetLayer:null,
            graphic:null,
            layerurl:null
        }
    },
    methods:{
        addFence(){
            // initArcgis.startDrawFence();
        },
        submitForm(formName){
            var that = this;
            that.graphic.attributes["S_Enclosure_ID"] = that.ruleForm.code;
            that.graphic.attributes["S_Enclosure_SUBTYPE"] = that.ruleForm.type;
            that.graphic.attributes["N_Enclosure_Len"] = that.ruleForm.len;

            var updategraphic = {
                "geometry":{"paths":that.graphic.geometry.paths,"spatialReference":that.graphic.geometry.spatialReference},
                "attributes":that.graphic.attributes
            }
            console.log("graphic:  ",that.graphic);
            var data = {
                f: "json",
                updates: JSON.stringify([updategraphic]) 
            }
            tool.featureLayerEditApi(that.layerurl,qs.stringify(data),"updateResults",function(success){
                if(success){
                    that.targetLayer.refresh();
                }
            });
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
        }
    },
    mounted(){
        var that = this;
        bus.$on("fenceAttributeShow",function(data){
            that.drawer = data.show;
            console.log("data:  ",data);
            that.graphic = null;
            that.ruleForm.code = data.data.attributes["S_Enclosure_ID"];
            that.ruleForm.type = data.data.attributes["S_Enclosure_SUBTYPE"];
            that.ruleForm.len = data.data.attributes["N_Enclosure_Len"];
            that.graphic = data.data;
            that.layerurl = data.layerurl;

            that.targetLayer = data.layer;
        });
    }
}
</script>
<style scoped>
.MapTool{
    top: 200px;
    left: 20px;
    position: relative;
    z-index: 4;
    text-align: left;
    width: 100px;
}
</style>
<style>
.MapTool .el-form-item{
    margin-bottom:20px;
}
.MapTool .el-drawer__header{
    padding: 10px 10px;
    height: 60px;
    border-bottom: 1px solid #F2F2F4;
    margin-bottom: 10px;
}
</style>