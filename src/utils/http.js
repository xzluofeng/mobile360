import axios from 'axios'
import qs from 'qs'
// import vue from 'vue'
import {
  Toast
} from 'vant'

let headerConfig = {
  'X-Requested-With': 'XMLHttpRequest',
  'Content-Type': 'application/x-www-form-urlencoded',
  'Access-Control-Allow-Origin': '*'
};

const service = axios.create({
  // baseURL: 'http://36.33.216.237:8762',
  baseURL: config.http.capiBaseURL
  // timeout: 3000
});

service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token
    }
    // 设置Loading动画展示
    Toast.loading({
      // mask: true,
      message: '加载中...'
    });
    return config
  },
  error => {
    // console.log(error);
    // Promise.reject(error);
    Promise.resolve(error);
  }
);
service.interceptors.response.use(
  response => {
    // 关闭Loading动画
    Toast.clear();
    return response
  },
  error => {
    console.log(JSON.stringify(error));
    Toast.fail('服务器开小差了！');
  }
);

function post(url, params = {}) {
  return new Promise((resolve, reject) => {
    service.post(url, qs.stringify(params), {
      headers: headerConfig
    }).then(response => {
      if (response) {
        if (response.data && response.data.status == "200") {
          resolve(response.data)
        } else {
          Toast.fail(response.data.message);
        }
      } else {
        // console.log('= no data =')
      }
    }, error => {
      reject(error)
    })
  })

}

export default {
  post
}
