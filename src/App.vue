<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import $ from '@/assets/jquery-vendor.js'
export default {
  name: 'app',
  components: {}
}
</script>
<style src='./assets/css/normalize.css'>
</style>
<style scoped>
#app {
  height: 100%;
}
</style>
