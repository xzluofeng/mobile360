<template>
  <div class="cda" v-bind:style="{ 'padding-top': top + 'px', 'padding-bottom': bottom + 'px' }">
    <van-nav-bar class="title" fixed v-if="!isFragment">
      <div slot="title">
        <span class="title-span">CDA</span>
      </div>
      <i class="fa fa-home index-icon" slot="left" @click="go('/card')" v-if="showHome"></i>
    </van-nav-bar>
    <div class="container" v-if="cdaTypeListVO.length>0">
      <div class="name" v-if="isFragment">患者姓名：{{this.hzxm}}</div>
      <div class="bl-list">
        <van-collapse v-model="activeNames" accordion>
          <van-collapse-item v-for="(bl, index ) in cdaTypeListVO" :key="bl.cdadm" :name="index" :title="bl.cdamc + bl.typeSize">
            <van-cell v-for="blmx in bl.lcwdmx" @click.native="saveLcwd(blmx)" :key="blmx.id" :title="handleWdmc(blmx)" to="/cdaContent" is-link/>
          </van-collapse-item>
        </van-collapse>
      </div>
    </div>
    <div v-else><img src="../../assets/img/empty.png" class="empty-container"></div>
    <Menu v-if="!isFragment"/>
    <VisitClick v-if="isFragment"  @updateData="enter"/>
  </div>
</template>

<script>
  import Menu from "@/components/Menu.vue";
  import mobile from "@/utils/mobile";
  import VisitClick from "@/components/VisitClick.vue";
  export default {
    data() {
      return {
        patientInfo: {}, //患者信息
        cdaList: [], //病历列表
        cdaTypeListVO: [], //根据cda分组
        wdlbList: [], //文档类别列表
        activeNames: "1",
        isFragment: false,
        top: 46,
        bottom: 50,
        showHome:true
      };
    },
    name: "Cda",
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
        this.getLcwd();
      },
      /**
       * 获取cda
       */
      getLcwd() {
        var patidList =
          this.patientInfo.patid +
          "+" +
          this.patientInfo.jzlb +
          "+" +
          this.patientInfo.yljgdm;
        this.$post("/api/v1/cdady/getCdaByJzlsh", {
          jzlsh: this.patientInfo.jzlsh,
          patidList: patidList
        })
          .then(data => {
            if (data.data) {
              if (data.data.cdaList && data.data.cdaList[0]) {
                this.cdaList = data.data.cdaList[0].lcwdList;
              } else {
                this.cdaList = [];
              }
              this.wdlbList = data.data.cdaTypeList || [];
            }
          })
          .then(() => {
            this.buildLcwdListVO();
          });
      },
      //保存cda信息
      saveLcwd(lcwd) {
        this.$storage.set("page-header", lcwd.cdamc);
        this.$storage.set("bl-cdadm", lcwd.cdadm);
        this.$storage.set("bl-xh", lcwd.xh);
        this.$storage.set("bl-cdatablename", lcwd.cdaname);
      },
      //根据文档类别分组
      buildLcwdListVO() {
        var map = {};
        this.cdaTypeListVO = [];
        for (var i = 0; i < this.cdaList.length; i++) {
          var lcwd = this.cdaList[i];
          if (!map[lcwd.cdamc]) {
            this.cdaTypeListVO.push({
              cdamc: lcwd.cdamc,
              lcwdmx: [lcwd],
              typeSize: lcwd.typeSize
            });
            map[lcwd.cdamc] = lcwd;
          } else {
            for (var j = 0; j < this.cdaTypeListVO.length; j++) {
              var lcwdnew = this.cdaTypeListVO[j];
              if (lcwdnew.cdamc == lcwd.cdamc) {
                lcwdnew.lcwdmx.push(lcwd);
                break;
              }
            }
          }
        }
      },
      //微信分享接口配置
      wxconfig() {
        const patientInfo = JSON.parse(localStorage.getItem("infos"));
        let desc = this.$getValue(patientInfo.zdmc);
        let age = this.$getJzAge(patientInfo.brxxkJz.birth, patientInfo.jzkssj);
        mobile.wxConf("cdady", config, age, desc);
      },
      //处理文档名称，如果带时间则之间显示，不过不带则取cjsj放前面
      handleWdmc(data) {
        return data.sjlrsj.substring(0, 16) + ' ' + data.cdamc;
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
      this.getLcwd();
    }
  };
</script>

<style lang="scss" scoped>
  .cda {
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
      .nav-bar-arrow-left-icon {
        color: #f8f9ff;
        font-size: 17px;
      }
    }
    /* 无数据空白页面 */
    .empty-container {
      width: 50%;
      margin: 25%;
    }
    .container {
      .name{
        font-size: 16px;
        margin:10px;
      }
    }
  }
</style>

<style lang="scss">
  .van-collapse-item__title {
    ont-family: PingFangSC-Regular;
    font-size: 17px;
    color: #191f25;
    line-height: 22px;
  }

  .van-collapse-item__content {
    padding: 0;
    padding-left: 10px;

    .van-cell__title {
      font-family: PingFangSC-Regular;
      font-size: 15px;
      color: rgba(13, -2147483648, 19, 0.8);
      line-height: 27px;
    }
  }
</style>
