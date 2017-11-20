

var register = require("../../utils/register.js");
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var login = require("../../utils/login.js");


Page({

  /**
   * 页面的初始数据
   */
  data: {
  
    countdownText: '发送验证码',
    second: 60,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
  
  },

  //注册
  phoneNumberInput: function (e) {
    var registerPhoneNum = e.detail.value;
    console.log(e.detail.value);
    wx.setStorageSync('registerPhoneNum', registerPhoneNum);
  },
  sendVerificationCode: function (res) {
    console.log(wx.getStorageSync('registerPhoneNum'));
    register.sendVerificationCode(wx.getStorageSync('registerPhoneNum'));

    //重发倒数
    var that = this;

    that.setData({
      second: 60,
      lock_countdown: true,
    });
    countdown(that);
    if (second < 0) {
      that.setData({
        countdownText: "重发验证码",
        lock_countdown: false,
      });
    }
  },
  verificationCodeInput: function (e) {
    var verificationCode = e.detail.value;
    console.log(e.detail.value);
    wx.setStorageSync('verificationCode', verificationCode);
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


function countdown(that) {
  var second = that.data.second;
  if (second < 0) {
    that.setData({
      countdownText: "重发验证码",
      lock_countdown: false,
    });
    return;
  }

  var time = setTimeout(function () {
    that.setData({

      countdownText: second + '秒后可重发',
      second: second - 1,
      lock_countdown: true,
    });
    countdown(that);
  }
    , 1000)
}