<template>
  <div class="login">
    <div class="logo"></div>
    <div class="form">
      <div class="usercode-row">
        <div class="label usercode-label">用户工号</div>
        <van-field v-model="usercode" clearable placeholder="请输入工号" class="usercode"/>
      </div>
      <div class="password-row" v-if="showPasswordRow">
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
        <span class="login-btn" @click="login">授权</span>
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
import axios from "axios";
import qs from "qs";
import watermark from "@/utils/watermark";

export default {
  data() {
    return {
      dingId: "",
      wxId:"",
      source:"",
      mobileToken: "",
      user_ticket:"",
      dingUsername: "",
      wxUsername:"",
      usercode: "",
      password: "abc123",
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
    getUserDetail() {
      const _this = this;
      if (_this.source === 'dingding') {
        try {
          axios
            .post(
              config.http.mobileApiURL + "/ding/getUserDetail",
              qs.stringify({
                dingId: _this.dingId,
                dingToken: _this.mobileToken
              })
            )
            .then(res => {
              const data = res.data;
              _this.dingUsername = data.name;
            });
        } catch (e) {
          alert(JSON.stringify(e));
        }
      }else if (_this.source === 'weixin'){
        try {
          axios
            .post(
              config.http.mobileApiURL + "/wechat/getUserDetail",
              qs.stringify({
                userTicket: _this.user_ticket,
                token: _this.mobileToken
              })
            )
            .then(res => {
              const data = res.data;
              _this.wxUsername = data.name;
            });
        } catch (e) {
          alert(JSON.stringify(e));
        }
      }
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
    login(confirmed) {
      const _this = this;
      if (_this.source === 'dingding') {
        _this
          .$post("/dict/dingTalk/bind", {
            mobileId: _this.dingId,
            mobileUsername: _this.dingUsername,
            usercode: _this.usercode,
            jgdm: _this.curInstitution.code,
            password: _this.password,
            source:_this.source,
            confirmed: confirmed ? confirmed : false
          })
          .then(res => {
            _this.setToken(res)
          });
      }else if (_this.source === 'weixin'){
        _this
          .$post("/dict/dingTalk/bind", {
            mobileId: _this.wxId,
            mobileUsername: _this.wxUsername,
            usercode: _this.usercode,
            jgdm: _this.curInstitution.code,
            password: _this.password,
            source:_this.source,
            confirmed: confirmed ? confirmed : false
          })
          .then(res => {
            _this.setToken(res)
          });
      }
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
        } else {
          // 再次确认
          _this.$dialog
            .confirm({
              title: "名称不一致",
              message: "企业用户名与移动360用户名不一致，是否授权？"
            })
            .then(() => {
              _this.login(true);
            })
            .catch(() => {
              // on cancel
            });
        }
      }
    },
    showInstitutionList() {
      this.showPopUp = true;
    }
  },
  mounted() {
    this.user_ticket = localStorage.getItem("user_ticket");
    this.dingId = localStorage.getItem("dingId");
    this.wxId = localStorage.getItem("wxId");
    this.mobileToken = localStorage.getItem("mobileToken");
    this.source = localStorage.getItem("source");
    this.getAllInstitutions();
    this.getUserDetail();
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
