<template>
    <div class="hunj">
    <ArcgisMap mapId='map'></ArcgisMap>
    </div>
</template>

<script>
import ArcgisMap from '@/components/ArcgisMap/ArcgisMap.vue'
export default {
  data() {
    return {}
  },
  components: {
    ArcgisMap
  },
  methods: {},
  mounted() {}
}
</script>

<style lang="scss" scoped>
.hunj {
  width: 100%;
  height: 100%;
}
</style>
