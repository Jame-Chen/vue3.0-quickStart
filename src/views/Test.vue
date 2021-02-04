<template>
  <div>
 <el-tabs tab-position="left" style="height:100%;">
    <el-tab-pane label="基本表格">

   <eltable :data="data" :complexColumn="complexColumn"></eltable>

    </el-tab-pane>
    <el-tab-pane label="echarts">
        <echarts id="ss" :data='option' ></echarts>
    </el-tab-pane>
    <el-tab-pane label="echarts1">
        <echarts id="aa" :data='option1' ></echarts>
    </el-tab-pane>
    <el-tab-pane label="其它">
       <el-button @click="visible=!visible">点击</el-button>
        <eldialog :visible.sync="visible">
            <div slot="header" style="color:red">哈哈</div>
            <div>default</div>
        </eldialog>
    </el-tab-pane>
  </el-tabs>
   
  </div>
</template>

<script>
import table from '@/assets/js/table.js'
import eltable from '@/components/elTable.vue'
import echarts from '@/components/echarts.vue'
import eldialog from '@/components/elDialog.vue'
export default {
  mixins: [table],
  data() {
    return {
      visible: false,
      option: {
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: 'line',
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ],
        tooltip: {}
      },
      option1: {
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [840, 632, 961, 934, 1290, 1330, 920],
            type: 'line',
            symbolSize: 8,
            lineStyle: {
              normal: {
                color: '#00E2FC',
                shadowColor: 'rgba(0, 0, 0, .3)',
                shadowBlur: 0,
                shadowOffsetY: 5,
                shadowOffsetX: 5
              }
            },
            label: {
              show: true,
              position: 'top',
              textStyle: {
                color: '#11FFFF'
              }
            },
            itemStyle: {
              color: '#11FFFF',
              borderColor: '#fff',
              borderWidth: 3,
              shadowColor: 'rgba(0, 0, 0, .3)',
              shadowBlur: 0,
              shadowOffsetY: 2,
              shadowOffsetX: 2
            },
            tooltip: {
              show: true
            },
            areaStyle: {
              normal: {
                color: new this.$echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: 'rgba(17,255,255,0.3)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(17,255,255,0)'
                    }
                  ],
                  false
                ),
                shadowColor: 'rgba(17,255,255, 0.9)',
                shadowBlur: 20
              }
            }
          }
        ],
        tooltip: {}
      }
    }
  },
  components: { eltable, echarts, eldialog },
  methods: {
    selectionChange(rows) {
      console.log('selected', rows)
    }
  },
  mounted() {}
}
</script>

<style lang="scss" scoped>
#ss {
  width: calc(100vw - 96px);
  height: calc(50vh);
}
#aa {
  width: calc(100vw - 96px);
  height: calc(50vh);
}
</style>
