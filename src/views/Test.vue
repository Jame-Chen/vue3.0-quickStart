<template>
  <div>
 <el-tabs tab-position="left" style="height:100%;">
    <el-tab-pane label="基本表格">

   <eltable :data="data" :complexColumn="complexColumn"></eltable>

    </el-tab-pane>
    <el-tab-pane label="基本表格">基本表格</el-tab-pane>
    <el-tab-pane label="基本表格">基本表格</el-tab-pane>
    <el-tab-pane label="基本表格">基本表格</el-tab-pane>
  </el-tabs>
   
  </div>
</template>

<script>
import table from '@/assets/js/table.js'
import eltable from '@/components/elTable.vue'
export default {
  mixins: [table],
  data() {
    return {}
  },
  components: { eltable },
  methods: {
    selectionChange(rows) {
      console.log('selected', rows)
    }
  },
  mounted() {}
}
</script>

<style lang="scss" scoped>
</style>
