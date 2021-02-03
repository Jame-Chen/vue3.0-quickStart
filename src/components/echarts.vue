<template>
    <div  :id="id" ></div>
</template>
<script>
export default {
  props: ['id', 'data'],
  data() {
    return {
      ChartGraph: null
    }
  },
  watch: {
    data: {
      handler(newValue) {
        this.drawGraph(this.id, newValue)
      },
      deep: true
    }
  },
  mounted() {
      this.drawGraph(this.id, this.data)
  },
  methods: {
    drawGraph(id, data) {
      let _this = this
      let myChart = document.getElementById(id)
      this.ChartGraph = this.$echarts.init(myChart)
      this.ChartGraph.setOption(data)
      window.addEventListener('resize', function() {
        _this.ChartGraph.resize()
      })
    }
  },
  beforeDestroy() {
    if (this.ChartGraph) {
      this.ChartGraph.clear()
    }
  },
  components: {}
}
</script>
