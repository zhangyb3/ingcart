
var register = require("../../utils/register.js");
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var login = require("../../utils/login.js");
// var JSEncrypt = require("../../utils/jsencrypt.js");
var operation = require("../../utils/operation.js");

Page({

 
  data: {
		qrId:null,
		carts:[],

		winHeight: 0,
		chooseCityName:'none',
		chooseZoneName: 'none',

		cities:[],
		zones:[],
		selectedZone: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		var that = this;
		wx.getSystemInfo({
			success: function (res) {
				var date = new Date();
				that.setData({
					winHeight: res.windowHeight,
					
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
		wx.request({
			url: config.PytheRestfulServerURL + '/select/all/city',
			data: {
				
			},
			method: 'GET',
			success: function(res) {
				if(res.data.status == 200)
				{
					var cities = res.data.data;
					that.setData({
						cities: cities,
					});
				}
			},
			fail: function(res) {},
			complete: function(res) {},
		})
  },

	// 输入单车编号
	carIdInput: function (e) {
		this.setData({

			qrId: e.detail.value,
		})
	},

	//扫描车牌
	scanCar: function (e) {
		var that = this;
		wx.scanCode({
			onlyFromCamera: true,
			success: function (res) {
				console.log(res);
				if (res.errMsg == 'scanCode:ok') {
					var parameters = operation.urlProcess(res.result);

					that.data.qrId = parameters.id;
					that.setData({
						qrId: parameters.id,
					})
				}
			},
			fail: function (res) { },
			complete: function (res) { },
		});
	},

	//录入定点车辆
	recordCarInPosition:function(e){
		var that = this;
		if(that.data.qrId == null)
		{
			wx.showModal({
				title: '提示',
				content: '尚未输入车号',
				showCancel: true,
				cancelText: '',
				cancelColor: '',
				confirmText: '',
				confirmColor: '',
				success: function(res) {},
				fail: function(res) {},
				complete: function(res) {},
			})
		}
		else
		{
			wx.request({
				url: config.PytheRestfulServerURL + '/update/car/point/',
				data: {
					qrId: that.data.qrId,
					areaId: that.data.selectedZone.id,
				},
				method: 'POST',
				success: function(res) {
					if(res.data.status == 200)
					{
						wx.showToast({
							title: '已录入',
							icon: '',
							image: '',
							duration: 1500,
							mask: true,
							success: function(res) {},
							fail: function(res) {},
							complete: function(res) {},
						});

						that.data.carts.unshift(that.data.qrId);
						that.setData({
							carts: that.data.carts,
						});
					}
					else {
						wx.showModal({
							title: '提示',
							content: res.data.msg,
							showCancel:false,
							confirmText: '我知道了',
							confirmColor: '',
							success: function (res) { },
							fail: function (res) { },
							complete: function (res) { },
						})
					}
				},
				fail: function(res) {},
				complete: function(res) {},
			})
		}

	},

	//删除录入
	unrecordCarInPosition:function(e){
		var that = this;
		var qrId = e.currentTarget.dataset.cart;
		var index = e.currentTarget.dataset.index;
		wx.showModal({
			title: '提示',
			content: '是否取消该定点车辆？',
			success: function(res) {
				if(res.confirm)
				{
					wx.request({
						url: config.PytheRestfulServerURL + '/delete/car/point/',
						data: {
							qrId: qrId,
							areaId: that.data.selectedZone.id,
						},
						method: 'POST',
						success: function(res) {
							if(res.data.status == 200)
							{
								that.data.carts.splice(index, 1);
							}
							else {
								wx.showModal({
									title: '提示',
									content: res.data.msg,
									showCancel:false,
									confirmText: '我知道了',
									confirmColor: '',
									success: function (res) { },
									fail: function (res) { },
									complete: function (res) { },
								})
							}
							that.setData({
								carts: that.data.carts,
							});
						},
						fail: function(res) {},
						complete: function(res) {},
					})
				}
				
			},
			fail: function(res) {},
			complete: function(res) {},
		})
	},


	//  点击选择城市的框
	chooseCityName: function (e) {
		var that = this;
		that.setData({
			chooseCityName: 'block'
		})
	},

	//  点击选择景区的框
	chooseZoneName: function (e) {
		var that = this;
		that.setData({
			chooseZoneName: 'block'
		})
	},

	changeCity: function (e) {
		
		console.log("city",e);
		var that = this;
		
		
			that.setData({
				tempCityName: that.data.cities[e.detail.value[0]].city,
			})
		
		
	},

	changeZone: function (e) {

		console.log("zone", e);
		var that = this;
		
		
			that.setData({
				tempZone: that.data.zones[e.detail.value[0]],
			})
		
		
	},

	//  取消按钮
	close: function () {
		var that = this;
		that.setData({
			chooseCityName: 'none',
			chooseZoneName: 'none',
		})
	},

	// 确定按钮
	sureCity: function (e) {
		console.log("city", e);
		var that = this;
		if (that.data.cities.length == 1) {
			that.setData({
				tempCityName: that.data.cities[0].city,
			})
		}
		that.setData({
			chooseCityName: 'none',
			cityName: that.data.tempCityName,
			zones: [],
		});

		wx.request({
			url: config.PytheRestfulServerURL + '/select/all/area',
			data: {
				city: that.data.cityName,
				pageNum: 1,
				pageSize: 10,
			},
			method: 'GET',
			success: function(res) {
				if(res.data.status == 200)
				{
					that.data.zones = res.data.data;
					that.setData({
						zones: that.data.zones,
					});
				}
			},
			fail: function(res) {},
			complete: function(res) {},
		})
	},

	// 确定按钮
	sureZone: function (e) {
		console.log("zone", e);
		var that = this;
		if (that.data.zones.length == 1) {
			that.setData({
				tempZone: that.data.zones[0],
			})
		}
		that.setData({
			chooseZoneName: 'none',
			zoneName: that.data.tempZone.name,
			selectedZone: that.data.tempZone
		});

		var carts = JSON.parse(that.data.selectedZone.carIds);
		that.setData({
			carts: carts,
		});
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