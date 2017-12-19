
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");

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
			//更新状态
			// wx.getLocation({
			// 	type: 'gcj02',
			// 	success: function (res) {
					
			// 		wx.request({
			// 			url: operation.UNLOCK_URL,
			// 			data: {
			// 				customerId: wx.getStorageSync(user.CustomerID),
			// 				carId: that.data.carId,
			// 				latitude: res.latitude,
			// 				longitude: res.longitude
			// 			},
			// 			method: 'POST',
			// 			success: function (res) {
			// 				var result = res.data;
			// 				if (result.status == 200) {

								

								operation.unlock(
									that,
									wx.getStorageSync(user.CustomerID),
									that.data.carId,
									(result)=>{

										

									},
								);
								
			// 				}
			// 				else {
			// 					if (result.status == 300) {
			// 						that_.setData({
			// 							notify_arrearage: true,
			// 							arrearage_amount: result.data,
			// 						});
			// 					}
			// 					else {
			// 						that_.setData({
			// 							unlock_progress: false,
			// 							unlock_status: true,
			// 							unlock_status_image: '/images/unlock_' + result.status + '.png',
			// 						});
			// 					}

			// 				}


			// 			},
			// 			fail: function (res) {
			// 				typeof fail == "function" && fail(res);
			// 			}
			// 		});
			// 	}
			// });

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
					wx.closeBLEConnection({
						deviceId: wx.getStorageSync(user.UsingCar),
						success: function (res) { },
						fail: function (res) { },
						complete: function (res) { },
					})
				},
				() => {
					wx.hideLoading();
					wx.closeBLEConnection({
						deviceId: '',
						success: function (res) { },
						fail: function (res) { },
						complete: function (res) { },
					})
				}
			);
		}

  },

	lockToPay: function (e) {
		this.data.payFormId = e.detail.formId;
		lockToPay(this);
	},
	lockToHold: function (e) {
		lockToHold(this);
	},

	selectHoldTime: function (res) {
		var appointmentTime = res.currentTarget.dataset.appointment_time;

		selectHoldTime(appointmentTime, this);

	},

	confirmBill: function (e) {
		this.setData({
			notify_bill: false,
		});
		wx.navigateTo({
			url: '/pages/index/index?from=processing',
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
			
			wx.navigateTo({
				url: '/pages/index/index?from=processing',
				success: function (res) { },
				fail: function (res) { },
				complete: function (res) { },
			})
		}
	);

}