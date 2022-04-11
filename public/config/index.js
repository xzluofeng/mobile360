const config = {
  project: {
    name: 'mobile360'
  },
  http: {
    capiBaseURL: 'http://127.0.0.1:8762/c', // GW外网地址及端口
    mobileBaseURL: 'http://127.0.0.1:8081/mobile360', // tomcat中mobile360服务外网地址
    mobileApiURL: 'http://127.0.0.1:8081/mobile360api', // tomcat中mobile360api服务的地址
    // capiBaseURL: 'https://app.qphospital.com/qpz-pc360',
    // mobileBaseURL: 'https://app.qphospital.com/qpz-mobile360',
    // mobileApiURL: 'https://app.qphospital.com/qpz-mobile360api',
    icpURL:'http://www.baidu.com'  //ipc备案的域名，微信端使用，如只使用钉钉则不需要配置
  },
  ding: {
    corpId: 'ding4a84fe9759f2f24235c2f4657eb6378f' // 钉钉corpId
  },
  wechat:{
    corpId:'wxac9ca7b3c2c43e81', // 企业微信corpId
    AgentId:'1000021' // 应用AgentId
  }
};
