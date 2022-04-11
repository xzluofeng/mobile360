<!-- 患者基本信息 -->
<template>
  <div class="patient-info"  v-bind:style="{ 'padding-top': top + 'px' }">
    <van-nav-bar class="title" fixed v-if="!isFragment">
      <div slot="title">
        <span class="patient-info-head">患者信息</span>
      </div>
      <i class="fa fa-home index-icon" slot="left" @click="go('/card')" v-if="showHome"></i>
    </van-nav-bar>

    <div class="container">
      <div class="content-item">
        <!-- 基本信息-->
        <div class="content-base-info-title">基本信息</div>
        <div class="content-base-info">
          <table class="content-base-info-table">
            <tr class="content-base-info-tr">
              <td class="lable-title">患者姓名</td>
              <td class="lable-info">{{patientInfo.brxxkJz.hzxm}}</td>
              <td class="lable-title">患者年龄</td>
              <td class="lable-info">{{$getJzAge(patientInfo.brxxkJz.birth,patientInfo.jzkssj)}}</td>
            </tr>
            <tr class="content-base-info-tr">
              <td class="lable-title">联系方式</td>
              <td class="lable-info">{{patientInfo.brxxkJz.lxdh}}</td>
              <td class="lable-title">出生日期</td>
              <td class="lable-info">{{$formatDate(patientInfo.brxxkJz.birth)}}</td>
            </tr>
            <tr class="content-base-info-tr">
              <td class="lable-title">居住地址</td>
              <td class="lable-info">{{patientInfo.brxxkJz.lxrdz}}</td>
            </tr>
            <tr class="content-base-info-tr">
              <td class="lable-title">身份证号</td>
              <td class="lable-info" colspan="3">{{patientInfo.brxxkJz.zjhm}}</td>
            </tr>
          </table>
        </div>
      </div>
      <div class="content-item">
        <!-- 就诊信息-->
        <div class="content-base-info-title">就诊信息</div>
        <div class="content-base-info">
          <table class="content-base-info-table">
            <tr class="content-base-info-tr">
              <td class="lable-title">门&nbsp;&nbsp;诊&nbsp;&nbsp;号</td>
              <td class="lable-info">{{patientInfo.brxxkJz.jzlb=='1'?patientInfo.brxxkJz.blh:''}}</td>
              <td class="lable-title">住&nbsp;&nbsp;院&nbsp;&nbsp;号</td>
              <td class="lable-info">{{patientInfo.brxxkJz.jzlb=='2'?patientInfo.brxxkJz.blh:''}}</td>
            </tr>
            <tr class="content-base-info-tr">
              <td class="lable-title">主治医师</td>
              <td class="lable-info">{{patientInfo.jzysmc}}</td>
              <td class="lable-title">入院日期</td>
              <td class="lable-info">{{$formatDate(patientInfo.jzkssj)}}</td>
            </tr>
            <tr class="content-base-info-tr">
              <td class="lable-title">所在医院</td>
              <td class="lable-info" colspan="3">{{patientInfo.brxxkJz.yljgmc}}</td>
            </tr>
          </table>
        </div>
      </div>
      <div class="content-item">
        <!-- 病情信息-->
        <div class="content-base-info-title">病情信息</div>
        <div class="content-base-info">
          <table class="content-base-info-table">
            <tr class="content-base-info-tr">
              <td class="lable-title">病情评估</td>
              <td class="lable-info">{{patientInfo.wzjbmc}}</td>
              <td class="lable-title">护理级别</td>
              <td class="lable-info">{{patientInfo.hljbmc}}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>

    <Menu v-if="!isFragment"/>
  </div>
</template>

<script>
import Menu from "@/components/Menu.vue";
import mobile from "@/utils/mobile";
export default {
  data() {
    return {
      patientInfo: this.$storage.get("infos"), // 获得患者信息
      isFragment: false,
      top: 46,
      bottom: 50,
       showHome:true
    };
  },
  name: "diagnosis",
  components: {
    Menu
  },
  methods: {
    //微信分享接口配置
    wxconfig() {
      const patientInfo = JSON.parse(localStorage.getItem("infos"));
      let desc = this.$getValue(patientInfo.zdmc);
      let age = this.$getJzAge(patientInfo.brxxkJz.birth, patientInfo.jzkssj);
      mobile.wxConf("patientInfo", config, age, desc);
    }
  },
  mounted() {
    const module = localStorage.getItem("module");
      if (module && module === "0") {
        this.showHome=false
      }
    const source = localStorage.getItem("source");
    if (source && source === "weixin") {
      this.wxconfig();
    }
    this.isFragment = this.$isFragment();
    this.top = this.$getContentContainerPositionInfo().top;
    this.bottom = this.$getContentContainerPositionInfo().bottom;
  }
};
</script>

<style lang="scss">
.patient-info {
  padding-top: 46px;
  background-color: #f5f5f9;
  position: relative;
  height: 100%;

  .patient-info-head {
    color: #ffffff;
    // font-size: 17px !important;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }

  .title {
    background-color: #276bf1;
    position: absolute;
    top: 0;
    width: 100%;
    height: 46px;
    line-height: 46px;
    text-align: center;
    color: #fff;
    background-color: #276bf1;
    font-size: 18px;
  }

  .container {
    background-color: #f5f5f9;
    height: 100%;
    overflow: auto;
    margin: 0;
    padding: 0;
  }
  .content-item {
    background: #ffffff;
    margin-top: 8px;
    padding: 10px;
    margin-bottom: 8px;
  }

  .content-base-info-title {
    font-size: 17px;
    color: #191f25;
    letter-spacing: 0;
    padding-left: 8px;
    border-left: 2px solid #2470f3;
    color: #256ae4;
  }

  .content-base-info {
    padding: 0px 10px;
    background-color: #fff;
  }

  .content-base-info-table {
    border-collapse: collapse;
    border-spacing: 0;
    max-width: 100%;
    background-color: transparent;
    table-layout: fixed;
    width: 100%;
    padding-bottom: 0px;
  }

  .content-base-info-tr {
    border-bottom: 1px solid #ededed;
    height: 40px;
    line-height: 40px;
  }

  .lable-title {
    width: 20%;
    text-align: left;
    font-size: 14px;
    color: #666666;
  }
  .lable-info {
    width: 30%;
    font-size: 14px;
    color: #333333;
    /*height: 0.02px;//给个高度，如果为空时，不会变形*/
  }
}
</style>
