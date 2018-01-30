
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
			that.setData({
				unlock_progress: true,
			});			


			
			operation.unlock(
				that,
				wx.getStorageSync(user.CustomerID),
				that.data.carId,
				(result)=>{

					// if(wx.getStorageSync('DeviceID') != null)
					// {
					// 	setTimeout(
					// 		function(){
					// 			wx.navigateBack({
					// 				delta: 1,
					// 			})
					// 		},
					// 		1000*5
					// 	);
					// }
				},
				()=>{
					wx.navigateBack({
						delta: 1,
					})
				}
			);
								


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

						wx.reLaunch({
							url: 'index?from=processing',
							success: function (res) { },
							fail: function (res) { },
							complete: function (res) { },
						})

						

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

		wx.closeBluetoothAdapter({
			success: function(res) {},
			fail: function(res) {},
			complete: function(res) {},
		})
		
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