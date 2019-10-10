// pages/mine/contact/contact.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

    return getApp().share();
  }
})