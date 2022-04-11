<template>
  <div class="redirect">
  </div>
</template>

<script>
  import axios from "axios";
  import qs from "qs";
  import watermark from "@/utils/watermark";
  import { getPatidList, getPatient } from "@/utils/api";
  import { Toast } from "vant";
  import * as dd from 'dingtalk-jsapi';

  export default {
    data() {
      return {
        // source: this.$route.params.source,
        dingId: "",
        wxId: "",
        mobileToken: "",
        user_ticket: "",
        source: this.$route.query.source
          ? this.$route.query.source
          : this.$route.query.state,
        redirectParams: this.$route.query.params
          ? this.$route.query.params
          : this.$route.query.state,
        requestAuthCode: "",
        token: "",
        error: "",
        wxCode: this.$route.query.code
      };
    },
    components: {},
    methods: {
      getAuthCode() {
        const _this = this;
        // 获取微应用免登授权码
        // try {
        dd.ready(function() {
          // 老版本
          dd.runtime.permission.requestAuthCode({
            corpId: config.ding.corpId,
            onSuccess: function(result) {
              // alert("授权成功"+JSON.stringify(result));
              _this.requestAuthCode = result.code;
              _this.getUserInfo();
            },
            onFail: function(err) {
              _this.error = JSON.stringify(err);
              // alert("授权失败"+JSON.stringify(err));
              _this.$toast.fail("获取微应用免登授权码发生错误！");
            }
          });
          // 新版本
          // try {
          //   dd.getAuthCode({
          //     success: (res) => {
          //       alert(1);
          //       _this.requestAuthCode = res.code;
          //       _this.getUserInfo();
          //     },
          //     fail: (err) => {
          //       dd.alert({content: JSON.stringify(err)});
          //     }
          //   })
          // } catch (e) {
          //   alert(JSON.stringify(e));
          // }
        });
        /*} catch (e) {
          alert(JSON.stringify(e));
        }*/
      },
      getUserInfo() {
        try {
          const _this = this;
          axios
            .post(
              config.http.mobileApiURL + "/ding/getUserInfo",
              qs.stringify({
                authCode: _this.requestAuthCode
              })
            )
            .then(res => {
              const userInfo = res.data;
              if (!userInfo.userId) {
                _this.$toast.fail("获取钉钉ID时发生错误！请输入用户名密码登陆");
                this.$router.push("/loginByPassword");
                return;
              }
              _this.dingId = userInfo.userId;
              _this.mobileToken = userInfo.token;
              localStorage.setItem("dingId", userInfo.userId);
              localStorage.setItem("mobileToken", userInfo.token);

              _this.getToken("dingding");
            });
        } catch (e) {
          alert(JSON.stringify(e));
        }
      },
      //获取微信用户信息
      getWxUser() {
        const _this = this;
        axios
          .post(
            config.http.mobileApiURL + "/wechat/getUserInfo",
            qs.stringify({
              authCode: _this.wxCode
            })
          )
          .then(res => {
            const userInfo = res.data;
            if (!userInfo.userId) {
              _this.$toast.fail("获取微信ID时发生错误！请输入用户名密码登陆");
              this.$router.push("/loginByPassword");
              return;
            }
            _this.wxId = userInfo.userId;
            _this.mobileToken = userInfo.token;
            localStorage.setItem("wxId", userInfo.userId);
            localStorage.setItem("mobileToken", userInfo.token);
            localStorage.setItem("user_ticket", userInfo.user_ticket);
            //_this.wxConfig();
            _this.getToken("wx");
            console.log(userInfo);
          });
      },
      getToken(sys) {
        const _this = this;
        if (sys === "dingding") {
          try {
            this.$post("/dict/dingTalk/getToken", {
              dingId: _this.dingId
            }).then(data => {
              const userInfo = data.data;
              if (userInfo && userInfo.token) {
                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                localStorage.setItem("token", userInfo.token);
                const str = JSON.stringify({
                  client: "mobile",
                  keyStr: userInfo.usercode + "_" + new Date().getTime()
                });
                localStorage.setItem("statData", str);
              }
              _this.to();
            });
          } catch (e) {
            alert(JSON.stringify(e));
          }
        } else if (sys === "wx") {
          try {
            this.$post("/dict/weChat/getToken", {
              wxId: _this.wxId
            }).then(data => {
              const userInfo = data.data;
              if (userInfo && userInfo.token) {
                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                localStorage.setItem("token", userInfo.token);
                const str = JSON.stringify({
                  client: "mobile",
                  keyStr: userInfo.usercode + "_" + new Date().getTime()
                });
                localStorage.setItem("statData", str);
              }
              _this.to();
            });
          } catch (e) {
            alert(JSON.stringify(e));
          }
        }
      },
      //登陆加密
      encodeWord(str) {
        let keyStr =
          "ABCDEFGHIJKLMNOP" +
          "QRSTUVWXYZabcdef" +
          "ghijklmnopqrstuv" +
          "wxyz0123456789+/" +
          "=";
        let output = "";
        let chr1,
          chr2,
          chr3 = "";
        let enc1,
          enc2,
          enc3,
          enc4 = "";
        let i = 0;
        do {
          chr1 = str.charCodeAt(i++);
          chr2 = str.charCodeAt(i++);
          chr3 = str.charCodeAt(i++);
          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;
          if (isNaN(chr2)) {
            enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
            enc4 = 64;
          }
          output =
            output +
            keyStr.charAt(enc1) +
            keyStr.charAt(enc2) +
            keyStr.charAt(enc3) +
            keyStr.charAt(enc4);
          chr1 = chr2 = chr3 = "";
          enc1 = enc2 = enc3 = enc4 = "";
        } while (i < str.length);

        return output;
      },
      // 老版本
      // getTokenByDingDingCode(code) {
      //   const _this = this;
      //   this.$post("/c/dict/dingTalk/getUserInfo", {
      //     code: code
      //   }).then(data => {
      //     const patientInfo = data.data;
      //     localStorage.setItem("token", patientInfo.token);
      //     _this.$router.push("/card");
      //   })
      // },
      storePatientInfoAndRedirect(params) {
        const _this = this;
        this.$post("/api/v1/zyjzdjk/getPatientByJzlsh", params).then(data => {
          const patientInfo = data.data;
          if (patientInfo) {
            localStorage.setItem("infos", JSON.stringify(patientInfo));
            getPatidList(
              patientInfo.patid,
              patientInfo.jzlb,
              patientInfo.yljgdm,
              function(data) {
                localStorage.setItem("originalPatids", data);
                _this.$router.push("/index");
              }
            );
          } else {
            _this.$toast.fail("获取患者信息失败！");
          }
        });
      },
      to() {
        const _this = this;
        const token = localStorage.getItem("token");
        if (token) {
          // 添加水印
          const userInfo = _this.$storage.get("userInfo");
          const watermarkContent = userInfo.fullname || "移动360";
          const dateTime = _this.$formatDateTime(new Date());
          watermark.set(watermarkContent, dateTime);
          const params = _this.redirectParams;
          if (params && (params !== "weixin" && params!=="dingding")) {
            _this.storePatientInfoAndRedirect(JSON.parse(decodeURI(params)));
          } else {
            _this.$router.push("/card");
          }
        } else {
          _this.$router.push("/login");
        }
      },
      init() {
        const _this = this;
        // 存放访问来源，用于调用移动接口时区分是来自钉钉还是微信
        if (this.$route.query.state || this.$route.query.state === "weixin") {
          this.source = "weixin";
        }
        if (this.$route.query.state || this.$route.query.state === "dingding") {
          this.source = "dingding";
        }

        console.log(this.$route.query.state);
        localStorage.setItem("source", this.source);

        if ("dingding" == this.source) {
          // this.getTokenForDingTalk();
          this.getAuthCode();
          // this.getUserInfo();
        } else if ("weixin" == this.source) {
          localStorage.setItem("wxCode", this.wxCode);
          this.getWxUser();
        } else {
          // 请求参数
          const param = this.$route.query;
          // 目录先考虑支持token
          if (param.token || (param.usercode && param.password && param.jgdm)) {
            if (!param.token) {
              return;
            }
            const token = param.token;
            this.$post("/api/v1/token/mobileClient/getToken", {
              usercode: param.usercode,
              jgdm: param.jgdm,
              jzlsh: param.jzlsh,
              jzlb: param.jzlb,
              yljgdm: param.yljgdm,
              yexh: param.yexh,
              patid: param.patid,
              zjh: param.zjh,
              blh: param.blh,
              module: param.module,
              authenticationCode: token
            }).then(data => {
              if (data.data) {
                localStorage.setItem("token", data.data.token);
                let jzlsh = data.data.jzlsh;
                let jzlb = data.data.jzlb;
                let yljgdm = data.data.yljgdm;
                let yexh = data.data.yexh;
                let patid = data.data.patid;
                let zjh = data.data.zjh;
                let blh = data.data.blh;
                let module = data.data.module;
                // source - 来源
                // infos - 患者信息
                localStorage.setItem("module", module);
                const moduleMap = {
                  "0": "/index",
                  "1": "/index",
                  "2": "/inspect",
                  "3": "/check",
                  "4": "/diagnosis",
                  "5": "/recipel",
                  "6": "/medicalRecord",
                  "7": "/quota",
                  "8": "/advice",
                  "9": "/sign",
                  "10": "/patientInfo",
                  "11": "/cda"
                };
                if (!module || module === "") {
                  Toast.fail("参数中缺少模块信息！");
                  return;
                }
                const modulePath = moduleMap[module];
                if (!modulePath) {
                  Toast.fail("模块参数错误，目前只支持0~10！");
                  return;
                }
                const userInfo = data.data.userInfo;
                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                const str = JSON.stringify({
                  client: "mobile",
                  keyStr: userInfo.usercode + "_" + new Date().getTime()
                });
                localStorage.setItem("statData", str);
                const watermarkContent = userInfo.fullname || "移动360";
                const dateTime = this.$formatDateTime(new Date());
                watermark.set(watermarkContent, dateTime);

                getPatient(
                  {
                    jzlsh: jzlsh,
                    jzlb: jzlb,
                    yljgdm: yljgdm,
                    yexh: yexh,
                    patid: patid,
                    zjh: zjh,
                    blh: blh
                  },
                  function(data) {
                    localStorage.setItem("infos", JSON.stringify(data));
                    getPatidList(data.patid, data.jzlb, data.yljgdm, function(
                      originalPatids
                    ) {
                      localStorage.setItem("originalPatids", originalPatids);
                      _this.$router.push(modulePath);
                    });
                  }
                );
              }
            });
            // originalPatids -- 患者历次就诊keystr
          } else {
            this.$router.push("/loginByPassword");
          }
          // this.$post("/c/api/v1/token/login", {
          //   // usercode: this.encodeWord("admin"),
          //   // password: this.encodeWord("winning"),
          //   // yljgdm: "42504942400"
          //   usercode: this.encodeWord("0001"),
          //   password: this.encodeWord("abc123"),
          //   yljgdm: "0002"
          // }).then(data => {
          //   console.log(data);
          //   const userInfo = data.data;
          //   localStorage.setItem("userInfo", JSON.stringify(userInfo));
          //   localStorage.setItem("token", userInfo.token);
          //   const str = JSON.stringify({client: 'mobile', keyStr: userInfo.usercode + '_' + new Date().getTime()});
          //   localStorage.setItem('statData', str);
          //   localStorage.setItem("dingId", "063300603327387037");
          //   localStorage.setItem("dingToken", "039b7ec1726735c8ad2d4e93af4bccdf");
          //   // this.$router.push("/login");
          //   const watermarkContent = "移动360";
          //   const dateTime = this.$formatDateTime(new Date());
          //   watermark.set(watermarkContent, dateTime);
          //   this.$router.push("/card");
          // });
        }
      }
    },
    mounted() {
      // 进入系统前清空缓存
      // localStorage.clear();
      // 改为手动清除 localStorage 的属性，保留 ksInfos 属性
      localStorage.removeItem("source");
      localStorage.removeItem("module");
      localStorage.removeItem("statData");
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      this.init();
    }
  };
</script>

<style lang="scss" scoped>
  .redirect {
    /*background-color: #ffffff;*/
    background: url("../assets/img/redirect-page-background-image.png") center
    center no-repeat;
    background-size: 100% 100%;
    width: 100%;
    height: 100%;
    position: relative;
  }
</style>
