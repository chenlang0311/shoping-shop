//app.js
const Api = require('./utils/api.js');
const Event = require('./utils/event.js');
const Config = require('./config/config.js');

App({
  onLaunch: function () {
    // 展示本地存储能力
    var bearerToken = wx.getStorageSync('bearer-token');
    if (!bearerToken) {
      this.login();
    }
    this.globalData.isInit = true,

      // 获取用户信息
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                // 可以将 res 发送给后台解码出 unionId
                this.globalData.userInfo = res.userInfo

                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (this.userInfoReadyCallback) {
                  this.userInfoReadyCallback(res)
                }
              }
            })
          }
        }
      });
  },
  onShow: function () {
    let { isInit, isAudioInit } = this.globalData;

    if (isInit) {
      this.checkAuth(() => {
        this.globalData.Event.emit('changeAuth');
        // this.changeSetting();
        this.globalData.isAuth = true;
      });
    }

    // console.log(isInit, typeof wx.getBackgroundAudioManager().paused === 'undefined');
    // 背景播放组件被其他小程序占用中
    if (isAudioInit && typeof wx.getBackgroundAudioManager().paused === 'undefined') {
      this.globalData.isPlay = false;
      this.globalData.isAudioInit = false;
      this.globalData.Event.emit('changePlayState', { isPlay: false });
    }
  },

  checkAuth: function (cb) {
    wx.showLoading();
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          cb && cb();
        }
      },
      fail: err => {
        this.login();
      },
      complete: () => {
        wx.hideLoading();
      }
    })
  },

  login: function (successCb, failCb) {
    const that = this;
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        Api.common.login({
          code: res.code
        }).then((res) => {
          let { rds_session_key } = res.data;

          // 获取用户信息
          wx.getUserInfo({
            withCredentials: true,
            success: (data) => {

              _success(that, rds_session_key, data);
            },
            fail: (err) => {
              // console.log(err);
              if (err.errMsg === 'getUserInfo:fail auth deny') {
                that.showAuthAgain(function(that, data) {
                  _success(that, rds_session_key, data);
                });
              }
            }
          })

        });
      }
    });

    function _success(that, rds_session_key, data) {
      that.globalData.userInfo = data.userInfo;
      that.globalData.isAuth = true;

      // 触发页面更新
      // that.changeSetting();
      that.globalData.Event.emit('changeAuth');

      // 登录
      Api.common.sign(Object.assign({
        rds_session_key
      }, data)).then((res) => {
        wx.setStorageSync('bearer-token', res.data);
        successCb && successCb(res);
      });
    }

  },

  showAuthAgain: function (success) {
    const that = this;
    wx.showModal({
      title: '再次授权',
      content: '您点击了拒绝授权，您在使用过程中可能会出现问题，为了保障您的正常使用，请点击“前往授权”进行授权',
      showCancel: false,
      mask: true,
      confirmText: '前往授权',
      success: function () {
        wx.openSetting({
          success: function (res) {
            // console.log('success');

            wx.getUserInfo({
              success: function(data) {
                success && success(that, data);
              }
            })
            
            // that.changeSetting(res.authSetting);
          }
        });
      }
    })
  },

  // 该方法在需要的时候可以被各个页面重写
  changeSetting: function (setting) {

  },

  share: function (options) {
    return Object.assign({}, {
      title: Config.shareTitle,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }, options);
  },

  setGlobalData: function (key, value) {
    if (typeof key === 'undefined') {
      return Object.assign({}, this.globalData);
    }
    if (typeof value === 'undefined') {
      return this.globalData[key];
    }
    this.globalData[key] = value;
  },

  getEvent: function () {
    return this.globalData.Event;
  },

  globalData: {
    userInfo: null,
    audioInfo: null,    // 当前播放的音频的信息
    isAuth: false,
    isInit: false,
    Event: Event,

    playList: [],       // 播放列表
    playListActive: 0,  // 当前播放
    classInfo:null,     // 音频对应的课程信息
    isPlay: false,      // 音频是否在播放
    isPause: false,     // 点击暂停后触发，因为存在第三种状态即未初始化，所以新增此变量
    isAudioInit: false,      // 音频组件是否初始化
  }
});
