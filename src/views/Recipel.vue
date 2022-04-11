<template>
    <div class="recipel" v-bind:style="{ 'padding-top': top + 'px', 'padding-bottom': bottom + 'px' }">
        <van-nav-bar class="title" fixed v-if="!isFragment">

            <div slot="title">
                <span class="title-span">处方</span>
            </div>
            <i class="fa fa-home index-icon" slot="left" @click="go('/card')" v-if="showHome"></i>
        </van-nav-bar>
        <div class="container">
            <div class="recipel-list" v-if="cfListVO.length>0">
              <div class="name" v-if="isFragment">患者姓名：{{this.hzxm}}</div>
                <div class="cf-card" v-for="cf in cfListVO" :key="cf.kfsj">
                    <div class="cf-title">
                        <span class="kfsj">{{cf.kfsj}}</span>
                            <van-row class="title-right">
                                <van-col span="50" class="pcmc">{{cf.pcmc}}</van-col>
                                <van-col span="50" class="yyts">{{cf.yyts}}天</van-col>
                            </van-row>
                        <div class="yfmc">
                            {{cf.yfmc}}
                        </div>
                    </div>
                    <div class="cf-list" v-for="cfmx in cf.cfmx" :key="cfmx.cfmxxh">
                        <van-row>
                            <van-col span="10" class="xmmc">{{cfmx.xmmc}}</van-col>
                            <van-col span="2" class="fzIcon"><div v-bind:class="fzClass(cfmx.cfxhImg)"></div></van-col>
                            <van-col span="8" class="ypgg">{{cfmx.ypgg}}</van-col>
                            <van-col span="2" class="mcyl">{{cfmx.mcyl}}</van-col>
                            <van-col span="2" class="ypsl">{{cfmx.ypsl}}{{cfmx.ypdw}}</van-col>
                        </van-row>
                    </div>
                </div>
            </div>
            <div v-else><img src="../assets/img/empty.png" class="empty-container"></div>
        </div>
        <Menu v-if="!isFragment"/>
        <VisitClick v-if="isFragment"  @updateData="enter"/>
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
      cfList: [], //服务返回的处方列表
      cfListVO: [], //分组后的处方列表
      isFragment: false,
top: 46,
bottom: 50,
showHome:true
    };
  },
  computed: {},
  name: "recipel",
  components: {
    Menu,
    VisitClick
  },
  methods: {
     //更新患者当次处方数据
    enter(jzlsh,jzlb,yljgdm){
      this.patientInfo.jzlb = jzlb;
      this.patientInfo.jzlsh = jzlsh;
      this.patientInfo.yljgdm = yljgdm;
      this.getCfxx();
    },
    /**
     * 获取处方结果信息
     */
    getCfxx() {
      this.$post("/api/v1/mzcfk/getMzcfkListByCflxdm", {
        // jzlb:'1',
        // yexh:'0',
        // yljgdm:'0002',
        // jzlsh:'27078788',
        // ksrq:'2016-08-24',
        // jsrq:'2016-08-26'
        jzlb: this.patientInfo.jzlb,
        yexh: this.patientInfo.yexh,
        yljgdm: this.patientInfo.yljgdm,
        jzlsh: this.patientInfo.jzlsh,
        ksrq: this.patientInfo.jzkssj,
        jsrq: this.patientInfo.jzjssj,
        cflx: 'all',
        jsbz: 'all'
      })
        .then(data => {

          if (data.data.result) {
            this.cfList = data.data.result;
          }
        })
        .then(() => {
          this.buildcfListVO();
        });
    },
    /**
     * 处方分组图标
     * @param cfxhImg
     * @returns {{top: boolean, center: boolean, bottom: boolean}}
     */
    fzClass: function(cfxhImg) {
      return {
        top: cfxhImg == "top",
        center: cfxhImg == "center",
        bottom: cfxhImg == "bottom"
      };
    },
    //微信分享接口配置
    wxconfig() {
      const patientInfo = JSON.parse(localStorage.getItem("infos"));
      let desc = this.$getValue(patientInfo.zdmc);
      let age = this.$getJzAge(patientInfo.brxxkJz.birth, patientInfo.jzkssj);
      mobile.wxConf("recipel", config, age, desc);
    },
    /**
     * 根据开方时间分组
     */
    buildcfListVO() {
      var map = {};
      this.cfListVO = [];
      for (var i = 0; i < this.cfList.length; i++) {
        var cf = this.cfList[i];
        if (!map[cf.kfsj]) {
          this.cfListVO.push({
            kfsj: cf.kfsj,
            yfmc: cf.yfmc,
            pcmc: cf.pcmc,
            yyts: cf.yyts,
            cfmx: [cf]
          });
          map[cf.kfsj] = cf;
        } else {
          for (var j = 0; j < this.cfListVO.length; j++) {
            var cfnew = this.cfListVO[j];
            if (cfnew.kfsj == cf.kfsj) {
              cfnew.cfmx.push(cf);
              break;
            }
          }
        }
      }
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
    this.isFragment = this.$isFragment()
this.top = this.$getContentContainerPositionInfo().top;
this.bottom = this.$getContentContainerPositionInfo().bottom;
    this.patientInfo = this.$storage.get("infos");
    this.getCfxx();
  }
};
</script>

