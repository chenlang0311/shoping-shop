// component/home-list-item/home-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    name: {
      type: String,
      value: ''
    },
    hasTime: {
      type: Boolean,
      value: true
    },

    listData: {
      type: Object,
      value: {
        list: [],

      },
    },

    // 当前激活的tab
    active: {
      type: String,
      value: ''
    }

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
