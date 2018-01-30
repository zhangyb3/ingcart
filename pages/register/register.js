

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
		send_verification_code: true,
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

		// var myVar = setInterval(
		// 	function () { checkCustomerRegister(this) },
		// 	1000 * 5);

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
				send_verification_code: true,
      });
    }
  },
  verificationCodeInput: function (e) {
    var verificationCode = e.detail.value;
    console.log(e.detail.value);
    wx.setStorageSync('verificationCode', verificationCode);
  },
  customerRegister:function(e){
    register.commitRegister(this,
			(res)=>{
				wx.reLaunch({
					url: '../index/index',
					success: function(res) {},
					fail: function(res) {},
					complete: function(res) {},
				})
			}
		);
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
			send_verification_code: true,
    });
    return;
  }

  var time = setTimeout(function () {
    that.setData({

      countdownText: second + '秒后可重发',
      second: second - 1,
      lock_countdown: true,
			send_verification_code: false,
    });
    countdown(that);
  }
    , 1000)
}

function checkCustomerRegister(the){
	var that = the;
	if(wx.getStorageSync(user.CustomerID) > 0)
	{
		wx.redirectTo({
			url: '../index/index',
			success: function(res) {},
			fail: function(res) {},
			complete: function(res) {},
		})
	}
}