<template>
  <div class="quota" v-bind:style="{ 'padding-top': top + 'px', 'padding-bottom': bottom + 'px' }">
    <van-nav-bar class="title" fixed v-if="!isFragment">
      <div slot="title">
        <span class="title-name">指标</span>
      </div>
      <i class="fa fa-home index-icon" slot="left" @click="go('/card')" v-if="showHome"></i>
    </van-nav-bar>
    <div class="quota-list" v-if="quotaList.length>0">
      <div class="name" v-if="isFragment">患者姓名：{{this.hzxm}}</div>
      <div v-for="quota in quotaList" class="quota-info" :key="quota.groupInfo.id">
        <div class="group-name-row">
          <span class="group-name">{{ quota.groupInfo.name }}</span>
        </div>
        <div class="quota-item-list">
          <van-row v-for="item in quota.itemList" class="quota-item-info" :key="item.id">
            <van-col span="8" class="quota-item-name">{{ item.itemInfo.name }}</van-col>
            <van-col
              span="4"
              class="quota-item-jyjg"
              v-bind:class="{'quota-item-jyjg-high': item.lastData.ycbz == 'H', 'quota-item-jyjg-low': item.lastData.ycbz == 'L'}"
            >
              <span>{{ item.lastData.jyjg }}</span>
              <i v-if="item.lastData.ycbz == 'L'" class="fa fa-long-arrow-down" aria-hidden="true"></i>
              <i v-if="item.lastData.ycbz == 'H'" class="fa fa-long-arrow-up" aria-hidden="true"></i>
            </van-col>
            <van-col span="10" class="quota-item-bgfbrq">{{ item.lastData.bgfbrq }}</van-col>
            <van-col span="2" class="quota-item-icon">
              <i class="fa fa-line-chart" aria-hidden="true" v-if="item.allNumeric" @click="showChart(item.itemInfo)"></i>
            </van-col>
          </van-row>
        </div>
      </div>
    </div>
    <div v-else><img src="../assets/img/empty.png" class="empty-container"></div>
    <van-popup v-model="showChartDialog" :lazy-render="false" class="quota-chart-dialog">
      <div id="quotaChart" class="quota-chart"></div>
      <i class="fa fa-times-circle-o closeBtn" @click="showChartDialog = false" aria-hidden="true"></i>
    </van-popup>
    <Menu v-if="!isFragment"/>
  </div>
</template>


<script>
import echarts from "echarts";
import Menu from "@/components/Menu.vue";
import mobile from "@/utils/mobile";

