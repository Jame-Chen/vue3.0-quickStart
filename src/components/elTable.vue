<template>
    <div>
    <el-table :data="data"  v-bind="$attrs" v-on="$listeners">
    <template v-for="item in complexColumn" >
        <el-table-column v-if="item.prop=='selection'" :key="item.id" type="selection" width="50">
        </el-table-column > 
        <el-table-column v-else-if="item.prop=='cation'" :key="item.id" :label="item.label" :align="item.align?item.align:''" :width="item.width?item.width:''"  >
          <template slot-scope="scope">
             <render :scope="scope" :render="item.render"></render>
          </template>
        </el-table-column>
        <el-table-column v-else :key="item.id" :prop="item.prop" :label="item.label" :align="item.align?item.align:''" :width="item.width?item.width:''" >
        </el-table-column>
    </template>
    </el-table>
    </div>
</template>

<script>
import render from '@/components/render.vue'
export default {
  data() {
    return {}
  },
  props: {
    data: { type: Array },
    complexColumn: { type: Array }
  },
  components: {
    render
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
</style>
