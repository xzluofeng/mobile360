<template>
  <div class="check-detail" v-bind:style="{ 'padding-top': top + 'px' }">
    <van-nav-bar class="title" fixed v-if="!isFragment">
      <div slot="title">
        <span class="title-name">{{bglbmc}}</span>
      </div>
      <!--<van-icon slot="left" name="arrow-left" class="title-icon" @click="goBack"/>-->
    </van-nav-bar>
    <div class="bodyLists" v-if="isShow">
      <div v-for="(item, index) in checkDetails" :key="index">
        <div class="check-title">
          <span>{{item.zbxmmc}}</span>
        </div>
        <div class="check-content">
          <div v-html="item.zbjg"></div>
        </div>
      </div>

      <div class="image-data" v-if="paramsData.dicom!= null && paramsData.dicom != ''">
        <span @click="lookImageData">影像资料</span>
      </div>

      <!--防止影像按钮被遮挡，增加空白部分-->
      <div class="check-content">
        <div v-html=""></div>
      </div>
      <div class="check-content">
        <div v-html=""></div>
      </div>
      <div class="check-content">
        <div v-html=""></div>
      </div>

    </div>
    <iframe :src="thirdUrl" v-else class="main"></iframe>
    <Menu v-if="!isFragment"/>
  </div>
</template>

<script>
  import Menu from "@/components/Menu.vue";
  import mobile from "@/utils/mobile";
  export default {
    data() {
      return {
        patientInfo: {}, //患者信息
        checkDetails: [], //报告列表
        content: "", //报告内容
        paramsData: this.$route.query, // 跳转过来的参数
        bglbmc: "", //报告类别名称
        thirdUrl: "", //影像资料url地址
        isFragment: false,
        top: 46,
        bottom: 50,
        isShow:true
      };
    },
    name: "checkDetails",
    components: {
      Menu
    },
    methods: {
      /* //后退
      goBack() {
        this.$router.go(-1);
      },*/
      //获取检查信息类别
      getCheckDetails() {
        this.$post("/api/v1/risreport/getRisjcjgkEntitiesByBgdh", {
          bgdh: this.paramsData.bgdh,
          bglbdm: this.paramsData.bglbdm,
          jzlb: this.patientInfo.jzlb,
          yljgdm: this.patientInfo.yljgdm,
          yexh: this.patientInfo.yexh,
          sysId: this.paramsData.sysId,
          isPrint: 0
        }).then(data => {
          if (data.data) {
            this.checkDetails = data.data;
          }
        });
      },
      //微信分享接口配置
      wxconfig() {
        const patientInfo = JSON.parse(localStorage.getItem("infos"));
        let desc = this.$getValue(patientInfo.zdmc);
        let age = this.$getJzAge(patientInfo.brxxkJz.birth, patientInfo.jzkssj);
        mobile.wxConf("checkDetails", config, age, desc);
      },
      //查看影像资料
      lookImageData() {
        this.$post("/api/v1/com/getResourceUrl", {
          resourceUrlCode: this.paramsData.bglbdm,
          attachPara: JSON.stringify({
            bgdh: this.paramsData.bgdh,
            sysId: this.paramsData.sysId
          }),
          jzlb: this.patientInfo.jzlb,
          jzlsh: this.patientInfo.jzlsh,
          yljgdm: this.patientInfo.yljgdm,
          clientCode: "1"
        }).then(data => {
          if (data.data) {
            this.thirdUrl = data.data.url;
            this.isShow=false
          }
        });
      }
    },
    mounted() {
      const source = localStorage.getItem("source");
      if (source && source === "weixin") {
        this.wxconfig();
      }
      this.isFragment = this.$isFragment();
      this.top = this.$getContentContainerPositionInfo().top;
      this.bottom = this.$getContentContainerPositionInfo().bottom;
      this.patientInfo = this.$storage.get("infos");
      this.getCheckDetails();
      this.bglbmc = this.paramsData.bglbmc;
    }
  };
</script>
<style lang="scss" >
  .check-detail {
    padding-top: 46px;
    background-color: #f5f5f9;
    height: 92%;
    .title {
      background-color: #276bf1;
      .title-name {
        color: #ffffff;
        font-size: 16px;
        font-weight: bold;
      }
      .title-icon {
        font-size: 17px;
        color: #ffffff;
      }
    }
  }
  .check-title {
    background: #ffffff;
    margin-top: 8px;
    padding: 6px 10px 10px 16px;
    //   height: 48px;
    margin-bottom: 2px;
    //   line-height: 48px;
  }
  .check-title span {
    font-size: 16px;
    // color: #0A51E6;
    // letter-spacing: 0;
    // padding-left: 8px;
    // border-left: 2px solid #0A51E6;
    font-weight: bold;
  }
  .check-content {
    background: #ffffff;
    padding-left: 15px;
    padding-right: 15px;
  }
  .check-content > div {
    font-size: 15px;
    color: #191f25;
    line-height: 22px;
    padding: 10px 0;
  }
  .image-data {
    background: #ffffff;
    margin-top: 16px;
    padding: 6px 10px 10px 16px;
    //   height: 48px;
    margin-bottom: 5px;
    //   line-height: 48px;
  }
  .image-data span {
    font-size: 16px;
    color: #0a51e6;
    line-height: 22px;
    font-weight: bold;
  }
  .headTitle {
    background-color: #276bf1;
  }
  .main{
    width:100%;
    height: 100%;
  }
</style>
