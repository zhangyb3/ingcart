
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var util = require("../../utils/util.js");


Page({

  /**
   * 页面的初始数据
   */
  data: {

    list_mode: 'history_record',
    list_type: 'history_record',
    history_record: {},
    history_date: [],
		pageNum: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    wx.setNavigationBarTitle({
      title: '历史行程'
    });

    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          scrollHeight: res.windowHeight,
          show_cancel_button: this.data.show_cancel_button
        });
      }
    });
  
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
			url: config.PytheRestfulServerURL + '/user/trip',
			data: {
				customerId: wx.getStorageSync(user.CustomerID),
				pageNum: 1,
				pageSize: 10,
			},
			method: 'GET',
			success: function(res) {
				if(res.data.status == 200)
				{
					var returnData = res.data.data;
					handleReturnData(that, returnData);
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
		var that = this;
		that.data.pageNum = that.data.pageNum + 1;

		wx.request({
			url: config.PytheRestfulServerURL + '/user/trip',
			data: {
				customerId: wx.getStorageSync(user.CustomerID),
				pageNum: that.data.pageNum,
				pageSize: 10,
			},
			method: 'GET',
			success: function(res) {
				if(res.data.status == 200)
				{
					var returnData = res.data.data;

					if (returnData.historyDate.length == 0)
					{
						that.data.pageNum = that.data.pageNum - 1;
					}
					else{
						handleReturnData(that, returnData);
					}
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


function handleReturnData(the, currentDatas) 
{
	var that = the;
	var concatDatas = {};
	
	//第一次加载或者刚好每日数据切割与分页吻合
	if (that.data.history_date.length == 0 || that.data.history_date[that.data.history_date.length - 1] != currentDatas.historyDate[0]) {
		that.data.history_date = that.data.history_date.concat(currentDatas.historyDate);
		
		for (var count = 0; count < currentDatas.historyDate.length; count++) {
			var key = currentDatas.historyDate[count];
			var temp = currentDatas.record[key];
			console.log(temp);
			that.data.history_record[key] = temp;

			concatDatas[count] = temp;
		}

	}
	else {
		//拼接相同日期的纪录
		var originalDateLength = that.data.history_date.length;
		var duplicateDate = currentDatas.historyDate.shift();
		that.data.history_date = that.data.history_date.concat(currentDatas.historyDate);
		var restRecord = currentDatas.record[duplicateDate];
		Array.prototype.push.apply(that.data.history_record[duplicateDate], restRecord);
		// Array.prototype.push.apply(that.data.history_record[originalDateLength - 1], restRecord);
		for (var count = 0; count < currentDatas.historyDate.length; count++) {
			var key = currentDatas.historyDate[count];
			var temp = currentDatas.record[key];
			console.log(temp);
			that.data.history_record[key] = temp;

			concatDatas[count] = temp;
		}
	}
	console.log('concatDatas',concatDatas);
	// that.data.history_record = that.data.history_record.concat(concatDatas);
	console.log('before setData----------' + that.data.history_date);
	that.setData({
		history_record: that.data.history_record,
		history_date: that.data.history_date,
	});

}