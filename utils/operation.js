
var config = require('./config')
var user = require('./user')

//开锁
const UNLOCK_URL = `${config.PytheRestfulServerURL}/use/unlock`;

//关锁
const LOCK_URL = `${config.PytheRestfulServerURL}/use/lock`;

//保留用车
const HOLD_URL = `${config.PytheRestfulServerURL}/use/hold`;

//结束用车，计费
const COMPUTEFEE_URL = `${config.PytheRestfulServerURL}/use/computeFee`;

//更新客户状态
const UPDATE_CUSTOMER_STATUS_URL = `${config.PytheRestfulServerURL}/customer/select`;

function unlock(customerId, carId, success, fail){

  wx.getLocation({
    type: 'gcj02',
    success: function(res) {
      wx.request({
        url: UNLOCK_URL,
        data: {
          customerId: customerId,
          carId: carId,
          latitude: res.latitude,
          longitude: res.longitude
        },
        method: 'POST',
        success: function (res) {
          var result = res;
          normalUpdateCustomerStatus(
            customerId,
            ()=>{
              typeof success == "function" && success(result.data);
            });
          
        },
        fail: function (res) { 
          typeof fail == "function" && fail(res.data);
        }
      });
    }
  })
  

}

function lock(customerId, carId, recordId, success, fail){

  wx.getLocation({
    type: 'gcj02',
    success: function(res) {
      wx.request({
        url: LOCK_URL,
        data: {
          customerId: customerId,
          carId: carId,
          recordId: recordId,
          latitude: res.latitude,
          longitude: res.longitude
        },
        method: 'POST',
        success: function (res) {
          var result = res;
          normalUpdateCustomerStatus(
            customerId,
            () => {
              typeof success == "function" && success(result.data);
            });
        },
        fail: function (res) { 
          typeof fail == "function" && fail(res.data);
        }
      });
    }
  })
  

}

function hold(customerId, carId, appointmentTime, success, fail){

  wx.request({
    url: HOLD_URL,
    data: {
      customerId: customerId,
      carId: carId,
      appointmentTime: appointmentTime
    },
    method: 'POST',
    success: function (res) {
      var result = res;
      normalUpdateCustomerStatus(
        customerId,
        () => {
          typeof success == "function" && success(result.data);
        });
    },
    fail: function (res) { 
      typeof fail == "function" && fail(res.data);
    }
  });

}

function computeFee(customerId, carId, recordId, success, fail){

  wx.request({
    url: COMPUTEFEE_URL,
    data: {
      customerId: customerId,
      carId: carId,
      recordId: recordId
    },
    method: 'POST',
    success: function (res) {
      var result = res;
      normalUpdateCustomerStatus(
        customerId,
        () => {
          typeof success == "function" && success(result.data);
        });
    },
    fail: function (res) { 
      typeof fail == "function" && fail(res.data);
    }
  });

}

function checkUsingMinutes(carId, success, fail) {

  if (carId != null) {
    wx.request({
      url: config.PytheRestfulServerURL + '/use/car/time',
      data: {
        carId: carId
      },
      method: 'GET',
      success: function (res) {
        typeof success == "function" && success(res.data);
      },
      fail: function (res) {
        typeof fail == "function" && fail(res.data);
      }
    })
  }


}

function checkHoldingMinutes(customerId, success, fail) {

  if (customerId != null) {
    wx.request({
      url: config.PytheRestfulServerURL + '/save/time',
      data: {
        customerId: customerId
      },
      method: 'GET',
      success: function (res) {
        typeof success == "function" && success(res.data);
      },
      fail: function (res) {
        typeof fail == "function" && fail(res.data);
      }
    })
  }


}

function normalUpdateCustomerStatus(customerId, success, fail)
{
  wx.request({
    url: UPDATE_CUSTOMER_STATUS_URL,
    data: {
      customerId: wx.getStorageSync(user.CustomerID)
    },
    method: 'GET',
    dataType: '',
    success: function (res) {
      console.log(res);
      var info = res.data.data;

      wx.setStorageSync(user.CustomerID, info.customerId);
      wx.setStorageSync(user.Description, info.description);
      wx.setStorageSync(user.Status, info.status);
      wx.setStorageSync(user.UsingCar, info.carId);
      wx.setStorageSync(user.RecordID, info.recordId);
      wx.setStorageSync(user.UsingCarStatus, info.carStatus);

      typeof success == "function" && success(res.data);
    },
    fail: function(res){
      typeof fail == "function" && fail(res.data);
    }
  });
}


module.exports = {
  unlock: unlock,
  lock: lock,
  hold: hold,
  computeFee: computeFee,

  checkUsingMinutes: checkUsingMinutes,
  checkHoldingMinutes: checkHoldingMinutes,

  normalUpdateCustomerStatus: normalUpdateCustomerStatus
}