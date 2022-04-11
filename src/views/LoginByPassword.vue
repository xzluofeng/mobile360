<template>
  <div class="login">
    <div class="logo"></div>
    <div class="form">
      <div class="usercode-row">
        <div class="label usercode-label">用户工号</div>
        <van-field v-model="usercode" clearable placeholder="请输入工号" class="usercode"/>
      </div>
      <div class="password-row">
        <div class="label usercode-label">密码</div>
        <van-field v-model="password" type="password" placeholder="请输入密码" class="password"/>
      </div>
      <div class="yljg-row" v-if="showYljg">
        <div class="label yljg-label">医疗机构</div>
        <span class="yljg">{{ curInstitution.name }}</span>
        <i
          class="fa fa-sort-desc show-institutions-icon"
          aria-hidden="true"
          @click="showInstitutionList"
        ></i>
      </div>
      <div class="btn-row">
        <span class="login-btn" @click="login">登陆</span>
      </div>
    </div>
    <van-popup v-model="showPopUp" style="width: 100%">
      <van-picker
        :columns="institutions"
        value-key="name"
        show-toolbar
        position="bottom"
        @confirm="changeInstitution"
        @cancel="showPopUp = false"
      />
    </van-popup>
  </div>
</template>

<script>
  import watermark from "@/utils/watermark";

  export default {
    data() {
      return {
        usercode: "",
        password: "",
        showYljg: false,
        showPopUp: false,
        showPasswordRow: false,
        institutions: [],
        curInstitution: {}
      };
    },
    components: {},
    methods: {
      changeInstitution(value) {
        this.curInstitution = value;
        this.showPopUp = false;
      },
      getAllInstitutions() {
        const _this = this;
        _this.$post("/dict/getAllInstitutions").then(res => {
          const list = res.data;
          _this.curInstitution = list[0];
          _this.institutions = list;
          if (list && list.length > 1) {
            // 多个医疗机构
            _this.showYljg = true;
          } else {
            // 一个医疗机构
            _this.showYljg = false;
          }
        });
      },
      login() {
        const _this = this;
        this.$post("/api/v1/token/login", {
          usercode: this.encodeWord(_this.usercode),
          password: this.encodeWord(_this.password),
          yljgdm: this.encodeWord(_this.curInstitution.code)
        }).then(data => {
          const userInfo = data.data;
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          localStorage.setItem("token", userInfo.token);
          localStorage.setItem("source", 'mobile360');
          const str = JSON.stringify({client: 'mobile', keyStr: userInfo.usercode + '_' + new Date().getTime()});
          localStorage.setItem('statData', str);
          // this.$router.push("/login");
          const userMsg = _this.$storage.get("userInfo");
          const watermarkContent = userMsg.fullname || "移动360";
          const dateTime = this.$formatDateTime(new Date());
          watermark.set(watermarkContent, dateTime);
          this.$router.push("/card");
        });
      },

      encodeWord(str){
        let keyStr = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv"
          + "wxyz0123456789+/" + "=";
        let output = "";
        let chr1, chr2, chr3 = "";
        let enc1, enc2, enc3, enc4 = "";
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
          output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2)
            + keyStr.charAt(enc3) + keyStr.charAt(enc4);
          chr1 = chr2 = chr3 = "";
          enc1 = enc2 = enc3 = enc4 = "";
        } while (i < str.length);

        return output;
      },

      setToken(res){
        const _this = this;
        if (res.status == 200) {
          const userInfo = res.data;
          if (userInfo && userInfo.token) {
            _this.$toast.success("授权成功！");
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
            localStorage.setItem("token", userInfo.token);
            const str = JSON.stringify({client: 'mobile', keyStr: userInfo.usercode + '_' + new Date().getTime()});
            localStorage.setItem('statData', str);
            // 添加水印
            const userMsg = _this.$storage.get("userInfo");
            const watermarkContent = userMsg.fullname || "移动360";
            const dateTime = _this.$formatDateTime(new Date());
            watermark.set(watermarkContent, dateTime);
            _this.$router.push("/card");
          }
        }
      },
      showInstitutionList() {
        this.showPopUp = true;
      }
    },
    mounted() {
      this.getAllInstitutions();
    }
  };
</script>

<style lang="scss" scoped>
  .login {
    width: 100%;
    height: 100%;
    padding: 40px 15px;
    background-color: #ffffff;
    /*background-color: rgb(30, 86, 200);*/
    /*filter: alpha(Opacity=80);*/
    -moz-opacity: 0.8;
    opacity: 0.8;

    .logo {
      width: 160px;
      height: 160px;
      margin: 0 auto;
      background: url("../assets/img/logo.jpg") center center no-repeat;
      background-size: 160px 160px;
    }

    .form {
      padding-top: 30px;

      .label {
        font-size: 14px;
        color: #666666;
      }

      .password-row,
      .yljg-row {
        padding-top: 20px;
      }

      .usercode,
      .password {
        border-bottom: 1px solid #dddddd;
      }

      .usercode input,
      .password input {
        height: 32px;
        line-height: 32px;
      }

      .yljg-row {
        font-size: 18px;
        color: #333333;
        position: relative;

        .yljg-label {
          padding-bottom: 15px;
        }

        .yljg {
          display: inline-block;
          padding: 0 15px;
        }

        .show-institutions-icon {
          position: absolute;
          padding: 6px 10px;
          bottom: 0;
        }
      }

      .btn-row {
        padding-top: 30px;

        .login-btn {
          display: inline-block;
          color: #ffffff;
          background-color: #0040c9;
          width: 100%;
          height: 100%;
          text-align: center;
          padding: 10px;
          font-size: 20px;
          border-radius: 4px;
        }
      }
    }
  }
</style>

<style lang="scss">
  .login {
    .van-field__control {
      font-size: 18px;
      color: #333333;
    }
  }
</style>
