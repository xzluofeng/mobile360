<template>
  <div class="sign flex flex-v">
    <!--头部-->
    <section class="header flex flex-align-center"  v-if="!isFragment">
      <!--<van-icon name="arrow-left" @click="goBack"/>-->
      <i class="fa fa-home index-icon" slot="left" @click="go('/card')" v-if="showHome"></i>
      <div class="header-title">体征</div>
    </section>
    <div id="chart"></div>
    <section class="info-container flex-1">
      <div class="cell flex">
        <div class="c-title">血压</div>
        <div class="c-value flex-1">{{otherInfo.ssy}} <span v-if="otherInfo.ssy && otherInfo.ssy">/</span> {{otherInfo.szy}}</div>
      </div>
      <div class="cell flex">
        <div class="c-title">大便次数</div>
        <div class="c-value flex-1">{{otherInfo.dbcs}}</div>
      </div>
      <div class="cell flex">
        <div class="c-title">入量</div>
        <div class="c-value flex-1">{{otherInfo.rl}}</div>
      </div>
      <div class="cell flex">
        <div class="c-title">出量</div>
        <div class="c-value flex-1">{{otherInfo.cl}}</div>
      </div>
      <div class="cell flex">
        <div class="c-title">尿量</div>
        <div class="c-value flex-1">{{otherInfo.nl}}</div>
      </div>
      <div class="cell flex">
        <div class="c-title">体重</div>
        <div class="c-value flex-1">{{otherInfo.tz}}</div>
      </div>
      <div class="cell flex">
        <div class="c-title">身高</div>
        <div class="c-value flex-1">{{otherInfo.sg}}</div>
      </div>

    </section>
    <g-footer class="g-footer"  v-if="!isFragment"></g-footer>
  </div>
</template>

