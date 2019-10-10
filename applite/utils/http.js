const config = require('../config/config.js');


function HandleMethod(method, url, data) {
  return new Promise((resolve, reject) => {
    if (url[0] == 'h' && url[1] == 't')
      url = url;
    else
      url = config.API_HOST + url + '?_platform=mini';
    if (Object.prototype.toString.call(data) !== '[object Object]') {
      data = {}
    }
    let header = {
      'Content-Type': 'application/json'
    }

    if (wx.getStorageSync('bearer-token')) {
      header['Authorization'] = 'Bearer ' + wx.getStorageSync('bearer-token');
    }

    new Promise((resolve1, reject1) => {
      let options = {
        url: url,
        data: data,
        method: method,
        header: header,
        success: res => resolve1(res),
        fail: res => reject1(res)
      };
      wx.request(options);
    })
      .then(function (d) {
        if (d.data && d.data.status == true) {
          resolve(d.data);
        } else if (d.data && d.data.status == false && d.data.code == 1101) {
          // 当token失效时，登录获取token后重新发送api请求
          getApp().login(()=>{
            wx.request(options);
          }, () => {
            reject(d);
          });
          
        } else {
          return reject(d);
        }
      })
      .catch(function (err) {
        if (err && err.data && err.data.msg) {
          wx.showToast({
            title: err.data.msg,
            icon: 'none',
            duration: 1000
          });
        } else if (err && (err.statusCode === 500 || err.statusCode === 501 || err.statusCode === 502)) {
          wx.showToast({
            title: '网络超时',
            icon: 'none',
            duration: 1000
          });
        }
        wx.hideLoading();
        reject(err);
      });
  });
}

function _get(url, data) {
  let obj = { _timestamp: new Date().getTime() };

  if (Object.prototype.toString.call(data) === '[object Object]') {
    data['_timestamp'] = data['_timestamp'] ? data['_timestamp'] : new Date().getTime();
    obj = data;
  }

  return HandleMethod('GET', url, obj);
}

function _post(url, data) {
  return HandleMethod('POST', url, data);
}

function _put(url, data) {
  return HandleMethod('PUT', url, data);
}

function _delete(url, data) {
  return HandleMethod('DELETE', url, data);
}

module.exports =  {
  'get': _get,
  'post': _post,
  'put': _put,
  'delete': _delete
}
