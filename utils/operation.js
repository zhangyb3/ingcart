
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

//服务通知支付状态
const NOTIFY_PAY_INFO_URL = `${config.PytheRestfulServerURL}/message/notifyPay`;

//取消预约
const CANCEL_HOLDING_URL = `${config.PytheRestfulServerURL}/cancel/appointment`;

//通信帧AES128加密
const FRAME_ENCRYPT_URL = `${config.PytheRestfulServerURL}/bluetooth/encrypt`;

//通信帧AES128解密
const FRAME_DECRYPT_URL = `${config.PytheRestfulServerURL}/bluetooth/decrypt`;

//开锁数据帧加密
const UNLOCK_FRAME_ENCRYPT_URL = `${config.PytheRestfulServerURL}/unlock/encode`;

//加密通信帧
function encryptFrame(frameStr, success, fail) {

  wx.request({
    url: FRAME_ENCRYPT_URL,
    data: frameStr,
    method: 'POST',
    success: function (res) {
      typeof success == "function" && success(res.data);
    },
    fail: function (res) {
      typeof fail == "function" && fail(res.data);
    }
  })

}

//解密通信帧
function decryptFrame(frameStr, success, fail) {

  wx.request({
    url: FRAME_DECRYPT_URL,
    data: frameStr,
    method: 'POST',
    success: function (res) {
      typeof success == "function" && success(res.data);
    },
    fail: function (res) {
      typeof fail == "function" && fail(res.data);
    }
  })

}

function getLockToken(success, fail) {

  let buffer = new ArrayBuffer(16);
  let dataView = new DataView(buffer);


  dataView.setUint8(0, 6);
  dataView.setUint8(1, 1);
  dataView.setUint8(2, 1);
  dataView.setUint8(3, 1);

  dataView.setUint8(4, 48);
  dataView.setUint8(5, 48);
  dataView.setUint8(6, 48);
  dataView.setUint8(7, 48);
  dataView.setUint8(8, 48);

  dataView.setUint8(9, 48);
  dataView.setUint8(10, 48);
  dataView.setUint8(11, 48);
  dataView.setUint8(12, 48);

  dataView.setUint8(13, 48);
  dataView.setUint8(14, 48);
  dataView.setUint8(15, 48);


  encryptFrame(wx.arrayBufferToBase64(buffer),
    (result) => {
      typeof success == "function" && success(result);
    },
    (result) => {
      typeof fail == "function" && fail(result);
    })


}


function getUnlockFrame(carId, token, success, fail) {

  wx.request({
    url: UNLOCK_FRAME_ENCRYPT_URL,
    data: {
      carId: carId,
      token: token
    },
    method: 'POST',
    success: function(res) {
      typeof success == "function" && success(res.data.data);
    },
    fail: function(res) {
      typeof fail == "function" && fail(res.data.data);
    }
  })

}


