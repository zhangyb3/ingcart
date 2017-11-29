
var register = require("../../utils/register.js");
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var login = require("../../utils/login.js");
var pay = require("../../utils/pay.js");

Page({
  data:{
    inputValue: 0,

    selectAmount: 0
  },
// 页面加载
  onLoad:function(options){
    wx.setNavigationBarTitle({
      title: '充值'
    })
  },

  onShow:function(){
    this.setData({
      selectAmount: this.data.selectAmount,
    });
  },

  selectChargeAmount:function(res){
    console.log(res.currentTarget);
    var chargeAmount = res.currentTarget.dataset.charge_amount;

    //充值流程

    this.setData({
      selectAmount: chargeAmount,
    });
  },

// 存储输入的充值金额
  bindInput: function(res){
    this.setData({
      inputValue: res.detail.value
    })  
  },

// 充值
  charge: function(){
    // 必须输入大于0的数字
    if(parseInt(this.data.selectAmount) <= 0 || isNaN(this.data.selectAmount)){
      wx.showModal({
        title: "提示",
        content: "充值金额错误",
        showCancel: false,
        confirmText: "确定"
      })
    }else{

      var that = this;
      //小程序支付充值
      pay.requestOrder(that, that.data.selectAmount,
      (prepayResultSet)=>{
        var that_ = that;
        var prepayResultStr = prepayResultSet.data;
        var prepayResult = JSON.parse(prepayResultStr);
        //统一下单成功
        if(prepayResult.return_code == 'SUCCESS' 
        && prepayResult.result_code == 'SUCCESS')
        {
          //调用微信支付
          pay.orderPay(that_, prepayResult,
          (payResultSet)=>{
            var that__ = that_;
            var payResult = payResultSet.errMsg;
            //支付成功，更新数据库纪录
            if (payResult == 'requestPayment:ok')
            {
              pay.chargeConfirm(that__, payResult,
              (feedbackrResult)=>{
                console.log(JSON.stringify(feedbackrResult))
                if(feedbackrResult.status == 200)
                {
                  wx.showToast({
                    title: feedbackrResult.data,
                    icon: '',
                    image: '',
                    duration: 2000,
                    mask: true,
                    complete: function(res) {
                      wx.navigateBack({
                        delta: 1,
                      })
                    },
                  })
                }
              },
              ()=>{});
            }
          },
          ()=>{});
        }
      },
      ()=>{});

     
    }
  },
// 页面销毁，更新本地金额，（累加）
  onUnload:function(){
     
  }
})