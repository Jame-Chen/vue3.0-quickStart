<template>
  <div>
    <!-- <el-dialog :visible.sync="visible" @close="$emit('update:visible', false)" v-bind="$attrs" v-on="$listeners">
      <slot name="header"></slot>
      <slot></slot>
    </el-dialog> -->
    <el-drawer :visible.sync="visible" :title="title" :direction="direction" @close="$emit('update:visible', false)" v-bind="$attrs" v-on="$listeners">
      <!-- <slot name="head">{{ title }}</slot> -->
      <slot></slot>
    </el-drawer>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    visible: {
      type: Boolean,
      default: false,
    },
    direction: {
      type: String,
      default: 'rtl',
    },
  },
  watch: {
    visible(val) {
      this.visible = val;
    },
  },
};
</script>

<style lang="scss" scoped>
/deep/ .el-drawer__header {
  font-size: 18px;
  font-weight: bold;
  text-align: left;
}
/deep/ .el-drawer__body {
  overflow: auto;
}
</style>