export default {
  data() {
    return {
      trendChart: null, // chart容器
      chartOption: {
        // chart设置
        title: {
          text: "",
          top: 10
        },
        grid: {
          left: 50,
          right: 50
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            textStyle: {
              color: "#333",
              fontSize: 14,
              fontWeight: "bold"
            },
            margin: 20
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed",
              color: "rgba(140, 160, 179,0.25)"
            }
          },
          data: [] // 日期数据
        },
        yAxis: {
          type: "value",
          name: "",
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            textStyle: {
              color: "#0040C9"
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed",
              color: "rgba(140, 160, 179,0.25)"
            }
          }
        },
        series: [
          {
            name: "本次就诊记录",
            type: "line",
            smooth: true,
            symbol: "circle",
            hoverAnimation: false,
            showAllSymbol: true,
            itemStyle: {
              normal: {
                color: "#0040C9"
              }
            },
            lineStyle: {
              normal: {
                color: "#0040C9"
              }
            },
            symbolSize: 10,
            label: {
              normal: {
                show: true,
                position: "top",
                fontSize: 18,
                fontWeight: "bold",
                color: "#0040C9"
              }
            },
            markLine: {
              silent: true,
              symbolSize: 0,
              label: {
                normal: {
                  show: true,
                  fontSize: 16
                }
              },
              data: []
            },
            data: []
          }
        ]
      },
      patientInfo: {},
      quotaList: [],
      showChartDialog: false,
      isFragment: false,
      top: 46,
      bottom: 50,
      showHome:true
    };
  },
  components: {
    Menu
  },
  methods: {
    getChartData(
      jzlsh,
      patid,
      jzlb,
      yljgdm,
      yexh,
      bblx,
      bglbdm,
      jyzbxmdm,
      ksbgrq,
      jsbgrq,
      patidList
    ) {
      this.$post("/api/v1/lisreport/getChartDataOfYjjgByJzlshAndJyzbxmdm", {
        jzlsh: jzlsh,
        patid: patid,
        jzlb: jzlb,
        yljgdm: yljgdm,
        yexh: yexh,
        bblx: bblx,
        bglbdm: bglbdm,
        jyzbxmdm: jyzbxmdm,
        ksbgrq: ksbgrq,
        jsbgrq: jsbgrq,
        patidList: patidList
      }).then(res => {
        // this.quotaList = this.tidyData(data.data);
        const data = res.data;
        if (data && data.length > 0) {
          this.showChartDialog = true;
          let xAxisData = [];
          let target = [];
          // let yAxisMax = 0;
          let jgckzLower = parseFloat(data[data.length - 1].jgckzLower) || 0; // 低参考值
          let jgckzUpper = parseFloat(data[data.length - 1].jgckzUpper) || 0; // 高参考值
          let min = 0; // Y轴最小值
          let max = 0; // Y轴最大值

          // 参考值 标准值 标记线
          let markLineData = [
            {
              yAxis: jgckzLower,
              lineStyle: {
                normal: {
                  color: "#01cd80"
                }
              }
            },
            {
              yAxis: jgckzUpper,
              lineStyle: {
                normal: {
                  color: "#ff4e4e"
                }
              }
            }
          ];
          if (data.length) {
            data.forEach(v => {
              xAxisData.push(
                v.bgfbrq
                  .substring(5, 16)
                  .split("-")
                  .join("/")
              );

              let yAxisVal = parseFloat(v.jyjg);
              if (yAxisVal > max) {
                max = yAxisVal;
              }
              if (yAxisVal < min) {
                min = yAxisVal;
              }
              // if (yAxisMax < yAxisVal) {
              //   yAxisMax = yAxisVal;
              // }
              let labelColor = "#0040C9";
              if (
                parseFloat(v.jyjg) < jgckzLower ||
                parseFloat(v.jyjg) > jgckzUpper
              ) {
                labelColor = "#FF5A5A";
              }
              let obj = {
                value: v.jyjg,
                label: {
                  normal: {
                    show: true,
                    position: "top",
                    fontSize: 14,
                    color: labelColor
                  }
                },
                itemStyle: {
                  normal: {
                    color: labelColor
                  }
                }
              };
              target.push(obj);

              // if (parseFloat(v.jyjg) > max) {
              //   max = parseFloat(v.jyjg);
              // }
              // if (parseFloat(v.jyjg) < min) {
              //   min = parseFloat(v.jyjg);
              // }
            });
          } else {
            xAxisData = ["暂无数据"];
            target = [0];
          }

          this.chartOption.xAxis.data = xAxisData;
          this.chartOption.yAxis.max = max;
          this.chartOption.yAxis.min = min;

          this.chartOption.series[0].data = target;
          this.chartOption.series[0].markLine.data = markLineData;

          this.chartOption.series[0].name = data[0].jyzbxmmc;
          this.chartOption.title.text = `${data[0].jyzbxmmc}趋势图`;

          this.$nextTick(() => {
            if (!this.trendChart) {
              this.trendChart = echarts.init(
                document.getElementById("quotaChart")
              );
            }
            this.trendChart.setOption(this.chartOption);
          });
        } else {
          // 没有数据，清空echarts
          if (!this.trendChart) {
            this.trendChart = echarts.init(
              document.getElementById("quotaChart")
            );
          }
          this.trendChart.clear();
          this.showChartDialog = false;
          this.$toast("暂无数据！");
        }
      });
    },
    /**
     * 获取指标
     */
    getQuotaList(patid, jzlb, yljgdm, yexh, ksdm, jzkssj, jzjssj) {
      this.$post("/api/v1/quota/getMyQuotaList", {
        patid: patid,
        jzlb: jzlb,
        yljgdm: yljgdm,
        yexh: yexh,
        ksdm: ksdm,
        jzkssj: jzkssj,
        jzjssj: jzjssj
      }).then(data => {
        this.quotaList = this.tidyData(data.data);
      });
    },
    //后退
    goBack() {
      this.$router.go(-1);
    },
    showChart(item) {
      this.getChartData(
        this.patientInfo.jzlsh,
        this.patientInfo.patid,
        this.patientInfo.jzlb,
        this.patientInfo.yljgdm,
        this.patientInfo.yexh,
        item.bblx,
        item.bglbdm,
        item.code,
        this.$formatDate(this.patientInfo.jzkssj),
        this.$formatDate(this.patientInfo.jzjssj),
        this.patientInfo.keystr
      );
    },
    //微信分享接口配置
    wxconfig() {
      const patientInfo = JSON.parse(localStorage.getItem("infos"));
      let desc = this.$getValue(patientInfo.zdmc);
      let age = this.$getJzAge(patientInfo.brxxkJz.birth, patientInfo.jzkssj);
      mobile.wxConf("quota", config, age, desc);
    },
    tidyData(list) {
      let result = [];
      for (let i = 0; i < list.length; i++) {
        let group = {};
        group.groupInfo = list[i].quotaGroupEntity;
        group.itemList = [];
        const quotaValueList = list[i].quotaValueResultVOList;
        if (quotaValueList && quotaValueList.length > 0) {
          for (let j = 0; j < quotaValueList.length; j++) {
            let item = {};
            item.itemInfo = quotaValueList[j].quotaValueEntity;
            item.allNumeric = quotaValueList[j].allNumeric;
            if (
              quotaValueList[j].yjjgChartDataList &&
              quotaValueList[j].yjjgChartDataList.length > 0
            ) {
              item.lastData = quotaValueList[j].yjjgChartDataList[0];
              item.dataList = quotaValueList[j].yjjgChartDataList;
            } else {
              item.lastData = {};
              item.dataList = [];
            }
            group.itemList.push(item);
          }
        }
        result.push(group);
      }
      return result;
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
    this.getQuotaList(
      this.patientInfo.patid,
      this.patientInfo.jzlb,
      this.patientInfo.yljgdm,
      this.patientInfo.yexh,
      this.patientInfo.ksdm,
      this.$formatDate(this.patientInfo.jzkssj),
      this.$formatDate(this.patientInfo.jzjssj)
    );
  }
};
</script>

