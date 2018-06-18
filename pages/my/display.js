
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

		selfReturn: false,
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
				wx.setStorageSync(user.PhoneNum, info.phoneNum);

				var showPhoneNum = util.replaceStr(that.data.account.phoneNum, 3, 7, "····");
				console.log(showPhoneNum);
				that.setData({
					avatarUrl: wx.getStorageSync("avatarUrl"),
					wxNickName: wx.getStorageSync("wxNickName"),
					showPhoneNum: showPhoneNum,
					account: that.data.account,
					cardQuantity: that.data.cardQuantity,
					UsingCarStatus: wx.getStorageSync(user.UsingCarStatus),
				});
      },
      fail: function(res) {},
      complete: function(res) {

      },
    })

    

  },


// 跳转至钱包
  toWallet: function(){
    wx.navigateTo({
      // url: '../wallet/charge',
			url: '../my/rechargePage'
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

	toCoupon: function () {
		wx.navigateTo({
			url: 'coupon',
			success: function (res) { },
			fail: function (res) { },
			complete: function (res) { },
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

  toAgreement: function () {
    wx.navigateTo({
      url: '../agreement/agreement',
    })
  },

	selfReturn:function(){
		var that = this;
		wx.scanCode({
			onlyFromCamera: true,
			success: function (res) {
				console.log(res);
				if (res.errMsg == 'scanCode:ok') {


					var parameters = operation.urlProcess(res.result);
					var qrId = parameters.id;

					if(qrId == '0000000')
					{
						// var pages = getCurrentPages();
						// var indexPage = pages[0];
						// indexPage.data.selfReturn = true;

						// wx.navigateBack({
						// 	delta: 1,
						// })

						that.setData({
							selfReturn: true,
						});
					}
				

				}

			},
			fail: function (res) {

			},
			complete: function (res) { },
		});
	},

	switchAccount:function(){
		wx.setStorageSync(user.CustomerID, null);

		wx.setStorageSync(user.Description, null);
		wx.setStorageSync(user.Status, null);

		wx.setStorageSync(user.UsingCar, null);
		wx.setStorageSync(user.RecordID, null);
		wx.setStorageSync(user.UsingCarStatus, null);

		wx.setStorageSync(user.Level, null);
		wx.setStorageSync(user.Amount, null);

		wx.setStorageSync('alreadyRegister', 'no');
		console.log('p', wx.getStorageSync(user.PhoneNum));
		wx.request({
			url: config.PytheRestfulServerURL + '/customer/loginout',
			data: {
				phoneNum: wx.getStorageSync(user.PhoneNum),
			},
			method: 'POST',
			success: function(res) {
				if(res.data.status == 200)
				{
					wx.navigateTo({
						url: '../register/accedit?fromPage=switchAccount',
					})

				}
			},
			fail: function(res) {},
			complete: function(res) {},
		})
		
	},

	//自行还车扫码停止计费
	selfReturnToRefund: function () {
		wx.showLoading({
			title: '结束行程中...',
			mask: true,
			success: function(res) {},
			fail: function(res) {},
			complete: function(res) {},
		})
		var that = this;

		var date = new Date();
		if (wx.getStorageSync(user.UsingCar) > 0) {
			wx.request({
				url: config.PytheRestfulServerURL + '/manage/urgent/refund/',//小程序版退费
				data: {
					phoneNum: wx.getStorageSync(user.UsingCar),
					date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':00',
					managerId: -1,
				},
				method: 'POST',
				success: function (res) {
					wx.hideLoading();
					that.setData({
						selfReturn: false,
					});
					if (res.data.status == 200) {
						wx.showToast({
							title: res.data.msg,
							icon: '',
							image: '',
							duration: 5000,
							mask: true,
							success: function (res) { },
							fail: function (res) { },
							complete: function (res) { },
						})

					}
					if (res.data.status == 400) {
						wx.showModal({
							title: '提示',
							content: res.data.msg,
							showCancel: false,
							confirmText: '我知道了',
							success: function (res) { },
							fail: function (res) { },
							complete: function (res) { },
						})
					}
				},
				fail: function (res) { },
				complete: function (res) { },
			});
		}
		else {
			wx.hideLoading();
			that.setData({
				selfReturn: false,
			});
			wx.showModal({
				title: '提示',
				content: '用户尚无行程，押金退款失败',
				showCancel: false,
				confirmText: '我知道了',
				success: function (res) { },
				fail: function (res) { },
				complete: function (res) { },
			})
		}



	},

	selfReturnHoldOn: function () {
		var that = this;
		that.setData({
			selfReturn: false,
		});
	},

})