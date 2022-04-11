/**
 * 放置项目公用JS方法
 * 日期相关的公用JS方法放在@/utils/date.js文件中
 * HTTP请求相关的公用方法放在@/utils/http.js文件中
 */

/**
 * 根据就诊类别获取就诊类别名称
 * @param {*} jzlb 
 */
function getJzlbmc(jzlb) {
  let result;
  if (jzlb == 1) {
    result = '门诊';
  } else if (jzlb == 2) {
    result = '住院';
  } else if (jzlb == 3) {
    result = '体检';
  }
  return result;
}

/**
 * 根据患者年龄、性别名称、婴儿序号获取患者头像样式
 * @param {*} age 
 * @param {*} xbmc 
 * @param {*} yexh 
 */
function getPatientHeadImg(age, xbmc, yexh) {
  let result = '';
  try {
    if (yexh == 0) {
      if (age >= 0 && age <= 7) {
        if (xbmc.replace(/ /g, '') == '男') {
          result = 'baby-boy';
        } else {
          result = 'baby-girl';
        }
      } else if (age > 7 && age <= 60) {
        if (xbmc.replace(/ /g, '') == '男') {
          result = 'man';
        } else {
          result = 'woman';
        }
      } else if (age > 60) {
        if (xbmc.replace(/ /g, '') == '男') {
          result = 'old-man';
        } else {
          result = 'old-woman';
        }
      }
    } else {
      if (xbmc.replace(/ /g, '') == '男') {
        result = 'baby-boy'
      } else {
        result = 'baby-girl'
      }
    }
  } catch (error) {
    // do nothing
  }
  return result;
}

/**
 * 公共方法处理null值
 * @param obj
 * @param defaultValue
 * @returns {*}
 */
function getValue(obj, defaultValue) {
  if (obj === null || obj === 'null' || typeof obj === 'undefined' || '' === obj) {
    return defaultValue ? defaultValue : '';
  }
  return obj;
}

function go(path) {
  this.$router.push(path);
}

/**
 * 获取内容区位置信息
 */
function getContentContainerPositionInfo() {
  if (isFragment()) {
    return {
      top: 0,
      bottom: 0
    }
  } else {
    return {
      top: 46,
      bottom: 50
    }
  }
}

function isFragment() {
  let arr = ['dingding', 'weixin', 'mobile360'];
  const module = localStorage.getItem("module");
  if(module&&module==="0"){
    return false
  }
  const source = localStorage.getItem("source");
  return arr.findIndex(function (value) {
    return value === source;
  }) < 0
}

export default {
  getJzlbmc,
  getPatientHeadImg,
  getValue,
  go,
  isFragment,
  getContentContainerPositionInfo
}
