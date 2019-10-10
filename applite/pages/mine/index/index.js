// pages/mine/index/index.js
const App = getApp();
const Api = require('../../../utils/api.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,

    class_locked: 0,
    catalog_read: 0,
    catalog_locked: 0,
    class_total: 0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = App.globalData.userInfo;
    // console.log(userInfo);
    this.getInfo();
    this.setData({
      userInfo
    });
  },

  goLogin: function () {
    App.login();
  },

  getInfo: function () {
    const that = this;
    Api.mine.getInfo().then((res) => {
      let { class_locked,
        catalog_read,
        catalog_locked,
        class_total, } = res.data;
      that.setData({
        class_locked,
        catalog_read,
        catalog_locked,
        class_total,
      })
    });
  },

  goItem: function () {
    wx.navigateToMiniProgram({
      appId: 'wx2d4ebbe0d767af56',
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    setTimeout(() => {
      this.getInfo();
      this.setData({
        userInfo: App.globalData.userInfo
      });
      wx.stopPullDownRefresh();
    }, 300);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return App.share();
  }
})