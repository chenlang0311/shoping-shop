// component/vodeo-btn/video-btn.js
const App = getApp();
const Event = App.getEvent();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    audio: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    audioInfo: null,
    isPlay: false,
  },

  ready: function () {
    
    this.init();
    
    // 当播放状态改变时，触发组件更新 data: {isPlay: true}
    Event.on('changePlayState', (data) => {
      this.setData({
        isPlay: data.isPlay
      });
    });

    // 播放列表更新时触发 data: {playList: [], playListActive: 0}
    Event.on('changeAudio', (data) => {
      // console.log('video-btn get event changeAudio', data);
      this.init();
    });
  },


  /**
   * 组件的方法列表
   */
  methods: {
    handleToAudio: function () {
      let { audioInfo } = this.data;
      if( !audioInfo ) {
        wx.showModal({
          title: '提示',
          content: '你还未选择任何音频课程，请先选择后再点击收听',
          showCancel: false,
          confirmText: '知道了'
        });
      } else {
        wx.navigateTo({
          url: '/pages/audio/index/index',
        })
      }
    },

    init: function () {
      let { playList, playListActive, isPlay } = App.setGlobalData();
      // console.log(playList, playListActive);
      let audioInfo = null;
      
      if (playList && playList.length) {
        audioInfo = playList[playListActive]
      } 
      this.setData({
        audioInfo,
        isPlay
      });

    },
  }
})
