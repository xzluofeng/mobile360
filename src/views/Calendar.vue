<template>
  <div class="calendar">
    <van-nav-bar class="title" fixed>
      <div slot="title">
        <span class="title-name">选择日期</span>
      </div>
    </van-nav-bar>
    <div class="container">
      <div class="date-selector">
        <div class="year-container flex flex-align-center flex-v">
          <van-icon
            name="arrow-left"
            color="#198AFE"
            class="year-pre-btn"
            @click.native="handleYearClickEvent(year - 1)"
          />
          <span class="year">{{ year }}</span>
          <van-icon
            name="arrow"
            color="#198AFE"
            class="year-suf-btn"
            @click.native="handleYearClickEvent(year + 1)"
          />
        </div>
        <van-row class="month-container" type="flex" justify="center">
          <van-col span="2" v-for="(month, index) in months" :key="index">
            <span
              class="month"
              :class="{enable: month.enable, active: month.active}"
              @click="handleMonthClickEvent(month.num, month.enable)"
            >{{ month.num + 1 }}</span>
          </van-col>
        </van-row>
        <!-- <div class="month">
          <van-icon name="arrow-left" class="month-pre-btn"/>
          <span class="month-value">{{ month + 1 }}</span>
          <van-icon name="arrow" class="month-suf-btn"/>
        </div>-->
      </div>
      <van-row type="flex" justify="space-between" class="weeks-row">
        <van-col span="3" class="week sunday">日</van-col>
        <van-col span="3" class="week monday">一</van-col>
        <van-col span="3" class="week tuesday">二</van-col>
        <van-col span="3" class="week wednesday">三</van-col>
        <van-col span="3" class="week thursday">四</van-col>
        <van-col span="3" class="week friday">五</van-col>
        <van-col span="3" class="week saturday">六</van-col>
      </van-row>
      <van-row type="flex" justify="space-between" class="days-row" v-for="(item, i) in days" :key="i">
        <van-col
          span="3"
          class="day"
          v-for="(week, j) in weeks"
          :key="week + i + j"
          :class="[item[j] && item[j].enable ? 'enable' : 'disable', week]"
          @click.native="handleDayClickEvent(item[j])"
        >{{ item[j] ? item[j].day : "" }}</van-col>
      </van-row>
    </div>
  </div>
</template>

<script>
import date from "@/utils/date";