<style lang="scss" scoped>
.quota {
  padding-top: 46px;
  padding-bottom: 50px;
  background-color: #f5f5f9;
  /* 无数据空白页面 */
 .empty-container {
    width: 50%;
    margin: 25%;
 }
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
  .quota-list {
    margin: 10px;
     .name{
         font-size: 16px;
         margin:10px;
        }
    .quota-info {
      border-radius: 4px;
      margin-bottom: 8px;
      .group-name-row {
        height: 38px;
        padding: 8px 10px;
        background-color: #ffffff;
        display: flex;
        .group-name {
          font-size: 16px;
          color: #266ff3;
          padding-left: 8px;
          border-left: 2px solid #2470f3;
          font-weight: 500;
        }
      }
      .quota-item-info {
        margin-top: 2px;
        background-color: #ffffff;
        font-size: 14px;
        padding: 10px;
        .quota-item-name {
          color: #333333;
        }
        .quota-item-jyjg {
          /*color: #15cb25;*/
          text-align: center;
        }
        .quota-item-jyjg > span {
          padding-right: 2px;
        }
        .quota-item-jyjg-high {
          color: #fc6661;
        }
        .quota-item-jyjg-low {
          color: #00aca7;
        }
        .quota-item-bgfbrq {
          color: #999999;
        }
        .quota-item-icon {
          text-align: right;
          color: #00aca7;
        }
        .quota-item-name,
        .quota-item-jyjg,
        .quota-item-bgfbrq,
        .quota-item-icon {
          min-height: 1px;
        }
      }
    }
  }
  .quota-chart-dialog {
    width: 100%;
    .closeBtn {
      margin-left: 46%;
    }
    .quota-chart {
      width: 100%;
      height: 400px;
    }
  }
}
</style>
