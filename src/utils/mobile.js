/**
 * 放置钉钉、微信相关封装方法
 */
import wx from 'weixin-js-sdk'
import axios from "axios";
import qs from "qs";

function share(title, url, content) {
  const source = localStorage.getItem('source');
  if ('dingding' == source) {
    // dd.biz.util.share({
    //   type: 0, //分享类型，0:全部组件 默认； 1:只能分享到钉钉；2:不能分享，只有刷新按钮
    //   url: url,
    //   title: title,
    //   content: '',
    //   image: '',
    //   onSuccess: function () {},
    //   onFail: function () {}
    // });
    dd.biz.util.share({
      "type": 0,
      "url": url,
      "title": title,
      "content": content,
      "image": config.http.mobileBaseURL + '/logo.jpg'
    });
  } else if ('weixin' == source) {

    // 微信分享
  }
}

function wxConf(path,conf,age,desc) {
  let jsTicket='-1'
  let obj = localStorage.getItem("jsTicket");
  if (obj){
    let newTime = new Date().getTime();
    if (newTime - obj.timestemp < 5400000) {
      jsTicket = obj.jsTicket;
    }
  }
  const patientInfo = JSON.parse(localStorage.getItem("infos"));

  let url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+config.wechat.corpId+
    '&redirect_uri='+encodeURI(config.http.icpURL+'/mobile360')+'&response_type=code&scope=snsapi_userinfo&agentid='
    + config.wechat.AgentId+'&state='+ encodeURI(
      JSON.stringify({
        jzlsh: patientInfo.jzlsh,
        jzlb: patientInfo.jzlb,
        yljgdm: patientInfo.yljgdm,
        yexh: patientInfo.yexh
      })
    ) +'#wechat_redirect';
  const title = patientInfo.brxxkJz.hzxm + " " + age;
  //获取js-sdk权限
  axios
    .post(
      config.http.mobileApiURL + "/wechat/getSign",
      qs.stringify({
        token: localStorage.getItem("mobileToken"),
        path:path,
        jsTicket:jsTicket
      })
    )
    .then(res => {
      const data = res.data;
      let timestemp = new Date().getTime();
      let obj = {
        jsTicket:data.jsTicket,
        timestemp:timestemp
      };
      localStorage.setItem("jsTicket",obj);
      wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: data.appId, // 必填，企业号的唯一标识，此处填写企业号corpid
        timestamp: data.timestamp, // 必填，生成签名的时间戳
        nonceStr: data.nonceStr, // 必填，生成签名的随机串
        signature: data.signature,// 必填，签名，见附录1
        jsApiList: ['onMenuShareAppMessage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
      });
      wx.ready(function(){
        //配置患者详情页分享信息，自动跳转到该患者
        wx.onMenuShareAppMessage({
          title: title, // 分享标题
          desc: desc, // 分享描述
          link: url, // 分享链接，该链接域名必须与当前企业的可信域名一致
          imgUrl: config.http.icpURL + '/mobile360/logo.jpg', // 分享图标
          type: 'link', // 分享类型,music、video或link，不填默认为link
          dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
        });
      });
    });
}

export default {
  share,wxConf
}
