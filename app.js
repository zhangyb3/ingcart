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

    wx.setStorageSync('alreadyRegister', 'no');
    wx.setStorageSync('logoutSystem', 'yes');

    wx.setStorageSync('last_latitude', 'undefined');
    wx.setStorageSync('last_longtitude', 'undefined');

    
    


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