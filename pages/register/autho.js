//index.js
//获取应用实例
const app = getApp()

var register = require("../../utils/register.js");
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var login = require("../../utils/login.js");
var WXBizDataCrypt = require('../../utils/decode.js');
var operation = require('../../utils/operation.js');

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },


	getPhoneNumber: function (e) {
		var that = this;
		console.log(e.detail.errMsg);
		console.log(e.detail.iv);
		console.log(e.detail.encryptedData);

		var encryptedData = e.detail.encryptedData;
		var iv = e.detail.iv;

		var pc = new WXBizDataCrypt(config.AppID, wx.getStorageSync('SessionKey'));
		var result = pc.decryptData(encryptedData, iv);
		console.log("phoneNumber decode: " + JSON.stringify(result));
		var phoneNumber = result.phoneNumber;
		var purePhoneNumber = result.purePhoneNumber;
		var countryCode = result.countryCode;

		if (e.detail.errMsg == 'getPhoneNumber:ok') {
			wx.request({
				url: config.PytheRestfulServerURL + '/customer/register/',
				data: {

					name: wx.getStorageSync('wxNickName'),
					phoneNum: phoneNumber,

					openId: wx.getStorageSync(user.OpenID),
					unionId: wx.getStorageSync(user.UnionID),
					type: 0,//小程序注册类型为0
				},
				method: 'POST',
				success: function (res) {
					// success
					console.log(res);
					if (res.data.data == null) {
						wx.showModal({
							title: '提示',
							content: res.data.msg,
							success: function (res) {
								if (res.confirm) {
									console.log('用户点击确定')
								}
							}
						});

						that.setData({
							lock_register: false,
						});
					}
					else if (res.data.status == 200) {
						wx.setStorageSync(user.CustomerID, res.data.data.customerId);

						wx.setStorageSync(user.Description, res.data.data.description);
						wx.setStorageSync(user.Status, res.data.data.status);

						wx.setStorageSync(user.UsingCar, res.data.data.carId);
						wx.setStorageSync(user.RecordID, res.data.data.recordId);
						wx.setStorageSync(user.UsingCarStatus, res.data.data.carStatus);

						wx.setStorageSync(user.Level, res.data.data.level);
						wx.setStorageSync(user.Amount, res.data.data.amount);

						//判断注册是否成功，成功则返回index页面
						wx.setStorageSync('alreadyRegister', 'yes');

						wx.showLoading({
							title: '登录中',
							mask: true,
							success: function (res) { },
							fail: function (res) { },
							complete: function (res) { },
						})
						operation.loginSystem(
							that,
							() => {
								wx.hideLoading();
								wx.navigateBack({
									delta: 5,
								})

							}
						);


					}
					else if (res.data.status == 202) {
						wx.showModal({
							title: '提示',
							content: res.data.msg,
							confirmText: '我知道了',
							confirmColor: '',
							success: function (res) {
								if (res.confirm) {
									wx.navigateBack({
										delta: 2,
									})
								}
							},
							fail: function (res) { },
							complete: function (res) { },
						})
					}

				},
				fail: function () {
					// fail
					wx.showModal({
						title: '提示',
						content: '登录失败，请重试',
						success: function (res) {
							if (res.confirm) {
								console.log('用户点击确定')
							}
						}
					});

					that.setData({
						lock_register: false,
					});
				},

			});
		}


	},

	redirectToNormalRegister:function(e){
		wx.redirectTo({
			url: 'register',
			success: function(res) {},
			fail: function(res) {},
			complete: function(res) {},
		})
	},

	redirectToAgreement: function (e) {
		wx.navigateTo({
			url: '../agreement/agreement',
			success: function (res) { },
			fail: function (res) { },
			complete: function (res) { },
		})
	},
  bindGetUserInfo(e) {
    wx.navigateTo({
      url: '/pages/index/index',
    })
  }
	
})
