<template>
  <div class="card">
    <!-- <img alt="Vue logo" src="../assets/logo.jpg"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <van-nav-bar class="title" fixed @click-right="search">
      <div slot="title" @click="showDeptList">
        <span
          id="currentDept"
          class="current-dept"
          :data-code="currentDept.departmentCode"
          :data-name="currentDept.departmentName"
        >{{ currentDept.departmentName }}</span>
        <!-- <van-icon name="arrow-down" style="color: #FFFFFF;top: -1px;"/> -->
        <i class="fa fa-sort-desc" aria-hidden="true"></i>
      </div>
      <van-icon name="search" slot="right" class="nav-bar-search-icon"/>
    </van-nav-bar>
    <!-- <van-search placeholder="请输入搜索关键词" v-model="filterValue" style="background-color: #F5F5F9;"/> -->
    <div class="container">
      <van-row class="patient-btn-row">
        <van-col
          span="8"
          class="patient-btn"
          :class="{'active': activedPatientBtn == 'followed'}"
          data-value="followed"
          @click.native="changePatientList('followed')"
        >关注患者</van-col>
        <van-col
          span="8"
          class="patient-btn"
          :class="{'active': activedPatientBtn == 'my'}"
          data-value="my"
          @click.native="changePatientList('my')"
        >我的患者</van-col>
        <van-col
          span="8"
          class="patient-btn"
          :class="{'active': activedPatientBtn == 'all'}"
          style="border-top-right-radius: 4px;border-bottom-right-radius: 4px;"
          data-value="all"
          @click.native="changePatientList('all')"
        >全部患者</van-col>
      </van-row>
      <van-list class="patient-info-list">
        <div
          v-for="patient in patientList"
          class="patient-info"
          :key="patient.jzlsh+'_'+patient.yexh"
          @click="enter(patient)"
        >
          <div class="patient-info-title flex flex-pack-justify-between flex-align-center">
            <div class="patient-info-left">
              <span class="patient-info-title-bed">
                <span class="patient-info-title-bed-value">{{ patient.rycw }}</span>
                <span class="patient-info-title-bed-label">床</span>
              </span>
              <span class="patient-info-title-patient-name">{{ patient.brxxkJz.hzxm }}</span>
              <span class="patient-info-title-patient-age">{{ $getJzAge(patient.brxxkJz.birth,patient.jzkssj) }}岁</span>
              <span class="patient-info-title-patient-gender">
                <!-- <i
                v-bind:class="{'fa fa-mars': patient.brxxkJz.xbdm == 1, 'fa fa-venus': patient.brxxkJz.xbdm == 2}"
                ></i>-->
                <span>{{ patient.brxxkJz.xbmc }}</span>
              </span>
            </div>
            <div class="patient-info-right">
              <span class="patient-info-title-doctor">
                <span class="patient-info-title-doctor-label">主治医师</span>
                <span class="patient-info-title-doctor-value">{{ patient.jzysmc }}</span>
              </span>
            </div>
          </div>
          <div class="patient-info-body">
            <van-row>
              <van-col span="18">
                <div class="patient-info-body-time">
                  <span class="patient-info-body-time-label">入院时间</span>
                  <span class="patient-info-body-time-value">{{ $formatDate(patient.jzkssj) }}</span>
                </div>
                <div class="patient-info-body-zd">
                  <span class="patient-info-body-zd-label">主要诊断</span>
                  <span class="patient-info-body-zd-value">{{ patient.zdmc }}</span>
                </div>
              </van-col>
              <van-col span="6" style="text-align: center">
                <i
                  class="fa"
                  :class="patient.followed ? 'fa-star' : 'fa-star-o'"
                  style="margin-top: 14px"
                  @click.stop="handleFollow(patient)"
                ></i>
              </van-col>
            </van-row>
          </div>
        </div>
        <div class="empty-text" v-if="!patientList.length">暂无数据</div>
      </van-list>
    </div>
    <van-popup v-model="show" position="bottom">
      <van-picker
        :columns="deptList"
        @confirm="changeCurrentDept"
        @cancel="hideDeptList"
        value-key="departmentName"
        show-toolbar
        :visible-item-count="visibleItemCount"
      />
    </van-popup>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
// import date from "@/utils/date";
import { getPatidList } from "@/utils/api";
import wx from 'weixin-js-sdk'
import axios from "axios";
import qs from "qs";

