//index.js
//获取应用实例
const app = getApp()

var register = require("../../utils/register.js");
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var login = require("../../utils/login.js");
var pay = require("../../utils/pay.js");
var operation = require("../../utils/operation.js");

Page({
  data: {
    windowHeight:0,
    isShow:false ,  //‘确定充值’按钮是否显示
    isRandow:true,
    addStyle:null,
    inputMoney:30,
		giving:0,
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
		that.data.inputMoney = rechargeMoney;
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

		if(addStyle != 2)
		{
			charge(that);
		}
  },

  closeLayer:function(){
    var that=this;
    that.setData({
      isShow: false,
      isRandow: true,
      addStyle: null,
			inputMoney: 30,
    })
  },

  inputMoney:function(e){
    var inputMoney=e.detail.value;
    var patt=/[0-9]+.?/;
    this.setData({
      inputMoney: inputMoney.replace(/[^0-9]/,'')
    })
  },

	charge:function(e){
		charge(this);
	},
  

})


// 充值
function charge(the) {
	var chargeAmount = the.data.inputMoney;
	var giving = the.data.giving;
	// 必须输入大于0的数字
	if (chargeAmount <= 0 || isNaN(chargeAmount)) {
		wx.showModal({
			title: "提示",
			content: "充值金额错误",
			showCancel: false,
			confirmText: "确定"
		})
	} 
	else {

		var that = the;
		//小程序支付充值
		pay.requestOrder(that, chargeAmount, giving,
			(prepayResultSet) => {
				
				var prepayResultStr = prepayResultSet.data;
				var prepayResult = JSON.parse(prepayResultStr);
				//统一下单成功
				if (prepayResult.return_code == 'SUCCESS'
					&& prepayResult.result_code == 'SUCCESS') {
					//调用微信支付
					pay.orderPay(that, prepayResult,
						(payResultSet) => {
							
							var payResult = payResultSet.errMsg;
							//支付成功，更新数据库纪录
							if (payResult == 'requestPayment:ok') {

								// pay.chargeConfirm(that, payResult,
								// 	(feedbackrResult) => {
								// 		console.log(JSON.stringify(feedbackrResult))
								// 		if (feedbackrResult.status == 200) {
								// 			wx.showToast({
								// 				title: feedbackrResult.data,
								// 				icon: '',
								// 				image: '',
								// 				duration: 2000,
								// 				mask: true,
								// 				complete: function (res) {

								// 					//如果是超值套餐，需要调用赠品接口
								// 					// operation.receiveGift(
								// 					// 	wx.getStorageSync(user.CustomerID),
								// 					// 	that.data.dealerId,
								// 					// 	prepayResult.out_trade_no,
								// 					// 	prepayResult.prepay_id,
								// 					// 	(result) => {
								// 					// 		console.log(result);
								// 					// 	},
								// 					// 	() => { }
								// 					// );


								// 					wx.navigateBack({
								// 						delta: 1,
								// 					})
								// 				},
								// 			})
								// 		}
								// 		else {
								// 			that.data.hotCharge = false;
								// 			that.setData({
								// 				selectHotCharge: 0,
								// 			});
								// 		}
								// 	},
								// 	() => { }
								// );

								var pages = getCurrentPages();
								var indexPage = pages[0];
								indexPage.data.backFrom = 'charge';
								
								wx.navigateBack({
									delta: 1,
								})

							}
						},
						() => { });
				}
			},
			() => { });


	}
}
