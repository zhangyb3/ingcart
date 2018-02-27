
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var util = require("../../utils/util.js");
var operation = require("../../utils/operation.js");

Page({
  data:{

    account:{
      amount: 0,

    },

    cardQuantity: 0,
  },
// 页面加载
  onLoad:function(){
    // 设置本页导航标题
    wx.setNavigationBarTitle({
      title: '个人中心'
    })

		
   
  },

  onShow:function(){

		
    var that = this;
    wx.request({
      url: config.PytheRestfulServerURL + '/customer/select',
      data: {
        customerId: wx.getStorageSync(user.CustomerID)
      },
      method: 'GET',
      dataType: '',
      success: function(res) {
        console.log(res);
        var info = res.data.data;
        that.data.account = info;

        wx.setStorageSync(user.CustomerID, info.customerId);
        wx.setStorageSync(user.Description, info.description);
        wx.setStorageSync(user.Status, info.status);
        wx.setStorageSync(user.UsingCar, info.carId);
        wx.setStorageSync(user.RecordID, info.recordId);
        wx.setStorageSync(user.UsingCarStatus, info.carStatus);
      },
      fail: function(res) {},
      complete: function(res) {

        var showPhoneNum = util.replaceStr(that.data.account.phoneNum,3,7,"····");
        console.log(showPhoneNum);
        that.setData({
          avatarUrl: wx.getStorageSync("avatarUrl"),
          wxNickName: wx.getStorageSync("wxNickName"),
          showPhoneNum: showPhoneNum,
          account: that.data.account,
          cardQuantity: that.data.cardQuantity,
        });
      },
    })

    

  },


// 跳转至钱包
  toWallet: function(){
    wx.navigateTo({
      url: '../wallet/charge'
    })
  },

  // 跳转至卡券页面
  toCard: function () {
    wx.showModal({
      title: '',
      content: '尚未开通卡券功能',
      showCancel: true,
      cancelText: '',
      cancelColor: '',
      confirmText: '确定',
      confirmColor: '',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  toHistory: function() {
    wx.navigateTo({
      url: 'history',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

	toRecordRepair: function () {
		wx.navigateTo({
			url: 'record_repair'
		})
	},

  stopFee:function(){
    wx.navigateTo({
      url: '../stopFee/stopFee',
    })
  },

  storeInfo: function () {
    wx.navigateTo({
      url: '../store/storeInfo',
    })
  },

	cancelStore: function () {
		wx.navigateTo({
			url: '../store/cancelStore',
		})
	},

	repositorySupply: function () {
		wx.navigateTo({
			url: '../repository/supply',
		})
	},

	carStatusQuery: function () {
		wx.navigateTo({
			url: '../monitor/carStatus',
		})
	},

	recordCarInPosition: function () {
		wx.navigateTo({
			url: '../monitor/recordCar',
		})
	},

	recordOperationZone: function () {
		wx.navigateTo({
			url: '../zone/record',
		})
	},

	checkCallRepair: function () {
		wx.navigateTo({
			url: '../maintenance/records',
		})
	},

})