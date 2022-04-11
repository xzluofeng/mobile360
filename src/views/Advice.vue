<template>
  <div class="advice" v-bind:style="{ 'padding-top': top + 'px', 'padding-bottom': bottom + 'px' }">
    <van-nav-bar class="title" fixed v-if="!isFragment">
      <div slot="title">
        <span class="title-span">医嘱</span>
      </div>
      <i class="fa fa-home index-icon" slot="left" @click="go('/card')" v-if="showHome"></i>
    </van-nav-bar>
    <div class="container">
      <van-row class="advice-btn-row">
        <van-col
          span="8"
          class="advice-btn"
          :class="{'active': activedAdviceBtn == 'long'}"
          data-value="followed"
          @click.native="changeAdviceList('long',true)"
        >长期医嘱</van-col>
        <van-col
          span="8"
          class="advice-btn"
          :class="{'active': activedAdviceBtn == 'short'}"
          data-value="my"
          @click.native="changeAdviceList('short',true)"
        >临时医嘱</van-col>
        <van-col
          span="8"
          class="advice-btn"
          :class="{'active': activedAdviceBtn == 'valid'}"
          data-value="all"
          @click.native="changeAdviceList('valid',true)"
        >有效医嘱</van-col>
      </van-row>
      <span class="calendar-btn" :class="{actived: calendarIconActived}" @click="goToSelectDate" :style="getHeight()"></span>
      <div v-if="adviceListVO.length>0">
        <div class="name" v-if="isFragment">患者姓名：{{this.hzxm}}</div>
      <van-list
        class="advice-list"
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        :immediate-check="false"
        @load="loadMore"
      >
        <div class="advice-card" v-for="advice in adviceListVO" :key="advice.ksrq">
          <div class="ksrq">
            <span class="rqtitle">日期</span>
            <span class="rqvalue">{{advice.ksrq}}</span>
          </div>
          <div class="yznr">
            <van-row class="yznr-row">
              <van-col span="3" class="nrtitle">医嘱</van-col>
              <van-col span="21" class="yzmx-right">
                <van-row
                  class="yzmxList"
                  v-bind:class="fzClass(yzmx.yzzhImg)"
                  v-for="yzmx in advice.advicemx"
                  :key="yzmx.id"
                >
                  <van-col span="1" class="fzIcon">
                    <div v-bind:class="fzClass(yzmx.yzzhImg)"></div>
                  </van-col>
                  <van-col span="23" class="yzmx">
                    <div class="first-floor" :class="{'cancled':yzmx.yzzt==='3'}">
                      <span>{{yzmx.ksrq.substring(11,16)}}&nbsp;{{yzmx.yznr}}</span>
                    </div>
                    <div class="second-floor">
                      <span>{{yzmx.ypsl}}{{yzmx.ypdw}}&nbsp;{{yzmx.yfmc}}&nbsp;{{yzmx.pcmc}}&nbsp;{{yzmx.mcyl}}</span>
                    </div>
                  </van-col>
                </van-row>
              </van-col>
            </van-row>
          </div>
        </div>
      </van-list>
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
      adviceList: [], //服务返回的医嘱列表
      adviceListVO: [], //根据日期分组的医嘱列表
      activedAdviceBtn: "long", // 当前选中医嘱按钮：长期、临时、有效
      queryParams: this.$route.query, // 跳转过来的参数
      ksrqList: [],
      ksrq: "",
      calendarIconActived: false,
      size: 10, // 下拉加载数据：一次加载数据个数
      start: 0, // 下拉加载数据：开始位置
      finished: false, // 下拉加载数据：是否已加载完成
      loading: false, // 下拉加载数据：是否处于加载状态
      isFragment: false,
      top: 46,
      bottom: 50,
      showHome:true
    };
  },
  name: "home",
  components: {
    Menu,
    VisitClick
  },
  methods: {
    //获取当前患者的信息
    enter(jzlsh,jzlb,yljgdm){
      this.patientInfo.jzlb = jzlb;
      this.patientInfo.jzlsh = jzlsh;
      this.patientInfo.yljgdm = yljgdm;

      this.changeAdviceList(this.activedAdviceBtn);

    },
    //切换选项卡
    changeAdviceList(type, isChange) {
      this.activedAdviceBtn = type;
      if (this.queryParams && this.queryParams.ksrq) {
        this.ksrq = this.queryParams.ksrq;
        this.calendarIconActived = true;
      } else {
        this.ksrq = "";
        this.calendarIconActived = false;
      }

      //   this.activedAdviceBtn = type;
      if (isChange) {
        this.resetListProperties(false, true);
      }

      if (type == "long") {
        // this.getLongAdviceList();
        const params = {
          jzlb: this.patientInfo.jzlb,
          yexh: this.patientInfo.yexh,
          yljgdm: this.patientInfo.yljgdm,
          jzlsh: this.patientInfo.jzlsh,
          size: this.size,
          start: this.start,
          ksrq: this.ksrq,
          yzlb: "1",
          yzzt: "-1"
        };
        this.getKsrqList(params);
        this.getAdviceList(params);
      } else if (type == "short") {
        // this.getShortAdviceList();
        const params = {
          jzlb: this.patientInfo.jzlb,
          yexh: this.patientInfo.yexh,
          yljgdm: this.patientInfo.yljgdm,
          jzlsh: this.patientInfo.jzlsh,
          size: this.size,
          start: this.start,
          ksrq: this.ksrq,
          yzlb: "2",
          yzzt: "-1"
        };
        this.getKsrqList(params);
        this.getAdviceList(params);
      } else if (type == "valid") {
        const params = {
          jzlb: this.patientInfo.jzlb,
          yexh: this.patientInfo.yexh,
          yljgdm: this.patientInfo.yljgdm,
          jzlsh: this.patientInfo.jzlsh,
          size: this.size,
          start: this.start,
          ksrq: this.ksrq,
          yzlb: "1",
          yzzt: "0,1,2"
        };
        this.getKsrqList(params);
        this.getAdviceList(params);
      }
    },
    /**
     * 处方分组图标
     * @param yzzhImg
     * @returns {{top: boolean, center: boolean, bottom: boolean}}
     */
    fzClass: function(yzzhImg) {
      return {
        top: yzzhImg == "top",
        center: yzzhImg == "center",
        bottom: yzzhImg == "bottom",
        else: yzzhImg != "top" && yzzhImg != "center" && yzzhImg != "bottom"
      };
    },
    //获取医嘱
    getAdviceList(params) {
      this.$post("/api/v1/zyyzmxk/getZyyzmxkListByPage", params)
        .then(data => {
          if (data.data && data.data.content && data.data.content.length > 0) {
            this.adviceList = this.$lodash.concat(
              this.adviceList,
              data.data.content
            );
            this.start += 1;
            this.finished = data.data.last;
            this.loading = false;
          } else {
            this.finished = true;
            this.loading = false;
          }
        })
        .then(() => {
          this.adviceListVO = [];
          this.buildAdviceListVO();
        });
    },
    getKsrqList(params) {
      const _this = this;
      this.$post("/api/v1/zyyzmxk/getKsrqList", params).then(data => {
        _this.ksrqList = data.data;
      });
    },
    goToSelectDate() {
      this.$router.push({
        path: "/calendar",
        query: {
          ksrqList: this.ksrqList,
          type: this.activedAdviceBtn
        }
      });
    },
    getHeight(){
      if(this.isFragment){
        return 'top:110px;'
      }else{
        return 'top:75px;'
      }
    },
    //加载更多
    loadMore() {
      if (this.activedAdviceBtn === "long") {
        this.changeAdviceList("long", false);
      } else if (this.activedAdviceBtn === "short") {
        this.changeAdviceList("short", false);
      } else if (this.activedAdviceBtn === "valid") {
        this.changeAdviceList("valid", false);
      }
    },
    /**
     * 重置List组件属性
     */
    resetListProperties(loading, finished) {
      this.adviceList = [];
      this.adviceListVO = [];
      this.start = 0;
      this.loading = loading;
      this.finished = finished;
    },
    //微信分享接口配置
    wxconfig() {
      const patientInfo = JSON.parse(localStorage.getItem("infos"));
      let desc = this.$getValue(patientInfo.zdmc);
      let age = this.$getJzAge(patientInfo.brxxkJz.birth, patientInfo.jzkssj);
      mobile.wxConf("advice", config, age, desc);
    },
    //根据医嘱开始日期分组
    buildAdviceListVO() {
      var map = {};
      this.adviceListVO = [];
      for (var i = 0; i < this.adviceList.length; i++) {
        var advice = this.adviceList[i];
        if (!map[advice.ksrq.substring(0, 10)]) {
          this.adviceListVO.push({
            ksrq: advice.ksrq.substring(0, 10),
            advicemx: [advice]
          });
          map[advice.ksrq.substring(0, 10)] = advice;
        } else {
          for (var j = 0; j < this.adviceListVO.length; j++) {
            var advicenew = this.adviceListVO[j];
            if (
              advicenew.ksrq.substring(0, 10) == advice.ksrq.substring(0, 10)
            ) {
              advicenew.advicemx.push(advice);
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
    this.isFragment = this.$isFragment();
    this.top = this.$getContentContainerPositionInfo().top;
    this.bottom = this.$getContentContainerPositionInfo().bottom;
    this.ksrq = "";
    if (this.queryParams.type) {
      this.activedAdviceBtn = this.queryParams.type;
    } else {
      this.activedAdviceBtn = "long";
    }
    this.patientInfo = this.$storage.get("infos");
    // this.getLongAdviceList();
    this.changeAdviceList(this.activedAdviceBtn);
  }
};
</script>

<style lang="scss" scoped>
.advice {
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
    position: relative;
     .empty-container {
      width: 50%;
       margin: 25%;
     }
    .advice-btn-row {
      background-color: #ffffff;
      /* 无数据空白页面 */
      .advice-btn {
        height: 48px;
        line-height: 48px;
        text-align: center;
        color: rgba(25, 31, 37, 0.8);
        font-size: 17px;
      }
      .advice-btn.active {
        color: #0a51e6;
        font-size: 16px;
        font-weight: bold;
        border-bottom: 3px solid #0a51e6;
      }
    }
     .name{
     font-size: 16px;
     margin:10px;
     }
    .calendar-btn {
      display: block;
      position: absolute;
      right: 12px;
      width: 18px;
      height: 18px;
      background: url("../assets/img/calendar-unactived.png") center center
        no-repeat;
      background-size: 18px;
    }
    .calendar-btn.actived {
      background: url("../assets/img/calendar-actived.png") center center
        no-repeat;
      background-size: 18px;
    }
    .advice-list {
      .advice-card {
        padding-bottom: 13px;
        background: #ffffff;
        margin-top: 8px;
        .ksrq {
          border-bottom: 1px solid #ededed;
          height: 48px;
          font-family: PingFangSC-Regular;
          font-size: 17px;
          color: #191f25;
          letter-spacing: 0;
          .rqvalue {
            line-height: 48px;
            margin-left: 28px;
          }
          .rqtitle {
            line-height: 48px;
            margin-left: 15px;
          }
        }
        .yznr {
          .yznr-row {
            margin-left: 16px;
            .nrtitle {
              font-family: PingFangSC-Regular;
              font-size: 17px;
              color: #191f25;
              letter-spacing: 0;
              margin-top: 13px;
            }
            .yzmx-right {
              margin-top: 13px;
              .yzmxList:not(:first-child) {
                .fzIcon {
                  margin-top: 12px;
                }
                .yzmx {
                  .cancled {
                    text-decoration: line-through red;
                  }
                  .first-floor {
                    margin-top: 12px;
                  }
                }
              }
              .yzmxList:not(:first-child).else {
                margin-top: 13px;
                border-top: 1px solid #ededed;
              }
              .yzmxList {
                .fzIcon {
                  min-height: 1px;
                  .top {
                    margin-top: 10px;
                    width: 6.6px;
                    height: 10px;
                    border-left: 2px solid #191f25;
                    border-top: 2px solid #191f25;
                  }
                  .center {
                    margin-top: 10px;
                    width: 6.6px;
                    height: 10px;
                    border-left: 2px solid #191f25;
                  }
                  .bottom {
                    margin-top: 10px;
                    width: 6.6px;
                    height: 10px;
                    border-left: 2px solid #191f25;
                    border-bottom: 2px solid #191f25;
                  }
                }
                .yzmx {
                  .first-floor {
                    font-family: PingFangSC-Regular;
                    font-size: 17px;
                    color: #191f25;
                    letter-spacing: 0;
                    margin-right: 10px;
                  }
                  .second-floor {
                    font-family: PingFangSC-Regular;
                    font-size: 13px;
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
  }
}
</style>
<style lang="scss">
.van-list__finished-text {
  background-color: #f5f5f9;
}
</style>
