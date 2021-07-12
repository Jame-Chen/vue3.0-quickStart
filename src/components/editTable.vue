<template>
  <el-table :data="tableData" stripe border style="width: 100%" :header-cell-style="{ background: '#f4f4f5', color: '#666' }">
    <template v-for="(item, i) in tableHead">
      <el-table-column v-if="item.type == 'input'" :key="i" :prop="item.prop" :label="item.label" :width="item.width" :align="item.align">
        <template slot-scope="scope">
          <el-input v-model="scope.row[item.prop]" size="small" style="width:100%" placeholder="请输入" small></el-input>
        </template>
      </el-table-column>
      <el-table-column v-if="item.type == 'select'" :key="i" :prop="item.prop" :label="item.label" :width="item.width" :align="item.align">
        <template slot-scope="scope">
          <el-select v-model="scope.row[item.prop]" size="small">
            <el-option v-for="(jtem, i) in item.options" :key="i" :label="jtem.label" :value="jtem.value" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column v-if="item.type == 'checkbox'" :key="i" :prop="item.prop" :label="item.label" :width="item.width" :align="item.align">
        <template slot-scope="scope">
          <el-checkbox-group v-model="scope.row[item.prop]">
            <el-checkbox v-for="(jtem, i) in item.options" :key="i" :label="jtem.label"></el-checkbox>
          </el-checkbox-group>
        </template>
      </el-table-column>
      <el-table-column v-if="item.type == 'radio'" :key="i" :prop="item.prop" :label="item.label" :width="item.width" :align="item.align">
        <template slot-scope="scope">
          <el-radio v-model="scope.row[item.prop]" v-for="(jtem, i) in item.options" :key="i" :label="jtem.label">{{ jtem.label }}</el-radio>
        </template>
      </el-table-column>
      <el-table-column v-if="item.type == 'datetime'" :key="i" :prop="item.prop" :label="item.label" :width="item.width" :align="item.align">
        <template slot-scope="scope">
          <el-date-picker v-model="scope.row[item.prop]" type="date" size="small" placeholder="选择日期"></el-date-picker>
        </template>
      </el-table-column>
      <el-table-column v-if="item.type == 'custom'" :key="i" :prop="item.prop" :label="item.label" :width="item.width" :align="item.align">
        <template slot-scope="scope">
          <slot name="custom" :scope="scope.row"></slot>
        </template>
      </el-table-column>
    </template>
  </el-table>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: ['tableData', 'tableHead'],
};
</script>
