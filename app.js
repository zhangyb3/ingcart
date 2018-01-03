//app.js



var app = getApp();

App({
  data: {
    userInfo: null,
  },
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    try {
      wx.clearStorageSync()
    } catch (e) {
      // Do something when catch error
    }

    wx.getSystemInfo({
      success: (res) => {
				wx.setStorageSync('windowWidth', res.windowWidth);
        wx.setStorageSync('windowHeight', res.windowHeight);
				wx.setStorageSync('platform', res.platform);
				console.log('platform',res.platform);
      }
    });

    wx.setStorageSync('alreadyRegister', 'no');
    // wx.setStorageSync('logoutSystem', 'yes');

   

    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        wx.setStorageSync('last_latitude', res.latitude);
        wx.setStorageSync('last_longtitude', res.longitude);
      }
    });

    

  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              that.globalData.iv = res.iv
              that.globalData.encryptedData = res.encryptedData
              console.log(res.userInfo);
              console.log(res.encryptedData);
              console.log(res.iv);
              typeof cb == "function" && cb(that.globalData.userInfo)

            }
          })
        }
      })
    }
  },
  
  globalData: {

    userInfo: null,
    loginCode: null,
    encryptedData: null,
    iv: null,
   
    defaultPageSize: 10,
  }
})