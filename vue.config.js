// const CompressionWebpackPlugin = require('compression-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // 用于移动360打包app的路径
  // baseUrl: './',
  baseUrl: '/mobile360/',
  productionSourceMap: false,
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          'toast-background-color': 'rgba(40,76,152, 0.8)',
        }
      }
    }
  },

  // 高级的方式
  // configureWebpack: config => {
  //   config.externals = {
  //     "vue": "Vue",
  //     // vuex: "Vuex",
  //     "vue-router": "VueRouter",
  //     "axios": "axios"
  //   };
  // }
  configureWebpack: () => {},
}
