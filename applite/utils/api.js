let Http = require('./http.js');

let common = {
  login: params => Http.get('/users/weapp/login', params),
  sign: params => Http.post('/users/weapp/sign', params),
};

// 首页
let home = {
  getList: params => Http.get('/classes/list', params),
  getBanner: params => Http.get('/swipers/list', params),
  getDoc: id => Http.get(`/catalogs/details/${id}`),
};

// 课程详情
let details = {
  getDetails: (id, params) => Http.get(`/classes/details/${id}`, params),
  getPayInfo: params => Http.post('/pays/wxpay', params),
  notify: params => Http.post('/pays/order/notify', params),
  count: (id, params) => Http.get(`/catalogs/count/${id}`, params),
}

// 我的
let mine = {
  getClass: (params) => Http.get(`/users/classes`, params),
  getInfo: () => Http.get(`/users/userinfo`),
  exchangeGoods: params => Http.post('/users/exchange-goods', params),
  dailySign: params => Http.post('/users/dailysign', params),
}

module.exports = {
  common,
  home,
  details,
  mine,
}