// pages/mine/contact/contact.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qq: '18665375796',
    wechat: '18665375796',
    qun: '623235728',
  },

  copy: function(e) {
    // console.log(e);
    let { type } = e.currentTarget.dataset;

    wx.setClipboardData({
      data: this.data[type],
      success: function (res) {
        wx.showToast({
          title: '复制成功',
          mask: true,
        })
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
    return getApp().share();
  }
})