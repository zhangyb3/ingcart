
var register = require("../../utils/register.js");
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var login = require("../../utils/login.js");
var pay = require("../../utils/pay.js");
var operation = require("../../utils/operation.js");

Page({
  data:{
    inputValue: 0,

    selectAmount: 0,

    normalCharge: false,
    hotCharge: false,
    dealerId: null,

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
    this.data.normalCharge = true;
    this.data.hotCharge = false;
    this.setData({
      selectAmount: chargeAmount,
      
    });

    charge(this);
  },

  selectHotCharge: function (res) {
    console.log(res.currentTarget);
    var hotChargeAmount = res.currentTarget.dataset.hot_charge_amount;

    //充值流程
    this.data.hotCharge = true;
    this.data.normalCharge = false;
    this.setData({
      selectHotCharge: hotChargeAmount,
    });

    var that = this;
    wx.scanCode({
      onlyFromCamera: true,
      success: function(res) {
        that.data.dealerId = res.result;

        charge(that);
      },
      fail: function(res) {
        that.data.hotCharge = false;
        that.setData({
          selectHotCharge: 0,
        });
      },
      complete: function(res) {},
    })
    
  },

// 存储输入的充值金额
  bindInput: function(res){
    this.setData({
      inputValue: res.detail.value
    })  
  },


// 页面销毁，更新本地金额，（累加）
  onUnload:function(){
     
  }
})


// 充值
function charge(the) {
  var chargeAmount;
  if(the.data.normalCharge == true)
  {
    chargeAmount = the.data.selectAmount;
  }
  if (the.data.hotCharge == true) {
    // chargeAmount = the.data.selectHotCharge;
    chargeAmount = 0.38;
  }
  // 必须输入大于0的数字
  if (chargeAmount <= 0 || isNaN(chargeAmount)) {
    wx.showModal({
      title: "提示",
      content: "充值金额错误",
      showCancel: false,
      confirmText: "确定"
    })
  } else {

    var that = the;
    //小程序支付充值
    pay.requestOrder(that, chargeAmount,
      (prepayResultSet) => {
        var that_ = that;
        var prepayResultStr = prepayResultSet.data;
        var prepayResult = JSON.parse(prepayResultStr);
        //统一下单成功
        if (prepayResult.return_code == 'SUCCESS'
          && prepayResult.result_code == 'SUCCESS') {
          //调用微信支付
          pay.orderPay(that_, prepayResult,
            (payResultSet) => {
              var that__ = that_;
              var payResult = payResultSet.errMsg;
              //支付成功，更新数据库纪录
              if (payResult == 'requestPayment:ok') {
                
                pay.chargeConfirm(that__, payResult,
                  (feedbackrResult) => {
                    console.log(JSON.stringify(feedbackrResult))
                    if (feedbackrResult.status == 200) {
                      wx.showToast({
                        title: feedbackrResult.data,
                        icon: '',
                        image: '',
                        duration: 2000,
                        mask: true,
                        complete: function (res) {

                          //如果是超值套餐，需要调用赠品接口
                          operation.receiveGift(
                            wx.getStorageSync(user.CustomerID), 
                            that__.data.dealerId, 
                            prepayResult.out_trade_no, 
                            prepayResult.prepay_id, 
                            (result)=>{
                              console.log(result);
                            }, 
                            ()=>{});

                          wx.navigateBack({
                            delta: 1,
                          })
                        },
                      })
                    }
                    else{
                      that__.data.hotCharge = false;
                      that__.setData({
                        selectHotCharge: 0,
                      });
                    }
                  },
                  () => { });
              }
            },
            () => { });
        }
      },
      () => { });


  }
}