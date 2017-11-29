
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
          longtitude: res.longitude
        },
        method: 'POST',
        success: function (res) {

        },
        fail: function (res) { },
        complete: function (res) { },
      });
    },
    fail: function(res) {},
    complete: function(res) {},
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

        },
        fail: function (res) { },
        complete: function (res) { },
      });
    },
    fail: function(res) {},
    complete: function(res) {},
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

    },
    fail: function (res) { },
    complete: function (res) { },
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

    },
    fail: function (res) { },
    complete: function (res) { },
  });

}




module.exports = {
  unlock: unlock,
  lock: lock,
  hold: hold,
  computeFee: computeFee
}