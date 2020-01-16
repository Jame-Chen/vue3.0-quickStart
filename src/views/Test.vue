<template>
  <div>
    <div id="scoretb">
      <ul>
        <li>
          1
        </li>
        <li>
          2
        </li>
        <li>
         3
        </li>
        <li>
          4
        </li>
        <li>
         5
        </li>
         <li>
          1
        </li>
        <li>
          2
        </li>
        <li>
         3
        </li>
        <li>
          4
        </li>
        <li>
         5
        </li>
         <li>
          1
        </li>
        <li>
          2
        </li>
        <li>
         3
        </li>
        <li>
          4
        </li>
        <li>
         5
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { get } from '../http/api';
import '../../public/js/jquery.scrollbox';
export default {
  data() {
    return {
      dizhuData: []
    }
  },
  methods: {
  },
  mounted() {
    $('#scoretb').scrollbox({
      linear: true,
      step: 1,
      delay: 0,
      speed: 100
    });
  }
}
</script>
<style scoped>
#scoretb {
  height: 200px;
  overflow: hidden;
  font-size: 36px;
  background-color: aquamarine;
}
#scoretb ul {
  height: 300px;
  overflow: hidden;
}
</style>