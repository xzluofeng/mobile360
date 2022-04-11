import moment from 'moment'

function format(date, pattern) {
  let result = '';
  if (date && pattern) {
    try {
      result = moment(date, 'YYYY-MM-DD HH:mm:ss').format(pattern);
    } catch (error) {
      // console.log(error);
    }
  }
  return result;
}

/**D
 * 格式化日期
 * @param {*} dateTime
 */
function formatDate(dateTime) {
  let result;
  if (dateTime) {
    result = moment(dateTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
  } else {
    result = moment().format('YYYY-MM-DD');
  }
  return result;
}

/**
 * 格式化日期
 * @param {*} dateTime
 */
function formatDateTime(dateTime) {
  let result;
  if (dateTime) {
    result = moment(dateTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
  } else {
    result = moment().format('YYYY-MM-DD HH:mm:ss');
  }
  return result;
}

/**
 * 根据出生日期获取年龄
 * @param {*} birthDay
 */
function getAge(birthDay) {
  let result = 0;
  if (birthDay) {
    result = moment().diff(moment(birthDay, 'YYYY-MM-DD'), 'years');
  }
  return result;
}

/**
 * 根据出生日期和就诊时间获取年龄
 * @param {*} birthDay
 */
function getJzAge(birthDay,jzkssj) {
  let result = 0;
  if (birthDay && jzkssj) {
    result = moment(jzkssj, 'YYYY-MM-DD').diff(moment(birthDay, 'YYYY-MM-DD'), 'years');
  }
  return result;
}

function getYear(date) {
  return moment(date, 'YYYY-MM-DD HH:mm:ss').get('year');
}

function getMonth(date) {
  return moment(date, 'YYYY-MM-DD HH:mm:ss').get('month');
}

function getDay(date) {
  return moment(date, 'YYYY-MM-DD HH:mm:ss').get('date')
}

/**
 * 根据年、月获取一个月开始日期，返回示例：2019-01-01
 * @param year
 * @param month
 * @returns {*}
 */
function getStartDayOfMonth(year, month) {
  return formatDate(new Date(year, month, 1));
}

/**
 * 根据年、月获取一个月的天数
 * @param year
 * @param month
 * @returns {number}
 */
function  getDaysInMonth(year, month) {
  return moment(new Date(year, month, 1)).daysInMonth();
}

/**
 * 根据日期返回星期几，星期天返回0，依次类推
 * @param day
 * @returns {string}
 */
function getDayOfWeek(day) {
  return moment(day, "YYYY-MM-DD").format("e");
}

/**
 * 根据日期获取日
 * @param day
 * @returns {string}
 */
function getDayOfMonth(day) {
  return moment(day, "YYYY-MM-DD").format("D");
}

function isBeforeToday(year, month, day) {
  return moment(new Date(year, month, day)).isBefore(moment(new Date()));
}

export default {
  format,
  formatDate,
  formatDateTime,
  getAge,
  getDaysInMonth,
  getStartDayOfMonth,
  getDayOfWeek,
  getDayOfMonth,
  getYear,
  getMonth,
  getDay,
  isBeforeToday,
  getJzAge
}
