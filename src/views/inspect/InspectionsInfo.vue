<template>
  <div class="inspections-info flex flex-v">
    <!--头部-->
    <section class="header flex flex-align-center" v-if="!isFragment">
      <i class="fa fa-home index-icon" slot="left" @click="go('/card')"></i>
      <div class="header-title">{{queryData.title}}</div>
    </section>
    <section class="info-box flex-1 flex flex-v" v-bind:style="{ 'margin-top': top + 'px' }">
      <!--非微生物表头-->
      <van-row class="table-title" v-if="queryData.wswbgbz !== '1'">
        <van-col span="9">项目名称</van-col>
        <van-col span="4" class="tac">结果</van-col>
        <van-col span="8" class="tac">参考值</van-col>
        <van-col span="3" class="tac">趋势</van-col>
      </van-row>
      <!--微生物表头-->
      <van-row class="table-title" v-if="queryData.wswbgbz === '1'">
        <van-col span="8">抗生素</van-col>
        <van-col span="4" class="tac">数值</van-col>
        <van-col span="4" class="tac">敏感度</van-col>
        <van-col span="8" class="tac">剂量及用法</van-col>
      </van-row>

      <div class="content-container flex-1">
        <van-row
          class="content-item flex flex-align-center"
          v-for="(item, index) in tableData"
          :key="index"
          align="center"
        >
          <!--非微生物检验结果-->
          <van-col
            span="9"
            v-if="queryData.wswbgbz !== '1'"
            class="position flex flex-align-center"
          >
            <i class="help" @click="toHlep(item)"></i>
            {{item.jyzbxmmc}}
          </van-col>
          <van-col
            span="4"
            class="tac"
            :class="[{'high': item.ycbz === 'H'}, {'low': item.ycbz === 'L'}]"
            v-if="queryData.wswbgbz !== '1'"
          >
            {{item.jyjg}}
            <!-- <i
              class="the-icon"
              :class="[{'up': item.ycbz === 'H'}, {'down': item.ycbz === 'L'}]"
              v-if="item.ycbz === 'H'|| item.ycbz === 'L'"
            ></i>-->
            <i v-if="item.ycbz == 'L'" class="fa fa-long-arrow-down" aria-hidden="true"></i>
            <i v-if="item.ycbz == 'H'" class="fa fa-long-arrow-up" aria-hidden="true"></i>
          </van-col>
          <van-col
            span="8"
            class="tac"
            v-if="queryData.wswbgbz !== '1'"
          >{{item.jgckzDx + item.jgdw}}</van-col>
          <van-col
            span="3"
            class="tac"
            v-if="queryData.wswbgbz !== '1' && !isNaN(filterFloat(item.jyjg))"
          >
            <!--<i class="chart-icon" @click="getChartData(item)"></i>-->
            <i class="fa fa-line-chart chart-icon" aria-hidden="true" @click="getChartData(item)"></i>
          </van-col>
          <!--微生物检验结果-->
          <van-col span="8" v-if="queryData.wswbgbz === '1'">{{item.ymmc}}</van-col>
          <van-col span="4" class="tac" v-if="queryData.wswbgbz === '1'">{{item.kssjcjg}}</van-col>
          <van-col span="4" class="tac" v-if="queryData.wswbgbz === '1'">{{item.jcjg}}</van-col>
          <van-col span="8" class="tac" v-if="queryData.wswbgbz === '1'">{{item.yfjyl}}</van-col>
        </van-row>
        <div class="no-data tac" v-if="!tableData.length && hasQequest">暂无数据</div>
      </div>
    </section>
    <van-popup v-model="popupShow">
      <div id="chart"></div>
      <i class="fa fa-times-circle-o closeBtn" @click="popupShow = false" aria-hidden="true"></i>
    </van-popup>
  </div>
</template>

