

var register = require("../../utils/register.js");
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var login = require("../../utils/login.js");
var WXBizDataCrypt = require('../../utils/decode.js');
var operation = require("../../utils/operation.js");

Page({

  /**
	 * "pages/register/register",
	 * 
	 * 
   * 页面的初始数据
   */
  data: {

    countdownText: '发送验证码',
    second: 60,
		send_verification_code: true,
		fromPage:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (parameters) {
		var that = this;
		that.data.fromPage = parameters.fromPage;
		
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
		var that = this;
    register.commitRegister(this,
			(res)=>{
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
		);
  },


	getPhoneNumber: function (e) {
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

		if (e.detail.errMsg == 'getPhoneNumber:ok'){
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


						wx.reLaunch({
							url: '../index/index',
							success: function (res) { },
							fail: function (res) { },
							complete: function (res) { },
						})


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

	getUserInfo: function (e) {
		wx.login({
			success: function (loginRes) {
				console.log("登录获取code", loginRes);
				wx.setStorage({
					key: user.js_code,
					data: loginRes.code,
				});

				wx.request({
					url: config.PytheRestfulServerURL + '/wxSession/request',
					data: {
						code: loginRes.code,
						// AppID: config.AppID,
						// AppSecret: config.AppSecret,
						userType: 0,//用户版为0
					},
					complete: function (res) {
						if (res.statusCode != 200) {//失败
							console.error("登录失败", res);
							var data = res.data || { msg: '无法请求服务器' };
							if (typeof fail == "function") {
								fail();
							} else {
								wx.showModal({
									title: '提示',
									content: data.msg,
									showCancel: false
								});
							}
						} else {//成功

							var login_result = res.data.data;

							console.log("登录成功", res);

							wx.setStorageSync('SessionID', res.data.data.session_id);
							wx.setStorageSync('OpenID', res.data.data.openid);
							wx.setStorageSync('SessionKey', res.data.data.session_key);

							console.log('session key : ' + wx.getStorageSync('SessionKey'));
							console.log('openid : ' + wx.getStorageSync('OpenID'));

							wx.getUserInfo({
								withCredentials: true,
								success: function (res) { },
								fail: function (res) { },
								complete: function (res) {
									console.log("encryptedData", res.encryptedData);
									var session_key = wx.getStorageSync("SessionKey");
									var encryptedData = res.encryptedData;
									var iv = res.iv;

									var pc = new WXBizDataCrypt(config.AppID, session_key)
									var result = pc.decryptData(encryptedData, iv);
									console.log("!!!decode: " + JSON.stringify(result));
									wx.setStorageSync(user.UnionID, result.unionId);
                  console.log("zhaozha:===>>" + result.unionId)


								},
							})


						}
					}
				})
			}
		})
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