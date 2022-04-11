<template>
  <div class="menu">
    <van-tabbar v-model="active" fixed :dot="false">
      <template v-for="(module, index) in showedModuleList">
        <van-tabbar-item v-if="module.code != 'more'" :key="module.code" @click.native="go(module.path, module.code, module.name)">
          <span>{{ module.name }}</span>
          <i
            slot="icon"
            class="menu-icon"
            :class="active == index ? module.iconClass.actived : module.iconClass.default"
          ></i>
        </van-tabbar-item>
        <van-tabbar-item
          v-if="module.code == 'more'"
          @click.native="showMoreMenu"
          :key="module.code"
        >
          <span>{{ module.name }}</span>
          <i
            slot="icon"
            class="menu-icon"
            :class="active == index ? module.iconClass.actived : module.iconClass.default"
          ></i>
        </van-tabbar-item>
      </template>

      <!--<van-tabbar-item icon="home" to="/index">
        <span>概览</span>
        <i slot="icon" class="menu-icon" :class="active == 0 ? 'index-actived' : 'index-default'"></i>
      </van-tabbar-item>
      <van-tabbar-item icon="records" to="/check">
        <span>检查</span>
        <i slot="icon" class="menu-icon" :class="active == 1 ? 'jc-actived' : 'jc-default'"></i>
      </van-tabbar-item>
      <van-tabbar-item icon="records" to="/inspect">
        <span>检验</span>
        <i slot="icon" class="menu-icon" :class="active == 2 ? 'jy-actived' : 'jy-default'"></i>
      </van-tabbar-item>
      <van-tabbar-item icon="chat" to="/sign">
        <span>体征</span>
        <i slot="icon" class="menu-icon" :class="active == 3 ? 'tz-actived' : 'tz-default'"></i>
      </van-tabbar-item>
      <van-tabbar-item icon="records" @click.native="showMoreMenu">
        <span>更多</span>
        <i slot="icon" class="menu-icon" :class="active == 4 ? 'more-actived' : 'more-default'"></i>
      </van-tabbar-item>-->
    </van-tabbar>
    <ul class="more-menu-list" v-if="showMoreMenuList">
      <!--<li class="more-menu-item" @click="go('/advice')">医嘱</li>
      <li class="more-menu-item" @click="go('/diagnosis')">诊断</li>
      <li class="more-menu-item" @click="go('/recipel')">处方</li>
      <li class="more-menu-item" @click="go('/medicalRecord')">病历</li>
      <li class="more-menu-item" @click="go('/quota')">指标</li>
      <li class="more-menu-item" @click="go('/patientInfo')">基本信息</li>-->
      <li
        v-for="module in hiddenModuleList"
        :key="module.code"
        class="more-menu-item"
        @click="go(module.path, module.code, module.name)"
      >{{ module.name }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "tabbarMenu",
  data() {
    return {
      active: 0,
      // 概览（所有用户都有）
      indexModule: {
        name: "概览",
        code: "index",
        path: "/index",
        order: "1",
        iconClass: {
          default: "index-default",
          actived: "index-actived"
        }
      },
      // 更多，可用模块大于3个时可见
      moreModule: {
        name: "更多",
        code: "more",
        path: "#",
        order: "1",
        iconClass: {
          default: "more-default",
          actived: "more-actived"
        },
        subPathList: []
      },
      // 与PC端共有模块
      moduleList: [
        {
          name: "检查",
          code: "check",
          path: "/check",
          isShow: false,
          order: "1",
          iconClass: {
            default: "jc-default",
            actived: "jc-actived"
          },
          subPathList: ["/checkDetails"]
        },
        {
          name: "检验",
          code: "inspect",
          path: "/inspect",
          isShow: false,
          order: "2",
          iconClass: {
            default: "jy-default",
            actived: "jy-actived"
          },
          subPathList: [
            "/inspect/categoryList",
            "/inspect/inspectionsList",
            "/inspect/inspectionsInfo"
          ]
        },
        {
          name: "体征",
          code: "sign",
          path: "/sign",
          isShow: false,
          order: "3",
          iconClass: {
            default: "tz-default",
            actived: "tz-actived"
          }
        },
        {
          name: "医嘱",
          code: "advice",
          path: "/advice",
          isShow: false,
          order: "4",
          iconClass: {
            default: "yz-default",
            actived: "yz-actived"
          }
        },
        {
          name: "诊断",
          code: "diagnosis",
          path: "/diagnosis",
          isShow: false,
          order: "5",
          iconClass: {
            default: "zd-default",
            actived: "zd-actived"
          }
        },
        {
          name: "处方",
          code: "recipel",
          path: "/recipel",
          order: "6",
          iconClass: {
            default: "cf-default",
            actived: "cf-actived"
          }
        },
        {
          name: "病历",
          code: "medical-record",
          path: "/medicalRecord",
          isShow: false,
          order: "7",
          iconClass: {
            default: "bl-default",
            actived: "bl-actived"
          }
        },
        {
          name: "指标",
          code: "quota",
          path: "/quota",
          isShow: false,
          order: "8",
          iconClass: {
            default: "zb-default",
            actived: "zb-actived"
          }
        }
        ,
        {
          name: "CDA",
          code: "cdady",
          path: "/cdady",
          isShow: false,
          order: "10",
          iconClass: {
            default: "zb-default",
            actived: "zb-actived"
          }
        }
      ],
      // 手机端特有模块
      ownModuleList: [
        {
          name: "基本信息",
          code: "patientInfo",
          path: "/patientInfo",
          isShow: false,
          order: "9"
        }
      ],
      showMoreMenuList: false,
      // 可用模块列表
      enabledModuleList: [],
      // 常显模块列表
      showedModuleList: [],
      // 更多模块列表
      hiddenModuleList: []
    };
  },
  methods: {
    go(path, moduleCode, moduleName) {
      const ignoredModuleCodeList = ["index", "more"];
      if (moduleCode && ignoredModuleCodeList.indexOf(moduleCode) === -1) {
        // 调用
        const patientInfo = JSON.parse(localStorage.getItem("infos"));
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const statData = JSON.parse(localStorage.getItem("statData"));
        if (patientInfo && userInfo && statData) {
          this.$post(
            config.http.capiBaseURL + "/api/v1/statData/save", {
              usercode: userInfo.usercode || "",
              keyStr: statData.keyStr,
              userName: userInfo.fullname || "",
              empi: patientInfo.keyStr,
              hzxm: patientInfo.brxxkJz.hzxm,
              ksdm: patientInfo.ksdm,
              ksmc: patientInfo.ksmc,
              moduleCode: moduleCode,
              moduleName: moduleName,
              client: statData.client || "mobile",
              moduleType: 1,
              parentCode: null,
              note: null
            }
          );
        }
      }
      this.$router.push(path);
    },
    getModuleList() {
      const _this = this;
      _this.$post("/api/v1/com/getModule").then(data => {
        const moduleList = data.data;

        for (let i = 0; i < _this.moduleList.length; i++) {
          if (_this.getModuleStatus(moduleList, _this.moduleList[i])) {
            _this.moduleList[i].isShow = true;
            _this.enabledModuleList.push(_this.moduleList[i]);
          }
        }
        // 根据order排序
        _this.enabledModuleList.sort(function(a, b){
          return a.order - b.order;
        });

        if (_this.enabledModuleList && _this.enabledModuleList.length > 0) {
          if (
            _this.enabledModuleList.length <=
            4 - _this.ownModuleList.length
          ) {
            // 小于等于4，不显示“更多”
            _this.showedModuleList.push(_this.indexModule);
            for (let i = 0; i < _this.enabledModuleList.length; i++) {
              _this.initModuleIcon(_this.enabledModuleList[i]);
              _this.showedModuleList.push(_this.enabledModuleList[i]);
            }
            for (let i = 0; i < _this.ownModuleList.length; i++) {
              _this.showedModuleList.push(_this.ownModuleList[i]);
            }
          } else {
            // 大于4个时显示“更多”
            _this.showedModuleList.push(_this.indexModule);
            for (let i = 0; i < 3; i++) {
              _this.initModuleIcon(_this.enabledModuleList[i]);
              _this.showedModuleList.push(_this.enabledModuleList[i]);
            }
            _this.showedModuleList.push(_this.moreModule);
            // 初始化更多列表
            for (let i = 3; i < _this.enabledModuleList.length; i++) {
              _this.moreModule.subPathList.push(
                _this.enabledModuleList[i].path
              );
              _this.hiddenModuleList.push(_this.enabledModuleList[i]);
            }
            // 添加手机端特有模块
            for (let i = 0; i < _this.ownModuleList.length; i++) {
              _this.moreModule.subPathList.push(_this.ownModuleList[i].path);
              _this.hiddenModuleList.push(_this.ownModuleList[i]);
            }
          }
        }

        _this.initActivedIndex();
      });
    },
    /**
     * 获取模块显示状态
     */
    getModuleStatus(moduleList, module) {
      let result = false;
      for (let i = 0; i < moduleList.length; i++) {
        if (moduleList[i].moduleCode == module.code) {
          // 给order重新赋值
          for (let j = 0; j < this.moduleList.length; j++) {
            if (this.moduleList[j].code === module.code) {
              // debugger
              this.moduleList[j].order = moduleList[i].orderno
            }
          }
          result = true;
          break;
        }
      }
      return result;
    },
    initModuleIcon(module) {
      if (module.iconClass) {
        if (!module.iconClass.default) {
          module.iconClass.default = "mz-default";
        }
        if (!module.iconClass.actived) {
          module.iconClass.actived = "mz-actived";
        }
      } else {
        module.iconClass = {
          default: "mz-default",
          actived: "mz-actived"
        };
      }
    },
    initActivedIndex() {
      let activeIndex;
      const path = this.$route.path;
      const _this = this;
      for (let i = 0; i < _this.showedModuleList.length; i++) {
        if (_this.showedModuleList[i].path == path) {
          activeIndex = i;
          break;
        } else if (
          _this.showedModuleList[i].subPathList &&
          _this.showedModuleList[i].subPathList.indexOf(path) > -1
        ) {
          activeIndex = i;
          break;
        }
      }
      if (typeof activeIndex == "undefined") {
        activeIndex = _this.showedModuleList.length - 1;
      }
      this.active = activeIndex;
    },
    showMoreMenu() {
      this.showMoreMenuList = !this.showMoreMenuList;
    }
  },
  mounted() {
    this.getModuleList();
  },
  created() {
    // switch (path) {
    //   case "/index":
    //     activeIndex = 0;
    //     break;
    //   case "/check":
    //   case "/checkDetails":
    //     activeIndex = 1;
    //     break;
    //   case "/inspect/categoryList":
    //   case "/inspect/inspectionsList":
    //   case "/inspect/inspectionsInfo":
    //     activeIndex = 2;
    //     break;
    //   case "/sign":
    //     activeIndex = 3;
    //     break;
    // }
    // this.active = activeIndex;
  }
};
</script>

