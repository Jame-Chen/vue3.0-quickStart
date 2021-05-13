<template>
  <div id="map">
	<div class="layerlist">
				<template v-for="(item, i) in layerGroupData">
					<div :key="i" class="gcontent">
					
							<el-checkbox :indeterminate="isIndeterminate['indete' + i]" v-model="checkAll['checkAll' + i]" @change="(checked) =>handleCheckAllChange(checked, item.Name, i)">{{ item.Name }}</el-checkbox>
					
						<el-checkbox-group v-model="check['check' + i]" @change="(checked) =>handleCheckChange(check['check' + i],item.Name,i)">
						
								<el-checkbox v-for="(layer,i) in layerData.filter((f) => f.Name_view2 == item.Name)" :label="layer.Name" :key="i">{{ layer.Name }}</el-checkbox>
						
						</el-checkbox-group>
					</div>
				</template>
	</div>
  <div class="legend">
    <ul>
      <li v-for="(item,i) in legendData" :key="i"><img :src="item.src" /><label>{{item.layerName}}</label></li>
    </ul>
  </div>
  </div>
</template>

<script>
import arcgis from '@/components/ArcgisMap/js/arcgis_map.js'
import { settingTemplate } from '@/config/defaultSetting'
import $http from '@/http/api.js'
export default {
  data() {
    return {
      baseurl: '',
      layerUrl: '',
      ServerInstanceId: '',
      layerGroupData: [],
      layerData: [],
      isIndeterminate: {},
      checkAll: {},
      check: {},
      legendData: []
    }
  },
  methods: {
    getdata() {
      let _this = this
      let params = {
        Page: 1,
        Limit: 100,
        Visible: 1
      }
      $http
        .post('ServerInstance/Search', params) //实例
        .then(res => {
          // console.log('res', res)
          if (res.Code == 200) {
            _this.baseurl = res.Data[0].BaseUrl
            _this.ServerInstanceId = res.Data[0].ID
          }
          params.Name = ''
          params.ServerInstanceId = _this.ServerInstanceId
          return $http.post('BaseMap/Search', params) //底图
        })
        .then(res => {
          // console.log('res', res)
          if (res.Code == 200) {
            settingTemplate.baseMapLayers = []
            res.Data.forEach(item => {
              settingTemplate.baseMapLayers.push({
                id: 'TiledLayer',
                name: '底图',
                url: _this.baseurl + item.Url,
                type: 'tile'
              })
            })
            params.Name = ''
            params.Visible = 1
            return $http.post('LayerGroup/Search', params) //图层组
          }
        })
        .then(res => {
          if (res.Code == 200) {
            _this.layerGroupData = res.Data
            _this.layerGroupData.forEach((item, i) => {
              _this.$set(_this.check, 'check' + i, [])
              _this.$set(_this.checkAll, 'checkAll' + i, false)
              _this.$set(_this.isIndeterminate, 'indete' + i, false)
            })
          }
          params.Name = ''
          params.Visible = 1
          params.ServerInstanceId = _this.ServerInstanceId
          return $http.post('BaseLayer/Search', params) //图层
        })
        .then(res => {
          // console.log('res', res)
          _this.layerData = res.Data
          _this.layerUrl = _this.baseurl + _this.layerData[0].Url
          _this.layerUrl = _this.layerUrl.substr(0, _this.layerUrl.lastIndexOf('/'))
          if (res.Code == 200) {
            arcgis.init('map', function(map) {
              arcgis.loadDynamicLayer(_this.layerUrl, false, 'dynamiclayer')
            })
          }

          return $http.get(_this.layerUrl + '/legend?f=pjson', {}) //图例
        })
        .then(res => {
          _this.legendData = res.layers
          _this.legendData.forEach(item => {
            item['src'] = 'data:' + item.legend[0].contentType + ';base64,' + item.legend[0].imageData + ''
          })
          // console.log('res', res)
        })
    },
    //全选
    handleCheckAllChange(val, item, i) {
      let _this = this
      let data = this.layerData.filter(f => f.Name_view2 == item).map(m => m.Name)
      _this.check['check' + i] = val ? data : []
      _this.isIndeterminate['indete' + i] = false
      _this.visibleLayer()
    },
    //单选
    handleCheckChange(value, item, i) {
      let checkedCount = value.length
      let data = this.layerData.filter(f => f.Name_view2 == item)
      this.checkAll['checkAll' + i] = checkedCount === data.length
      this.isIndeterminate['indete' + i] = checkedCount > 0 && checkedCount < data.length
      this.visibleLayer()
    },
    visibleLayer() {
      let _this = this
      let checkData = []
      _this.layerGroupData.forEach((item, i) => {
        let data = _this.check['check' + i]
        data.forEach(f => {
          checkData.push(f)
        })
      })
      let layerids = _this.layerData.filter(f => checkData.includes(f.Name)).map(m => m.Code)
      arcgis.setMapvisibleLayer(layerids, 'dynamiclayer')
    }
  },
  mounted() {
    this.getdata()
  }
}
</script>

<style lang="scss" scoped>
#map {
  width: 100%;
  height: 100%;
  .layerlist {
    position: absolute;
    top: 50px;
    left: 50px;
    width: 400px;
    min-height: 200px;
    background-color: #fff;
    z-index: 999;
    padding: 20px;
    .gcontent {
      margin-bottom: 20px;
      font-size: 20px;
    }
    /deep/ .el-checkbox {
      width: 100px;
    }
  }
  .legend {
    position: absolute;
    bottom: 20px;
    left: 50px;
    width: 340px;
    min-height: 100px;
    background-color: #fff;
    z-index: 999;
    padding: 20px;
    font-size: 15px;
    ul {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: wrap;
      li {
        width: 110px;
        font-size: 12px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-bottom: 10px;
        img {
          width: 20px;
          margin-right: 10px;
        }
      }
    }
  }
}
</style>
