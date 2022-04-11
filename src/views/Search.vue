<template>
  <div class="search">
    <van-nav-bar class="title" fixed>
      <div slot="title">
        <span class="title-name">患者搜索</span>
      </div>
    </van-nav-bar>
    <van-search placeholder="姓名/身份证号/病历号/院内卡号/医保卡号/电话" v-model="value" @search="onSearch"/>
    <div class="patient-list">
      <van-row
        v-for="patient in patientList"
        class="patient-info"
        :key="patient.jzlsh"
        @click.native="enter(patient)"
      >
        <van-col class="info-col content-too-lang">
          <div class="hzxm">{{ patient.hzxm }}</div>
          <div class="xbmc">{{ patient.xbmc }}</div>
        </van-col>
        <van-col class="info-col content-too-lang">
          <div class="jzksmc"> <span>{{ patient.jzksmc }}</span> <span class="jzsj">{{ patient.jzsj }}</span></div>
          <div class="blh"> 门诊号/住院号：{{ patient.blh }} </div>
          <div class="zjhm"> 证件：{{ patient.zjhm }} </div>
          <div class="jzdz"> 地址：{{ patient.jzdz }}</div>
        </van-col>
        <!--<van-col class="info-col jzsj">{{ patient.jzsj }}</van-col>-->
      </van-row>
    </div>
  </div>
</template>

<script>
// import Menu from '@/components/Menu.vue'
import { getPatidList, getPatientInfo } from "@/utils/api";

export default {
  data() {
    return {
      value: "",
      patientList: []
    };
  },
  components: {
    // Menu
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const keyword = localStorage.getItem("patientSearchKeyword")
      if (keyword && keyword !== '') {
        this.value = keyword
        this.onSearch()
      }
    },
    enter(patient) {
      const _this = this;
      getPatidList(patient.patid, patient.jzlb, patient.yljgdm, function(data) {
        localStorage.setItem("originalPatids", data);
        getPatientInfo(
          patient.jzlsh,
          patient.jzlb,
          patient.yljgdm,
          patient.yexh,
          function(result) {
            _this.$storage.set("infos", result);
            _this.$router.push("/index");
          }
        );
      });
    },
    onSearch() {
      localStorage.setItem("patientSearchKeyword", this.value)
      // const keyword = JSON.parse(localStorage.getItem("patientSearchKeyword"))
      this.$post("/api/v1/hzss/hzxxSearch", {
        searchKey: this.value,
        isFg: "0",
        source:"mobile"
      }).then(data => {
        // console.log(data.data);
        if (!data.data.length) {
          this.$toast('暂无数据！');
        }
        this.patientList = data.data;
      });
    }
  }
};
</script>

<style lang="sass" scoped>
.search
  padding-top: 46px
  position: absolute
  top: 0
  bottom: 0
  left: 0
  right: 0
  .title
    background-color: #276BF1
    .title-name
      color: #FFFFFF
  .patient-list
    position: absolute
    top: 90px
    bottom: 0
    left: 0
    right: 0
    background-color: #FFFFFF
    padding: 10px 0
    overflow-y: scroll
    .patient-info
      border-bottom: 1px solid #EDEDED
      font-size: 15px
      padding: 0 15px
      height: 130px
      line-height: 130px
      .van-col
        margin-left: 10px
      /*.hzxm*/
        /*font-weight: 500*/
      /*.hzxm, .xbmc*/
        /*text-align: center*/
      .jzsj
        margin-left: 40px
      .jzdz
        height: 40px
        line-height: 24px
        padding-left: 5px
      .jzksmc,  .hzxm, .xbmc, .blh, .zjhm
        height: 24px
        line-height: 24px
        padding-left: 5px
      .jzksmc
        margin-top: 6px
      .hzxm
        margin-top: 30px
      .xbmc
        margin-left: 10px
</style>
