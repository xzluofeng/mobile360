import Vue from 'vue'
import Router from 'vue-router'
import { saveLogs} from "./utils/stat-data";
// import Home from './views/Home.vue'
import Redirect from './views/Redirect.vue'
// TODO for test
// import Calendar from './views/Calendar.vue'
// import Card from './views/Card.vue'

Vue.use(Router);
let routerMap = [
  {
    path: '/',
    name: '重定向页面',
    component: Redirect
  },
  {
    path: '/card',
    name: '床位卡',
    meta: {
      moduleCode: 'card',
      moduleName: '床位卡'
    },
    // 床位卡
    // component: import('./views/Card.vue')
    component: () => import(/* webpackChunkName: "about" */ './views/Card.vue')
  },
  {
    path: '/about',
    name: '',
    // 关于（未用到）
    component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
  },
  {
    path: '/advice',
    name: '医嘱',
    meta: {
      moduleCode: 'advice',
      moduleName: '医嘱'
    },
    // 医嘱
    component: () => import('./views/Advice.vue')
  },
  {
    path: '/check',
    name: '检查',
    meta: {
      moduleCode: 'check',
      moduleName: '检查'
    },
    // 检查
    component: () => import('./views/Check.vue')
  },
  {
    path: '/checkDetails',
    name: '检查报告明细',
    // 检查报告明细
    component: () => import('./views/CheckDetails.vue')
  },
  {
    path: '/diagnosis',
    name: '诊断',
    meta: {
      moduleCode: 'diagnosis',
      moduleName: '诊断'
    },
    // 诊断
    component: () => import('./views/Diagnosis.vue')
  },
  {
    path: '/index',
    name: '首页',
    meta: {
      moduleCode: 'index',
      moduleName: '首页'
    },
    //
    component: () => import('./views/Index.vue')
  },
  {
    path: '/login',
    name: 'login',
    // 首页
    component: () => import('./views/Login.vue')
  },
  {
    path: '/loginByPassword',
    name: 'loginByPassword',
    // 首页
    component: () => import('./views/LoginByPassword.vue')
  },
  {
    path: '/inspect',
    name: '检验',
    meta: {
      moduleCode: 'inspect',
      moduleName: '检验'
    },
    // 检验
    redirect: '/inspect/inspectionsList',
    component: () => import('./views/inspect/Inspect.vue'),
    children: [
      {
        path: 'inspectionsList',
        name: 'inspectionsList',
        component: () => import('./views/inspect/InspectionsList.vue')
      },
      {
        path: 'inspectionsInfo',
        name: 'inspectionsInfo',
        component: () => import('./views/inspect/InspectionsInfo.vue')
      }
    ]
  },
  {
    path: '/medicalRecord',
    name: '病历',
    meta: {
      moduleCode: 'medicalRecord',
      moduleName: '病历'
    },
    // 病历
    component: () => import('./views/medicalRecord/MedicalRecord.vue')
  },
  {
    path: '/medicalRecordContent',
    name: 'medicalRecordContent',
    // 病历
    component: () => import('./views/medicalRecord/MedicalRecordContent.vue')
  },
  {
    path: '/recipel',
    name: '处方',
    meta: {
      moduleCode: 'recipel',
      moduleName: '处方'
    },
    // 处方
    component: () => import('./views/Recipel.vue')
  },
  {
    path: '/patientInfo',
    name: '患者基本信息',
    meta: {
      moduleCode: 'patientInfo',
      moduleName: '患者基本信息'
    },
    // 患者基本信息
    component: () => import('./views/PatientInfo.vue')
  },
  {
    path: '/quota',
    name: '指标',
    meta: {
      moduleCode: 'quota',
      moduleName: '指标'
    },
    // 指标
    component: () => import('./views/Quota.vue')
  },
  {
    path: '/search',
    name: 'search',
    // 患者搜索
    component: () => import('./views/Search.vue')
  },
  {
    path: '/sign',
    name: '体征',
    meta: {
      moduleCode: 'sign',
      moduleName: '体征'
    },
    // 体征
    component: () => import('./views/Sign.vue')
  },
  {
    path: '/cdady',
    name: 'CDA',
    meta: {
      moduleCode: 'cda',
      moduleName: 'CDA'
    },
    // 体征
    component: () => import('./views/cda/Cda.vue')
  },
  {
    path: '/cdaContent',
    name: 'cdaContent',
    // CDA
    component: () => import('./views/cda/CdaContent.vue')
  },
  {
    path: '/time',
    name: 'time',
    // 时间轴
    component: () => import('./views/Time.vue')
  },
  {
    path: '/calendar',
    name: 'calendar',
    // 时间轴
    component: () => import('./views/Calendar.vue')
  }
]
let route = new Router({
  // 用于移动360打包app的路由模式
  //mode: 'hash',
  mode: 'history',
  base: process.env.BASE_URL,
  routes: routerMap
});
route.beforeEach((to, from, next) => {
  // 有当前患者信息缓存 则记录操作日志
  if(localStorage.getItem("infos") && to.meta){
    let moduleCode = to.meta.moduleCode;
    let moduleName = to.meta.moduleName;
    saveLogs(moduleCode,moduleName,1,"mobile360")
  }
  next();
});
export default route;
