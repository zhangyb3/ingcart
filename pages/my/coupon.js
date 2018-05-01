
var register = require("../../utils/register.js");
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var login = require("../../utils/login.js");
var operation = require("../../utils/operation.js");
var pay = require("../../utils/pay.js");
var util = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
		coupons:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		this.getDevice();
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
		var that = this;
		var myDate = new Date();
		that.setData({
			deadLine: myDate.getFullYear() + '.' + (myDate.getMonth()+1) + '.' + myDate.getDate(),
		});

		wx.request({
			url: config.PytheRestfulServerURL + '/select/coupon',
			data: {
				customerId: wx.getStorageSync(user.CustomerID),
				pageNum: 1,
				pageSize: 10,
			},
			method: 'GET',
			success: function(res) {
				var coupons = res.data.data;
				for(var count = 0 ; count < coupons.length; count++)
				{
					coupons[count].startTime = util.formatDay(coupons[count].startTime);
					coupons[count].stopTime = util.formatDay(coupons[count].stopTime);
				}

				if(res.data.status == 200)
				{
					that.setData({
						coupons: coupons,
					});
				}
			},
			fail: function(res) {},
			complete: function(res) {},
		})
  },

	useCoupon:function(e){

		var coupon = e.currentTarget.dataset.coupon;
		if(coupon.status == 0)
		{
			wx.showModal({
				title: '提示',
				content: '你确定使用该优惠券？',
				showCancel: true,
				cancelText: '取消',
				confirmText: '确定',
				success: function (res) {
					if (res.confirm) {

						var pages = getCurrentPages();
						var indexPage = pages[0];
						indexPage.data.coupon = 'oneDayTicket';
						indexPage.data.couponCode = coupon.code;
						// indexPage.data.couponType = coupon.type;
						indexPage.data.useCoupon = true;
						wx.navigateBack({
							delta: 5,
						});

						// wx.reLaunch({
						// 	url: '../index/index?coupon=oneDayTicket&couponCode=' + coupon.code,
						// 	success: function (res) { },
						// 	fail: function (res) { },
						// 	complete: function (res) { },
						// });

					}
				},
				fail: function (res) { },
				complete: function (res) { },
			});
		}
		
		

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