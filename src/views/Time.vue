<template>
  <div class="time">
    <van-nav-bar class="title" fixed>
      <div slot="title">
        <span class="title-name">历史记录</span>
      </div>
      <i class="fa fa-home index-icon" slot="left" @click="go('/card')" v-if="showHome"></i>
      <!-- <van-icon slot="left" name="arrow-left" class="title-icon" @click="goBack"/> -->
    </van-nav-bar>
    <div class="jzdj-list">
      <div
        v-for="jzdj in jzdjList"
        class="jzdj-info"
        :key="jzdj.jzlsh"
        @click="enter(jzdj.jzlsh, jzdj.jzlb, jzdj.yljgdm)"
      >
        <div class="jzdj-info-row">
          <span class="jzkssj">{{ $formatDate(jzdj.jzkssj) }}</span>
          <span class="jzlbmc">{{ $getJzlbmc(jzdj.jzlb) }}</span>
        </div>
        <div class="jzdj-info-row">
          <span class="yljgmc">[{{ jzdj.yljgmc }}]</span>
          <span class="jzksmc">{{ jzdj.jzksmc }}</span>
        </div>
        <div class="jzdj-info-row">
          <span class="zdmc">{{ jzdj.zdmc }}</span>
        </div>
      </div>
    </div>
    <Menu/>
  </div>
</template>

<script>
import Menu from "@/components/Menu.vue";
import { getPatientInfo } from "@/utils/api";
import { getPatidList } from "@/utils/api";
import mobile from "@/utils/mobile";
export default {
  data() {
    return {
      value: "2017093017",
      jzdjList: [],
      showHome:true
    };
  },
  components: {
    Menu
  },
  methods: {
    init() {
      var patientInfo = this.$storage.get("infos");
      var patidList = localStorage.getItem("originalPatids");
      this.$post("/api/v1/zyjzdjk/getJzjlsjz", {
        patid: patientInfo.patid,
        jzlb: patientInfo.jzlb,
        yljgdm: patientInfo.yljgdm,
        yexh: patientInfo.yexh,
        patidList: patidList
      }).then(data => {
        this.jzdjList = data.data;
      });
    },
    //微信分享接口配置
    wxconfig(){
      const patientInfo = JSON.parse(localStorage.getItem("infos"));
      let desc = this.$getValue(patientInfo.zdmc);
      let age = this.$getJzAge(patientInfo.brxxkJz.birth,patientInfo.jzkssj);
      mobile.wxConf('time',config,age,desc)
    },
    enter(jzlsh, jzlb, yljgdm) {
      const _this = this;
      let patientInfo = this.$storage.get("infos");
      getPatientInfo(jzlsh, jzlb, yljgdm, patientInfo.yexh, function(data) {
        _this.$storage.set("infos", data);
        getPatidList(data.patid, jzlb, yljgdm, function(res) {
          localStorage.setItem("originalPatids", res);
          _this.$router.push("/index");
        });
      })
    },
    //后退
    goBack() {
      this.$router.go(-1);
    }
  },
  mounted() {
     const module = localStorage.getItem("module");
      if (module && module === "0") {
        this.showHome=false
      }
    const source = localStorage.getItem("source");
    if (source && source ==='weixin') {
      this.wxconfig()
    }
    this.init();
  }
};
</script>

<style lang="sass" scoped>
.time
  padding-top: 46px
  padding-bottom: 50px
  background-color: #F5F5F9
  .title
    background-color: #276BF1
    .title-name
      color: #FFFFFF
    .title-icon
      font-size: 17px
      color: #ffffff
  .jzdj-list
    margin-top: 8px
    .jzdj-info
      margin-bottom: 2px
      background-color: #FFFFFF
      margin-bottom: 2px
      padding: 8px 15px 6px 15px
      .jzdj-info-row
        padding-bottom: 2px
        font-size: 17px
        .jzkssj
          color: #191F25
        .jzlbmc
          margin-left: 8px
          font-size: 10px
          padding: 0 3px
          border: 1px solid #0A51E6
          border-radius: 3px
          color:  #0A51E6
        .yljgmc
          color: #0A51E6
          font-size: 15px
          font-weight: 500
        .jzksmc
          color: #0D0013
          font-size: 15px
          margin-left: 5px
        .zdmc
          color: #191F25
          font-weight: 600
</style>
