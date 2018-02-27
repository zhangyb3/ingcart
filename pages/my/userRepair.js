//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    maxInputLen:50
  },

  onLoad: function () {
  
  },

  // 获取用户设备信息
  getDevice: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          deviceHeight: res.windowHeight
        })
      }
    })
  },
  
  countLen:function(e){
    console.log(e.detail.cursor);
    var that=this;
    that.setData({
      maxInputLen: 50 - e.detail.cursor
    })
  }

})
