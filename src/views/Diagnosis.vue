<template>
   <div class="diagnosis" v-bind:style="{ 'padding-top': top + 'px', 'padding-bottom': bottom + 'px' }">
        <van-nav-bar class="title" fixed v-if="!isFragment">
            <div slot="title">
                <span class="title-span">诊断</span>
            </div>
            <i class="fa fa-home index-icon" slot="left" @click="go('/card')"  v-if="showHome"></i>
        </van-nav-bar>
        <div class="container">
            <div class="diagnosis-list" v-if="zdListVO.length>0">
              <div class="name" v-if="isFragment">患者姓名：{{this.hzxm}}</div>
                <div v-for="zd in zdListVO" class="zd-card" :key="zd.zdlbmc">
                    <span class="zdlb">{{zd.zdlbmc}}</span>
                    <div class="zd-list">
                        <div class="zd-list-inner" v-for="(zdmx,index) in zd.zdmx" :key="index">
                            <div class="inner-first">
                                <span class="zdmc">{{zdmx.zdmc}}</span>
                                <span v-if="zdmx.zdlxdm==='0'" class="zzd"></span>
                                <span class="zdsj">{{zdmx.zdsj}}</span>
                            </div>
                            <div class="inner-second">
                                <div class="zdnr" v-html="handleZdnr(zdmx)"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else><img src="../assets/img/empty.png" class="empty-container"></div>
        </div>
        <Menu v-if="!isFragment"/>
        <VisitClick fixed v-if="isFragment"  @updateData="enter"/>
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
      zdListVO: [], //分组后的诊断结果列表
      zdList: [], //服务返回的诊断结果
      showHome:true,
      isFragment: false,
      top: 46,
      bottom: 50
    };
  },
  name: "diagnosis",
  components: {
    Menu,
    VisitClick
  },
  methods: {

    //更新患者当次的诊断信息
    enter(jzlsh,jzlb,yljgdm){

      this.patientInfo.jzlb = jzlb;
      this.patientInfo.jzlsh = jzlsh;
      this.patientInfo.yljgdm = yljgdm;

      this.getZdxx();
    },
    /**
     * 获取诊断结果信息
     */
    getZdxx() {
      this.$post("/api/v1/brzd/getBrzdListByJzlshAndYljgdm", {
        jzlb: this.patientInfo.jzlb,
        yexh: this.patientInfo.yexh,
        yljgdm: this.patientInfo.yljgdm,
        jzlsh: this.patientInfo.jzlsh
      })
        .then(data => {
          if (data.data) {
              this.zdList = data.data;
          }
        })
        .then(() => {
          this.buildZdListVO();
        });
    },
    /**
     * 将诊断列表根据诊断类别分组
     */
    buildZdListVO() {
      var map = {};
      this.zdListVO = [];
      for (var i = 0; i < this.zdList.length; i++) {
        var zd = this.zdList[i];
        if (!map[zd.zdlbmc]) {
          this.zdListVO.push({
            zdlbmc: zd.zdlbmc,
            zdmx: [zd]
          });
          map[zd.zdlbmc] = zd;
        } else {
          for (var j = 0; j < this.zdListVO.length; j++) {
            var zdnew = this.zdListVO[j];
            if (zdnew.zdlbmc == zd.zdlbmc) {
              zdnew.zdmx.push(zd);
              break;
            }
          }
        }
      }
    },
    /**
     * 处理诊断说明，将诊断名称以外的字段高亮
     * @param zdmx 诊断结果
     * @returns {*}
     */
    handleZdnr(zdmx) {
      var zdmc = this.$getValue(zdmx.zdmc);
      var zdsm = this.$getValue(zdmx.zdsm);
      var index = zdsm.indexOf(zdmc);
      if (index === -1) {
        return zdsm;
      } else if (index === 0) {
        return (
          zdmc +
          ' <span class="introduce">' +
          zdsm.substring(zdmc.length, zdsm.length) +
          "</span>"
        );
      } else {
        return (
          '<span class="introduce">' +
          zdsm.substring(0, index) +
          " </span>" +
          zdmc +
          ' <span class="introduce">' +
          zdsm.substring(index + zdmc.length, zdsm.length) +
          "</span>"
        );
      }
    },
    //微信分享接口配置
    wxconfig() {
      const patientInfo = JSON.parse(localStorage.getItem("infos"));
      let desc = this.$getValue(patientInfo.zdmc);
      let age = this.$getJzAge(patientInfo.brxxkJz.birth, patientInfo.jzkssj);
      mobile.wxConf("diagnosis", config, age, desc);
    },
    /**
     * 公共方法处理null值
     * @param obj
     * @param defaultValue
     * @returns {*}
     */
    getValue(obj, defaultValue) {
      if (
        obj === null ||
        obj === "null" ||
        typeof obj === "undefined" ||
        "" === obj
      ) {
        return defaultValue ? defaultValue : "";
      }
      return obj;
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
    this.getZdxx();
  }
};
</script>

<style lang="scss" scoped>
.diagnosis {
  padding-top: 46px;
  padding-bottom: 50px;
  .title {
    background-color: #276bf1;
    .title-span {
      color: #ffffff;
      font-size: 16px !important;
      font-weight: bold;
      text-align: center;
    }
    .nav-bar-arrow-left-icon {
      color: #f8f9ff;
      font-size: 17px;
    }
  }
  .container {
    /* 无数据空白页面 */
   .empty-container {
      width: 50%;
      margin: 25%;
    }
    .diagnosis-list {
        .name{
         font-size: 16px;
         margin:10px;
        }
      .zd-card {
        .zdlb {
          // margin-left: 16px;
          font-size: 15px;
          color: rgba(25, 31, 37, 0.8);
          letter-spacing: 0;
        }
        .zd-list {
          background: #ffffff;
          .zd-list-inner:not(:first-child) {
            border-top: 1px solid #ededed;
          }
          .zd-list-inner {
            padding-bottom: 11px;
            margin-left: 16px;
            .inner-first {
              height: 39px;
              .zdmc {
                margin-top: 12px;
                display: inline-block;
                font-family: PingFangSC-Regular;
                font-size: 17px;
                color: #191f25;
                vertical-align: top;
              }
              .zzd {
                background: url("../assets/img/zd-main.png") center center
                  no-repeat;
                vertical-align: top;
                margin-left: 8px;
                display: inline-block;
                padding: 3px;
                margin-top: 17px;
                width: 15px;
                height: 15px;
              }
              .zdsj {
                margin-top: 14px;
                margin-right: 16px;
                opacity: 0.9;
                font-family: PingFangSC-Regular;
                font-size: 14px;
                color: rgba(25, 31, 37, 0.56);
                letter-spacing: 0;
                float: right;
              }
            }
            .inner-second {
              min-height: 1px;
              .zdnr {
                vertical-align: top;
                opacity: 0.9;
                font-family: PingFangSC-Regular;
                font-size: 14px;
                color: rgba(25, 31, 37, 0.8);
                letter-spacing: 0;
              }
            }
          }
        }
      }
    }
  }
}
</style>

<style>
.introduce {
  opacity: 0.9;
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #ff0000;
  letter-spacing: 0;
}
</style>
