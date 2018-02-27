
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
		deviceHeight: 0,
		pageNum: 1,
		callRepairList:[],
		visibleArray:[],

		notesHeight: [],
		notesHeight2: [],
		foldTxt: [],
		param: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		this.getDevice();
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
			url: config.PytheRestfulServerURL + '/select/maintenance/condition',
			data: {

				pageNum: 1,
				pageSize: 10,
			},
			method: 'GET',
			success: function(res) {
				
				if(res.data.status == 200)
				{
					that.setData({
						callRepairList: res.data.data,
					});
					that.fold();

					for (var count = 0; count < that.data.callRepairList.length; count++)
					{
						that.data.visibleArray[count] = true;
					}
					that.setData({
						visibleArray: that.data.visibleArray,
					});
				}
			},
			fail: function(res) {},
			complete: function(res) {},
		})
  },

	fold: function () {
		var that = this;
		var notesHeight = [];
		var notesHeight2 = [];
		var foldTxt = [];
		var param = [];
		for (var i = 0; i < that.data.callRepairList.length; i++) {
			notesHeight[i] = "max-height:80rpx;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;";
			notesHeight2[i] = "max-height:114rpx;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;";
			foldTxt[i] = '展开';
			param[i] = 1
		};

		that.setData({
			notesHeight: notesHeight,
			notesHeight2: notesHeight2,
			foldTxt: foldTxt,
			param: param
		});
		console.log(notesHeight)
	},

	foldMore: function (e) {
		// console.log(e.target.dataset.fold);
		// console.log(e.target.dataset.param);
		var that = this;
		var param = that.data.param;
		var fold = e.target.dataset.fold;
		var notesHeight = that.data.notesHeight;
		var notesHeight2 = that.data.notesHeight2;
		var foldTxt = that.data.foldTxt;
		if (param[e.target.dataset.fold] == 1) {
			param[e.target.dataset.fold] = 0;
			notesHeight[fold] = "max-height:auto;text-align:justify;";
			notesHeight2[fold] = "max-height:auto;text-align:justify;";
			foldTxt[fold] = '收起';
			that.setData({
				notesHeight: notesHeight,  //高度
				notesHeight2: notesHeight2,  //高度
				foldTxt: foldTxt,          //展开 收起
				param: param               //data-param
			})
		} else if (param[e.target.dataset.fold] == 0) {
			param[e.target.dataset.fold] = 1;
			notesHeight[fold] = "max-height:80rpx;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;";
			notesHeight2[fold] = "max-height:114rpx;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;";
			foldTxt[fold] = '展开';
			that.setData({
				notesHeight: notesHeight,  //高度
				notesHeight2: notesHeight2,  //高度
				foldTxt: foldTxt,          //展开 收起
				param: param               //data-param
			})
		}

	},

	findTargetOnMap:function(e){
		var dataset = e.currentTarget.dataset;
		
		var cart = dataset.cart;
		var notRedirect = dataset.not_redirect;
		if(!notRedirect){
			wx.openLocation({
				latitude: cart.latitude, // 纬度，范围为-90~90，负数表示南纬
				longitude: cart.longitude, // 经度，范围为-180~180，负数表示西经
				scale: 28, // 缩放比例
				success: function (res) {
					// success
				},
				fail: function (res) {
					// fail
				},
				complete: function (res) {
					// complete
				}
			})
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
		
		var that = this;
		that.data.pageNum = that.data.pageNum + 1;


		wx.request({
			url: config.PytheRestfulServerURL + '/select/maintenance/condition',
			data: {

				pageNum: that.data.pageNum,
				pageSize: 10,
			},
			method: 'GET',
			success: function (res) {
				if (res.data.status == 200) {
					var result = res.data.data;


					if (result == null) {
						that.data.pageNum = that.data.pageNum - 1;
					}
					else {
						that.data.callRepairList = that.data.callRepairList.concat(result);
						that.setData({
							callRepairList: that.data.callRepairList,

						});
						that.fold();

						var tempVisibleArray = [];
						for(var count = 0 ; count < result.length; count++)
						{
							tempVisibleArray[count] = true;
						}
						that.data.visibleArray = that.data.visibleArray.concat(tempVisibleArray);
						that.setData({
							visibleArray: that.data.visibleArray,
						});
					}

				}
				else{
					that.data.pageNum = that.data.pageNum - 1;
				}
			}
		});
		
  },

	alreadyFindTarget:function(e){
		var that = this;
		var index = e.currentTarget.dataset.index;
		wx.showModal({
			title: '提示',
			content: '是否已找到报修车辆？',
			success: function(res) {
				if(res.confirm){
					that.data.visibleArray[index] = false;
					that.setData({
						visibleArray: that.data.visibleArray,
					});
				}
			},
			fail: function(res) {},
			complete: function(res) {},
		})

	},


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})