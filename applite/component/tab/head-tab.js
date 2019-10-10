// component/tab/head-tab.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    className: {
      type: String,
      value: '',
    },
    tab: {
      type: String,
      value: ''
    },
    tabList: {
      type: Array,    //[{name: 'work', value: '职场 · 能力'}]
      value: [
        
      ],
      observe: function() {
        this.initScroll();
      }
    },
    hasScroll: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    scrollWidth: '100%'
  },

  ready: function() {
    this.initScroll();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeTab: function(e) {
      let { tab, index } = e.currentTarget.dataset;
      this.triggerEvent('changeTab', {
        tab,
        index
      })
    },

    initScroll: function() {
      if (this.data.hasScroll) {
        // todo 我TM不想算，文档有毒
        this.setData({
          scrollWidth: this.data.tabList.length * 160 + 'rpx'
        });
      }
    }
  }
})
