
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var login = require("../../utils/login.js");
var operation = require("../../utils/operation.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
		unlock_progress: false,
		fromPage: null,
		operation: null,
		carId: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (parameters) {
		console.log(parameters);
		this.data.fromPage = parameters.from;
		this.data.operation = parameters.operation;
		this.data.carId = parameters.carId;
		
		
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
			that.setData({
				unlock_progress: true,
			});					

			operation.unlock(
				that,
				wx.getStorageSync(user.CustomerID),
				that.data.carId,
				(result)=>{

					

				},
			);
								


		}

		//从外部扫描进来
		if (this.data.operation == 'unlock' && this.data.fromPage == 'weixin')
		{
			console.log('from weixin');
			var that = this;
			operation.loginSystem(
				this,
				()=>{
					//登录成功去开锁
					operation.unlock(
						that,
						wx.getStorageSync(user.CustomerID),
						that.data.carId,
						(result) => {



						},
					);
				},
				()=>{
					//分情况，从外部扫码进来就转接，内部扫码进来就返回上一页
					// if(that.data.fromPage == 'index')
					// {
					// 	wx.navigateBack({
					// 		delta: 1,
					// 	})
					// }
					// else
					{
						wx.redirectTo({
							url: 'index',
							success: function (res) { },
							fail: function (res) { },
							complete: function (res) { },
						});
					}

				}
			);

		}

		//检测到关锁
		if (this.data.operation == 'lock')
		{
			wx.showLoading({
				title: '关锁中···',
				mask: true,
			})
			var that = this;
			operation.lock(
				wx.getStorageSync(user.CustomerID),
				wx.getStorageSync(user.UsingCar),
				wx.getStorageSync(user.RecordID),
				(result) => {
					console.log(result);

					that.setData({
						selection_after_lock: true,
					});

					wx.hideLoading();

					var closeDevice;
					if (wx.getStorageSync('platform') == 'ios')
					{
						closeDevice = wx.getStorageSync('DeviceID');
					}
					else
					{
						closeDevice = wx.getStorageSync(user.UsingCar);
					}
					wx.closeBLEConnection({
						deviceId: closeDevice,
						success: function (res) {
							wx.setStorageSync('ServiceId', null);
							wx.setStorageSync('characteristicIdToRead', null);
							wx.setStorageSync('characteristicIdToWrite', null);
						 },
						fail: function (res) { },
						complete: function (res) { },
					})
				},
				() => {
					wx.hideLoading();

					var closeDevice;
					if (wx.getStorageSync('platform') == 'ios') {
						closeDevice = wx.getStorageSync('DeviceID');
					}
					else {
						closeDevice = wx.getStorageSync(user.UsingCar);
					}
					wx.closeBLEConnection({
						deviceId: closeDevice,
						success: function (res) { 
							wx.setStorageSync('ServiceId', null);
							wx.setStorageSync('characteristicIdToRead', null);
							wx.setStorageSync('characteristicIdToWrite', null);
						},
						fail: function (res) { },
						complete: function (res) { },
					})
				}
			);
		}

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
			title: '请稍候',
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
		selectHoldTime(appointmentTime, this);

	},

	confirmBill: function (e) {
		
		{
			wx.navigateBack({
				delta: 1,
			})
			// wx.redirectTo({
			// 	url: '/pages/index/index?from=processing',
			// 	success: function (res) { },
			// 	fail: function (res) { },
			// 	complete: function (res) { },
			// })
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


function lockToPay(the) {

	var that = the;
	operation.computeFee(
		wx.getStorageSync(user.CustomerID),
		wx.getStorageSync(user.UsingCar),
		wx.getStorageSync(user.RecordID),
		that.data.payFormId,
		(result) => {
			console.log("compute fee: " + result.data);
			that.setData({
				selection_after_lock: false,
				select_hold_time: false,
				notify_bill: true,
				price: result.data.price,
				duration: result.data.time,
			});
			wx.hideLoading();
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

function selectHoldTime(appointmentTime, the) {

	
	var that = the;
	operation.hold(
		wx.getStorageSync(user.CustomerID),
		wx.getStorageSync(user.UsingCar),
		appointmentTime,
		wx.getStorageSync(user.RecordID),
		(result) => {
			console.log("select hold time: " + result.data);
			that.setData({
				holding: true,
				selection_after_lock: false,
				select_hold_time: false,
				mapHeight: wx.getStorageSync('windowHeight') - 80,
			});
			wx.hideLoading();
			
			{
				wx.navigateBack({
					delta: 1,
				})
				// wx.redirectTo({
				// 	url: '/pages/index/index?from=processing',
				// 	success: function (res) { },
				// 	fail: function (res) { },
				// 	complete: function (res) { },
				// });
			}
		
		},
		()=>{
			wx.hideLoading();
		}
	);

}