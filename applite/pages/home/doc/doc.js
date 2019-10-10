// pages/home/doc/doc.js

const WxParse = require('../../../wxParse/wxParse.js');
const App = getApp();
const Api = require('../../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  
    let {id} = options;
    this.setData({
      id
    });
    this.getData();
  },

  getData: function( isRefresh ) {
    !isRefresh && wx.showLoading();
    let {id} = this.data;
    Api.home.getDoc(id).then((res) => {
      const that = this;
      let timer = null; 
      isRefresh && setTimeout(wx.stopPullDownRefresh, 200);
      timer = setTimeout(() => {
        let imagePadding = wx.getSystemInfoSync().windowWidth / 750 * 26;
        WxParse.wxParse('content', 'html', res.data.content, that, imagePadding);

        !isRefresh && wx.hideLoading();
        clearTimeout(timer);
      });

    }).catch(function(err) {
      wx.hideLoading();
      isRefresh && setTimeout(wx.stopPullDownRefresh, 200);
      
    });

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getData(true);
  },

})