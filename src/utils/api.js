import Vue from 'vue';
const vm = new Vue();

export const getPatidList = (patid, jzlb, yljgdm, cb) => {
  vm.$post("/api/v1/empi/queryPatient", {
    patid: patid,
    jzlb: jzlb,
    yljgdm: yljgdm
  }).then(data => {
    cb(data.data);
  })
}

export const getPatientInfo = (jzlsh, jzlb, yljgdm, yexh, cb) => {
  vm.$post("/api/v1/zyjzdjk/getPatientByJzlsh", {
    jzlsh: jzlsh,
    jzlb: jzlb,
    yljgdm: yljgdm,
    yexh: yexh
  }).then(data => {
    cb(data.data);
  })
}

export const getPatient = (param, cb) => {
  vm.$post("/api/v1/zyjzdjk/getPatient", param).then(data => {
    cb(data.data);
  })
}

