<template>
  <div id="app" v-finger:swipe="swipeHandler">
    <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
    <router-view/>
    <canvas style="display:none;" id="can" width="350" height="350"></canvas>
  </div>
</template>

<script>
export default {
  methods: {
    swipeHandler(e) {
      if ('Right' == e.direction) {
        this.$router.go(1)
      } else if ('Left' === e.direction) {
        this.$router.go(-1)
      }
    }
  }
}
</script>

<style lang="sass">
#app
  height: 100%
  position: relative
  background-color: #F5F5F9
  z-index: 999
</style>
