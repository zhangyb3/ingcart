
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

    this.setData({
      avatarUrl: wx.getStorageSync("avatarUrl"),
      wxNickName: wx.getStorageSync("wxNickName"),
      account: this.data.account,
      cardQuantity: this.data.cardQuantity,
    });

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

})