<style lang="scss" scoped>
.recipel {
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
    .recipel-list {
      .name{
         font-size: 16px;
         margin:10px;
        }
      .cf-card {
        padding-bottom: 12px;
        background: #ffffff;
        margin-top: 8px;
        .cf-title {
          border-bottom: 1px solid #ededed;
          margin-left: 16px;
          height: 48px;
          .kfsj {
            line-height: 48px;
            opacity: 0.9;
            font-family: PingFangSC-Regular;
            font-size: 17px;
            color: rgba(25, 31, 37, 0.8);
            letter-spacing: 0;
          }
          .title-right {
            margin-right: 16px;
            margin-top: 15px;
            border: 1px solid #3296fa;
            border-radius: 10px;
            text-align: center;
            float: right;
            font-family: PingFangSC-Medium;
            font-size: 10px;
            color: #3296fa;
            letter-spacing: 0.06px;
            line-height: 12px;
            height: 18px;
            width: 68px;
            .pcmc {
              min-height: 18px;
              line-height: 16px;
              width: 50%;
              vertical-align: middle;
              border-right: 1px solid #3296fa;
            }
            .yyts {
              min-height: 1px;
              line-height: 16px;
              width: 50%;
              vertical-align: middle;
            }
          }
          .yfmc {
            margin-top: 15px;
            margin-right: 10px;
            float: right;
            font-family: PingFangSC-Medium;
            font-size: 10px;
            color: #ffffff;
            letter-spacing: 0.06px;
            background: #3296fa;
            border: 1px solid #3296fa;
            border-radius: 2px;
            height: 18px;
            width: 37px;
            text-align: center;
            vertical-align: middle;
          }
        }
        .cf-list {
          margin-top: 10px;
          margin-left: 16px;
          .xmmc {
            font-family: PingFangSC-Regular;
            font-size: 17px;
            color: #191f25;
            word-break: break-word;
            min-height: 1px;
          }
          .ypgg {
            min-height: 1px;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: #191f25;
            word-break: break-word;
          }
          .mcyl {
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: #191f25;
            word-break: break-word;
            min-height: 1px;
          }
          .ypsl {
            min-height: 1px;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: #191f25;
            word-break: break-word;
          }
          .fzIcon {
            margin-left: 8px;
            min-height: 1px;
            width: 5%;
            .top {
              margin-top: 10px;
              width: 6.6px;
              height: 6.9px;
              border-right: 2px solid #191f25;
              border-top: 2px solid #191f25;
            }
            .center {
              margin-top: 10px;
              width: 6.6px;
              height: 6.9px;
              border-right: 2px solid #191f25;
            }
            .bottom {
              margin-top: 10px;
              width: 6.6px;
              height: 6.9px;
              border-right: 2px solid #191f25;
              border-bottom: 2px solid #191f25;
            }
          }
        }
      }
    }
  }
}
</style>
