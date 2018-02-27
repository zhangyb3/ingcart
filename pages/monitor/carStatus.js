
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
		deviceHeight: 0,
		pageNum: 1,
		carStatusList:[],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		this.getDevice();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

	// 获取用户设备信息
	getDevice: function () {
		var that = this;
		wx.getSystemInfo({
			success: function (res) {
				that.setData({
					deviceHeight: res.windowHeight
				})
			}
		})
	},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

		var that = this;
		wx.request({
			url: config.PytheRestfulServerURL + '/count/car/condition',
			data: {
				
				pageNum: 1,
				pageSize: 10,
			},
			method: 'GET',
			success: function (res) {
				if(res.data.status == 200)
				{
					var result = res.data.data;
					that.setData({
						carMargin: result.size,
					});

					that.setData({
						carStatusList: result.user,
					});
					
				}
			}
		});
  },

  
  

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
		

  },

  getMoreCarStatus:function(){
		var that = this;
		that.data.pageNum = that.data.pageNum + 1;


		wx.request({
			url: config.PytheRestfulServerURL + '/count/car/condition',
			data: {

				pageNum: that.data.pageNum,
				pageSize: 10,
			},
			method: 'GET',
			success: function (res) {
				if (res.data.status == 200) {
					var result = res.data.data;
				

					if(result.user == null){
						that.data.pageNum = that.data.pageNum -1;
					}
					else{
						that.data.carStatusList = that.data.carStatusList.concat(result.user);
						that.setData({
							carStatusList: that.data.carStatusList,
							carMargin: result.size,
						});
					}
					
				}
			}
		});
	},


})