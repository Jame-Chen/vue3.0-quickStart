<template>
  <div>
    <el-table :data="data" v-bind="$attrs" v-on="$listeners">
      <template v-for="item in complexColumn">
        <el-table-column v-if="item.prop == 'selection'" :key="item.id" type="selection" width="50"></el-table-column>
        <el-table-column v-else-if="item.prop == 'cation'" :key="item.id" :label="item.label" :align="item.align ? item.align : ''" :width="item.width ? item.width : ''">
          <template slot-scope="scope">
            <render :scope="scope" :render="item.render"></render>
          </template>
        </el-table-column>
        <el-table-column v-else :key="item.id" :prop="item.prop" :label="item.label" :align="item.align ? item.align : ''" :width="item.width ? item.width : ''" :formatter="item.formatter ? item.formatter : ''"></el-table-column>
      </template>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[5, 10, 20, 40]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
  </div>
</template>

<script>
import render from '@/components/render.vue'
export default {
  data() {
    return {
      currentPage: 1, //初始页
      pagesize: 20 //    每页的数据
    }
  },
  watch: {},
  props: {
    total: { type: Number },
    data: { type: Array },
    complexColumn: { type: Array }
  },
  components: {
    render
  },
  methods: {
    // 初始页currentPage、初始每页数据数pagesize和数据data
    handleSizeChange: function(size) {
      this.pagesize = size
      //console.log(this.pagesize); //每页下拉显示数据
    },
    handleCurrentChange: function(currentPage) {
      this.currentPage = currentPage
      this.$emit('CurrentChange', currentPage)
      //console.log(this.currentPage); //点击第几页
    }
  }
}
</script>

<style lang="scss" scoped>
.el-pagination {
  margin-top: 10px;
}
</style>
