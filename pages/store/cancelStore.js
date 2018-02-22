
var util = require('../../utils/util.js');
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");

Page({

  /**
   * 页面的初始数据
   */
	data: {
		storeCode: null,
		storeName: '',
		cargoMargin: '',
		commitNotAllowed: true,
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



	getStoreCode: function (e) {
		var that = this;
		that.setData({
			storeCode: e.detail.value,
		});
		if (that.data.storeCode.length > 6) {
			wx.request({
				url: config.PytheRestfulServerURL + '/select/store/bag',
				data: {
					code: that.data.storeCode
				},
				method: 'GET',
				success: function (res) {
					var storeDetail = res.data.data;
					if (storeDetail != null) {
						that.setData({
							cargoMargin: storeDetail.bagNum,
							storeName: storeDetail.name,
							locationName: storeDetail.locationName,
							commitNotAllowed: false,
						});
					}
					else {
						that.setData({
							storeName: '找不到该店铺',
							commitNotAllowed: true,
						});
					}
				},
				fail: function (res) { },
				complete: function (res) {
					if (that.data.storeName.length > 0 && that.data.storeName != '找不到该店铺' && that.data.supplyNum > 0 && that.data.supplyNum < 1000) {
						that.setData({
							commitNotAllowed: false,
						});
					}
				},
			})
		}

	},

	managerCancelStore:function(e){
		var that = this;
		wx.showModal({
			title: '提示',
			content: '确定删除该店铺？',
			// showCancel: true,
			// cancelText: '取消',
			// cancelColor: '',
			// confirmText: '确定',
			// confirmColor: '',
			success: function(res) {
				if (res.confirm) {
					wx.request({
						url: config.PytheRestfulServerURL + '/delete/store',
						data: {
							code: that.data.storeCode
						},
						method: 'GET',
						success: function (res) {
							if (res.data.status == 200) {
								wx.showToast({
									title: '删除成功',
									icon: '',
									image: '',
									duration: 2000,
									mask: true,
									success: function (res) { },
									fail: function (res) { },
									complete: function (res) { 
										wx.navigateBack({
											delta: 1,
										})
									},
								})
							}
							if (res.data.status == 400) {
								wx.showModal({
									title: '提示',
									content: res.data.msg,
									showCancel: false,
									confirmText: '我知道了',
									confirmColor: '',
									success: function (res) { },
									fail: function (res) { },
									complete: function (res) { },
								})
							}
						},
						fail: function (res) { },
						complete: function (res) { },
					})
				}
				
			},
			
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