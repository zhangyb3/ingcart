
var register = require("../../utils/register.js");
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var login = require("../../utils/login.js");
// var JSEncrypt = require("../../utils/jsencrypt.js");
var operation = require("../../utils/operation.js");
var pay = require("../../utils/pay.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
		qrIdFromWX:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (parameters) {
		var that = this;

		that.data.unlockQR = parameters.unlock;
		that.data.backFrom = 'payToUse';

		that.data.qrIdFromWX = operation.urlProcess(decodeURIComponent(parameters.q)).id;

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

		if (that.data.unlockQR != null && that.data.backFrom == 'payToUse') {
			that.data.backFrom = null;
			var originalAmount = wx.getStorageSync(user.Amount);
			// wx.showLoading({
			// 	title: '准备开锁...',
			// 	mask: true,
			// 	success: function (res) { },
			// 	fail: function (res) { },
			// 	complete: function (res) { },
			// })

			var checkAmountIntervalId = setInterval(
				function () {
					wx.request({
						url: config.PytheRestfulServerURL + '/customer/select',
						data: {
							customerId: wx.getStorageSync(user.CustomerID)
						},
						method: 'GET',
						dataType: '',
						success: function (res) {
							console.log(res);
							var info = res.data.data;
							that.data.account = info;
							that.setData({
								amount: info.amount,
								pStatus: info.pStatus,
							});
							//充值到账
							if (info.amount > originalAmount) {
                
								clearInterval(checkAmountIntervalId);
								var qrId = that.data.unlockQR;

								//去开锁
								operation.qr2mac(qrId,
									(result) => {

										var carId = result.id;
										var customerId = wx.getStorageSync(user.CustomerID);
										var recordId = wx.getStorageSync(user.RecordID);


										if (wx.getStorageSync('platform') == 'ios') {
											//据说每次都要先关闭再打开适配器清理缓存,试一下
											wx.closeBluetoothAdapter({
												success: function (res) {

													wx.openBluetoothAdapter({
														success: function (res) {

															//开锁
															wx.startBluetoothDevicesDiscovery({
																services: ['FEE7'],
																allowDuplicatesKey: true,
																interval: 0,
																success: function (res) {


																},
																fail: function (res) {

																},
																complete: function (res) {

																},
															});

															setTimeout(
																function () {
																	wx.hideLoading();
																	that.data.unlockQR = null;
																	wx.navigateTo({
																		url: 'processing?from=index&carId=' + carId + '&qrId=' + qrId + '&operation=unlock',
																		success: function (res) { },
																		fail: function (res) {

																		},
																		complete: function (res) { },
																	});
																},
																100
															);

														},
														fail: function (res) {

														},
														complete: function (res) { },
													});

												},
												fail: function (res) {

												},
												complete: function (res) {
												},
											})


										}
										else {
											//android版开锁
											wx.closeBluetoothAdapter({
												success: function (res) {

													wx.openBluetoothAdapter({
														success: function (res) {
															wx.hideLoading();
															that.data.unlockQR = null;
															wx.navigateTo({
																url: 'processing?from=index&carId=' + carId + '&qrId=' + qrId + '&operation=unlock',
																success: function (res) { },
																fail: function (res) {

																},
																complete: function (res) { },
															});

														},
														fail: function (res) { },
														complete: function (res) { },
													})
												},
												fail: function (res) { },
												complete: function (res) { },
											})

										}

									},
									(result) => {
										wx.showModal({
											title: '',
											content: result,
											showCancel: false,
											confirmText: '我知道了',
										})
									}
								);

							}
						},
						fail: function (res) { },
						complete: function (res) { },
					})
				},
				1000
			);




		}	

		if (that.data.qrIdFromWX != null){
			
			wx.redirectTo({
				url: 'index?unlock=' + that.data.qrIdFromWX + '&from=outside',
				success: function(res) {},
				fail: function(res) {},
				complete: function(res) {},
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