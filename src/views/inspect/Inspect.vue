<template>
  <div class="inspect flex flex-v">
    <router-view class="flex-1"/>
    <g-footer class="g-footer" v-if="!isFragment"></g-footer>
  </div>


</template>

<script>
import gFooter from "../../components/Menu";
export default {
  data() {
    return {
      isFragment: false
    };
  },
  components: {
    gFooter
  },
  mounted() {
    this.isFragment = this.$isFragment()
  }
};
</script>

<style lang="scss" scoped>
.inspect {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
.g-footer {
  height: 50px;
}
</style>
