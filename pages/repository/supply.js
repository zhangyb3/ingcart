
var util = require('../../utils/util.js');
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
		storeCode:null,
		storeName:'',
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
							locationName: storeDetail.locationName
						});
					}
					else{
						that.setData({
							storeName: '找不到该店铺',
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

	getSupplyNum:function(e){
		var that = this;
		that.setData({
			supplyNum: e.detail.value,
		});
		if(e.detail.value < 0 || e.detail.value > 999)
		{
			that.setData({
				commitNotAllowed: true,
			});
			wx.showModal({
				title: '提示',
				content: '输入数量不合标准',
				showCancel: false,
				confirmText: '我知道了',
				confirmColor: '',
				success: function(res) {},
				fail: function(res) {},
				complete: function(res) {
					
				},
			})
			
		}
		else{
			if (that.data.storeName.length > 0 && that.data.storeName != '找不到该店铺' ) {
				that.setData({
					commitNotAllowed: false,
				});
			}
		}
	},

	managerRecordSupply:function(e){
		var that = this;
		wx.request({
			url: config.PytheRestfulServerURL + '/update/store/goods/',
			data: {
				location_name: that.data.locationName,
				bag_num: that.data.supplyNum,
				openId: wx.getStorageSync(user.OpenID),
				dealer: wx.getStorageSync(user.PhoneNum)
			},
			method: 'POST',
			success: function(res) {
				console.log(res);
				if(res.data.status == 200)
				{
					that.setData({
						cargoMargin: res.data.data.total_bag_num
					});
					wx.showToast({
						title: '补仓成功',
						icon: '',
						image: '',
						duration: 1000,
						mask: true,
						success: function(res) {},
						fail: function(res) {},
						complete: function(res) {},
					})
					setTimeout(function () { 
							wx.navigateBack({
								delta: 1,
							})
						}, 
						1000
					);
				}
				else{
					wx.showModal({
						title: '提示',
						content: res.data.msg,
						showCancel: false,
						confirmText: '我知道了',
						confirmColor: '',
						success: function(res) {},
						fail: function(res) {},
						complete: function(res) {},
					})
				}
			},
			fail: function(res) {},
			complete: function(res) {},
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