<style lang="scss" scoped>
.menu {
  .more-menu-list {
    position: fixed;
    bottom: 50px;
    right: 0;
    width: 120px;
    text-align: center;
    border: 1px solid rgb(238, 238, 238);
    background-color: rgb(255, 255, 255);
    .more-menu-item {
      height: 40px;
      line-height: 40px;
      font-size: 14px;
      border-bottom: 1px dashed #eee;
    }
  }
  .menu-icon {
    font-size: 18px;
    width: 18px;
    height: 18px;
    display: inline-block;
  }
  .index-default {
    background: url("../assets/img/gl-default.svg") center center no-repeat;
  }
  .index-actived {
    background: url("../assets/img/gl-actived.svg") center center no-repeat;
  }
  .jc-default {
    width: 18px;
    background: url("../assets/img/jc-default.svg") center center no-repeat;
  }
  .jc-actived {
    width: 18px;
    background: url("../assets/img/jc-actived.svg") center center no-repeat;
  }
  .jy-default {
    width: 18px;
    background: url("../assets/img/jy-default.svg") center center no-repeat;
  }
  .jy-actived {
    width: 18px;
    background: url("../assets/img/jy-actived.svg") center center no-repeat;
  }
  .tz-default {
    width: 18px;
    background: url("../assets/img/tz-default.svg") center center no-repeat;
  }
  .tz-actived {
    width: 18px;
    background: url("../assets/img/tz-actived.svg") center center no-repeat;
  }

  .bl-default {
    width: 18px;
    background: url("../assets/img/bl-default.svg") center center no-repeat;
  }
  .bl-actived {
    width: 18px;
    background: url("../assets/img/bl-actived.svg") center center no-repeat;
  }
  .yz-default {
    width: 18px;
    background: url("../assets/img/yz-default.svg") center center no-repeat;
  }
  .yz-actived {
    width: 18px;
    background: url("../assets/img/yz-actived.svg") center center no-repeat;
  }
  .cf-default {
    width: 18px;
    background: url("../assets/img/cf-default.svg") center center no-repeat;
  }
  .cf-actived {
    width: 18px;
    background: url("../assets/img/cf-actived.svg") center center no-repeat;
  }
  .zd-default {
    width: 18px;
    background: url("../assets/img/zd-default.svg") center center no-repeat;
  }
  .zd-actived {
    width: 18px;
    background: url("../assets/img/zd-actived.svg") center center no-repeat;
  }
  .zb-default {
    width: 18px;
    background: url("../assets/img/zb-default.svg") center center no-repeat;
  }
  .zb-actived {
    width: 18px;
    background: url("../assets/img/zb-actived.svg") center center no-repeat;
  }
  .more-default {
    width: 18px;
    background: url("../assets/img/more-default.svg") center center no-repeat;
  }
  .more-actived {
    width: 18px;
    background: url("../assets/img/more-actived.svg") center center no-repeat;
  }
}
</style>
