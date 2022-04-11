<template>
  <div class="medical-record-content" v-bind:style="{ 'padding-top': top + 'px', 'padding-bottom': bottom + 'px' }">
    <van-nav-bar class="title" fixed v-if="!isFragment">
      <div slot="title">
        <span class="title-span">{{handleHeader}}</span>
      </div>
      <i class="fa fa-home index-icon" slot="left" @click="go('/card')"></i>
    </van-nav-bar>
    <div class="container">
      <div class="wd-list">
        <div class="wdnr-list" v-for="wdnr in wdnrList" :key="wdnr.id">
          <div class="mc">{{wdnr.wddmc}}</div>
          <!--<pre class="nr">{{wdnr.wddnr}}</pre>-->
          <img v-if="wdnr.wddgs.toLowerCase() == 'base64'" :src="'data:image/jpeg;base64,'+ wdnr.wddnr "/>
          <pre v-if="wdnr.wddgs == 'wbnr'" class="nr">{{wdnr.wddnr}}</pre>
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
      wdnrList: [], //文档段数据
      patientInfo: {}, //患者信息
      pageHeader: "", //文档名称
      wdbsh: "", //文档标识号
      yljgdm: "", //医疗机构代码
      sysId: "", //系统标识
      isFragment: false,
      top: 46,
      bottom: 50
    };
  },
  name: "MedicalRecord_nr",
  components: {
    Menu
  },
  computed: {
    //截取病历名称，保留25位
    handleHeader: function() {
      if (this.pageHeader.length > 25) {
        return this.pageHeader.substring(0, 26) + "...";
      } else {
        return this.pageHeader;
      }
    }
  },
  methods: {
    //获取病历内容（段数据）
    getLcwdnr() {
      this.$post("/api/v1/lcwd/getLcwdwddsjEntitiesByWdbsh", {
        wdbsh: this.wdbsh,
        yljgdm: this.yljgdm,
        sysId: this.sysId
      }).then(data => {
        if (data.data) {
          this.wdnrList = data.data;
        }
      });
    },
    //微信分享接口配置
    wxconfig() {
      const patientInfo = JSON.parse(localStorage.getItem("infos"));
      let desc = this.$getValue(patientInfo.zdmc);
      let age = this.$getJzAge(patientInfo.brxxkJz.birth, patientInfo.jzkssj);
      mobile.wxConf("medicalRecordContent", config, age, desc);
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
    this.pageHeader = this.$storage.get("page-header");
    this.wdbsh = this.$storage.get("bl-wdbsh");
    this.yljgdm = this.$storage.get("bl-yljgdm");
    this.sysId = this.$storage.get("bl-sys-id");
    this.getLcwdnr();
  }
};
</script>

<style lang="scss" scoped>
.medical-record-content {
  padding-top: 46px;
  padding-bottom: 50px;
  background-color: #f5f5f9;
  .title {
    background-color: #276bf1;
    .title-span {
      color: #ffffff;
      font-size: 16px !important;
      font-weight: bold;
      text-align: center;
    }
  }
  .container {
    padding-top: 10px;
    .wd-list {
      .wdnr-list {
        background-color: #fff;
        padding: 10px 10px 0 10px;
        .mc {
          font-size: 16px;
          color: #266ff3;
          padding-left: 10px;
          border-left: 3px solid #266ff3;
        }
        .nr {
          border: none;
          background-color: #fff;
          display: block;
          padding: 9.5px;
          margin: 0 0 10px;
          font-size: 13px;
          line-height: 1.428571429;
          color: #333;
          word-break: break-all;
          word-wrap: break-word;
          white-space: pre-wrap;
          border-radius: 4px;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.van-ellipsis {
  max-width: 100%;
}
</style>
