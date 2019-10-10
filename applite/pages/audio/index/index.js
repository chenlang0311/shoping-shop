// pages/audio/index/index.js
const Utils = require('../../../utils/util.js');
const App = getApp();
const Event = App.globalData.Event;
const Base64 = require('../../../utils/base64.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    percent: 0,               // 当前时间占总时长的比例,用于模拟进度条
    duration: 0,              // 当前播放音频时长
    durationStr: "00:00",     //
    currentTime: 0,           // 当前时间 0s
    currentTimeStr: "00:00",  // 当前时间的展示值00：00
    isPlay: false,            // 播放状态
    isLoading: false,
    isAudioInit: false,       // 音频组件是否已经初始化

    video_link: "",           // 音频原始地址
    cover_pic: "",            // 封面图
    timer: null,              // 时间显示的定时器
    playList: [],             // 播放列表
    playListActive: 0,        // 当前音频在播放列表中的索引   
    classInfo: null,          // 音频对应的课程信息    

    showList: false,          // 显示播放列表   

    isStart: false,           // 初始化页面的播放，onload和onshow执行一个,避免重复执行

    startX: 0,                // 用于拖动滚动条时记住开始位置
    startTime: 0,             // 滑动 开始时的播放时间
    offsetX: 0,               // 进度条长度
    showLoading: false,          // 是否正在拖动，拖动时在timeUpdate事件中不实时更新percent数据
    needSeek: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // if(!this.data.isStart) {
      
    
    this.initAudioData();

    let isPlay = App.setGlobalData('isPlay');
    let isAudioInit = App.setGlobalData('isAudioInit');

    //  console.log('sdaewq',isAudioInit);
    if (!isAudioInit) {
      this.initAudio();
      this.setData({
        showLoading: true
      });
    }

    this.setData({
      isStart: true
    });

    // 提前获取进度条宽度供计算
    this.getProgressWidth();
    // }

    // Event.on('changeAudio', (data) => {
    //   console.log(data);
    //   this.initAudioData();
    //   this.initAudio();
    // });

    console.log('load');

  },

  onShow: function () {
    let { isStart } = this.data;
    let isAudioInit = App.setGlobalData('isAudioInit');
    // console.log(isStart, App.globalData.isAudioInit, typeof wx.getBackgroundAudioManager().paused);

    // 另一个小程序正在播放音频时，接管音频播放
    if (!isStart && typeof wx.getBackgroundAudioManager().paused === 'undefined') {
      // console.log('xxxxxxxxx', App.globalData.isPlay, App.globalData.isAudioInit );
      App.globalData.isPlay = false;
      App.globalData.isAudioInit = false;

      this.setData({
        isPlay: false,
        isAudioInit: false,
      });

      // 播放状态改变交由app.js中的show事件处理
      // Event.emit('changePlayState', { isPlay: false });

      this.initAudioData();
      this.initAudio();
    }
  },

  onHide: function () {
    this.setData({
      isStart: false
    });
  },

  onUnload: function () {
    this.setData({
      isStart: false
    });
  },

  // 初始化音频数据
  initAudioData: function () {
    const that = this;
    let { playList, playListActive, classInfo } = App.globalData;
    let currentAudio = playList[playListActive];

    let { video_link, title, cover_pic, currentTime, duration } = currentAudio;
    let isPlay = App.setGlobalData('isPlay');
    let isAudioInit = App.setGlobalData('isAudioInit');

    // console.log('initAudioData', currentAudio);
    // console.log(duration);

    // console.log(playList, playListActive, classInfo);
    that.setData({
      playList,
      playListActive,
      classInfo,
      title,
      cover_pic: cover_pic || '/statics/img/home/cover_default.png',
      video_link,
      duration: duration,
      currentTime,
      durationStr: Utils.formatSec(duration),
      currentTimeStr: Utils.formatSec(currentTime || 0),

      isPlay,
      isAudioInit,
    });
    
    that.setData({
      percent: that.calculateProgress(currentTime),
    });


    let backgroundAudioManager = wx.getBackgroundAudioManager();

    // onCanplay方法失效,未知问题
    // onCanplay在从其他小程序播放音频切换至本页面时触发，EXM？
    backgroundAudioManager.onCanplay(_onCanplay);
    backgroundAudioManager.onPlay(_onPlay);
    backgroundAudioManager.onPause(_onPause);
    backgroundAudioManager.onTimeUpdate(_onTimeUpdate);
    backgroundAudioManager.onWaiting(_onWaiting);
    backgroundAudioManager.onEnded(_onEnded);
    backgroundAudioManager.onError(_onError);

   
    function _onCanplay() {
      console.log('canplay');
      // let backgroundAudioManager = wx.getBackgroundAudioManager();
      // console.log(backgroundAudioManager.duration);
      // let duration = Math.ceil(backgroundAudioManager.duration);
      // that.setData({
      //   duration: duration,
      //   durationStr: Utils.formatSec(duration)
      // });
    }
    function _onPlay() {
      that.setData({
        isPlay: true,
      });

      setTimeout(() => {
        that.setData({
          showLoading: false,
        });
      }, 600);

      App.setGlobalData('isPlay', true);
      Event.emit('changePlayState', { isPlay: true });
      _setCurTime();
       console.log('play');
    }
    function _onPause() {
      console.log('pause');
      that.setData({
        isPlay: false,
      });

      App.setGlobalData('isPlay', false);
      Event.emit('changePlayState', { isPlay: false });
      _setCurTime();

    }

    function _onTimeUpdate() {
      console.log('timeupdate');

      _setCurTime();
    }

    function _setCurTime() {
      // 该对象从this.data中获取时取不到属性值
      let backgroundAudioManager = wx.getBackgroundAudioManager();
      let currentTime = Math.ceil(backgroundAudioManager.currentTime);

      // 时长改为后台读取
      // let duration = Math.ceil(backgroundAudioManager.duration);
      // that.setData({
      //   duration,
      //   durationStr: Utils.formatSec(duration)
      // });

      // 记住当前时间，用于音频列表显示和重新进入时初始化
      let { playList, playListActive } = that.data;

      playList[playListActive].currentTime = currentTime;
      App.setGlobalData('playList', playList);

      that.setData({
        currentTime,
        playList,
        currentTimeStr: Utils.formatSec(currentTime),
      });

      if (!that.data.showLoading) {
        that.setData({
          percent: that.calculateProgress(currentTime),
        });
      }
    }

    function _onWaiting(e) {
       console.log('loading...');
       that.setData({
         showLoading: true
       });
    }

    function _onError(err) {
      console.log('Error' + err.errMsg);
    }

    function _onEnded() {
      that.setData({
        isPlay: false,
        isAudioInit: false,
        currentTime: 0,
        currentTimeStr: Utils.formatSec(0),
        percent: that.calculateProgress(0),
      });
      App.setGlobalData('isPlay', false);
      let { playList, playListActive } = that.data;

      // 下一首
      if (playListActive + 1 < playList.length) {
        that.changeIndex(++playListActive, that);
      } else {
        playList[playListActive].currentTime = 0;
        App.setGlobalData('playList', playList);
        setTimeout(() => {
          showLoading: false
        }, 600);
        Event.emit('changePlayState', { isPlay: false });
      }
      console.log('end');
    }
  },

  // 加载音频组件
  initAudio: function () {

    let backgroundAudioManager = wx.getBackgroundAudioManager();
    let { currentTime, title, cover_pic, duration, video_link } = this.data;
    let { classInfo } = this.data;
    const that = this;
    // console.log('initAudio', video_link);
    // console.log('99999', currentTime, title, cover_pic, duration, video_link);
    // 设置开始时间，如果有该视频播放记录
    backgroundAudioManager.startTime = currentTime || 0;
    backgroundAudioManager.title = title;
    backgroundAudioManager.epname = classInfo.title;
    backgroundAudioManager.coverImgUrl = cover_pic;
    backgroundAudioManager.duration = duration;
    backgroundAudioManager.src = video_link;

    that.setData({
      isAudioInit: true
    });

    App.setGlobalData('isAudioInit', true);
  },

  playOrPause: function () {
    if (this.data.showLoading) {
      return;
    }

    let { isPlay, isAudioInit } = this.data;
    let backgroundAudioManager = wx.getBackgroundAudioManager();
    // console.log(isPlay, isAudioInit);
    if (isPlay) {
      backgroundAudioManager.pause();
    } else {
      this.setData({
        showLoading: true
      });

      // 
      if (isAudioInit) {
        backgroundAudioManager.play();
      } else {
        this.initAudio();
      }
    }

  },

  changeAudio: function (e) {
    //
    let { action } = e.currentTarget.dataset;
    let { playList, playListActive } = this.data;
    const that = this;

    // 下一首
    if (action === 'next') {
      if (playListActive + 1 >= playList.length) {
        _showToast('已经是最后一条');
      } else {
        that.changeIndex(++playListActive, that);
      }
    }

    if (action === 'prev') {
      if (playListActive - 1 <= -1) {
        _showToast('已经是第一条');
      } else {
        that.changeIndex(--playListActive, that);
      }
    }

    function _showToast(text) {
      wx.showToast({
        title: text,
        icon: 'none'
      })
    }

  },

  // 改变当前播放的音乐的索引
  changeIndex: function (playListActive, that) {
    let { playList } = that.data;

    App.setGlobalData('playListActive', playListActive);

    // 切换音频后从头开始播放
    playList[playListActive].currentTime = 0;
    App.setGlobalData('playList', playList);

    Event.emit('changeAudio', {
      playList,
      playListActive
    });
    that.initAudioData();
    that.initAudio();
  },

  // 拖动进度条， 保持进度条显示与手指滑动同步
  changeProgress: function (e) {
    // console.log(e);
    let { startX, startTime, duration, offsetX, percent } = this.data;
    let { pageX } = e.changedTouches[0];

    // console.log(percent, pageX, startX, offsetX);
    // percen为100 到 0，所有应该percent - 移动的值
    percent = percent - (pageX - startX) / offsetX * 100;
    percent > 100 && (percent = 100);
    percent < 0 && (percent = 0);

    // console.log(percent);
    this.setData({
      percent,
      startX: pageX
    });

  },

  changeProgressStart: function (e) {
    let { pageX } = e.changedTouches[0];
    let { currentTime } = wx.getBackgroundAudioManager();

    this.setData({
      startX: pageX,
      startTime: currentTime,
      showLoading: true
    });


  },

  changeProgressEnd: function (e) {
    let { pageX } = e.changedTouches;
    let { percent, duration, isPlay } = this.data;

    // 计算移动距离
    // 计算公式
    // 移动距离 / 进度条长度 = 应该跳转的时长 / 总时长
    let currentTime = Math.ceil((1 - percent / 100) * duration);
    let backgroundAudio = wx.getBackgroundAudioManager();
    let { playList, playListActive } = this.data;
    const that = this;


    if(currentTime <= duration) {

      playList[playListActive].currentTime = currentTime;
      that.setData({
        playList,
        currentTime,
        currentTimeStr: Utils.formatSec(currentTime),
      });
      App.setGlobalData('playList', playList);

      if(isPlay) {
        backgroundAudio.seek(currentTime);
      } else {
        that.setData({
          currentTime,
        });
        that.initAudioData();
        that.initAudio();
      }

    } else {
      backgroundAudio.stop(); 
      playList[playListActive].currentTime = 0;
      App.setGlobalData('playList', playList);
    }
    
    this.setData({
      showLoading: true,

    });
    setTimeout(() => {
      this.setData({
        showLoading: false
      });
    }, 600);

  },

  getProgressWidth: function () {
    var query = wx.createSelectorQuery();
    const that = this;
    query.select('#js-progress').boundingClientRect(function (rect) {

      that.setData({
        offsetX: rect.width
      });
    }).exec();

  },

  // 播放列表相关
  // 显示播放列表
  openList: function () {
    this.initPlayList();
    this.setData({
      showList: true
    });
  },

  handleClose: function (e) {
    this.setData({
      showList: false
    });
  },

  // 处理时间捕获
  handleEvent: function (e) {
    // console.log('catch a event');
  },

  handleListTap: function (e) {
    let { index } = e.currentTarget.dataset;


    let { playListActive, playList } = this.data;
    if (playListActive === index) return;
    this.setData({
      playListActive: index,
    });

    this.changeIndex(index, this);
    this.setData({
      showList: false,
    });

  },

  calculateProgress: function (currentTime) {
    let { duration } = this.data;
    let percent = 100 - currentTime / duration * 100;
    return percent;
  },

  initPlayList: function () {
    let playList = App.setGlobalData('playList');
    let playListActive = App.setGlobalData('playListActive');
    let classInfo = App.setGlobalData('classInfo');

    // 格式化时长及当前时间比
    for (let i = 0, len = playList.length; i < len; i++) {
      let duration = playList[i].duration;
      let currentTime = playList[i].currentTime;

      playList[i]._duration = Utils.formatSec(duration || 0, true);

      if (currentTime) {
        let _currentTime = Math.ceil((currentTime / duration) * 100);
        _currentTime = _currentTime > 100 ? 100 : _currentTime;
        playList[i]._currentTime = '已听 ' + _currentTime + '%';
      } else {
        playList[i]._currentTime = '未收听';
      }

    }

    this.setData({
      playList,
      playListActive,
      classInfo
    });

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let { classInfo } = this.data;
    let { title, id, cover_pic } = classInfo;
    return App.share({
      title,
      path: `/pages/home/detail/detail?id=${id}`,
      imageUrl: cover_pic
    });
  }
})