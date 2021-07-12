<template>
  <div class="queryForm">
    <el-form :model="form" ref="form" inline :label-width="labelWidth">
      <el-form-item :label="item.label" v-for="(item, index) in queryForm" :key="index">
        <slot :name="item.name" :scope="form[item.name]" v-if="item.hasOwnProperty('custom')" />
        <template v-else>
          <el-input :style="item.style ? item.style : ''" :placeholder="item.placeholder || '请输入'" v-if="item.type === 'input'" size="small" clearable v-model="form[item.name]" />
          <el-date-picker :style="item.style ? item.style : ''" v-if="item.type === 'date'" :placeholder="item.placeholder || '请选择'" v-model="form[item.name]" size="small" clearable value-format="yyyy-MM-dd" />
          <el-date-picker :style="item.style ? item.style : ''" v-if="item.type === 'month'" type="month" :placeholder="item.placeholder || '请选择'" v-model="form[item.name]" size="small" clearable value-format="yyyy-MM" />
          <el-date-picker :style="item.style ? item.style : ''" v-model="form[item.name]" v-if="item.type === 'datetimerange'" type="datetimerange" range-separator="至" start-placeholder="开始日期" size="small" end-placeholder="结束日期"></el-date-picker>
          <el-date-picker
            :style="item.style"
            v-if="item.type === 'daterange'"
            :placeholder="item.placeholder || '请选择'"
            size="small"
            v-model="form[item.name]"
            type="daterange"
            range-separator="——"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="
              val => {
                return handleDate(val, item.name);
              }
            "
            clearable
            value-format="yyyy-MM-dd"
          />
          <el-select :style="item.style ? item.style : ''" v-if="item.type === 'select'" :placeholder="item.placeholder || '全部'" v-model="form[item.name]" size="small" @focus="getOption(item.name)" clearable>
            <el-option v-for="(items, indexs) in item.options" :key="indexs" :label="items[item.optionLabel] || items.label" :value="items[item.optionValue] || items.value" />
          </el-select>
        </template>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" icon="el-icon-search" @click="handleSearch">查询</el-button>
      </el-form-item>
      <slot name="btn" />
      <el-form-item v-if="ifAdd">
        <el-button type="primary" @click="handleAdd('Form')" size="small" icon="el-icon-plus">{{ addText }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    form: {
      type: Object,
      default: () => {},
      required: true,
    },
    queryForm: {
      type: Array,
      default: () => [],
      required: true,
    },
    addText: {
      type: String,
      default: '新增',
    },
    ifAdd: {
      type: Boolean,
      default: true,
    },
    labelWidth: {
      type: String,
      default: '100px',
    },
  },
  data() {
    return {};
  },
  methods: {
    getOption(name) {
      this.$emit('getOption', name);
    },
    handleSearch() {
      console.log(this.form);
      this.$emit('handleSearch', this.form);
    },
    handleAdd() {
      this.$emit('handleAdd');
    },
    handleDate(val, name) {
      let obj = { val, name };
      this.$emit('handleDate', obj);
    },
  },
};
</script>

<style lang="less" scoped>
.queryForm {
  /deep/ .el-form {
    flex-wrap: nowrap;
  }
  /deep/.el-form-item__label {
    text-align: center;
  }
}
</style>
