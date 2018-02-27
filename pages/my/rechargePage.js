//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    windowHeight:0,
    isShow:false ,  //‘确定充值’按钮是否显示
    isRandow:true,
    addStyle:0,
    inputMoney:''
  },

  onLoad: function () {
    var that=this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight
        })
        console.log(res.windowHeight)
        
      }
    })
  },

//  点击充值金额选项
  moneyChoice:function(e){
    console.log(e.currentTarget.dataset.charge);
    console.log(e.currentTarget.dataset.class);
    var that=this;
    var rechargeMoney = parseInt(e.currentTarget.dataset.charge);
    var  addStyle= parseInt(e.currentTarget.dataset.class) ;
    that.setData({
      addStyle: addStyle
    })
    if (rechargeMoney==0){
       that.setData({
         isShow:true,
         isRandow:false,
       })
    }else{
      that.setData({
        isShow: false,
        isRandow: true,
      })
    }
  },

  closeLayer:function(){
    var that=this;
    that.setData({
      isShow: false,
      isRandow: true,
      addStyle: 0
    })
  },

  inputMoney:function(e){
    var inputMoney=e.detail.value;
    var patt=/[0-9]+.?/;
    this.setData({
      inputMoney: inputMoney.replace(/[^0-9]/,'')
    })
  }
  

})
