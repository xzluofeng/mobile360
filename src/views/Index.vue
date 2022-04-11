<template>
  <div class="index">
    <van-nav-bar class="title" fixed v-if="!isFragment">
      <div slot="title">
        <span class="title-name">{{ baseInfo.hzxm }}</span>
        <i class="iconfont icon-clock" @click="go('/time')" :style="showHome===false?'right:15px !important':''"></i>
        <!-- <span @click="share" style="color: #FFF;">分享</span> -->
      </div>
      <van-icon
        v-if="showHome"
        name="ellipsis"
        slot="right"
        color="white"
        size="20px"
        @click.native="showNavbarMoreItemContainer"
      />
      <i class="fa fa-home index-icon" slot="left" @click="go('/card')" v-if="showHome"></i>
    </van-nav-bar>
    <div
      class="nav-bar-more-container"
      v-if="isShowNavbarMoreItemContainer"
      @click="hideNavbarMoreItemContainer">
      <ul class="nav-bar-more-item-list">
        <li class="nav-bar-more-item" type="share" @click="share">
          <span class="nav-bar-more-item-icon nav-bar-more-item-share-icon"></span>
          <span open-type="share" class="nav-bar-more-item-name">分享</span>
        </li>
        <li class="nav-bar-more-item" @click="followBtnEventHandler">
          <span class="nav-bar-more-item-icon nav-bar-more-item-follow-icon"></span>
          <span class="nav-bar-more-item-name">{{ followed ? '取消关注' : '关注患者'}}</span>
        </li>
      </ul>
    </div>

    <div class="container" v-bind:style="{ top: top + 'px', bottom: bottom + 'px' }">
      <div class="base-info-container">
        <van-row>
          <van-col span="6" class="base-info-img-container min-height">
            <span
              class="patient-head-img"
              :class="$getPatientHeadImg($getJzAge(baseInfo.birth,patientInfo.jzkssj), baseInfo.xbmc, patientInfo.yexh)"
            ></span>
          </van-col>
          <van-col span="18">
            <div class="base-info-inner-row">
              <span class="hzxm">{{ baseInfo.hzxm }}</span>
              <span class="rycw">[{{ patientInfo.rycw }}床]</span>
              <span
                class="xbmc age"
              >{{ baseInfo.xbmc ? baseInfo.xbmc.trim() : "" }}/{{ $getJzAge(baseInfo.birth,patientInfo.jzkssj) }}岁</span>
              <span class="hljbmc">{{ patientInfo.hljbmc }}</span>
            </div>
            <div class="base-info-inner-row">
              <span class="blh">{{ baseInfo.blh }}</span>
              <span class="jzkssj">
                {{ $formatDate(patientInfo.jzkssj) }}
                <span v-if="patientInfo.jzlb == 2">入院</span>
                <span v-if="patientInfo.jzlb == 1">就诊</span>
              </span>
            </div>
            <div></div>
          </van-col>
        </van-row>
        <van-row class="wzjb-row">
          <!-- wzjbmc -->
          <van-col span="6" class="wzjbmc-label">病情评估</van-col>
          <van-col span="18" class="wzjbmc-value">{{ patientInfo.wzjbmc }}</van-col>
        </van-row>
        <van-row class="gmxx-row">
          <van-col span="6" class="gmxx-label">过敏信息</van-col>
          <van-col span="18" class="gmxx-value">
            <span class="gmlxmc">{{ gmlxmc }}</span>
          </van-col>
        </van-row>
      </div>
      <div class="module-info-container">
        <div class="module-info-title">
          <span class="module-info-title-name">体征信息</span>
          <i
            class="fa fa-angle-right module-info-title-more-icon"
            aria-hidden="true"
            @click="go('/sign')"
          ></i>
        </div>
        <div class="module-info-body">
          <van-row class="module-info-body-row" v-for="tzjl in tzjlList" :key="tzjl.id">
            <van-col span="4">
              <span class="content">{{ tzjl.tzmc }}</span>
            </van-col>
            <van-col span="12">{{ tzjl.tzvalueText }}（{{ tzjl.tzdw }}）</van-col>
            <van-col span="8" class="lrrq">{{ $format(tzjl.lrrq, "MM-DD HH:mm") }}</van-col>
          </van-row>
          <div class="no-data-row" v-if="tzjlList.length == 0 && isTzjlListLoaded">暂无数据！</div>
        </div>
        <div class="time" is-link v-show=" isFragment && showHome" @click="showPopup">
        </div>
        <van-popup class="time-show" v-model="show" position="right" :style="{ height: '66%', width: '80%'} ">
          <div class="jzdj-list">
            <div v-for="jzdj in jzdjList"
                 class="jzdj-info" :key="jzdj.jzlsh"
                 @click="enter(jzdj.jzlsh,jzdj.jzlb,jzdj.yljgdm)">
              <div class="jzdj-info-row">
                <span class="jzkssj">{{ jzdj.jzkssj }}
                <span v-if="patientInfo.jzlb == 2">入院</span>
                <span v-if="patientInfo.jzlb == 1">就诊</span></span>
                <!--<span class="jzlbmc">{{ jzdj.jzlb }}</span>-->
              </div>
              <div class="jzdj-info-row">
                <span class="yljgmc">[{{ jzdj.yljgmc }}]</span>
              </div>
              <div class="jzdj-info-row">
                <span class="jzksmc">{{ jzdj.jzksmc }}</span>
              </div>
              <div class="jzdj-info-row">
                <span class="zdmc">{{ jzdj.zdmc }}</span>
              </div>
            </div>
          </div>
        </van-popup>
      </div>

      <div class="module-info-container">
        <div class="module-info-title">
          <span class="module-info-title-name">检验报告</span>
          <i
            class="fa fa-angle-right module-info-title-more-icon"
            aria-hidden="true"
            @click="go('/inspect')"
          ></i>
        </div>
        <div class="module-info-body">
          <van-row
            class="module-info-body-row"
            v-for="lisReport in lisReportList"
            :key="lisReport.id"
            @click.native="toInspectDetails(lisReport.bglbdm, lisReport.bglbmc, lisReport.bblx, lisReport.bgdh, lisReport.wswbgbz, lisReport.sysId)"
          >
            <van-col span="16" style="position: relative">
              <div>
                <span class="ycbz" aria-hidden="true" v-if="lisReport.ycbz === 'P'"></span>
                <span class="content">
                  <span class="bblx">{{ lisReport.bblx }}</span>
                  <span class="xmmc">{{ lisReport.xmmc }}</span>
                </span>
                <span class="wjzbz" aria-hidden="true" v-if="lisReport.wjzbz === '1'"></span>
              </div>
              <div class="wjz-nr" v-if="lisReport.wjzJyzbxmmcs">
                <span>{{ lisReport.wjzJyzbxmmcs }}</span>
              </div>
            </van-col>
            <van-col span="8" class="lrrq">{{ $format(lisReport.bgfbsj, "MM-DD HH:mm") }}</van-col>
          </van-row>
          <div class="no-data-row" v-if="lisReportList.length == 0 && isLisReportListLoaded">暂无数据！</div>
        </div>
      </div>
      <div class="module-info-container">
        <div class="module-info-title">
          <span class="module-info-title-name">检查报告</span>
          <i
            class="fa fa-angle-right module-info-title-more-icon"
            aria-hidden="true"
            @click="go('/check')"
          ></i>
        </div>
        <div class="module-info-body">
          <van-row
            class="module-info-body-row"
            v-for="risReport in risReportList"
            :key="risReport.id"
            @click.native="toCheckDetails(risReport.bglbdm, risReport.bglbmc, risReport.bgdh, risReport.dicom, risReport.sysId)"
          >
            <!-- <van-col span="16">
              <span class="content">{{ risReport.bglbmc }}</span>
            </van-col>
            <van-col span="8" class="lrrq">{{ $format(risReport.bgfbsj, "MM-DD HH:mm") }}</van-col>-->
            <div class="module-info-body-inner-row">
              <span class="content">{{ risReport.bglbmc }}</span>
              <span class="lrrq">{{ $format(risReport.bgfbsj, "MM-DD HH:mm") }}</span>
            </div>
            <div class="module-info-body-inner-row jcjg">
              <span>{{ risReport.jcjg }}</span>
            </div>
          </van-row>
          <div class="no-data-row" v-if="risReportList.length == 0 && isRisReportListLoaded">暂无数据！</div>
        </div>
      </div>
    </div>
    <div v-show="wxShare" class="overlayer" @touchmove.prevent @click="hideOverPlay">
    </div>
    <Menu v-if="!isFragment"/>
  </div>