function unlock(the, customerId, carId, success, fail){

  var that = the;

	wx.getLocation({
		type: 'gcj02',
		success: function (res) {

			wx.request({
				url: UNLOCK_URL,
				data: {
					customerId: wx.getStorageSync(user.CustomerID),
					carId: carId,
					latitude: res.latitude,
					longitude: res.longitude
				},
				method: 'POST',
				success: function (res) {
					var result = res.data;
					if (result.status == 200) {



						wx.createBLEConnection({
							deviceId: carId,
							success: function (res) {
								console.log(res);

								wx.getBLEDeviceServices({
									deviceId: carId,
									success: function (res) {
										console.log(res);

										wx.setStorageSync('ServiceId', res.services[0].uuid);

										wx.getBLEDeviceCharacteristics({
											deviceId: carId,
											serviceId: wx.getStorageSync('ServiceId'),
											success: function (res) {
												console.log(res);
												wx.setStorageSync('characteristicIdToWrite', res.characteristics[0].uuid);
												wx.setStorageSync('characteristicIdToRead', res.characteristics[1].uuid);


												//启用特征值订阅，监控串口
												wx.notifyBLECharacteristicValueChange({
													deviceId: carId,
													serviceId: wx.getStorageSync('ServiceId'),
													characteristicId: wx.getStorageSync('characteristicIdToRead'),
													state: true,
													success: function (res) {
														console.log(res);
													},
													fail: function (res) { },
													complete: function (res) { },
												});



												wx.onBLECharacteristicValueChange(function (res) {

													console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`);
													console.log(ab2hex(res.value) + " arraybuffer length: " + res.value.byteLength);//坑，非16字节标准数据


													var encryptedTokenFrame = res.value.slice(0, 16);


													//解密载有令牌的通信帧
													decryptFrame(
														wx.arrayBufferToBase64(encryptedTokenFrame),
														(res) => {
															console.log('decrypt token frame: ', res);
															var tokenFrameHexStr = (ab2hex(wx.base64ToArrayBuffer(res)));
															console.log('token: ' + tokenFrameHexStr.substring(0, 32) + ' ,head: ' + tokenFrameHexStr.slice(0, 2));
															//如果通信帧符合，取出token备用
															if (tokenFrameHexStr.slice(0, 4) == '0602') {
																console.log('correct token: ' + tokenFrameHexStr.substring(0, 32));
																wx.setStorageSync("token", tokenFrameHexStr.substring(6, 14));

																

																//后台用token+密码组成加密帧
																getUnlockFrame(
																	carId,
																	wx.getStorageSync('token'),
																	(encryptedFrameStr) => {


																		wx.writeBLECharacteristicValue({
																			deviceId: carId,
																			serviceId: wx.getStorageSync('ServiceId'),
																			characteristicId: wx.getStorageSync('characteristicIdToWrite'),
																			value: wx.base64ToArrayBuffer(encryptedFrameStr),
																			success: function (res) {
																				console.log('write to unlock: ', res);
																				

																			},
																			fail: function (res) { },
																			complete: function (res) { },
																		})
																	},
																	() => { }
																);

															}

															if (tokenFrameHexStr.slice(0, 8) == '05020100') 
															{
																//开锁成功
																that.setData({
																	unlock_progress: false,
																});
																normalUpdateCustomerStatus(
																	wx.getStorageSync(user.CustomerID),
																	() => {

																		wx.navigateBack({
																			delta: 1,
																		});

																	});
																typeof success == "function" && success('unlock');
															}
															if(tokenFrameHexStr.slice(0, 8) == '05020101')
															{
																//开锁失败

															}

															if(tokenFrameHexStr.slice(0, 8)=='05080100') {


																//检测到关锁成功信号
															

																wx.navigateTo({
																	url: '/pages/index/processing?operation=lock',
																	success: function(res) {},
																	fail: function(res) {},
																	complete: function(res) {},
																})
																
																


															}



														}
													);


												});


												//读取锁连接后的随机令牌
												getLockToken(
													(encryptedFrameStr) => {

														wx.writeBLECharacteristicValue({
															deviceId: carId,
															serviceId: wx.getStorageSync('ServiceId'),
															characteristicId: wx.getStorageSync('characteristicIdToWrite'),
															value: wx.base64ToArrayBuffer(encryptedFrameStr),

														});
													},
												);





											},
											fail: function (res) { },
											complete: function (res) { },
										})

									},
									fail: function (res) { },
									complete: function (res) { },
								})

							},
							fail: function (res) {
								console.log(res);
							},
							complete: function (res) { },
						});



					}
					else {
						if (result.status == 300) {
							that.setData({
								notify_arrearage: true,
								arrearage_amount: result.data,
							});
						}
						else {
							that.setData({
								unlock_progress: false,
								unlock_status: true,
								unlock_status_image: '/images/unlock_' + result.status + '.png',
							});
						}

					}


				},
				fail: function (res) {
					typeof fail == "function" && fail(res);
				}
			});
		}
	});


  
  

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

function hold(customerId, carId, appointmentTime, recordId, success, fail){

  wx.request({
    url: HOLD_URL,
    data: {
      customerId: customerId,
      carId: carId,
      appointmentTime: appointmentTime,
      recordId: recordId,
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

function computeFee(customerId, carId, recordId, formId, success, fail){

  wx.request({
    url: COMPUTEFEE_URL,
    data: {
      customerId: customerId,
      carId: carId,
      recordId: recordId,
      formId: formId
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
        var result = res;
        normalUpdateCustomerStatus(
          wx.getStorageSync(user.CustomerID),
          () => {
            typeof success == "function" && success(result.data);
          });
      },
      fail: function (res) {
        typeof fail == "function" && fail(res.data);
      }
    })
  }


}

function checkHoldingMinutes(customerId, success, fail) {

  if (customerId != null && wx.getStorageSync(user.UsingCarStatus) == 2)  {
    wx.request({
      url: config.PytheRestfulServerURL + '/save/time',
      data: {
        customerId: customerId
      },
      method: 'GET',
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
    })
  }


}


function cancelHolding(customerId, success, fail){

  wx.request({
    url: CANCEL_HOLDING_URL,
    data: {
      customerId: customerId,
    },
    method: 'GET',
    dataType: '',
    success: function(res) {
      var result = res;
      normalUpdateCustomerStatus(
        customerId,
        () => {
          typeof success == "function" && success(result.data);
        });
    },
    fail: function(res) {
      typeof fail == "function" && fail(res.data);
    }
  });

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
      // console.log(res);
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



function notifyPayInfo(){



}

function receiveGift(customerId, dealerId, out_trade_no, prepay_id, success,fail)
{
  wx.request({
    url: `${config.PytheRestfulServerURL}/mai/bag`,
    data: {
      customerId: customerId,
      dealerId: dealerId,
      out_trade_no: out_trade_no,
      prepay_id: prepay_id
    },
    method: 'POST',
    dataType: '',
    success: function(res) {
      typeof success == "function" && success(res.data);
    },
    fail: function(res) {
      typeof fail == "function" && fail(res.data);
    }
  })
}

function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).toUpperCase().slice(-2)
    }
  )
  return hexArr.join('');
}

module.exports = {

	UNLOCK_URL: UNLOCK_URL,

  unlock: unlock,
  lock: lock,
  hold: hold,
  computeFee: computeFee,

  checkUsingMinutes: checkUsingMinutes,
  checkHoldingMinutes: checkHoldingMinutes,
  cancelHolding: cancelHolding,
  normalUpdateCustomerStatus: normalUpdateCustomerStatus,

  notifyPayInfo: notifyPayInfo,
  receiveGift: receiveGift,

  encryptFrame: encryptFrame,
  decryptFrame: decryptFrame,
	ab2hex: ab2hex,

}