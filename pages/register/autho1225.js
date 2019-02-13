
const app = getApp()
var operation = require("../../utils/operation.js");
var user = require("../../utils/user.js");

Page({

  onLoad: function (parameters) {


    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo'] && res.authSetting['scope.userLocation']) {
          wx.getLocation({
            type: "wgs84",
            success: function (res) {
              wx.setStorageSync(user.Latitude, res.latitude);
              wx.setStorageSync(user.Longitude, res.longitude);
              wx.navigateTo({
                url: '/pages/index/index',
              })
            }
          })
        }
      }
    })

	 wx.getLocation({
		type: "wgs84",
		success: (res) => {
			wx.setStorageSync(user.Latitude, res.latitude);
			wx.setStorageSync(user.Longitude, res.longitude);
		},
		fail: (res) => {
			wx.showModal({
				title: '提示',
				content: '如果不能提供位置，将无法使用很多功能',
				showCancel: true,
				cancelText: '拒绝',
				confirmText: '接受',
				success: function (res) {
					if (res.cancel) {
						wx.setStorageSync(user.Latitude, 22.60204);
						wx.setStorageSync(user.Longitude, 113.978616);
					}
					else
					{
						console.log('!!!!!!!!!!!!!!! unload !!!!!!!!!!!!!!!!');

            wx.showModal({
              title: '位置授权',
              content: '我们需要获取您的地理位置',
              success(res) {
                if (res.confirm) {
                  wx.openSetting({
                    success: function (res) {
                      //if(data.authSetting["scope.userLocation"] == true)
                      {
                        getUserLocation(that);
                        that.onShow();
                      }
                    },
                    fail: function (res) { },
                    complete: function (res) { },
                  })
                }
              }
            })
					}
				},
				fail: function (res) { },
				complete: function (res) { },
			})
		}
	});
    var carid = operation.urlProcess(decodeURIComponent(parameters.q)).id

    if (typeof (carid) != "undefined"){
      wx.setStorageSync(user.CARID, carid)
    }

  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  bindGetUserInfo(e) {
    wx.showLoading({
      title: '加载中',
    })
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo'] && res.authSetting['scope.userLocation']) {
          wx.getLocation({
            type: "wgs84",
            success: function (res) {
              wx.setStorageSync(user.Latitude, res.latitude);
              wx.setStorageSync(user.Longitude, res.longitude);
              setTimeout(function () {
                wx.hideLoading()
                wx.navigateTo({
                  url: '/pages/index/index',
                })
              }, 2000);
            }
          })
        }else{
          wx.hideLoading()
          wx.navigateTo({
            url: '/pages/register/autho1225?carId=' + wx.getStorageSync("carid"),
          })
        }
      }
    })

  },

	
})