</template>

<script>
  import Menu from "@/components/Menu.vue";
  import mobile from "@/utils/mobile";
  import {getPatientInfo} from "@/utils/api";
  import {getPatidList} from "@/utils/api";


  export default {
    data() {
      return {
        wxShare: false, //是否是微信分享：打开诱导分享遮罩层
        gmlxmc: "",
        show: false,
        followed: false, // 是否已关注
        baseInfo: {}, // 患者基本信息
        patientInfo: {}, // 患者就诊信息
        lisReportList: [], // 检验列表
        risReportList: [], // 检查列表
        tzjlList: [], // 体征列表
        isLisReportListLoaded: false, // 记录是否已经加载，用于控制“暂无数据！”显示时机
        isRisReportListLoaded: false, // 记录是否已经加载，用于控制“暂无数据！”显示时机
        isTzjlListLoaded: false, // 记录是否已经加载，用于控制“暂无数据！”显示时机
        isShowNavbarMoreItemContainer: false,
        isFragment: false,
        top: 46,
        bottom: 50,
        jzdjList: [],//就诊登记
        showHome:true

      };
    },
    name: "index",
    components: {
      Menu
    },
    methods: {
      /**
       * 点击展示历次就诊
       */
      showPopup() {
        const patidList = localStorage.getItem("originalPatids");
        this.$post("/api/v1/zyjzdjk/getJzjlsjz", {
          patid: this.patientInfo.patid,
          jzlb: this.patientInfo.jzlb,
          yljgdm: this.patientInfo.yljgdm,
          yexh: this.patientInfo.yexh,
          patidList: patidList
        })
          .then(data => {
            this.jzdjList = data.data || [];
            this.show = true;
          })
          .catch(() => {
          })
      },
      /**
       * 关注患者
       */
      follow() {
        const _this = this;
        this.$post("/api/v1/com/updatePatidGroup", {
          patidList: _this.patientInfo.keystr,
          jzlshGroupList: JSON.stringify([
            {groupId: "0",yexh:_this.patientInfo.yexh, jzlshGuid: _this.patientInfo.jzlshGuid}
          ])
        }).then(data => {
          if (data.status == 200) {
            this.$toast.success({
              duration: 1000,
              mask: true,
              message: "关注成功！"
            });
            _this.isShowNavbarMoreItemContainer = false;
            _this.patientInfo.followed = true;
            _this.followed = true;
            _this.$storage.set("infos", _this.patientInfo);
          }
        });
      },
      hideOverPlay() {
        this.wxShare = false;
        this.isShowNavbarMoreItemContainer = false;
      },
      followBtnEventHandler() {
        if (this.followed) {
          this.unfollow();
        } else {
          this.follow();
        }
      },
      getGmxx() {
        const patidList = localStorage.getItem("originalPatids");
        this.$post("/api/v1/gmjl/getDistinctZygmxxByPatidList", {
          patid: this.patientInfo.patid,
          jzlb: this.patientInfo.jzlb,
          yljgdm: this.patientInfo.yljgdm,
          patidList: patidList,
          psjgList: "1,2,3,4"
        }).then(data => {
          let gmlxmc = "";
          for (let i = 0; i < data.data.length; i++) {
            gmlxmc += data.data[i].gmlxmc + ",";
          }
          if (gmlxmc.length > 0) {
            gmlxmc = gmlxmc.substring(0, gmlxmc.length - 1);
          }
          this.gmlxmc = gmlxmc;
        });
      },
      getLisReportList() {
        const patidList = localStorage.getItem("originalPatids");
        this.$post("/api/v1/lisreport/getLisreportByPatidListAndJzlsh", {
          patidList: patidList,
          jzlsh: this.patientInfo.jzlsh,
          jzlb: this.patientInfo.jzlb,
          yljgdm: this.patientInfo.yljgdm,
          yexh: this.patientInfo.yexh
        }).then(data => {
          let lisReportList = [];
          this.isLisReportListLoaded = true;
          if (data.data && data.data.reportList && data.data.reportList[0]) {
            const reportList = data.data.reportList[0].lisreportEntityList;
            if (reportList) {
              if (reportList.length <= 5) {
                lisReportList = reportList;
              } else {
                for (let i = 0; i < 5; i++) {
                  lisReportList.push(reportList[i]);
                }
              }
            }
          }
          this.lisReportList = lisReportList;
        });
      },
      getRisReportList() {
        const patidList = localStorage.getItem("originalPatids");
        this.$post("/api/v1/risreport/getRisreportByPatidListAndJzlsh", {
          patidList: patidList,
          jzlsh: this.patientInfo.jzlsh,
          jzlb: this.patientInfo.jzlb,
          yljgdm: this.patientInfo.yljgdm,
          yexh: this.patientInfo.yexh
        }).then(data => {
          let risReportList = [];
          this.isRisReportListLoaded = true;
          if (data.data && data.data.reportList && data.data.reportList[0]) {
            const reportList = data.data.reportList[0].risreports;
            if (reportList) {
              if (reportList.length <= 5) {
                risReportList = reportList;
              } else {
                for (let i = 0; i < 5; i++) {
                  risReportList.push(reportList[i]);
                }
              }
            }
          }
          this.risReportList = risReportList;
        });
      },
      getTzjl() {
        this.$post("/api/v1/tzjl/getTzjlByJzlshByPage", {
          jzlsh: this.patientInfo.jzlsh,
          jzlb: this.patientInfo.jzlb,
          yljgdm: this.patientInfo.yljgdm,
          yexh: this.patientInfo.yexh,
          start: 0,
          size: 6
        }).then(data => {
          this.isTzjlListLoaded = true;
          if (data.data && data.data.length > 0) {
            this.tzjlList = data.data;
          } else {
            this.tzjlList = []
          }
        });
      },
      go(path) {
        this.$router.push(path);
      },
      hideNavbarMoreItemContainer() {
        this.isShowNavbarMoreItemContainer = false;
      },
      showNavbarMoreItemContainer() {
        this.isShowNavbarMoreItemContainer = true;
      },
      share() {
        const patientInfo = JSON.parse(localStorage.getItem("infos"));
        const source = localStorage.getItem("source");
        let url = "";
        if (source && source === "dingding") {
          url = config.http.mobileBaseURL + "?source=dingding&";
          url +=
            "params=" +
            encodeURI(
              JSON.stringify({
                jzlsh: patientInfo.jzlsh,
                jzlb: patientInfo.jzlb,
                yljgdm: patientInfo.yljgdm,
                yexh: patientInfo.yexh
              })
            );
          const title =
            patientInfo.brxxkJz.hzxm +
            " " +
            this.$getJzAge(patientInfo.brxxkJz.birth, patientInfo.jzkssj);
          mobile.share(title, url, this.$getValue(patientInfo.zdmc));
        } else if (source && source === "weixin") {
          // url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+config.wechat.corpId+
          //   '&redirect_uri='+encodeURI(config.http.icpURL+'/mobile360')+'&response_type=code&scope=snsapi_userinfo&agentid='
          // + config.wechat.AgentId+'&state='+ encodeURI(
          //     JSON.stringify({
          //       jzlsh: patientInfo.jzlsh,
          //       jzlb: patientInfo.jzlb,
          //       yljgdm: patientInfo.yljgdm,
          //       yexh: patientInfo.yexh
          //     })
          //   ) +'#wechat_redirect'
          this.wxShare = true;
        }
      },
      toCheckDetails(bglbdm, bglbmc, bgdh, dicom, sysId) {
        this.$router.push({
          path: "/checkDetails",
          query: {
            dicom: dicom,
            bglbmc: bglbmc,
            bgdh: bgdh,
            bglbdm: bglbdm,
            sysId: sysId
          }
        });
      },
      toInspectDetails(bglbdm, bglbmc, bblx, bgdh, wswbgbz, sysId) {
        this.$router.push({
          path: "/inspect/inspectionsInfo",
          query: {
            title: bglbmc + bblx,
            wswbgbz: wswbgbz,
            bgdh: bgdh,
            bglbdm: bglbdm,
            sysId: sysId,
            bblx: bblx
          }
        });
      },
      //微信分享接口配置
      wxconfig() {
        const patientInfo = JSON.parse(localStorage.getItem("infos"));
        let desc = this.$getValue(patientInfo.zdmc);
        let age = this.$getJzAge(patientInfo.brxxkJz.birth, patientInfo.jzkssj);
        mobile.wxConf("index", config, age, desc);
      },
      /**
       * 取消关注
       */
      unfollow() {
        const _this = this;
        this.$post("/api/v1/com/deletePatientGroup", {
          patidList: _this.patientInfo.keystr,
          yexh: _this.patientInfo.yexh
        }).then(data => {
          if (data.status == 200) {
            this.$toast.success({
              duration: 1000,
              mask: true,
              message: "取消关注操作成功！"
            });
            _this.isShowNavbarMoreItemContainer = false;
            _this.patientInfo.followed = false;
            _this.followed = false;
            _this.$storage.set("infos", _this.patientInfo);
          }
        });
      },
      enter(jzlsh, jzlb, yljgdm) {
        const _this = this;
        let patientInfo = this.$storage.get("infos");
        getPatientInfo(jzlsh, jzlb, yljgdm, patientInfo.yexh, function (data) {
          _this.$storage.set("infos", data);
          getPatidList(data.patid, jzlb, yljgdm, function (res) {
            localStorage.setItem("originalPatids", res);
            _this.isFragment = _this.$isFragment()
            _this.top = _this.$getContentContainerPositionInfo().top;
            _this.bottom = _this.$getContentContainerPositionInfo().bottom;
            _this.patientInfo = _this.$storage.get("infos");
            _this.baseInfo = _this.patientInfo.brxxkJz;
            _this.followed = _this.patientInfo.followed;
            _this.getGmxx();
            _this.getLisReportList();
            _this.getRisReportList();
            _this.getTzjl();

          });
        })
        this.show = false;
      },
    },

    mounted() {
      this.patientInfo = this.$storage.get("infos");
      this.baseInfo = this.patientInfo.brxxkJz;
      this.followed = this.patientInfo.followed;
      const source = localStorage.getItem("source");
      if (source && source === "weixin") {
        this.wxconfig();
      }
      const module = localStorage.getItem("module");
      if (module && module === "0") {
        this.showHome=false
      }
      this.isFragment = this.$isFragment()
      this.top = this.$getContentContainerPositionInfo().top;
      this.bottom = this.$getContentContainerPositionInfo().bottom;

      this.getGmxx();
      this.getLisReportList();
      this.getRisReportList();
      this.getTzjl();
    }
  };