<script>
import moment from "moment";
import mobile from "@/utils/mobile";
// import echarts from 'echarts';
import echarts from "echarts/lib/echarts";
// 再引入你需要使用的图表类型，标题，提示信息等
import "echarts/lib/chart/line";
import "echarts/lib/component/legend";
import "echarts/lib/component/title";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/dataZoom";
// import 'echarts/lib/component/axis';
// import 'echarts/lib/component/axisPointer';
import gFooter from "../components/Menu";
export default {
  data() {
    return {
      infos: this.$storage.get("infos"),
      chartOption: {
        backgroundColor: "#fff",
        grid: {
          top: 50,
          bottom: 30,
          left: 75,
          right: 20
        },
        legend: {
          show: true,
          top: 15,
          right: 60,
          itemGap: 20
        },
        tooltip: {
          trigger: "axis",
          formatter: pa => {
            let time = pa[0].value[0];
            // 获取当天的其他体征数据
            this.getData(2, time.substr(0, 10), time.substr(0, 10));
            let str = time;
            pa.forEach(item => {
              str += `<br> ${item.value[2]} :${item.value[1]}`;
            });
            return str;
          }
        },
        dataZoom: [
          {
            type: "inside",
            startValue: ""
          }
        ],
        series: [
          {
            type: "line",
            name: "体温",
            yAxisIndex: 0,
            symbolSize: 12,
            lineStyle: {
              normal: {
                color: "#15abff",
                width: 2
              }
            },
            itemStyle: {
              normal: {
                color: "#15abff"
              }
            },
            data: []
          },
          {
            name: "呼吸",
            type: "line",
            yAxisIndex: 1,
            symbolSize: 12,
            lineStyle: {
              normal: {
                color: "#75df64",
                width: 2
              }
            },
            itemStyle: {
              normal: {
                color: "#75df64"
              }
            },
            data: []
          },
          {
            name: "脉搏",
            type: "line",
            symbolSize: 12,
            yAxisIndex: 2,
            lineStyle: {
              normal: {
                color: "#FC6661",
                width: 2
              }
            },
            itemStyle: {
              normal: {
                color: "#ff001f"
              }
            },
            data: []
          }
        ],
        xAxis: {
          axisLabel: {
            show: true,
            align: "left",
            // interval:86400000,
            textStyle: {
              fontSize: 12,
              color: "#333",
              align: "center"
            },
            formatter: value => {
              // return  new Date(value).getHours() + '时';
              return moment(value).format("MM-DD");
            }
          },
          axisTick: { show: false },
          interval: 86400000,
          // max: "",
          // min: "",
          // position: "bottom",
          // offset: 0 ,
          type: "time"
        },
        yAxis: [
          {
            type: "value",
            name: "体\n温",
            min: 34,
            max: 42,
            position: "left",
            offset: 10,
            interval: 1,
            nameTextStyle: {
              fontSize: 12,
              color: "#62c2f8"
            },
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
              margin: -5,
              fontSize: 12,
              color: "#62c2f8"
            }
          },
          {
            type: "value",
            name: "呼\n吸",
            min: 10,
            max: 50,
            position: "left",
            offset: 60,
            interval: 5,
            nameTextStyle: {
              fontSize: 12,
              color: "#75df64"
            },
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
              margin: -6,
              fontSize: 12,
              color: "#75df64"
            }
          },
          {
            type: "value",
            name: "脉\n搏",
            min: 40,
            max: 200,
            position: "left",
            offset: 35,
            interval: 20,
            nameTextStyle: {
              fontSize: 12,
              color: "#ff0827"
            },
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
              margin: -10,
              fontSize: 12,
              color: "#ff0827"
            }
          }
        ],
        animationDurationUpdate() {
          return 10;
        },
        animationDelayUpdate() {
          return 10;
        }
      }, // chart 设置
      signChart: null, // chart 容器
      timeArr: [], // 存储呼吸，脉搏，体温数据所有 时间
      indexArr: [], // 存储呼吸，脉搏，体温数据所有 index
      otherInfo: {}, // 其他体征记录数据
      isFragment: false,
      top: 46,
      bottom: 50,
       showHome:true
    };
  },
  components: {
    gFooter
  },
  mounted() {
    const module = localStorage.getItem("module");
      if (module && module === "0") {
        this.showHome=false
      }
    const source = localStorage.getItem("source");
    if (source && source === "weixin") {
      this.wxconfig();
    }
    this.isFragment = this.$isFragment();
    this.top = this.$getContentContainerPositionInfo().top;
    this.bottom = this.$getContentContainerPositionInfo().bottom;
    const startDate = this.infos.jzkssj.substr(0, 10);
    const endDate = this.infos.jzjssj
      ? this.infos.jzjssj.substr(0, 10)
      : moment().format("YYYY-MM-DD");
    this.getData(1, startDate, endDate, () => {
      this.$nextTick(() => {
        if (!this.signChart) {
          this.signChart = echarts.init(document.getElementById("chart"));
        }
        this.getDataZoomStartValue();
        this.signChart.setOption(this.chartOption);
        // 查找最晚时间数据的index  并showTip
        const sortArr = this.timeArr.sort();
        if (sortArr.length) {
          const lastDate = sortArr[sortArr.length - 1];
          let tar = this.indexArr.find(item => {
            return lastDate === item.time;
          });
          if (tar != null) {
            const seriesIndex = tar.seriesIndex;
            const dataIndex =
              this.chartOption.series[seriesIndex].data.length - 1;
            this.signChart.dispatchAction({
              type: "showTip",
              seriesIndex: seriesIndex,
              dataIndex: dataIndex
            });
          }
        }
      });
    });
  },
  methods: {
    /**
     * 后退
     */
    goBack() {
      this.$router.go(-1);
    },
    //微信分享接口配置
    wxconfig() {
      const patientInfo = JSON.parse(localStorage.getItem("infos"));
      let desc = this.$getValue(patientInfo.zdmc);
      let age = this.$getJzAge(patientInfo.brxxkJz.birth, patientInfo.jzkssj);
      mobile.wxConf("inspect/inspectionsList", config, age, desc);
    },
    /**
     * 获取所有的chart数据
     * @param type: 处理chart或者表数据  0，都处理   1，处理chart数据  2，处理表数据
     * @param startDate  开始日期
     * @param endDate    结束日期
     */
    getData(type, startDate, endDate, cb) {
      const formData = {
        userId: "0",
        serviceId: "0",
        jzlsh: this.infos.jzlsh,
        yljgdm: this.infos.yljgdm,
        jzlb: this.infos.jzlb,
        startDate: startDate,
        endDate: endDate,
        yexh: this.infos.yexh
      };
      const url = "/api/v1/qjfw/getTzjlByJzlsh";

      this.$post(url, formData)
        .then(res => {
          const data = res.data.chartTzInfoList || [];
          data.forEach(item => {
            switch (item.rwCode) {
              case "tw":
              case "hx":
              case "mb":
                if (type !== 2) {
                  this.handleChartData(item);
                }
                break;
              case "szy":
              case "ssy":
              case "cl":
              case "rl":
              case "tz":
              case "dbcs":
              case "nl":
              case "tl":
              case "yll":
              case "sg":
                if (type !== 1) {
                  this.handleTableData(item);
                }
                break;
            }
          });
          if (cb && type !== 2) {
            cb();
          }
        })
        .catch(err => {
          // console.log(err);
        });
    },
    /**
     * 处理chart数据
     */
    handleChartData(data) {
      const arr = data.tzjlTzvalueList || [];
      let twData = [];
      const mbData = [];
      const hxData = [];
      arr.forEach(item => {
        this.timeArr.push(item.lrrq);
        let obj = {
          symbolSize: 8
        };
        let indexObj = { time: item.lrrq };
        if (data.rwCode === "tw") {
          indexObj.seriesIndex = 0;
          obj.symbol = "circle";
          obj.value = [item.lrrq.substr(0, 16), +item.tzvalueText, "体温"];
          twData.push(obj);
        } else if (data.rwCode === "hx") {
          indexObj.seriesIndex = 1;
          obj.value = [item.lrrq.substr(0, 16), +item.tzvalueText, "呼吸"];
          hxData.push(obj);
        } else if (data.rwCode === "mb") {
          indexObj.seriesIndex = 2;
          obj.symbol = "triangle";
          obj.value = [item.lrrq.substr(0, 16), +item.tzvalueText, "脉搏"];
          mbData.push(obj);
        }
        this.indexArr.push(indexObj);
      });
      if (data.rwCode === "tw") {
        this.chartOption.series[0].data = twData;
      } else if (data.rwCode === "hx") {
        this.chartOption.series[1].data = hxData;
      } else if (data.rwCode === "mb") {
        this.chartOption.series[2].data = mbData;
      }
    },
    /**
     * 处理其他体征数据
     */
    handleTableData(data) {
      let arr = data.tzjlTzvalueList || [];
      if (arr.length) {
        let value = data.tzjlTzvalueList[0].tzvalueText || "";
        let unit = data.tzjlTzvalueList[0].tzdw || "";
        // this.otherInfo[data.rwCode] = value + unit;
        this.$set(this.otherInfo, data.rwCode, value + unit);
      } else {
        // this.otherInfo[data.rwCode] = '';
        this.$set(this.otherInfo, data.rwCode, "");
      }
    },
    /**
     * 确定dataZoom控件的startValue
     */
    getDataZoomStartValue() {
      const sortArr = this.timeArr.sort();
      const longestTime = moment(sortArr[sortArr.length - 1]);
      const days = longestTime
        .locale("zh-cn")
        .subtract(6, "days")
        .format("L");
      this.chartOption.dataZoom[0].startValue = days.replace(/\//g, "-");
    }
  }
};
</script>

<style lang="scss" scoped>
.sign {
  position: absolute;
  width: 100%;
  height: 100%;
}
/*头部样式 srart*/
.header {
  width: 100%;
  height: 46px;
  background-image: linear-gradient(-270deg, #3777f5 0%, #195be6 100%);
  color: #fff;
  font-size: 17px;
  font-family: PingFangSC-Medium;
  margin-bottom: 8px;
}

.header-title {
  margin: 0 auto;
}

.van-icon-arrow-left {
  position: absolute;
  color: #f8f9ff;
  left: 10px;
}

/*头部样式 end*/
#chart {
  height: 324px;
}

.g-footer {
  height: 50px;
}

.info-container {
  margin-top: 8px;
  background-color: #fff;
  overflow-y: auto;
  .cell {
    margin-left: 16px;
    border-bottom: 1px solid #ededed;
    padding: 12px 0;
  }
  .c-title,
  .c-value {
    font-family: PingFangSC-Regular;
    font-size: 17px;
    color: #191f25;
    letter-spacing: 0;
  }
  .c-title {
    width: 50%;
  }
}
</style>