<script>
import moment from "moment";
import echarts from "echarts/lib/echarts";
import "echarts/lib/chart/line";
import "echarts/lib/component/title";
export default {
  data() {
    return {
      infos: this.$storage.get("infos"),
      hasQequest: false, // 解决拿到数据间隔显示 暂无数据
      queryData: this.$route.query, // 上级页面带过来的参数
      tableData: [], // 检验数据
      isFragment: false,
      top: 46,
      bottom: 50,
      popupShow: false, // 弹出框控制
      trendChart: null, // chart容器
      chartOption: {
        // chart设置
        title: {
          text: "",
          top: 0
        },
        grid: {
          top: 50,
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
            formatter: value => {
              return value.substr(5, 11);
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
      }
    };
  },
  mounted() {
    this.isFragment = this.$isFragment();
    this.top = this.$getContentContainerPositionInfo().top;
    this.bottom = this.$getContentContainerPositionInfo().bottom;
    this.getReportData();
  },
  beforeDestroy() {
    if (!this.trendChart) {
      return;
    }
    this.trendChart.dispose();
    this.trendChart = null;
  },
  methods: {
    /**
     * 后退
     */
    goBack() {
      this.$router.go(-1);
    },
    /**
     * 获取报告数据
     */
    getReportData() {
      let url;
      const formData = {
        bgdh: this.queryData.bgdh,
        bglbdm: this.queryData.bglbdm,
        sysId: this.queryData.sysId,
        yljgdm: this.infos.yljgdm,
        jzlb: this.infos.jzlb
      };
      // wswbgbz为1表示微生物
      if (this.queryData.wswbgbz === "1") {
        formData.yexh = this.infos.yexh;
        url = "/api/v1/lisreport/getMisxjjgkListByBgdh";
      } else {
        url = "/api/v1/lisreport/getLisyjjgkEntitiesByJylb";
      }
      this.$post(url, formData)
        .then(res => {
          this.hasQequest = true;
          const data = res.data || [];
          if (this.queryData.wswbgbz === "1") {
            if (data.length) {
              this.tableData = data[0].misymjgkEntityList;
            }
          } else {
            this.tableData = data;
          }
        })
        .catch(err => {
          // console.log(err);
        });
    },
    /**
     * 获取chart数据
     */
    getChartData(item) {
      this.chartOption.series[0].name = item.jyzbxmmc;
      this.chartOption.title.text = `${item.jyzbxmmc}趋势图`;
      const endDate = this.infos.jzjssj
        ? this.infos.jzjssj.substr(0, 10)
        : moment()
            .locale("zh-cn")
            .format("YYYY-MM-DD");
      const formData = {
        jyzbxmdm: item.jyzbxmdm,
        yljgdm: this.infos.yljgdm,
        patid: this.infos.patid,
        jzlb: this.infos.jzlb,
        ksbgrq: this.infos.jzkssj.substr(0, 10),
        jsbgrq: endDate,
        yexh: this.infos.yexh,
        jzlsh: this.infos.jzlsh,
        patidList: `${this.infos.patid}+${this.infos.jzlb}+${
          this.infos.yljgdm
        }`,
        bblx: this.queryData.bblx,
        bglbdm: item.bglbdm
      };
      const url = "/api/v1/lisreport/getChartDataOfYjjgByJzlshAndJyzbxmdm";
      this.$post(url, formData)
        .then(res => {
          const data = res.data;
          let timeData = [];
          let target = [];
          let yAxisMax = 0;
          let min = parseFloat(item.jgckzLower) || 0;
          let max = parseFloat(item.jgckzUpper) || 0;

          // 参考值 标准值 标记线
          let markLineData = [
            {
              yAxis: parseFloat(item.jgckzLower),
              lineStyle: {
                normal: {
                  color: "#01cd80"
                }
              }
            },
            {
              yAxis: parseFloat(item.jgckzUpper),
              lineStyle: {
                normal: {
                  color: "#ff4e4e"
                }
              }
            }
          ];
          if (data.length) {
            data.forEach(v => {
              timeData.push(
                v.bgfbrq
                  .substring(0, 16)
                  .split("-")
                  .join("/")
              );

              let yAxisVal = parseFloat(v.jyjg);
              if (yAxisMax < yAxisVal) {
                yAxisMax = yAxisVal;
              }
              let labelColor = "#0040C9";
              if (
                parseFloat(v.jyjg) < parseFloat(item.jgckzLower) ||
                parseFloat(v.jyjg) > parseFloat(item.jgckzUpper)
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

              if (parseFloat(v.jyjg) > max) {
                max = parseFloat(v.jyjg);
              }
              if (parseFloat(v.jyjg) < min) {
                min = parseFloat(v.jyjg);
              }
            });
          } else {
            timeData = ["暂无数据"];
            target = [0];
          }

          this.chartOption.xAxis.data = timeData;
          this.chartOption.yAxis.max = max;
          this.chartOption.yAxis.min = min;

          this.chartOption.series[0].data = target;
          this.chartOption.series[0].markLine.data = markLineData;

          this.popupShow = true;
          this.$nextTick(() => {
            if (!this.trendChart) {
              this.trendChart = echarts.init(document.getElementById("chart"));
            }
            this.trendChart.setOption(this.chartOption);
          });
        })
        .catch(err => {
          // console.log(err);
        });
    },
    /**
     * 检验是否数字，并转换
     */
    filterFloat(value) {
      if (/^(\-|\+)?|(\.\d+)(\d+(\.\d+)?|(\d+\.)|Infinity)$/.test(value)) {
        return Number(value);
      }
      return NaN;
    },
    /**
     * 跳转知识库
     */
    toHlep(item) {
      // console.log(item);
      this.$toast("这要跳转知识库，暂未开发");
    }
  }
};
</script>

<style lang="scss" scoped>
.inspections-info {
  height: 100%;
  /*头部样式 srart*/
  .header {
    width: 100%;
    height: 46px;
    background-image: linear-gradient(-270deg, #3777f5 0%, #195be6 100%);
    color: #fff;
    font-size: 17px;
    z-index: 1;
    position: fixed;
    font-family: PingFangSC-Medium;
  }

  .header-title {
    margin: 0 auto;
    font-size: 16px;
    font-weight: bold;
  }

  .van-icon-arrow-left {
    position: absolute;
    color: #f8f9ff;
    left: 10px;
  }
  /*头部样式 end*/

  .inspections-info {
    overflow: auto;
    background-color: #fff;
  }

  .info-box {
    background-color: #fff;
    margin-top: 46px;
  }

  .content-container {
    overflow-y: auto;
  }

  /*检测table样式*/
  .table-title {
    position: relative;
    // font-family: PingFangSC-Regular;
    font-size: 16px;
    color: #0a51e6;
    letter-spacing: 0;
    padding: 14px;
    padding-left: 0;
    margin-left: 14px;
    border-bottom: 1px solid #ededed;
    font-weight: bold;
  }

  .content-item,
  .no-data {
    position: relative;
    font-family: PingFangSC-Regular;
    font-size: 15px;
    color: #333333;
    letter-spacing: 0;
    padding: 13px;
    padding-left: 0;
    margin-left: 14px;
    border-bottom: 1px solid #ededed;
    word-wrap: break-word;
  }

  .chart-icon {
    display: inline-block;
    width: 19px;
    height: 14px;
    /*background-image: url("../../assets/img/chart.png");*/
    background-size: cover;
    color: #00aca7;
    font-weight: normal;
  }
  .high {
    color: #fc6661;
  }
  .low {
    color: #00aca7;
  }
  .the-icon {
    display: inline-block;
    width: 10px;
    height: 15px;
    background-size: cover;
    vertical-align: middle;
    &.up {
      background-image: url("../../assets/img/up.png");
    }
    &.down {
      background-image: url("../../assets/img/down.png");
    }
  }

  .van-popup {
    width: 100%;
  }

  #chart {
    width: 100%;
    height: 400px;
  }
  .tac {
    text-align: center;
  }
  .help {
    position: absolute;
    width: 16px;
    height: 16px;
    background-image: url("../../assets/img/help.png");
    background-size: cover;
    left: -2px;
  }
  .position {
    position: relative;
    padding-left: 20px;
  }
  .closeBtn {
    margin-left: 46%;
  }
}
</style>
