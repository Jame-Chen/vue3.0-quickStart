<template>
  <div class="returnHeader">
    <div class="left">
      <el-tooltip content="返回" placement="top">
        <span @click="handleBack" class="returnBtn">
          <i class="el-icon-arrow-left" style="font-weight: bold;font-size:18px"></i>
        </span>
      </el-tooltip>
      <slot name="custom" />
      <span style="font-weight: bold;margin-left:10px">{{ titleText }}</span>
    </div>
    <div class="right">
      <slot name="rightCustom" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    titleText: {
      type: String,
      default: '',
      required: true,
    },
  },
  data() {
    return {};
  },
  methods: {
    handleBack() {
      this.$emit('handleBack');
    },
  },
};
</script>

<style lang="less" scoped>
.returnHeader {
  text-align: left;
  color: #333333;
  background: #fff;
  width: 100%;
  padding: 0;
  display: flex;
  height: 50px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  .returnBtn {
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    &:hover {
      color: #3380fb;
    }
  }
  .returnBtn:hover {
    color: #3883fb;
  }
}
</style>