export default {
  name: "calendar",
  data() {
    return {
      beginDate: "",
      endDate: "",
      year: 2019,
      month: 0,
      queryParams: this.$route.query, // 跳转过来的参数
      availableDateList: [],
      available: {},
      days: [],
      months: [],
      weeks: [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ],
      // mondayList: [],
      // tuesdayList: [],
      // wednesdayList: [],
      // thursdayList: [],
      // fridayList: [],
      // saturdayList: [],
      // sundayList: [],
      daysInMonth: 0,
      startDayOfMonth: ""
    };
  },
  methods: {
    init() {
      const _this = this;
      this.days = [];
      if (_this.queryParams.ksrqList) {
        if (Array.isArray(_this.queryParams.ksrqList)) {
          if (_this.queryParams.ksrqList[0]) {
            const ksrq = _this.queryParams.ksrqList[0];
            this.year = date.getYear(ksrq);
            this.month = date.getMonth(ksrq);
            this.daysInMonth = date.getDaysInMonth(this.year, this.month);
            this.startDayOfMonth = date.getStartDayOfMonth(this.year, this.month);
          } else {
            this.year = new Date().getFullYear();
            this.daysInMonth = date.getDaysInMonth(this.year, 0);
            this.startDayOfMonth = date.getStartDayOfMonth(this.year, 0);
          }
        } else {
          const ksrq = _this.queryParams.ksrqList;
          this.year = date.getYear(ksrq);
          this.month = date.getMonth(ksrq);
          this.daysInMonth = date.getDaysInMonth(this.year, this.month);
          this.startDayOfMonth = date.getStartDayOfMonth(this.year, this.month);
        }
      } else {
        this.year = new Date().getFullYear();
        this.daysInMonth = date.getDaysInMonth(this.year, 0);
        this.startDayOfMonth = date.getStartDayOfMonth(this.year, 0);
      }


      _this.initAvailable();
      // 1、更新months
      _this.refreshMonths();
      // 2、更新days
      _this.refreshDays();
    },
    initAvailable() {
      const _this = this;
      // 初始化可用年份、月份、日
      let available = {};
      if (_this.queryParams.ksrqList) {
        if (Array.isArray(_this.queryParams.ksrqList)) {
          for (let i = 0; i < _this.queryParams.ksrqList.length; i++) {
            const ksrq = _this.queryParams.ksrqList[i];
            const year = date.getYear(ksrq);
            const month = date.getMonth(ksrq);
            const day = date.getDay(ksrq);
            if (available[year]) {
              //
            } else {
              available[year] = {};
            }
            if (available[year][month]) {
              //
            } else {
              available[year][month] = [];
            }
            available[year][month].push(day);
          }
        } else {
          const ksrq = _this.queryParams.ksrqList;
          const year = date.getYear(ksrq);
          const month = date.getMonth(ksrq);
          const day = date.getDay(ksrq);
          if (available[year]) {
            //
          } else {
            available[year] = {};
          }
          if (available[year][month]) {
            //
          } else {
            available[year][month] = [];
          }
          available[year][month].push(day);
        }

      }
      this.available = available;
    },
    isEnable(dayNum) {
      return date.isBeforeToday(this.year, this.month, dayNum);
    },
    handleDayClickEvent(day) {
      if (day && day.enable) {
        let ksrq = date.formatDate(new Date(this.year, this.month, day.day));
        let type = 'long';
        if (this.queryParams.type){
          type = this.queryParams.type
        }
        this.$router.push({
          path: "/advice",
          query: {
            ksrq: ksrq,
            type:type
          }
        });
      }
    },
    handleMonthClickEvent(month, enable) {
      if (!enable) {
        return;
      }
      this.month = month;
      this.daysInMonth = date.getDaysInMonth(this.year, this.month);
      this.startDayOfMonth = date.getStartDayOfMonth(this.year, this.month);

      // 刷新月份
      const _this = this;
      for (let i = 0; i < _this.months.length; i++) {
        _this.months[i].active = month === i;
      }
      // 更新days
      this.refreshDays();
    },
    handleYearClickEvent(year) {
      this.year = year;
      this.month = 0;

      // 1、更新months
      this.refreshMonths();

      this.daysInMonth = date.getDaysInMonth(this.year, this.month);
      this.startDayOfMonth = date.getStartDayOfMonth(this.year, this.month);
      // 2、更新days
      this.refreshDays();
    },
    refreshMonths() {
      const _this = this;
      _this.months = [];
      let defaultActivedIndex = -1;
      for (let i = 0; i < 12; i++) {
        const year = _this.available[_this.year];
        if (year && year[i]) {
          _this.months.push({
            num: i,
            enable: true
          });
          if (defaultActivedIndex == -1) {
            defaultActivedIndex = i;
          }
        } else {
          _this.months.push({
            num: i,
            enable: false
          });
        }
      }
      if (defaultActivedIndex !== -1) {
        _this.months[defaultActivedIndex].active = true;
        this.month = defaultActivedIndex;
      } else {
        _this.months[0].active = true;
      }
      console.log(JSON.stringify(_this.months));
    },
    refreshDays() {
      const _this = this;
      let dayNum = 1;
      _this.days=[]
      const startWeekNum = date.getDayOfWeek(_this.startDayOfMonth);
      const y = parseInt(
        (parseInt(_this.daysInMonth) + parseInt(startWeekNum)) / 7
      );
      for (let i = 0; i <= y; i++) {
          _this.days.push([]);
      }
      for (let i = 0; i < 7; i++) {
        if (i < startWeekNum) {
          _this.days[0][i] = {};
        } else {
          let enable = false;
          if (
            _this.available[_this.year] &&
            _this.available[_this.year][_this.month] &&
            _this.available[_this.year][_this.month].indexOf(dayNum) > -1
          ) {
            enable = true;
          }
          _this.days[0][i] = {
            day: dayNum,
            enable: enable
          };
          dayNum++;
        }
      }
      for (let i = 1; i <= y; i++) {
        for (let j = 0; j < 7 && dayNum <= _this.daysInMonth; j++) {
          let enable = false;
          if (
            _this.available[_this.year] &&
            _this.available[_this.year][_this.month] &&
            _this.available[_this.year][_this.month].indexOf(dayNum) > -1
          ) {
            enable = true;
          }
          _this.days[i][j] = {
            day: dayNum,
            enable: enable
          };
          dayNum++;
        }
      }
    }
  },
  mounted() {
    this.init();
  },
  created() {}
};
</script>

<style lang="scss" scoped>
.calendar {
  padding-top: 46px;
  padding-bottom: 50px;
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
  .container {
    // padding: 0 10px;
    .date-selector {
      font-size: 22px;
      background-color: #ffffff;
      .year-container {
        position: relative;
        text-align: center;
        padding: 10px 15px;
        .year-pre-btn,
        .year-suf-btn {
          position: absolute;
          top: 10px;
        }
        .year-pre-btn {
          left: 10px;
        }
        .year-suf-btn {
          right: 10px;
        }
        .year {
          font-size: 17px;
          color: rgba(25, 31, 37, 0.8);
          letter-spacing: -0.27px;
          text-align: center;
        }
      }
      .month-container {
        font-size: 14px;
        background-color: #ffffff;
        padding: 5px 10px 15px 10px;
        .month {
          border: 1px solid #e2e2e2;
          display: inline-block;
          width: 26px;
          height: 26px;
          line-height: 25px;
          border-radius: 13px;
          text-align: center;
          opacity: 0.4;
        }
        .month.enable {
          opacity: 1;
        }
        .month.active {
          opacity: 1;
          background-color: #198afe;
          border: 1px solid #198afe;
          color: #ffffff;
        }
      }
    }
    .weeks-row {
      padding: 10px 0;
      margin-top: 2px;
      background-color: #ffffff;
    }
    .week {
      font-size: 16px;
      text-align: center;
    }
    .days-row {
      font-size: 16px;
      text-align: center;
      padding: 10px 0 15px 0;
      background-color: #ffffff;
      .day {
        color: #191f25;
      }
      .day.disable {
        opacity: 0.2;
      }
    }
  }
}
</style>
