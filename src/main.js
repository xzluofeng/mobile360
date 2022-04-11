import Vue from 'vue'
import router from './router'
import 'amfe-flexible'
// import lodash from 'lodash'

// import Vant from 'vant'
// import 'vant/lib/index.css'
import 'vant/lib/index.css';//npm下载包
import 'vant/lib/icon/local.css'//本地图标，在没有网情况下
import 'font-awesome/css/font-awesome.min.css'
import '@/assets/iconfont/iconfont.css'

import date from "@/utils/date"
import http from "@/utils/http"
import common from "@/utils/common"

import '@/assets/css/common.css'

import { Cell, CellGroup, Col, Collapse, CollapseItem, Dialog, Field, Icon, List, NavBar, Picker, Popup, Row, Search, Tabbar, TabbarItem } from "vant";
Vue.use(Cell);
Vue.use(CellGroup);
Vue.use(Col);
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.use(Dialog);
Vue.use(Field);
Vue.use(Icon);
Vue.use(List);
Vue.use(NavBar);
Vue.use(Picker);
Vue.use(Popup);
Vue.use(Row);
Vue.use(Search);
Vue.use(Tabbar);
Vue.use(TabbarItem);

import App from './App.vue'

Vue.config.devtools = true;
// Vue.use(Vant);

Vue.prototype.$lodash = {
  concat(arr1, arr2) {
    return arr1.concat(arr2);
  }
};

// 自定义类库
Vue.prototype.$post = http.post;
Vue.prototype.$format = date.format;
Vue.prototype.$formatDate = date.formatDate;
Vue.prototype.$formatDateTime = date.formatDateTime;
Vue.prototype.$getAge = date.getAge;
Vue.prototype.$getJzAge = date.getJzAge;
// Vue.prototype.$addWaterMarkder = common.addWaterMarkder;
Vue.prototype.$getJzlbmc = common.getJzlbmc;
Vue.prototype.$getPatientHeadImg = common.getPatientHeadImg;
Vue.prototype.$getValue = common.getValue;
Vue.prototype.go = common.go;
Vue.prototype.$isFragment = common.isFragment;
Vue.prototype.$getContentContainerPositionInfo = common.getContentContainerPositionInfo;

import AlloyFinger from 'alloyfinger';
import AlloyFingerPlugin from 'alloyfinger/vue/alloy_finger_vue';

Vue.use(AlloyFingerPlugin,{
  AlloyFinger
})

import './utils/appback.js'


// Vue.prototype.$watermark = watermark

// localstorage封装
Vue.prototype.$storage = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get(key) {
    return JSON.parse(localStorage.getItem(key));
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

const FastClick = require('fastclick');
FastClick.attach(document.body);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
