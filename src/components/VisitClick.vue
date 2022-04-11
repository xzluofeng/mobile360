<template>
  <div class="visitClick">
    <div id="drag" class="time" is-link v-show="isShowTime" @click="showPopup"></div>
      <van-popup class="time-show" v-model="show" position="right" :style="{ height: '66%', width: '80%'} ">
        <div class="jzdj-list">
          <div v-for="jzdj in jzdjList"
               class="jzdj-info" :key="jzdj.jzlsh"
               @click="enter(jzdj.jzlsh,jzdj.jzlb,jzdj.yljgdm)">
            <div class="jzdj-info-row">
              <span class="jzkssj">{{ jzdj.jzkssj }}
                  <span v-if="patientInfo.jzlb == 2">入院</span>
                  <span v-if="patientInfo.jzlb == 1">就诊</span></span>
            </div>
            <div class="jzdj-info-row">
              <span class="yljgmc">[{{ jzdj.yljgmc }}]</span>
            </div>
            <div class="jzdj-info-row">
              <span class="jzksmc">{{ jzdj.jzksmc }}</span>
            </div>
            <div class="jzdj-info-row">
              <span class="zdmc">{{ jzdj.zdmc }}</span>
            </div>
          </div>
        </div>
      </van-popup>
  </div>

</template>

<script>
  export default {
    data(){
      return{
        jzdjList: [],//就诊登记
        isShowTime: true, //是否显示历次病历开关
        show: false,
        baseInfo: {}, // 患者基本信息
        patientInfo: {}, // 患者就诊信息
        position: { x: 0, y: 0,w: 0,h: 0 },//按钮位置信息
        nx: '', ny: '', dx: '', dy: '', xPum: '', yPum: '',x:'',y:'',w:'',h:''
      }
    },
    name:"VisitClick",
    comments:{
    },
    methods:{
      //绑定事件获取患者历次就诊数据
      showPopup() {
        const patidList = localStorage.getItem("originalPatids");
        this.$post("/api/v1/zyjzdjk/getJzjlsjz", {
          patid: this.patientInfo.patid,
          jzlb: this.patientInfo.jzlb,
          yljgdm: this.patientInfo.yljgdm,
          yexh: this.patientInfo.yexh,
          patidList: patidList
        })
          .then(data => {
            this.jzdjList = data.data || [];
            this.show = true;
          })
          .catch(() => {
          })
      },
      //绑定当次就诊，更新数据（子组件向父组件进行传值）
      //传当次的jzlsh、jzlb、yljgdm
      enter(jzlsh,jzlb,yljgdm){
        this.$emit("updateData",jzlsh,jzlb,yljgdm);
      },
      // 实现移动端图标拖拽
      down(){
        let moveDiv = document.querySelector("#drag");
        var touch;
        if(event.touches){
          touch = event.touches[0];
        }else {
          touch = event;
        }
        this.position.x = touch.clientX;
        this.position.y = touch.clientY;
        this.dx = moveDiv.offsetLeft; //左偏移量
        this.dy = moveDiv.offsetTop; //上移量
      },
      move(){
        let moveDiv = document.querySelector("#drag");
        var touch ;
        if(event.touches){
          touch = event.touches[0];
        }else {
          touch = event;
        }
        //组织默认事件，防止body滑动
        event.preventDefault();
        this.nx = touch.clientX - this.position.x;
        this.ny = touch.clientY - this.position.y;
        this.xPum = this.dx+this.nx;
        this.yPum = this.dy+this.ny;
        //边界判断
        this.xPum = this.xPum>0?this.xPum:0;
        this.yPum = this.yPum>0?this.yPum:0;
        this.xPum = this.xPum>this.w-this.x?this.w-this.x:this.xPum;
        this.yPum = this.yPum>this.h-this.y?this.h-this.y:this.yPum;
        moveDiv.style.left = this.xPum+"px";
        moveDiv.style.top = this.yPum +"px";
      }
    },
    mounted() {
      this.patientInfo = this.$storage.get("infos");
      this.baseInfo = this.patientInfo.brxxkJz;
      this.followed = this.patientInfo.followed;
      this.isFragment = this.$isFragment();
      this.top = this.$getContentContainerPositionInfo().top;
      this.bottom = this.$getContentContainerPositionInfo().bottom;
      let moveDiv = document.querySelector("#drag");
      this.w = document.documentElement.clientWidth || document.body.clientWidth;
      this.h = document.documentElement.clientHeight || document.body.clientHeight;
      this.x = moveDiv.offsetWidth;
      this.y = moveDiv.offsetHeight;
      moveDiv.addEventListener('touchstart', this.down, { passive: false });
      moveDiv.addEventListener('touchmove', this.move, { passive: false });
      if(this.baseInfo.jzlsh === 0){
        this.showPopup();
      }

    }
  }
</script>
<style lang="scss" scoped>
  .visitClick {
    padding-top: 46px;
    background-color: #f5f5f9;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .jzdj-list {
    margin-top: 8px
  }

  .jzdj-info {
    margin-bottom: 2px;
    background-color: #FFFFFF;
    margin-bottom: 2px;
    padding: 8px 15px 6px 15px
  }

  .jzdj-info-row {
    padding-bottom: 2px;
    font-size: 17px
  }

  .jzkssj {
    color: #191F25
  }

  .jzlbmc {
    margin-left: 8px;
    font-size: 10px;
    padding: 0 3px;
    border: 1px solid #0A51E6;
    border-radius: 3px;
    color: #0A51E6;
  }

  .yljgmc {
    color: #0A51E6;
    font-size: 15px;
    font-weight: 500
  }

  .jzksmc {
    color: #0D0013;
    font-size: 15px;
    margin-left: 5px;
  }

  .zdmc {
    color: #191F25;
    font-weight: 600
  }

  .time {
    width: 45px;
    height: 45px;
    background-image: url("../assets/img/lcjz.png");
    background-size: cover;
    background-repeat: no-repeat;
    position: fixed;
    top: 35%;
    right: 3%;
    .time-show{
      background-color: rgba(0, 0, 0, 0.28);
    }
  }

</style>
