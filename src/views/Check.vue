<template>
  <div class="check" v-bind:style="{ 'padding-top': top + 'px' }">

    <van-nav-bar class="title" fixed v-if="!isFragment">
      <div slot="title">
        <span class="title-name">检查</span>
      </div>
      <i class="fa fa-home index-icon" slot="left" @click="go('/card')" v-if="showHome"></i>
    </van-nav-bar>

    <div class="bodyLists" v-if="checkLists.length>0">
      <div class="name" v-if="isFragment">患者姓名：{{this.hzxm}}</div>
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="getCheckLists(item)"
        :immediate-check="false"
      >
        <van-cell
          v-for="item in checkLists"
          :key="item.bgdh"
          :title="item.bglbmc"
          is-link
          @click="toCheckDetails(item)"
          :value="item.bgfbsj === null ? $format(item.djsj, 'YYYY-MM-DD HH:mm') : $format(item.bgfbsj, 'YYYY-MM-DD HH:mm')"
          title-class="cell-title"
          value-class="value-title"
        />
        <van-icon slot="right" name="arrow" info="9"/>
      </van-list>
    </div>
     <div v-else><img src="../assets/img/empty.png" class="empty-container"></div>
    <Menu v-if="!isFragment"/>
    <VisitClick  fixed v-if="isFragment"  @updateData="enter"/>
  </div>
</template>

<script>
import Menu from "@/components/Menu.vue";
import mobile from "@/utils/mobile";
import VisitClick from "@/components/VisitClick.vue"
export default {
  data() {
    return {
      patientInfo: {}, //患者信息
      checkLists: [], //报告列表
      loading: false,
      finished: false,
      hzxm: "",
      isFragment: false,
      top: 46,
      bottom: 50,
      showHome:true
    };
  },
  name: "check",
  components: {
    Menu,
    VisitClick
  },
  methods: {
     enter(jzlsh,jzlb,yljgdm){
      this.patientInfo.jzlb = jzlb;
       this.patientInfo.jzlsh = jzlsh;
       this.patientInfo.yljgdm = yljgdm;
       this.getCheckLists();
     },
    //跳转到报告明细页面
    toCheckDetails(item) {
      this.$router.push({
        path: "/checkDetails",
        query: {
          dicom: item.dicom,
          bglbmc: item.bglbmc,
          bgdh: item.bgdh,
          bglbdm: item.bglbdm,
          sysId: item.sysId
        }
      });
    },
    //微信分享接口配置
    wxconfig() {
      const patientInfo = JSON.parse(localStorage.getItem("infos"));
      let desc = this.$getValue(patientInfo.zdmc);
      let age = this.$getJzAge(patientInfo.brxxkJz.birth, patientInfo.jzkssj);
      mobile.wxConf("check", config, age, desc);
    },
    //获取检查信息类别
    getCheckLists() {
      this.checkLists = [];
      const patidList = localStorage.getItem("originalPatids");
      this.$post("/api/v1/risreport/getRisreportByPatidListAndJzlsh", {
        patidList: patidList,
        jzlsh: this.patientInfo.jzlsh,
        jzlb: this.patientInfo.jzlb,
        yljgdm: this.patientInfo.yljgdm,
        yexh: this.patientInfo.yexh
      }).then(data => {
        if (data.data && data.data.reportList) {
          for (let i = 0; i < data.data.reportList[0].risreports.length; i++) {
            this.checkLists.push(data.data.reportList[0].risreports[i]);
          }
          // 加载状态结束
          this.loading = false;

          // 数据全部加载完成
          if (
            this.checkLists.length >= data.data.reportList[0].risreports.length
          ) {
            this.finished = true;
          }
        }
      });
    }
  },
  mounted() {
     const module = localStorage.getItem("module");
      if (module && module === "0") {
        this.showHome=false
      }
    this.patientInfo = this.$storage.get("infos");
    this.hzxm = this.patientInfo.brxxkJz.hzxm;
    const source = localStorage.getItem("source");
    if (source && source === "weixin") {
      this.wxconfig();
    }
    this.isFragment = this.$isFragment();
    this.top = this.$getContentContainerPositionInfo().top;
    this.bottom = this.$getContentContainerPositionInfo().bottom;
    this.patientInfo = this.$storage.get("infos");
    this.getCheckLists();
    this.hzxm = this.patientInfo.brxxkJz.hzxm;
  }
};
</script>
<style lang="scss" >
.check {
  .van-cell {
    height: 48px;
    padding-left: 16px;
  }
  .title-class {
    font-family: PingFangSC-Regular;
    font-size: 67px;
    color: #191f25;
  }
  .name{
   font-size: 16px;
   margin:10px;
  }

  padding-top: 46px;
  background-color: #f5f5f9;
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
  /* 无数据空白页面 */
.empty-container {
    width: 50%;
    margin: 25%;
}
  //   /*头部样式 srart*/
  //   .header {
  //     height: 40px;
  //     background-image: linear-gradient(-270deg, #3777f5 0%, #195be6 100%);
  //     color: #fff;
  //     font-size: 17px;
  //     font-family: PingFangSC-Medium;
  //   }

  //   .header-title {
  //     margin: 0 auto;
  //   }

  //   .van-icon-arrow-left {
  //     position: absolute;
  //     color: #f8f9ff;
  //     left: 10px;
  //   }
  /*头部样式 end*/
  .cell-title {
    font-family: PingFangSC-Regular;
    font-size: 17px;
    color: #191f25;
  }
  .value-title {
    ont-family: PingFangSC-Regular;
    font-size: 15px;
    color: rgba(25, 31, 37, 0.56);
  }
}
</style>
