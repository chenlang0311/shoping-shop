let all_host = {
  dev: "http://127.0.0.1:8010/api/v1",    // 开发版
  real: "https://test.ewanhe.cn/api/v1",                               // 仿真环境
  release: "",                            // 正式环境
};

const config = {
  mode: 'dev',          // 切换模式
  shareTitle: '改变认知,重塑自我',       // 用于分享的标题语  
}
config['API_HOST'] = all_host[config.mode];

module.exports = config;
 