<template>
  <div class="cda-content" v-bind:style="{ 'padding-top': top + 'px', 'padding-bottom': bottom + 'px', 'height': '100%' }">
    <van-nav-bar class="title" fixed v-if="!isFragment">
      <div slot="title">
        <!--<span class="title-span">{{handleHeader}}</span>-->
      </div>
      <i class="fa fa-home index-icon" slot="left" @click="go('/card')"></i>
    </van-nav-bar>
    <iframe :src="cdaUrl" class="main"></iframe>
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
      pageHeader: "", //cda名称
      cdadm: "", // cda代码
      xh: "", // cda序号
      cdatablename: "", //cda表名
      isFragment: false,
      top: 46,
      bottom: 50,
      cdaUrl: "", // cda url地址
      isShow:true
    };
  },
  name: "cdaContent",
  components: {
    Menu
  },
  computed: {
  },
  methods: {
    //获取cda详情
    getCdaContent() {
      this.$post("/api/v1/cdady/getMobileContent", {
        cdadm: this.cdadm,
        xh: this.xh,
        cdatablename: this.cdatablename
      }).then(data => {
        if (data.data) {
          this.cdaUrl = data.data;
          this.isShow=false
        }
      });
    },
    //微信分享接口配置
    wxconfig() {
      const patientInfo = JSON.parse(localStorage.getItem("infos"));
      let desc = this.$getValue(patientInfo.zdmc);
      let age = this.$getJzAge(patientInfo.brxxkJz.birth, patientInfo.jzkssj);
      mobile.wxConf("cdaContent", config, age, desc);
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
    this.xh = this.$storage.get("bl-xh");
    this.cdadm = this.$storage.get("bl-cdadm");
    this.cdatablename = this.$storage.get("bl-cdatablename");
    this.getCdaContent();
  }
};
</script>

<style lang="scss" scoped>
.cda-content {
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
  .main{
    width:100%;
    height: 100%;
  }
}
</style>
<style lang="scss">
.van-ellipsis {
  max-width: 100%;
}
</style>
