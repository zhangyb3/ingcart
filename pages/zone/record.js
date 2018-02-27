
var util = require('../../utils/util.js');
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
		cityName:null,
		operationZoneName:null,
		chooseLevel: 'none',
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
			url: config.PytheRestfulServerURL + '/select/level',
			data: {
				
			},
			method: 'GET',
			success: function(res) {
				if(res.data.status == 200)
				{
					that.setData({
						levels: res.data.data
					});
				}
			},
			fail: function(res) {},
			complete: function(res) {},
		})
  },


	getCityName:function(e){
		var that = this;
		that.data.cityName = e.detail.value;
		console.log('cityName',that.data.cityName);
	},

	getOperationZoneName: function (e) {
		var that = this;
		that.data.operationZoneName = e.detail.value;
		console.log('operationZoneName', that.data.operationZoneName);
	},

	managerRecordOperationZone:function(){
		var that = this;
		if(that.data.cityName != null && that.data.operationZoneName != null)
		{
			wx.request({
				url: config.PytheRestfulServerURL + '/insert/attraction/',
				data: {
					city: that.data.cityName,
					name: that.data.operationZoneName,
					level: that.data.zoneType,
				},
				method: 'POST',
				success: function(res) {
					if(res.data.status == 200)
					{
						wx.showToast({
							title: res.data.data,
							icon: '',
							image: '',
							duration: 2000,
							mask: true,
							success: function(res) {},
							fail: function(res) {},
							complete: function(res) {},
						});

					}
				},
				fail: function(res) {},
				complete: function(res) {},
			})
		}
	},

	chooseZoneType: function (e) {
		var that = this;
		that.setData({
			chooseLevel: 'block'
		})
	},

	changeLevel: function (e) {

		
		var that = this;

		that.setData({
			tempLevel: that.data.levels[e.detail.value[0]].level,
		})


	},

	//  取消按钮
	close: function () {
		var that = this;
		that.setData({
			chooseLevel: 'none',
			
		})
	},

	// 确定按钮
	sureLevel: function (e) {
		console.log("level", e);
		var that = this;
		if (that.data.levels.length == 1) {
			that.setData({
				tempLevel: that.data.levels[0].level,
			})
		}
		that.setData({
			chooseLevel: 'none',
			zoneType: that.data.tempLevel,
			
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