</script>

<style lang="scss" scoped>
  .index {
    padding-top: 46px;
    background-color: #f5f5f9;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    .title {
      background-color: #276bf1;
      .title-name {
        color: #ffffff;
        font-size: 16px;
        font-weight: bold;
      }
      .clock-icon-container {
        position: relative;
      }
      .icon-clock {
        color: #ffffff;
        font-size: 20px;
        position: fixed;
        top: 0;
        right: 45px;
      }
    }
    .nav-bar-more-container {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(0, 0, 0, 0.28);
      filter: alpha(opacity=60);
      filter: "alpha(opacity=60)";
      z-index: 2;
      .nav-bar-more-item-list {
        background-color: #ffffff;
        border: 1px solid #ededed;
        padding: 0 5px;
        position: fixed;
        top: 46px;
        right: 0;
        width: 130px;
        font-size: 16px;
        .nav-bar-more-item {
          border-bottom: 1px solid #ededed;
          padding: 10px 0;
          .nav-bar-more-item-icon {
            display: inline-block;
            width: 24px;
            height: 24px;
            margin-left: 10px;
            vertical-align: middle;
            background-size: 24px;
          }
          .nav-bar-more-item-share-icon {
            background: url("../assets/img/share.svg") center center no-repeat;
          }
          .nav-bar-more-item-follow-icon {
            background: url("../assets/img/star.svg") center center no-repeat;
          }
          .nav-bar-more-item-name {
            display: inline-block;
            padding-left: 8px;
            vertical-align: middle;
          }
        }
        .nav-bar-more-item:last-child {
          border-bottom: none;
        }
      }
    }
    .container {
      position: absolute;
      top: 46px;
      bottom: 50px;
      left: 0;
      right: 0;
      overflow: scroll;
      .base-info-container {
        padding: 13px 15px;
        font-size: 17px;
        color: #191f25;
        line-height: 22px;
        background-color: #ffffff;
        .patient-head-img {
          display: inline-block;
          width: 48px;
          height: 48px;
          border-radius: 24px;
        }
        .base-info-inner-row {
          position: relative;
          height: 22px;
        }
        .base-info-inner-row:not(:first-child) {
          margin-top: 4px;
        }
        .hzxm {
          font-size: 16px;
          font-weight: bold;
        }
        .rycw {
          padding-left: 5px;
          color: #0a51e6;
          font-size: 16px;
          font-weight: bold;
        }
        .xbmc {
          padding-left: 20px;
          font-size: 16px;
          font-weight: bold;
        }
        .blh {
          font-size: 16px;
          font-weight: bold;
        }
        .hljbmc {
          position: absolute;
          top: 2px;
          right: 0;
          font-size: 10px;
          color: #0a51e6;
          border: 1px solid #0a51e6;
          height: 20px;
          line-height: 20px;
          padding: 0 2px;
          border-radius: 4px;
        }
        .jzkssj {
          position: absolute;
          right: 0;
          font-size: 15px;
          color: rgba(25, 31, 37, 0.8);
        }
        .wzjb-row,
        .gmxx-row {
          padding-top: 10px;
        }
        .wzjbmc-label,
        .gmxx-label {
          font-size: 17px;
          color: rgba(25, 31, 37, 0.56);
          line-height: 22px;
        }
        .gmlxmc {
          color: #ff0000;
        }
      }
      .module-info-container {
        margin-top: 8px;
        .module-info-title {
          background-color: #ffffff;
          padding: 12px 15px;
          position: relative;
          font-size: 16px;
          font-weight: bold;
          .module-info-title-more-icon {
            color: rgba(25, 31, 37, 0.28);
            position: absolute;
            right: 15px;
            font-size: 26px;
          }
        }
        .module-info-body {
          font-size: 17px;
          color: #191f25;
          line-height: 22px;
          .module-info-body-row {
            background-color: #ffffff;
            padding: 12px 15px;
            margin-top: 1px;
            .lrrq {
              font-size: 15px;
              color: rgba(25, 31, 37, 0.56);
              line-height: 20px;
              text-align: right;
            }
            .ycbz {
              width: 16px;
              height: 16px;
              position: absolute;
              top: 3px;
              display: inline-block;
              background: url("../assets/img/red-asterisk.png") center center no-repeat;
            }
            .content {
              margin-left: 16px;
            }
            .xmmc {
              display: inline-block;
              margin-left: 13px;
            }
            .wjzbz {
              width: 16px;
              height: 16px;
              display: inline-block;
              background: url("../assets/img/wjz.png") center center no-repeat;
              margin-left: 15px;
              // margin-top: 3px;
              position: absolute;
              top: 3px;
            }
            .wjz-nr {
              padding-top: 3px;
              padding-left: 16px;
              font-size: 14px;
              color: #ff0000;
            }
            .lrrq {
              float: right;
            }
            .jcjg {
              padding-top: 3px;
              padding-left: 16px;
            }
            .jcjg span {
              line-height: 20px;
              max-height: 40px;
              font-size: 14px;
              color: rgba(25, 31, 37, 0.9);
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
          }
          .no-data-row {
            text-align: center;
            padding: 12px 15px;
            margin-top: 1px;
            background-color: #ffffff;
          }
        }
      }
      .module-info-container:last .warn-info {
        padding-top: 150px;
        text-align: center;
      }
    }
  }

  .overlayer {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background-image: url("../assets/img/wxShare.png");
    background-size: 100%;
    opacity: 0.8;
  }

  .jzdj-list {
    margin-top: 8px
  }

  .jzdj-info {
    margin-bottom: 2px;
    background-color: #FFFFFF;
    margin-bottom: 2px;
    padding: 8px 15px 6px 15px
  }

  .jzdj-info-row {
    padding-bottom: 2px;
    font-size: 17px
  }

  .jzkssj {
    color: #191F25
  }

  .jzlbmc {
    margin-left: 8px;
    font-size: 10px;
    padding: 0 3px;
    border: 1px solid #0A51E6;
    border-radius: 3px;
    color: #0A51E6;
  }

  .yljgmc {
    color: #0A51E6;
    font-size: 15px;
    font-weight: 500
  }

  .jzksmc {
    color: #0D0013;
    font-size: 15px;
    margin-left: 5px;
  }

  .zdmc {
    color: #191F25;
    font-weight: 600
  }

  .time {
    width: 36px;
    height: 36px;
    background-image: url("../assets/img/lcjz.png");
    background-size: cover;
    background-repeat: no-repeat;
    position: fixed;
    top: 40%;
    right: 3%;
    z-index: 9000;
    .time-show{
      background-color: rgba(0, 0, 0, 0.28);
    }
  }

</style>
