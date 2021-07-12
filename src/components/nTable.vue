<template>
  <div class="nTable">
    <el-table :data="tableData" :border="ifBorder" :height="tableHeight || null" :header-cell-style="{ background: '#f4f4f5', color: '#666' }" :expand-row-keys="expandKey" :row-key="getRowKeys" @selection-change="handleSelectionChange">
      <el-table-column type="selection" v-if="ifSelection" width="50px"></el-table-column>
      <el-table-column label="序号" width="50px" align="center" v-if="ifNumber">
        <template slot-scope="scope">{{ (findArticleDto.page - 1) * findArticleDto.pageSize + scope.$index + 1 }}</template>
      </el-table-column>
      <template v-for="(item, index) in tableHeader">
        <el-table-column :label="item.label" :key="index" :prop="item.prop" v-if="!item.type" :width="item.width" :align="item.align || 'left'" :formatter="item.formatter">
          <template v-if="item.children">
            <el-table-column :label="items.label" :key="indexs" :prop="items.prop" v-for="(items, indexs) in item.children" :width="items.width" :align="items.align || 'left'" :formatter="items.formatter">
              <template v-if="items.children">
                <el-table-column :label="itemss.label" :key="indexss" :prop="itemss.prop" v-for="(itemss, indexss) in items.children" :width="itemss.width" :align="itemss.align || 'left'" :formatter="itemss.formatter"></el-table-column>
              </template>
            </el-table-column>
          </template>
        </el-table-column>
        <el-table-column v-if="item.type === 'custom'" :key="index" :label="item.label" :width="item.width" :align="item.align || 'left'">
          <template slot-scope="scope">
            <slot :name="item.prop" :scope="scope.row" :index="scope.$index" />
          </template>
        </el-table-column>
        <slot :name="item.prop" v-if="item.type === 'level'"></slot>
      </template>
      <el-table-column type="expand" v-if="ifExpand">
        <template slot-scope="scope">
          <slot name="expand" :scope="scope.row" :index="scope.$index" />
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :current-page.sync="findArticleDto.page" :page-size="findArticleDto.pageSize" :page-sizes="[20, 50, 100, 500]" layout="total,prev,pager,next,sizes" :total="total" style="text-align: right;padding: 20px 0;" @size-change="handleSizeChange" @current-change="handleCurrentPage" v-if="ifPagination" />
  </div>
</template>

<script>
export default {
  props: {
    tableData: {
      type: Array,
      default: () => [],
      required: true,
    },
    tableHeader: {
      type: Array,
      default: () => [],
      required: true,
    },
    tableHeight: {
      type: String,
      default: '',
    },
    total: {
      type: Number,
      default: 0,
    },
    findArticleDto: {
      type: Object,
      default: () => ({
        page: 1,
        pageSize: 20,
      }),
    },
    ifPagination: {
      type: Boolean,
      default: true,
    },
    ifBorder: {
      type: Boolean,
      default: true,
    },
    ifExpand: {
      type: Boolean,
      default: false,
    },
    ifSelection: {
      type: Boolean,
      default: false,
    },
    expandKey: {
      type: Array,
      default: () => [],
    },
    ifNumber: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {};
  },
  computed: {},
  methods: {
    handleSizeChange(e) {
      this.findArticleDto.pageSize = e;
      this.$emit('handleSizeChange', e);
    },
    handleCurrentPage(e) {
      this.findArticleDto.page = e;
      this.$emit('handlePage', e);
    },
    getRowKeys(row) {
      return row.entrusCode;
    },
    handleSelectionChange(val) {
      this.$emit('handleSelectionChange', val);
    },
  },
};
</script>
