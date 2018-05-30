var app = getApp();
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var login = require("../../utils/login.js");
var operation = require("../../utils/operation.js");

// var ingcartSDK = require('../../lib/ingcart-lock-manager');


Page({

  /**
   * 页面的初始数据
   */
  data: {
		unlock_progress: false,
		fromPage: null,
		operation: null,
		carId: null,
		qrId:null,

		unlockFailTimes:0,

		bleUnlock: 1,
		switchInterval:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (parameters) {
		console.log(parameters);
		this.data.fromPage = parameters.from;
		this.data.operation = parameters.operation;
		this.data.carId = parameters.carId;
		this.data.qrId = parameters.qrId;
		if(this.data.fromPage == 'weixin')
		{
			wx.setStorageSync('from', 'weixin');
		}

		
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

		//程序内扫码开锁
		if (this.data.operation == 'unlock' && this.data.fromPage == 'index')
		{
			var that = this;
			

			if (that.data.qrId.length == 8 || that.data.qrId.length == 7) 
			{
			
				wx.setStorageSync('unlockingQR', that.data.qrId);
				wx.setStorageSync(that.data.qrId, 'unlocking');


				wx.getLocation({
					type: "gcj02",
					success: (res) => {
						console.log("unlock location", res);
						if(res.latitude != null){
							wx.setStorageSync(user.Latitude, res.latitude);
						}
						if (res.longitude != null){
							wx.setStorageSync(user.Longitude, res.longitude);
						}
						
						var preZero = '';
						if (that.data.qrId.length == 7) {
							preZero = '000';
						}
						if (that.data.qrId.length == 8) {
							preZero = '00';
						}
						console.log(preZero + that.data.qrId + ',' + res.latitude + ',' + res.longitude);

						if (wx.getStorageSync('unlock_mode') == 'ble') {
							// 下面这句调用强制使用蓝牙开锁
							app.ingcartLockManager.unlock(preZero + that.data.qrId, wx.getStorageSync(user.Latitude), wx.getStorageSync(user.Longitude), that.unlockCB, that.unlockFailCB, that.lockCB);
						}
						if (wx.getStorageSync('unlock_mode') == 'gprs') {
							if (that.data.qrId.length == 7) 
							{
								console.log(" node lock !!!!!!!!!!!!!!!!!!!!!");
								app.ingcartLockManager.unlock(preZero + that.data.qrId, wx.getStorageSync(user.Latitude), wx.getStorageSync(user.Longitude), that.unlockCB, that.unlockFailCB, that.lockCB);
							}
							else
							{
								console.log('GPRS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
								//这种模式下，每次先用蓝牙开锁，8秒后如果开锁失败改用gprs
								app.ingcartLockManager.unlock(preZero + that.data.qrId, wx.getStorageSync(user.Latitude), wx.getStorageSync(user.Longitude), that.unlockCB, that.unlockFailCB, that.lockCB,true);
								var switchCount = 0;
								that.data.switchInterval = setInterval(
									function(){
										if(switchCount > 10)
										{
											clearInterval(that.data.switchInterval);
											console.log('!!!!!!!!!!!!!!! switch to gprs unlock !!!!!!!!!!!!!!!!!');
											// 下面这句调用强制使用 gprs 开锁，假如蓝牙开不了
											app.ingcartLockManager.unlock(preZero + that.data.qrId, wx.getStorageSync(user.Latitude), wx.getStorageSync(user.Longitude), that.unlockCB, that.unlockFailCB, that.lockCB, false);
											that.data.bleUnlock = 0;
										}
										else
										{
											switchCount++;
										}
									},
									1000
								);
								
							}
							
						}
						that.setData({
							unlock_progress: true,
						});

					},
					
				});

				var count = 0;
				var checkUnlockingQR = setInterval(
					function () {

						count++;

						if (wx.getStorageSync(that.data.qrId) == 'unlock_success') {
							
							console.log('29 unlock success !!!!!!!!!!!!!!!!!!!!!!!!!');
							clearInterval(checkUnlockingQR);

							var couponCode = null;
							if (wx.getStorageSync('using_coupon_code') != 'no') {
								couponCode = wx.getStorageSync('using_coupon_code');
							}
							wx.request({
								url: config.PytheRestfulServerURL + '/use/unlock',
								data: {
									qrId: wx.getStorageSync('unlockingQR'),
									carId: wx.getStorageSync('unlockingQR'),
									customerId: wx.getStorageSync(user.CustomerID),
									latitude: wx.getStorageSync(user.Latitude),
									longitude: wx.getStorageSync(user.Longitude),
									code: couponCode,
									ble: that.data.bleUnlock,
								},
								method: 'POST',
								success: function (res) { 
									clearInterval(that.data.switchInterval);
									console.log("use unlock: ", res.data.status);
									if (res.data.status == 200) {
										clearInterval(checkUnlockingQR);
										wx.setStorageSync(that.data.qrId, 'unlocked');
										// wx.setStorageSync('unlockingQR', null);
										var pages = getCurrentPages();
										var indexPage = pages[0];
										indexPage.data.status = 'unlock';
										indexPage.data.unlockQR = null;
										indexPage.data.backFrom = null;
										indexPage.data.showZoneNotice = true;
										indexPage.data.useCoupon = false;
										indexPage.data.couponCode = null;
										indexPage.data.timing = true;
									}
									operation.normalUpdateCustomerStatus(
										wx.getStorageSync(user.CustomerID),
										() => {
											
											wx.navigateBack({
												delta: 1,
											});
										},
									);
									
								},
								fail: function (res) { },
								complete: function (res) { },
							});


							

							

						}						
						
						else if (wx.getStorageSync(that.data.qrId) == 'unlock_fail' || 
							(count > 25 && wx.getStorageSync('unlock_mode') == 'gprs') ||
							(count > 20 && wx.getStorageSync('unlock_mode') == 'ble'))
						{

							clearInterval(checkUnlockingQR);
							if (wx.getStorageSync('unlock_mode') == 'ble' && that.data.qrId.length == 8) 
							{
								wx.setStorageSync('unlock_mode', 'gprs');
							}
							wx.setStorageSync(that.data.qrId, null);
							// wx.setStorageSync('unlockingQR', null);
							wx.showModal({
								title: '提示',
								content: '暂时无法开锁，请返回首页重试',
								showCancel: false,
								confirmText: '我知道了',
								success: function (res) {

									//报手机型号故障
									operation.reportMobileModelFault(that, 
										that.data.qrId, 
										wx.getStorageSync(user.PhoneNum),
										wx.getStorageSync('mobileModel')
									);
									clearInterval(that.data.switchInterval);
									var pages = getCurrentPages();
									var indexPage = pages[0];
									indexPage.data.unlockQR = null;
									indexPage.data.backFrom = null;
									if (res.confirm) {

										wx.navigateBack({
											delta: 1,
										})
									}
									else {
										wx.navigateBack({
											delta: 1,
										})
									}
									
								},
								fail: function (res) { },
								complete: function (res) { },
							});

						}
						
					},
					1000
				);


			}
			else
			{
				console.log('777777777777777777777777777777777777');
				that.setData({
					unlock_progress: true,
					percent: 99,
				});
				operation.unlock(
					that,
					wx.getStorageSync(user.CustomerID),
					that.data.carId,
					that.data.qrId,
					(result) => {
						// var pages = getCurrentPages();
						// var indexPage = pages[0];
						// indexPage.data.status = 'unlock';
						// indexPage.data.unlockQR = null;
						// indexPage.data.backFrom = null;
						// indexPage.data.showZoneNotice = true;
						// indexPage.data.useCoupon = false;
						// indexPage.data.couponCode = null;
						// wx.navigateBack({
						// 	delta: 1,
						// });

					},
					() => {
						var pages = getCurrentPages();
						var indexPage = pages[0];
						indexPage.data.unlockQR = null;
						indexPage.data.backFrom = null;
						indexPage.data.useCoupon = false;
						indexPage.data.couponCode = null;
						wx.navigateBack({
							delta: 1,
						});
					}
				);
			}
			

			
		}

		

		//检测到关锁
		if (this.data.operation == 'lock' || wx.getStorageSync('executeLock') == 'yes')
		{
			wx.setStorageSync('executeLock', 'no');
			wx.closeBLEConnection({
				deviceId: wx.getStorageSync(user.UsingCarDevice),
				success: function (res) {
					wx.closeBluetoothAdapter({
						success: function (res) { },
						fail: function (res) { },
						complete: function (res) { },
					})
				},
				fail: function (res) { },
				complete: function (res) { },
			});
			
			wx.showLoading({
				title: '关锁中···',
				mask: true,
			})

			var that = this;

			if(wx.getStorageSync(user.Level) == 1)
			{
				//管理员版直接返回主页面
				operation.lock(
					wx.getStorageSync(user.CustomerID),
					wx.getStorageSync(user.UsingCar),
					wx.getStorageSync(user.RecordID),
					(result) => {
						console.log(result);

						wx.showToast({
							title: '关锁成功',
							icon: '',
							image: '',
							duration: 1500,
							mask: true,
							success: function(res) {},
							fail: function(res) {},
							complete: function(res) {},
						})

						var pages = getCurrentPages();
						var indexPage = pages[0];
						indexPage.data.fromPage = 'processing';
						wx.navigateBack({
							delta: 5,
						});
						// wx.reLaunch({
						// 	url: 'index?from=processing',
						// 	success: function (res) { },
						// 	fail: function (res) { },
						// 	complete: function (res) { },
						// })

						

						// that.setData({
						// 	selection_after_lock: true,
						// });

						wx.hideLoading();



					},
					() => {
						wx.hideLoading();


					}
				);

				
			}
			

			
		}

  },

	unlockCB: function (progress) {
		var that = this;
		var progress = progress.toString();
		console.log("unlock progress", progress + "%");
		if (progress < 100) {
			that.setData({
				percent: progress,
			});
		}

		if (progress == 100) {
			// wx.navigateBack({
			// 	delta: 1,
			// })
		}

	},

	unlockFailCB: function (errCode) {
		console.log("unlock failed ", errCode);
		var that = this;
		console.log('unlock fail !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
		that.data.unlockFailTimes = that.data.unlockFailTimes + 1;
		wx.setStorageSync(wx.getStorageSync('unlockingQR'), 'unlock_fail');
		
	},

	lockCB: function () {
		wx.showToast({
			title: '已关锁',
			icon: '',
			image: '',
			duration: 2000,
			mask: true,
			success: function(res) {},
			fail: function(res) {},
			complete: function(res) {},
		});
	},

	toCharge: function (e) {
		this.setData({
			notify_arrearage: false,
		});
		wx.redirectTo({
			url: '../wallet/charge',
			success: function (res) { },
			fail: function (res) { },
			complete: function (res) { },
		})
	},

	lockToPay: function (e) {
		
		this.data.payFormId = e.detail.formId;
		wx.showLoading({
			title: '计费中',
			mask: true,
			success: function(res) {},
			fail: function(res) {},
			complete: function(res) {},
		});
		lockToPay(this);
	},
	lockToHold: function (e) {


		lockToHold(this);
	},

	selectHoldTime: function (res) {
		var appointmentTime = res.currentTarget.dataset.appointment_time;
		wx.showLoading({
			title: '请稍候',
			mask: true,
			success: function(res) {},
			fail: function(res) {},
			complete: function(res) {},
		})
		selectHoldTime(appointmentTime, this,
			()=>{
				
				wx.reLaunch({
					url: 'index?from=processing',
					success: function(res) {},
					fail: function(res) {},
					complete: function(res) {},
				})
			}
		);

	},

	confirmBill: function (e) {
		
		// this.setData({
		// 	notify_bill: false,
		// });
		
		wx.reLaunch({
			url: 'index?from=processing',
			success: function (res) { },
			fail: function (res) { },
			complete: function (res) { },
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

		// wx.closeBluetoothAdapter({
		// 	success: function(res) {},
		// 	fail: function(res) {},
		// 	complete: function(res) {},
		// })
		
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


function lockToPay(the) {

	

	var that = the;
	operation.computeFee(
		wx.getStorageSync(user.CustomerID),
		wx.getStorageSync(user.UsingCar),
		wx.getStorageSync(user.RecordID),
		that.data.payFormId,
		(result) => {
			wx.hideLoading();

			// wx.showModal({
			// 	title: '',
			// 	content: JSON.stringify(result.data),
			// 	showCancel: true,
			// 	cancelText: '',
			// 	cancelColor: '',
			// 	confirmText: '',
			// 	confirmColor: '',
			// 	success: function(res) {},
			// 	fail: function(res) {},
			// 	complete: function(res) {},
			// })


			that.setData({
				selection_after_lock: false,
				select_hold_time: false,
				notify_bill: true,
				price: result.data.price,
				duration: result.data.time,
			});
			

		},
		()=>{
			wx.hideLoading();
		}
	);
}

function lockToHold(the) {

	

	the.setData({
		selection_after_lock: false,
		select_hold_time: true,
	});
}

function selectHoldTime(appointmentTime, the, success, fail) {

	
	var that = the;
	operation.hold(
		wx.getStorageSync(user.CustomerID),
		wx.getStorageSync(user.UsingCar),
		appointmentTime,
		wx.getStorageSync(user.RecordID),
		(result) => {
			
			that.setData({
				selection_after_lock: false,
				select_hold_time: false,
			});
			wx.hideLoading();
			typeof success == "function" && success(result);
		
		},
		()=>{
			wx.hideLoading();
		}
	);

}