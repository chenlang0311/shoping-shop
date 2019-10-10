// pages/home/index/index.js

const App = getApp();
const Api = require('../../../utils/api.js');
const Utils = require('../../../utils/util.js');
const Event = App.globalData.Event;

const TabList = [
  { name: 'tab_all', value: '全部', category_id: 0, index: 0 },
  { name: 'tab_grts', value: '个人提升', category_id: 1, index: 0 },
  { name: 'tab_zcjn', value: '职场技能', category_id: 2, index: 1 },
  { name: 'tab_lxqg', value: '两性情感', category_id: 3, index: 2 },
  { name: 'tab_qzjy', value: '亲子教育', category_id: 4, index: 3 },
  { name: 'tab_jsss', value: '健身瘦身', category_id: 5, index: 4 },
  { name: 'tab_nxss', value: '女性时尚', category_id: 6, index: 5 },
  { name: 'tab_tzlc', value: '投资理财', category_id: 7, index: 6 },
]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showHeadTab: false,   // 是否显示头部tab栏
    banners: [],          // 轮播图  
    isAuth: false,

    recommends: [],       // 首页最新推荐

    // 在onload中初始化
    tab: "",          // tab
    tabList: [],
    // 对应于tab名称 
    // tab_1: {
    //   page: 1,
    //   count: 10,
    //   list: [],
    //   hasMore: true,
    // },
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { tab, tabList } = this.data;
    // init swiper
    this.setData({
      isAuth: App.globalData.isAuth
    });

    // 初始化Tab的值
    // this.initTab();

    // this.getListData();

    // this.getBanner();

    this.dailySign();
    this.exchangeGoods();
    Event.on('changeAuth', () => {
      this.setData({
        isAuth: true
      });
    });

    // 当授权通过时触发页面更新
    // App.changeSetting = (setting) => {
    //   this.setData({
    //     isAuth: true
    //   });
    // }
  },
  dailySign(){
    Api.mine.dailySign().then(res=>{
      console.log('dailySign',res)
    })
  },
  exchangeGoods(){
    Api.mine.exchangeGoods().then(res => {
      console.log('exchangeGoods', res)
    })
  },
  // 初始化tab切换数据
  initTab: function(cb) {

    for (let i = 0, len = TabList.length; i < len; i++) {
      
      let name = TabList[i].name;
      this.setData({
        [name]: {
          page: 1,
          count: 10,
          list: [],
          hasMore: true,
          init: false,
          category_id: TabList[i].category_id 
        }
      });
    }
    this.setData({
      tabList: TabList,
      tab: TabList[0].name,
    });

    cb && cb();
  },

  getBanner: function() {
    const that = this;
    Api.home.getBanner({
      category: 'home'
    }).then((res) => {
      that.setData({
        banners: res.data
      });
    })
  },

  bannerTap: function(e) {
    let {id} = e.currentTarget.dataset;
    if(id) {
      wx.navigateTo({
        url: `../detail/detail?id=${id}`,
      })
    }
  },

  changeTab: function (e) {
    let { tab } = e.currentTarget.dataset;

    this.setData({
      tab
    });
    if (!this.data[tab].init) {
      this.getListData();
    }
  },

  handleListTap: function (e) {
    // console.log(e.currentTarget.dataset);
    let { id } = e.currentTarget.dataset;
    if (id) {
      wx.navigateTo({
        url: `../detail/detail?id=${id}`,
      });
    } else {
      throw new Error(`Error: wrong id ${id}`);
    }
  },

  getListData: function(isLoadMore, isRefresh) {
    let {tab} = this.data;
    let { page, count, list, hasMore, category_id} = this.data[tab];
    let that = this;

    Api.home.getList({
      page,
      count,
      category_id
    }).then(function(res) {
      !isLoadMore && (list = []);

      // 格式化时长
      for(let i =0, len = res.data.length; i <len; i++) {
        res.data[i]._duration = Utils.formatSec(res.data[i].duration); 
        res.data[i].cover_pic = res.data[i].cover_pic || '/statics/img/home/cover_default.png';
      }

      // 为首页最新推荐保存两个值
      let _hasMore;
      if (tab === TabList[0].name && !isLoadMore) {
        let recommends = res.data.splice(0, 2);
        _hasMore = (res.data.length + 2) === count;
        
        recommends.map((cur, index, arr) => {
          cur['_price'] = cur.price ? (parseFloat(cur.price) / 100).toFixed(2) : 0;
          cur['_original_price'] = cur.original_price ? (parseFloat(cur.original_price) / 100).toFixed(2) : 0;
          
          return cur
        });
        that.setData({
          recommends
        });
      }

      list = list.concat(res.data);
     
      that.setData({
        [tab]: Object.assign({}, that.data[tab], {
          list,
          page: page + 1,
          init: true,
          hasMore: _hasMore === undefined ? res.data.length === count : _hasMore
        })
      });

      isRefresh && setTimeout(() => {
        wx.stopPullDownRefresh();
      } , 300);

    }).catch(function() {
      isRefresh && setTimeout(() => {
        wx.stopPullDownRefresh();
      }, 300);
    });
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.initTab();
    this.getListData(false, true);
    this.getBanner();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let {tab} = this.data;
    
    if(this.data[tab].hasMore) {
      this.getListData(true);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return App.share();
  }
})