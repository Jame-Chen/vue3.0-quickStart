<template>
    <div>
        <el-dialog :visible.sync="visible" @close="$emit('update:visible', false)" v-bind="$attrs" v-on="$listeners">
            <slot name="header" ></slot>
            <slot ></slot>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    visible(val) {
      this.visible = val
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
