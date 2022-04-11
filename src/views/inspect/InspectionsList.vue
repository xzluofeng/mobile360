<template>
  <div class="inspections-list flex flex-v">
    <!--头部-->
    <section class="header flex flex-align-center" v-if="!isFragment">
      <i class="fa fa-home index-icon" slot="left" @click="go('/card')" v-if="showHome"></i>
      <div class="header-title">检验</div>
    </section>
    <div v-if="reportsListData.length>0">
     <div class="name" v-if="isFragment">患者姓名：{{this.hzxm}}</div>
    <section class="reports-box flex-1" >
      <van-collapse v-model="activeNames">
        <van-collapse-item
          v-for="(item, index) in reportsListData "
          :title="item.bglbmc + item.typeSize"
          :name="item.bglbdm"
          :key="index"
        >
          <van-cell
            v-for="(v, i) in item.listData"
            :key="i"
            title-class="cell-title"
            @click="toReports(v)"
            :label="v.wjzJyzbxmmcs"
            :required="v.ycbz === 'P'"
          >
            <template slot="title">
              <div class="flex flex-pack-justify-between">
                <div class="left flex flex-align-center">
                  <span class="custom-text">{{v.bblx}} {{v.xmmc}}</span>
                  <span class="danger" v-if="v.wjzbz === '1'"></span>
                </div>
                <div class="right">
                  <span class="van-cell__value">{{$format(v.bgfbsj, 'YYYY-MM-DD HH:mm')}}</span>
                </div>
              </div>

              <div class="van-cell__label text-danger">{{v.wjzJyzbxmmcs}}</div>
            </template>
            <!--<p slot="label">{{v.wjzJyzbxmmcs}}</p>-->

          </van-cell>
          <div class="no-data" v-if="!item.listData.length && hasQequest">暂无数据</div>
        </van-collapse-item>
        <div class="no-data" v-if="!reportsListData.length && hasQequest">暂无数据</div>
      </van-collapse>
    </section>
    </div>
     <div v-else><img src="../../assets/img/empty.png" class="empty-container"></div>
    <VisitClick v-if="isFragment"  @updateData="enter"/>
  </div>
</template>


<script>
import mobile from "@/utils/mobile";
import VisitClick from "@/components/VisitClick.vue"
export default {
  data() {
    return {
      infos: this.$storage.get("infos"), // 就诊信息，患者信息
      activeNames: [],
      reportsListData: [], // 检验报告数据
      hasQequest: false, // 解决拿到数据间隔显示 暂无数据
      isFragment: false,
      top: 46,
      bottom: 50,
      showHome:true
    };
  },
  mounted() {
    const module = localStorage.getItem("module");
      if (module && module === "0") {
        this.showHome=false
      }
    this.patientInfo = this.$storage.get("infos");
    this.hzxm = this.patientInfo.brxxkJz.hzxm;
    const source = localStorage.getItem("source");
    this.isFragment = this.$isFragment();
    if (source && source === "weixin") {
      this.wxconfig();
    }
    this.getCategoryData();
  },
  components: {
    VisitClick
  },
  methods: {
    /**
     * 后退
     */
    goBack() {
      this.$router.go(-1);
    },
    //获取当前患者的信息
    enter(jzlsh,jzlb,yljgdm){
      this.infos.jzlb = jzlb;
      this.infos.jzlsh = jzlsh;
      this.infos.yljgdm = yljgdm;
      this.getCategoryData();
    },
    //微信分享接口配置
    wxconfig() {
      const patientInfo = JSON.parse(localStorage.getItem("infos"));
      let desc = this.$getValue(patientInfo.zdmc);
      let age = this.$getJzAge(patientInfo.brxxkJz.birth, patientInfo.jzkssj);
      mobile.wxConf("inspect/inspectionsList", config, age, desc);
    },
    /**
     * 获取检验类别分组
     */
    getCategoryData() {
      const patidList = localStorage.getItem("originalPatids");
      const formData = {
        patidList: patidList,
        yexh: this.infos.yexh,
        jzlsh: this.infos.jzlsh,
        jzlb: this.infos.jzlb,
        yljgdm: this.infos.yljgdm
      };
      const url = "/api/v1/lisreport/getLisreportByPatidListAndJzlsh";
      this.$post(url, formData)
        .then(res => {
          this.hasQequest = true;
          const data = res.data;
          const categoryListData = data.typeList || [];
          const reportsList = data.reportList || [];
          let reportsListData = [];
          // 组装报告数据
          if (reportsList.length) {
            reportsListData = reportsList[0].lisreportEntityList || [];
          }
          categoryListData.forEach(item => {
            item.listData = [];
            reportsListData.forEach(v => {
              if (item.bglbdm === v.bglbdm) {
                item.listData.push(v);
              }
            });
          });
          this.reportsListData = categoryListData;
        })
        .catch(err => {
          // console.log(err);
        });
    },
    /**
     * 跳转报告明细
     */
    toReports(item) {
      this.$router.push({
        path: "inspectionsInfo",
        query: {
          title: item.bglbmc + item.bblx,
          wswbgbz: item.wswbgbz,
          bgdh: item.bgdh,
          bglbdm: item.bglbdm,
          sysId: item.sysId,
          bblx: item.bblx
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.inspections-list {
  height: 100%;
  /*头部样式 srart*/
  .header {
    height: 46px;
    background-image: linear-gradient(-270deg, #3777f5 0%, #195be6 100%);
    color: #fff;
    font-size: 17px;
    font-family: PingFangSC-Medium;
  }

  .header-title {
    margin: 0 auto;
    font-size: 16px;
    font-weight: bold;
  }
  .name{
   font-size: 16px;
   margin:10px;
  }
  .van-icon-arrow-left {
    position: absolute;
    color: #f8f9ff;
    left: 10px;
  }
  /*头部样式 end*/

  .reports-box {
    overflow-y: auto;
    background-color: #fff;
  }
  .unusual {
    display: inline-block;
    width: 10px;
    height: 10px;
    line-height: 10px;
    color: #ff0000;
  }
  .danger {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-image: url("../../assets/img/wjz.png");
    background-size: cover;
    margin-left: 5px;
  }
  .text-danger {
    color: #ff0000;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .van-cell:last-child::after {
    content: " ";
    position: absolute;
    pointer-events: none;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    left: 15px;
    right: 0;
    bottom: 0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    border-bottom: 1px solid #ebedf0;
  }

  .no-data {
    font-size: 17px;
    text-align: center;
    padding: 10px;
    color: #666;
  }
/* 无数据空白页面 */
.empty-container {
    width: 50%;
    margin: 25%;
}
}
</style>


<style lang="scss">
.inspections-list {
  .van-collapse-item {
    & > .van-cell {
      padding: 13px 16px;
      font-family: PingFangSC-Regular;
      font-size: 17px;
      color: #191f25;
      line-height: 22px;
    }
  }
  .van-collapse-item__content {
    padding: 0;
    & > .van-cell {
      padding: 13px 16px;
      font-family: PingFangSC-Regular;
      font-size: 15px;
      color: rgba(13, -2147483648, 19, 0.8);
      line-height: 24px;
      .van-cell__value {
        font-family: PingFangSC-Regular;
        font-size: 13px;
        color: #999999;
      }
    }
  }

  .van-hairline--top::after {
    border-top-width: 0;
  }
}
</style>
