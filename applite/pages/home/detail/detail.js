// pages/home/detail/detail.js
const App = getApp();
const Api = require('../../../utils/api.js');
const Utils = require('../../../utils/util.js');
const WxParse = require('../../../wxParse/wxParse.js');
const Event = App.getEvent();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,      // 课程id
    tabList: [
      { name: 'detail', value: '详情' },
      { name: 'lesson', value: '目录' },
    ],
    tab: 'detail',
    showHeadTab: false,
    init: false,
    hasData: false,
    hasDetails: false,

    //
    info: {
      cover_pic: '',
      author: '',
      title: '',
      price: 0,
      id: 0,
      original_price: 0,
      read_total: 0,   // 总参加数
    },
    details: {},      // 课程详情
    catalogs: [],     // 课程目录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { id } = options;
    this.setData({
      id: id || 1
    });
    wx.showLoading();
    this.getDetails();
  },

  handleUnlock: function (data) {
    const that = this;
    let { id } = this.data;

    wx.showLoading({
      title: '支付中',
      mask: true,
    });

    Api.details.getPayInfo({
      "class_id": id
    }).then(function (res) {
      that.startPay(res.data);

    }).catch(function (e) {
      that.payFail();
    });
  },

  // 发起支付
  startPay: function (data) {
    const that = this;
    data.timeStamp = String(data.timeStamp);
    wx.hideLoading();
    wx.requestPayment(Object.assign({}, data, {
      success: function (res) {

        that.payNotice({
          "order_id": data.order_id
        });
      },
      fail: function (res) {
        that.payFail();
      },
      complete: function () {
        // wx.hideLoading();
      }
    }));
  },

  payNotice: function (data) {
    const that = this;
    Api.details.notify(data).then(function () {
      wx.showToast({
        title: '购买成功',
      });
      that.getDetails();
    }, (err) => {
      that.payFail();
    });
  },

  payFail: function () {
    wx.hideLoading();
    wx.showToast({
      title: '支付失败！',
      icon: 'none'
    })
  },

  changeTab: function (e) {
    // console.log(e);
    let { tab } = e.currentTarget.dataset;
    this.setData({
      tab
    });
  },

  getDetails: function () {
    let { id } = this.data;
    const that = this;

    Api.details.getDetails(id).then((res) => {
      let {
        cover_pic, title, unlocks,
        price, details, catalogs,
        locked, id, original_price, read_total,
        author
       } = res.data;

      cover_pic = cover_pic || '/statics/img/home/cover_default.png';
      details = details && details.content ? details : {content: ''};

      // 格式化时长
      for (let i = 0, len = catalogs.length; i < len; i++) {
        catalogs[i]._duration = Utils.formatSec(catalogs[i].duration, true);
      }

      that.setData({
        catalogs,
        details,
        hasData: true,
        hasDetails: details && !!details.content,
        info: {
          cover_pic,
          title,
          unlocks,
          price: parseFloat(price / 100).toFixed(2),
          original_price: parseFloat(original_price / 100).toFixed(2),
          locked,
          id,
          read_total,
          author
        }
      });

      wx.hideLoading();


      let timer = null;
      timer = setTimeout(() => {
        let imagePadding = wx.getSystemInfoSync().windowWidth / 750 * 26;
        WxParse.wxParse('content', 'html', details.content, that, imagePadding);
        this.setData({
          init: true
        });
        clearTimeout(timer);
      });

    });
  },

  checkDoc: function (e) {
    // 文稿id
    let { id } = e.currentTarget.dataset;
    if (id) {
      wx.navigateTo({
        url: `../doc/doc?id=${id}`,
      });
    }
  },

  toastUnlock: function () {
    wx.showToast({
      title: '请先解锁课程',
      icon: "none",
    })
  },

  playVoice: function (e) {
    let { id, index, audition } = e.currentTarget.dataset;
    let { info, catalogs } = this.data;
    let isPlay = App.setGlobalData('isPlay');

    if (audition === 'yes') {
      // 当前正在播放该音频时，不初始化，只跳转
      // console.log(isPlay);
      if (isPlay) {
        let classInfo = App.setGlobalData('classInfo');
        let playList = App.setGlobalData('playList');
        let playListActive = App.setGlobalData('playListActive');

        if (id !== playList[playListActive].id || classInfo.id !== info.id) {
          // console.log(catalogs[index], index, info, _navigate);

          // 判断是否是解锁列表，不是的话取所有试听音频生成一个数组
          let arr = [];
          if (!info.locked) {
            arr = catalogs;
          } else {
            arr = _get(catalogs)
          }
          _play(arr, index, info, _navigate);
        } else {
          _navigate();
        }

      } else {
        let arr = [];
        if (!info.locked) {
          arr = catalogs;
        } else {
          arr = _get(catalogs)
        }
        _play(arr, index, info, _navigate);
      }

    } else {
      if (info.locked) {
        this.toastUnlock();
      } else {
        // 已解锁的音频
        // 将当前音频列表添加到全局
        // 将当前音频所在的索引保存
        // 触发音频信息更新事件
        // 跳转至播放页面
        let curPlayList = catalogs.concat();

        if (isPlay) {
          let classInfo = App.setGlobalData('classInfo');
          let playList = App.setGlobalData('playList');
          let playListActive = App.setGlobalData('playListActive');

          if (classInfo.id !== info.id || id !== playList[playListActive].id) {

            _play(curPlayList, index, info, _navigate);
          } else {
            _navigate();
          }
        } else {
          _play(curPlayList, index, info, _navigate);
        }
      }
    }

    function _play(playList, index, classInfo, cb) {
      App.setGlobalData('playList', playList);
      App.setGlobalData('playListActive', index);
      App.setGlobalData('classInfo', classInfo);
      App.setGlobalData('isAudioInit', false);

      Event.emit('changeAudio', {
        playList: playList.concat(),
        index
      });

      // 后台统计播放次数
      let { id, audition } = playList[index];
      Api.details.count(id, { audition });
      cb && cb();

    }

    // 获取当前目录下所有视频音频
    function _get(catalogs) {
      let arr = [];
      arr = catalogs.filter((cur, index, arr) => {
        if (cur.audition === 'yes') {
          return cur;
        }

      });
      return arr;

    }

    // 在页面数据赋值给全局属性之前跳转页面会导致赋值失败
    function _navigate() {
      wx.navigateTo({
        url: '../../audio/index/index',
      });
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getDetails();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let { info } = this.data;
    return App.share({
      title: info.title
    });
  }
})