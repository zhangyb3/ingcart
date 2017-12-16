
var config = require('./config')
var user = require('./user')
var util = require('./util')


const ORDER_URL = `${config.PytheRestfulServerURL}/user/pay/information`;//下单

const ENCHASHMENT_URL = `${config.PytheRestfulServerURL}/user/pay/transfer`;

const CHARGE_ORDER_URL = `${config.PytheRestfulServerURL}/account/charge`;//充值下单

const CHARGE_CONFIRM_URL = `${config.PytheRestfulServerURL}/account/wxChargeConfirm`;//充值成功反馈

/**
 * 充值下单
 */
function requestOrder(the, chargeFee,success,fail) {
  var sessionID = wx.getStorageSync(user.SessionID);
  var openID = wx.getStorageSync(user.OpenID);

  var parameters = {
    session_id: sessionID,
    mch_id: config.MerchantID,
    body: "ingcart_charge",
    total_fee: chargeFee,
    notify_url: "https://xue.pythe.cn",
    trade_type: "JSAPI",
    openId: openID
  };


  wx.request({
    url: CHARGE_ORDER_URL,
    data: util.encode(JSON.stringify(parameters)),
    method: 'POST',
    success: function (res) {
      typeof success == "function" && success(res.data);
    },
    fail: function (res) {
      typeof fail == "function" && fail(res.data);
    }
  });


}

/**
 * 付款
 */
function orderPay(the, prepayResult, success, fail){

    var that = the;
    console.log("预支付结果" + prepayResult);


    wx.requestPayment({
      timeStamp: prepayResult.timeStamp,
      nonceStr: prepayResult.nonceStr,
      package: 'prepay_id=' + prepayResult.prepay_id,
      signType: 'MD5',
      paySign: prepayResult.paySign,
      success: function (res) {
        console.log(res);
        wx.setStorageSync('last_pay_id', prepayResult.prepay_id);
        wx.setStorageSync('last_out_trade_no', prepayResult.out_trade_no);

        that.data.last_prepay_id = prepayResult.prepay_id;
        that.data.last_out_trade_no = prepayResult.out_trade_no;

        typeof success == "function" && success(res);
      },
      fail: function (res) {
        console.log(res);
        typeof fail == "function" && fail(res);
      },
      complete: function (res) {
        // complete
        return res.data;
      }
    })

  
}

/**
 * 充值成功反馈
 */
function chargeConfirm(the, payResult, success, fail) {

  wx.request({
    url: CHARGE_CONFIRM_URL,
    data: {
      customerId: wx.getStorageSync(user.CustomerID),
      out_trade_no: the.data.last_out_trade_no,
      prepay_id: the.data.last_prepay_id,
      amount: the.data.selectAmount,
    },
    method: 'POST',
    success: function (res) {
      console.log(res);

      typeof success == "function" && success(res.data);
    },
    fail: function (res) {
      console.log(res);
      typeof fail == "function" && fail(res.data);
    }
  })
}



module.exports = {
  requestOrder: requestOrder,
  orderPay: orderPay,
  chargeConfirm: chargeConfirm
  
}