export default {
  data() {
    return {
      activedPatientBtn: "followed", // 当前选中患者按钮：关注患者、我的患者、全部患者
      currentDept: {}, // 当前选中部门
      isChangeDepart: false, //是否是切换科室（下拉加载bug）
      deptList: [], // 部门列表
      filterValue: "", // 搜索关键词
      finished: true, // 下拉加载数据：是否已加载完成
      groupInfoList: [], // 分组信息列表
      jzdjInfos: [], // 患者就诊信息列表
      loading: false, // 下拉加载数据：是否处于加载状态
      patientList: [], // 患者信息列表
      show: false, // 部门选择弹出层是否显示
      size: 10, // 下拉加载数据：一次加载数据个数
      start: 0, // 下拉加载数据：开始位置
      visibleItemCount: 5 // 部门选择弹出层可见部门个数
    };
  },
  name: "home",
  components: {},
  methods: {
    /**
     * 切换当前科室
     */
    changeCurrentDept(dept) {
      this.currentDept = dept;
      this.show = false;
      this.isChangeDepart = true;
      if (this.activedPatientBtn == "all") {
        this.resetListProperties(false, false);
        this.getAllPatientList();
      }
      // 切换病区科室下拉框时，将病区科室信息保存到 localStorage
      localStorage.setItem("ksInfos", JSON.stringify(dept));
    },
    /**
     * 切换显示的患者列表：关注患者、我的患者、全部患者
     * @param type followed - 关注患者，my - 我的患者，all - 全部患者
     */
    changePatientList(type) {
      this.activedPatientBtn = type;
      this.resetListProperties(false, true);
      if (type == "followed") {
        this.getFollowedPatientList();
      } else if (type == "my") {
        this.getMyPatientList();
      } else if (type == "all") {
        this.getAllPatientList();
      }
    },
    /**
     * 进入首页
     */
    enter(patient) {
      const _this = this;
      getPatidList(patient.patid, patient.jzlb, patient.yljgdm, function(data) {
        localStorage.setItem("originalPatids", data);
        _this.$storage.set("infos", patient);
        _this.$router.push("/index");
      });
    },
    /**
     * 关注患者
     */
    follow(patient) {
      this.$post("/api/v1/com/updatePatidGroup", {
        patidList: patient.keystr,
        jzlshGroupList: JSON.stringify([
          { groupId: "0",yexh:patient.yexh, jzlshGuid: patient.jzlshGuid }
        ])
      }).then(data => {
        if (data.status == 200) {
          this.$toast.success({
            duration: 1000,
            mask: true,
            message: "关注成功！"
          });
          patient.followed = true;
        }
      });
    },
    /**
     * 获取所有患者（分页）
     */
    getAllPatientList() {
      this.$post("/api/v1/zyjzdjk/getZyjzlistByKsdm", {
        ksdm: this.currentDept.departmentCode,
        yljgdm: this.currentDept.yljgdm,
        // size: this.size,
        // start: this.start
      })
        .then(data => {
          if (data.data && data.data.length > 0) {
            this.patientList = this.$lodash.concat(
              this.patientList,
              data.data
            );
            this.getBrzdByJzlshList(data.data)
            // this.start += 1;
            // this.finished = data.data.last;
            // this.loading = false;
          }
          // else {
          //   this.finished = true;
          //   this.loading = false;
          // }
          this.isChangeDepart =false;
        })
        .then(() => {
          this.getGroupInfo();
        });
    },
    getBrzdByJzlshList(val){
      var coreInfos = [];
      val.forEach(item => {
        coreInfos.push({
        patid: item.patid,
        jzlsh: item.jzlsh,
        jzlb: item.jzlb,
        yljgdm: item.yljgdm,
        yexh: item.yexh,
        brzt: item.brzt
        });
      });
      this.$post("/api/v1/zyjzdjk/getBrzdByJzlshList",{ jzdjCoreInfos: JSON.stringify(coreInfos)})
        .then(data => {
          if (data.data) {
            data.data.forEach(item=>{
                this.patientList.forEach(patient=>{
                  if(item.jzlsh===patient.jzlsh&&item.yexh===patient.yexh
                  &&item.yljgdm===patient.yljgdm&&item.jzlb===patient.jzlb){
                    patient.zdmc=item.zdmc
                  }
                })
            })
          }
        })
        .catch(() => {});
    },
    /**
     * 获取部门列表
     */
    getDeptList() {
      this.$post("/api/v1/com/getDepartment")
        .then(data => {
          if (data.data) {
            // 从 localStorage 中获取 科室病区信息，如果没有则取默认的，如果有则取 localStorage中的病区科室信息
            let ksInfos = localStorage.getItem('ksInfos');
            if (ksInfos) {
              this.currentDept = JSON.parse(ksInfos); // 取localStorage中的病区科室信息
            } else {
              this.currentDept = data.data[0]; // 默认显示第一个科室
            }

            this.deptList = data.data;
          }
        })
        .then(() => {
          this.getFollowedPatientList();
        });
    },
    wxconf(){
      let jsTicket='-1'
      let obj = localStorage.getItem("jsTicket");
      if (obj){
        let newTime = new Date().getTime();
        if (newTime - obj.timestemp < 5400000) {
          jsTicket = obj.jsTicket;
        }
      }
      axios
        .post(
          config.http.mobileApiURL   + "/wechat/getSign",
          qs.stringify({
            token: localStorage.getItem("mobileToken"),
            path:'card',
            jsTicket:jsTicket
          })
        )
        .then(res => {
          const data = res.data;
          let timestemp = new Date().getTime();
          let obj = {
            jsTicket:data.jsTicket,
            timestemp:timestemp
          };
          localStorage.setItem("jsTicket",obj);
          wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: data.appId, // 必填，企业号的唯一标识，此处填写企业号corpid
            timestamp: data.timestamp, // 必填，生成签名的时间戳
            nonceStr: data.nonceStr, // 必填，生成签名的随机串
            signature: data.signature,// 必填，签名，见附录1
            jsApiList: ['onMenuShareAppMessage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
          });
          wx.ready(function(){
            wx.onMenuShareAppMessage({
              title: '患者360视图', // 分享标题
              desc: '患者360视图', // 分享描述
              link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+config.wechat.corpId+
                '&redirect_uri='+encodeURI(config.http.icpURL+'/mobile360')+'&response_type=code&scope=snsapi_userinfo&agentid='
                + config.wechat.AgentId+'&state=weixin#wechat_redirect', // 分享链接，该链接域名必须与当前企业的可信域名一致
              imgUrl: config.http.icpURL + '/mobile360/logo.jpg', // 分享图标
              type: 'link', // 分享类型,music、video或link，不填默认为link
              dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
              success: function () {
                console.log("分享成功")
                // 用户确认分享后执行的回调函数
              },
              cancel: function () {
                // 用户取消分享后执行的回调函数
              }
            });
            // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
          });
        });
    },
    /**
     * 获取关注状态
     */
    getFollowState(followedList, jzlsh, jzlb, yljgdm,yexh) {
      let followState = false;
      const jzlshGuid = jzlsh + "+" + jzlb + "+" + yljgdm;
      for (let i = 0; i < followedList.length; i++) {
        if (followedList[i].jzlshGuid == jzlshGuid&&followedList[i].yexh == yexh) {
          followState = true;
          break;
        }
      }
      return followState;
    },
    /**
     * 获取患者分组信息
     */
    getGroupInfo() {
      this.jzdjInfos = [];
      for (let i = 0; i < this.patientList.length; i++) {
        this.jzdjInfos.push({
          brzt: this.patientList[i].brzt,
          jzlsh: this.patientList[i].jzlsh,
          jzlb: this.patientList[i].jzlb,
          patid: this.patientList[i].patid,
          yexh: this.patientList[i].yexh,
          yljgdm: this.patientList[i].yljgdm
        });
      }
      if (this.jzdjInfos.length === 0) {
        return;
      }
      this.$post("/api/v1/zyjzdjk/getFzbzByJzlshList", {
        jzdjCoreInfos: JSON.stringify(this.jzdjInfos)
      }).then(data => {
        if (data.data) {
          if (this.patientList === "all") {
            this.groupInfoList = this.lodash.concat(
              this.groupInfoList,
              data.data
            );
          } else {
            this.groupInfoList = data.data;
          }
          for (let i = 0; i < this.patientList.length; i++) {
            this.$set(
              this.patientList[i],
              "followed",
              this.getFollowState(
                data.data,
                this.patientList[i].jzlsh,
                this.patientList[i].jzlb,
                this.patientList[i].yljgdm,
                this.patientList[i].yexh
              )
            );
          }
        }
      });
    },
    /**
     * 获取关注患者列表
     */
    getFollowedPatientList() {
      this.$post("/api/v1/zyjzdjk/getGroupPatientByUsercode", {
        yljgdm: this.currentDept.yljgdm
      })
        .then(data => {
          if (data.data) {
            this.patientList = data.data;
          }
        })
        .then(() => {
          this.getGroupInfo();
        });
    },
    getMyPatientList() {
      this.$post("/api/v1/zyjzdjk/getZyjzlistByUsercode", {
        yljgdm: this.currentDept.yljgdm
      })
        .then(data => {
          if (data.data) {
            this.patientList = data.data;
          }
        })
        .then(() => {
          this.getGroupInfo();
        });
    },
    handleFollow(patient) {
      // console.log(patient);
      if (patient.followed) {
        this.unfollow(patient);
        patient.followed = false
      } else {
        this.follow(patient);
      }
    },
    /**
     * 隐藏科室选择弹出层
     */
    hideDeptList() {
      this.show = false;
    },
    /**
     * 初始化
     */
    init() {
      this.activedPatientBtn = "followed";
      const source = localStorage.getItem("source");
      if (source && source ==='weixin') {
        this.wxconf();
      }
      this.getDeptList();
    },
    /**
     * List组件：加载更多
     */
    loadMore() {
      if (this.activedPatientBtn !== "all" || this.isChangeDepart) {
        return;
      }
      // console.log("= load more =");
      this.getAllPatientList();
    },
    /**
     * 重置List组件属性
     */
    resetListProperties(loading, finished) {
      this.groupInfoList = [];
      this.patientList = [];
      this.start = 0;
      this.loading = loading;
      this.finished = finished;
    },
    search() {
      this.$router.push("/search");
    },
    /**
     * 显示科室选择弹出层
     */
    showDeptList() {
      if (this.deptList.length < 5) {
        this.visibleItemCount = this.deptList.length;
      }
      this.show = true;
    },
    /**
     * 取消关注
     */
    unfollow(patient) {
      this.$post("/api/v1/com/deletePatientGroup", {
        patidList: patient.keystr,
        yexh:patient.yexh
      }).then(data => {
        if (data.status == 200) {
          this.$toast.success({
            duration: 1000,
            mask: true,
            message: "取消关注操作成功！"
          });
          if (this.activedPatientBtn == 'followed') {
            this.patientList = this.patientList.filter(
              subPatient => (subPatient.keystr != patient.keystr) ||  (subPatient.keystr == patient.keystr&&subPatient.yexh != patient.yexh) 
            );
          }
        }
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style lang="sass" scoped>
.card
  padding-top: 46px
  .title
    background-color: #276BF1
    .fa-sort-desc
      color: #FFFFFF
      font-size: 17px
      position: relative
      vertical-align: middle
      top: -5px
  .current-dept
    display: inline-block
    padding: 0 10px
    color: #FFFFFF
    font-size: 17px
  .nav-bar-search-icon
    font-size: 17px
    color: #FFFFFF !important
  .container
    // padding: 0 15px 7px 15px
    .patient-btn-row
      margin-bottom: 8px
      background-color: #FFFFFF
    .patient-btn
      height: 48px
      line-height: 48px
      text-align: center
      color: rgba(25,31,37,0.80)
      font-size: 17px
    .patient-btn.active
      color: #0A51E6
      font-size: 16px
      font-weight: bold
      border-bottom: 3px solid #0A51E6
    .patient-info
      background-color: #FFFFFF
      margin-bottom: 2px
      padding: 5px 15px
      .patient-info-title
        height: 27px
        /*position: relative*/
        .patient-info-title-bed
          font-size: 16px
          display: inline-block
          width: 70px
          text-align: left
          font-weight: bold
        .patient-info-title-bed-value
          color: #0A51E6
          display: inline-block
          width: 40px
        .patient-info-title-bed-label
          color: #0A51E6
          padding-left: 3px
          font-weight: normal
        .patient-info-title-patient-name
          padding-right: 10px
          color:  #191F25
          font-size: 16px
          font-weight: bold
        .patient-info-title-patient-age
          padding-right: 10px
          color:  #191F25
          font-size: 14px
        .patient-info-title-patient-gender
          font-size: 14px
          // font-weight: 600
          text-align: center
          color: #000
          .fa-venus
            background-color: #FFEDF1
            border-radius: 2px
            color: #FF4747
            font-weight: 600
          .fa-mars
            background-color: #FFEDF1
            border-radius: 2px
            color: #276BF1
        .patient-info-title-doctor
          width: 105px
          font-size: 14px
          color: #191F25
          /*position: absolute*/
          /*right: 1px*/
          /*bottom: -2px */
          .patient-info-title-doctor-label
            padding-right: 4px
            opacity: 0.9
          .patient-info-title-doctor-value
            letter-spacing: 0
      .patient-info-body
        padding: 7px 0 5px 0
        font-size: 14px
        color: rgba(25,31,37,0.80)
        .patient-info-body-time-label, .patient-info-body-zd-label
          display: inline-block
          width: 70px
          height: 20px
          line-height: 20px
        .patient-info-body-time-value, .patient-info-body-zd-value
          height: 20px
          line-height: 20px
        .patient-info-body-time
          margin-bottom: 3px
        .fa
          font-size: 20px
        .fa-star
          color: #FFC25C
        .fa-star-o
          color: rgba(25,31,37,0.28)
    .empty-text
      color: rgba(30, 60, 114, 0.4)
      text-align: center
      font-size: 18px

</style>

