// pages/mine/lesson/lesson.js
const Api = require('../../../utils/api.js');
const App = getApp();
const Utils = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {

    def: {
      page: 1,
      count: 10,
      hasMore: false,
      list: [],
      init: false,
    },
    tab: 'def',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading();
    this.getListData();
  },

  getListData: function (isLoadMore, isRefresh) {
    let { tab } = this.data;
    let { page, count, hasMore, list, init } = this.data[tab];
    const that = this;

    Api.mine.getClass({
      page: isLoadMore ? page + 1 : page,
      count,
    }).then(function (res) {
      !isLoadMore && (list = []);
      list = list.concat(res.data);
      !init && wx.hideLoading();

      // 格式化时长
      for (let i = 0, len = res.data.length; i < len; i++) {
        res.data[i]._duration = Utils.formatSec(res.data[i].duration);
        res.data[i].cover_pic = res.data[i].cover_pic || '/statics/img/home/cover_default.png';
      }

      that.setData({
        [tab]: Object.assign({}, that.data[tab], {
          hasMore: res.data.length === count,
          list,
          page: isLoadMore ? page + 1 : page,
          init: true,
        })
      });

      isRefresh && (setTimeout(wx.stopPullDownRefresh, 200));

    }, (err) => {
      isRefresh && (setTimeout(wx.stopPullDownRefresh, 200));
      !init && wx.hideLoading();
    });
  },

  handleTap: function (e) {
    let { id } = e.currentTarget.dataset;
    if (!id) {
      return;
    }
    wx.navigateTo({
      url: `../../home/detail/detail?id=${id}`,
    })
  },

  goHome: function () {
    wx.switchTab({
      url: '/pages/home/index/index',
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getListData(false, true);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let { tab } = this.data;
    let { hasMore } = this.data[tab];
    if (hasMore) {
      this.getListData(true);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return App().share();
  }
})