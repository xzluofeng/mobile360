import Vue from 'vue';
const vm = new Vue();
/**
 * 用户操作日志
 */
export const saveLogs= (moduleCode, moduleName, moduleType, parentCode, note)=>{
  let user = JSON.parse(localStorage.getItem('userInfo')); // 用户信息
  let statData = JSON.parse(localStorage.getItem("statData")); // key_str
  let patient = JSON.parse(localStorage.getItem("infos")); //患者信息

  if (!patient || !user) {
    return;
  }
  if (!moduleCode || !moduleName || '' === moduleCode || '' === moduleName) {
    return;
  }
  let params = {
    usercode: user.usercode,
    keyStr: statData.keyStr || '',
    userName: user.fullname,
    empi: patient.patid + '+' + patient.jzlb + '+' + patient.yljgdm,
    hzxm: patient.brxxkJz.hzxm,
    ksdm: patient.cyksdm,
    ksmc: patient.cyksmc,
    moduleCode: moduleCode,
    moduleName: moduleName,
    client: statData.client || 'browser',
    moduleType: moduleType || 1,
    parentCode: parentCode,
    note: note
  }
  vm.$post("/api/v1/statData/save",params).then(() =>{

  })
}
