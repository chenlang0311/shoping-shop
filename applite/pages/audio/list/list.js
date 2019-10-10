// pages/audio/list/list.js
const App = getApp();
const Event = App.getEvent();
const Utils = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    classInfo: {},
    playList: [],
    playListActive: 0,
    showList: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init();
    Event.on('changeAudio', (data) => {
      console.log('video/list: get event changeAudio');
      this.init();
    });

  },

  init: function () {
    let playList = App.setGlobalData('playList');
    let playListActive = App.setGlobalData('playListActive');
    let classInfo = App.setGlobalData('classInfo');

    // 格式化时长及当前时间比
    for(let i = 0, len = playList.length; i < len; i++) {
      let duration = playList[i].duration;
      let currentTime = playList[i].currentTime;

      playList[i]._duration = Utils.formatSec( duration || 0 , true);

      if ( currentTime ) {
        playList[i]._currentTime = '已听 ' + Math.ceil( (currentTime / duration) * 100 ) + '%';
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

  handleTap: function(e) {
    let { index } = e.currentTarget.dataset;
    
    let { playListActive, playList } = this.data;
    if (playListActive === index) return;
    this.setData({
      playListActive: index,
    });
    Event.emit('changeAudio', {
      playList,
      index
    });
  },

  handleClose: function(e) {
    this.setData({
      showList: false
    });
  },

  handleEvent: function(e) {
    console.log('catch a event');
  },
})