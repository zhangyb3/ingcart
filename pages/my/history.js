
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var util = require("../../utils/util.js");
var listViewUtil = require("../../utils/listViewUtil.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {

    list_mode: 'history_record',
    list_type: 'history_record',
    history_record: {},
    history_date: [],
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    wx.setNavigationBarTitle({
      title: '历史行程'
    });

    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          scrollHeight: res.windowHeight,
          show_cancel_button: this.data.show_cancel_button
        });
      }
    });
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
    loadHistoryRecord(this);

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})


function loadHistoryRecord(the) {
  var that = the;
  //加载附近机构列表
  var parameters = {
    customerId: wx.getStorageSync(user.CustomerID),
    pageNum: 1,
    pageSize: 10,
  };
  that.setData({
    history_record: [],
  });

  listViewUtil.loadList(that, 'history_record', config.PytheRestfulServerURL,
    "/user/trip",
    10,
    parameters,
    function (netData) {
      //取出返回结果的列表
      return netData.data;
    },
    function (item) {

    },
    {},
    'GET'
  );
}