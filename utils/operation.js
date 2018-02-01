
var config = require('./config')
var user = require('./user')
var login = require('./login')
var register = require('./register')

//二维码ID换MAC
const QR_TO_MAC_URL = `${config.PytheRestfulServerURL}/use/QR2MAC`;

//开锁前检查
const UNLOCK_PREPARE_URL = `${config.PytheRestfulServerURL}/unlock/prepare`;

//开锁
const UNLOCK_URL = `${config.PytheRestfulServerURL}/use/unlock`;

//关锁
const LOCK_URL = `${config.PytheRestfulServerURL}/use/lock`;

//管理员关锁
const MANAGER_LOCK_URL = `${config.PytheRestfulServerURL}/manager/lock`;

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
function encryptFrame(frameStr, carId, success, fail) {

  wx.request({
    url: FRAME_ENCRYPT_URL,
		data: {
			content: frameStr,
			carId: carId
		},
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
function decryptFrame(frameStr, carId, success, fail) {

  wx.request({
    url: FRAME_DECRYPT_URL,
    data: {
			content: frameStr,
			carId: carId
		},
    method: 'POST',
    success: function (res) {
      typeof success == "function" && success(res.data);
    },
    fail: function (res) {
      typeof fail == "function" && fail(res.data);
    }
  })

}

function getLockToken(carId, success, fail) {

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


  encryptFrame(wx.arrayBufferToBase64(buffer), carId,
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
			// if(res.data.status == 200)
			{
				console.log(res);
				typeof success == "function" && success(res.data.data);
			}
      
    },
    fail: function(res) {
      typeof fail == "function" && fail(res.data.data);
    }
  })

}


function unlock(the, customerId, carId, success, fail){

  var that = the;

	//设置5秒检查时间，到时如果仍未开锁则清除缓存重新执行该函数
	// if (wx.getStorageSync('platform') == 'android')
	// {
	// 	setTimeout(
	// 		function () {

	// 			if (wx.getStorageSync(user.UsingCarStatus) != 1) {
	// 				wx.closeBLEConnection({
	// 					deviceId: wx.getStorageSync('DeviceID'),
	// 					success: function (res) {

	// 						wx.closeBluetoothAdapter({
	// 							success: function (res) {

	// 								wx.openBluetoothAdapter({
	// 									success: function (res) {

	// 										unlock(that, customerId, carId);

	// 									},
	// 									fail: function (res) { },
	// 									complete: function (res) { },
	// 								})

	// 							},
	// 							fail: function (res) { },
	// 							complete: function (res) { },
	// 						});

	// 					},
	// 					fail: function (res) { },
	// 					complete: function (res) { },
	// 				})


	// 			}


	// 		},
	// 		1000 * 10
	// 	);
	// }
	// else
	// {
	// 	setTimeout(
	// 		function () {

	// 			if(wx.getStorageSync(user.UsingCarStatus) != 1)
	// 			{
	// 				wx.showModal({
	// 					title: '',
	// 					content: '连接超时，请再次扫码',
	// 					confirmText: '我知道了',
	// 					confirmColor: '',
	// 					success: function(res) {
	// 						if(res.confirm)
	// 						{
	// 							wx.navigateBack({
	// 								delta: 1,
	// 							})
	// 						}
	// 					},
	// 					fail: function(res) {},
	// 					complete: function(res) {},
	// 				})
					
	// 			}
	// 		},
	// 		1000 * 10
	// 	);
	// }
	
			
	wx.request({
		url: UNLOCK_PREPARE_URL,
		data: {
			customerId: wx.getStorageSync(user.CustomerID),
			carId: carId,
		
		},
		method: 'GET',
		success: function (res) {
			var result = res.data;
			if (result.status == 200) 
			{
				//通过检查，可以开锁

				var deviceId;
				//android、ios分情况处理
				if(wx.getStorageSync('platform') == 'android')
				{
					deviceId = carId;
					//直接开锁
					unlockOperation(that, deviceId, carId,
						(res)=>{
							typeof success == "function" && success(res.data);
						},
						(res)=>{
							typeof fail == "function" && fail(res);
						}

					);
					
				}
				if (wx.getStorageSync('platform') == 'ios') 
				{
					
					//找出跟MAC对应的deviceId
					wx.stopBluetoothDevicesDiscovery({
						success: function (res) {

							wx.getBluetoothDevices({
								success: function (res) {
									var devices = res.devices;

									for (var count = 0; count < devices.length; count++) {
										console.log(count, devices[count]);

										console.log('deviceId: ', devices[count].deviceId);
										var macBuff = (devices[count].advertisData).slice(2, 8);
										console.log('MAC: ', parseMAC(macBuff));
										var macAddress = parseMAC(macBuff);
										if (macAddress == that.data.carId) {
											deviceId = devices[count].deviceId;
											wx.setStorageSync('DeviceID', deviceId);
											break;
										}

									}

									//找到目标，停止查找，开锁
									unlockOperation(that, deviceId, carId,
										(res) => {
											typeof success == "function" && success(res.data);
										},
										(res) => {
											typeof fail == "function" && fail(res);
										}

									);
								},
								fail: function (res) { },
								complete: function (res) { },
							});

						},
						fail: function (res) { },
						complete: function (res) { },
					})
					
					

					// wx.onBluetoothDeviceFound(function(res){
						
					// 		console.log('deviceId: ', res.devices[0]);
					// 		var macBuff = wx.base64ToArrayBuffer(res.devices[0].advertisData).slice(2, 8);
					// 		console.log('MAC: ', parseMAC(macBuff));
					// 		var macAddress = parseMAC(macBuff);
					// 		if (macAddress == carId) 
					// 		{
					// 			deviceId = res.devices[0].deviceId;
					// 			wx.setStorageSync('DeviceID', deviceId);
					// 			wx.stopBluetoothDevicesDiscovery({
					// 				success: function(res) {

					// 					//找到目标，停止查找，开锁
					// 					unlockOperation(that, deviceId, carId,
					// 						(res) => {
					// 							typeof success == "function" && success(res.data);
					// 						},
					// 						(res) => {
					// 							typeof fail == "function" && fail(res);
					// 						}
											
					// 					);
										
					// 				},
					// 				fail: function(res) {},
					// 				complete: function(res) {},
					// 			})
					// 		}
						
					// });

				}





			}
			else {
				if (result.status == 300) {
					that.setData({
						unlock_progress: false,
						notify_arrearage: true,
						arrearage_amount: result.data,
					});
				}
				else {
					that.setData({
						unlock_progress: false,
						// unlock_status: true,
						// unlock_status_image: '/images/unlock_' + result.status + '.png',
					});

					wx.showModal({
						title: '提示',
						content: result.msg,
						showCancel: false,
						confirmText: '我知道了',
						confirmColor: '',
						success: function(res) {
							wx.navigateBack({
								delta: 1,
							})
						},
						fail: function(res) {},
						complete: function(res) {},
					})
				}

			}


		},
		fail: function (res) {
			typeof fail == "function" && fail(res);
			
		},
		complete: function(res){
			
		}
	});

}

function connectDevice(the, deviceId, success, fail){
	var that = the;
	wx.createBLEConnection({
		deviceId: deviceId,
		success: function (res) {
			console.log(res);

			wx.getBLEDeviceServices({
				deviceId: deviceId,
				success: function (res) {
					console.log(res);

					wx.setStorageSync('ServiceID', res.services[0].uuid);

					wx.getBLEDeviceCharacteristics({
						deviceId: deviceId,
						serviceId: wx.getStorageSync('ServiceID'),
						success: function (res) {
							console.log(res);
							wx.setStorageSync('characteristicIdToWrite', res.characteristics[0].uuid);
							wx.setStorageSync('characteristicIdToRead', res.characteristics[1].uuid);


							//启用特征值订阅，监控串口
							wx.notifyBLECharacteristicValueChange({
								deviceId: deviceId,
								serviceId: wx.getStorageSync('ServiceID'),
								characteristicId: wx.getStorageSync('characteristicIdToRead'),
								state: true,
								success: function (res) {
									console.log(res);
									
								},
								fail: function (res) { },
								complete: function (res) { },
							});

							//读取锁连接后的随机令牌
							getLockToken(
								wx.getStorageSync(user.UsingCar),
								(encryptedFrameStr) => {

									wx.writeBLECharacteristicValue({
										deviceId: deviceId,
										serviceId: wx.getStorageSync('ServiceID'),
										characteristicId: wx.getStorageSync('characteristicIdToWrite'),
										value: wx.base64ToArrayBuffer(encryptedFrameStr),

									});
								},
							);

							wx.onBLECharacteristicValueChange(function (res) {

								console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`);
								console.log(ab2hex(res.value) + " arraybuffer length: " + res.value.byteLength);//坑，非16字节标准数据


								var encryptedTokenFrame = res.value.slice(0, 16);


								//解密载有令牌的通信帧
								decryptFrame(
									wx.arrayBufferToBase64(encryptedTokenFrame), 
									wx.getStorageSync(user.UsingCar),
									(res) => {
										console.log('decrypt token frame: ', res);
										var tokenFrameHexStr = (ab2hex(wx.base64ToArrayBuffer(res)));

										typeof success == "function" && success(tokenFrameHexStr);
										

									}
								);


							}); 


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

function unlockOperation(the, deviceId, carId, success, fail, complete){
	var that = the;
	wx.createBLEConnection({
		deviceId: deviceId,
		success: function (res) {
			console.log(res);

			wx.getBLEDeviceServices({
				deviceId: deviceId,
				success: function (res) {
					console.log(res);

					wx.setStorageSync('ServiceID', res.services[0].uuid);

					wx.getBLEDeviceCharacteristics({
						deviceId: deviceId,
						serviceId: wx.getStorageSync('ServiceID'),
						success: function (res) {
							console.log(res);
							wx.setStorageSync('characteristicIdToWrite', res.characteristics[0].uuid);
							wx.setStorageSync('characteristicIdToRead', res.characteristics[1].uuid);


							//启用特征值订阅，监控串口
							wx.notifyBLECharacteristicValueChange({
								deviceId: deviceId,
								serviceId: wx.getStorageSync('ServiceID'),
								characteristicId: wx.getStorageSync('characteristicIdToRead'),
								state: true,
								success: function (res) {
									console.log(res);
								},
								fail: function (res) { 
									typeof fail == "function" && fail('fallback');
								},
								complete: function (res) { },
							});

							//读取锁连接后的随机令牌
							getLockToken(
								carId,
								(encryptedFrameStr) => {

									wx.writeBLECharacteristicValue({
										deviceId: deviceId,
										serviceId: wx.getStorageSync('ServiceID'),
										characteristicId: wx.getStorageSync('characteristicIdToWrite'),
										value: wx.base64ToArrayBuffer(encryptedFrameStr),
										success: function (res) {
											console.log(res);
										},
										fail: function (res) {
											console.log(res);
										},
										complete: function (res) {
											console.log(res);
										},
									});
								},
							);
							

							wx.onBLECharacteristicValueChange(function (res) {

								console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`);
								console.log(ab2hex(res.value) + " arraybuffer length: " + res.value.byteLength);//坑，非16字节标准数据


								var encryptedTokenFrame = res.value.slice(0, 16);


								//解密载有令牌的通信帧
								decryptFrame(
									wx.arrayBufferToBase64(encryptedTokenFrame), carId,
									(res) => {
										console.log('decrypt token frame: ', res);
										var tokenFrameHexStr = (ab2hex(wx.base64ToArrayBuffer(res)));
										console.log('token: ' + tokenFrameHexStr.substring(0, 32) + ' ,head: ' + tokenFrameHexStr.slice(0, 2));
										//如果通信帧符合，取出token备用
										if (tokenFrameHexStr.slice(0, 4) == '0602' ) 
										{
											console.log('correct token: ' + tokenFrameHexStr.substring(0, 32));
											wx.setStorageSync("token", tokenFrameHexStr.substring(6, 14));

											//数据库记录此时车锁的deviceId
											wx.request({
												url: config.PytheRestfulServerURL + '/record/deviceInfo',
												data: {
													deviceId: deviceId,
													carId: carId,
												},
												method: 'POST',
												success: function (res) {

												},
												fail: function (res) { },
												complete: function (res) { },
											});

											//后台用token+密码组成加密帧
											getUnlockFrame(
												carId,
												wx.getStorageSync('token'),
												(encryptedFrameStr) => {


													wx.writeBLECharacteristicValue({
														deviceId: deviceId,
														serviceId: wx.getStorageSync('ServiceID'),
														characteristicId: wx.getStorageSync('characteristicIdToWrite'),
														value: wx.base64ToArrayBuffer(encryptedFrameStr),
														success: function (res) {
															console.log('write to unlock: ', res);
															
															typeof success == "function" && success('unlock');
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

											wx.closeBLEConnection({
												deviceId: deviceId,
												success: function (res) {
													wx.hideLoading();
													wx.navigateBack({
														delta: 1,
													});
												},
												fail: function (res) { },
												complete: function (res) { },
											});

											
											
											//更新开锁状态
											// wx.getLocation({
											// 	type: 'gcj02',
											// 	altitude: true,
											// 	success: function(res) {

											// 		wx.request({
											// 			url: UNLOCK_URL,
											// 			data: {
											// 				carId: carId,
											// 				customerId: wx.getStorageSync(user.CustomerID),
											// 				longitude: res.longitude,
											// 				latitude: res.latitude,
											// 			},
											// 			method: 'POST',
											// 			success: function (res) { 

											// 				normalUpdateCustomerStatus(
											// 					wx.getStorageSync(user.CustomerID),
											// 					() => {

											// 						wx.navigateBack({
											// 							delta: 1,
											// 						})

																
											// 					});

											// 				typeof success == "function" && success('unlock');

											// 			},
											// 			fail: function (res) { },
											// 			complete: function (res) { },
											// 		});

											// 	},
											// 	fail: function(res) {},
											// 	complete: function(res) {},
											// })
											
											
										}
										if (tokenFrameHexStr.slice(0, 8) == '05020101') {
											//开锁失败

										}

										if (tokenFrameHexStr.slice(0, 8) == '05080100') {


											//检测到关锁成功信号
											wx.setStorageSync('executeLock', 'yes');
											managerLock(that);
	
										}

									}
								);


							});

							
							


						},
						fail: function (res) { 
							typeof fail == "function" && fail('fallback');
						},
						complete: function (res) { },
					})

				},
				fail: function (res) { 
					typeof fail == "function" && fail('fallback');
				},
				complete: function (res) { },
			})

		},
		fail: function (res) {
			typeof fail == "function" && fail('fallback');
		},
		complete: function (res) { },
	});
}

function lock(customerId, carId, recordId, success, fail){

	

  wx.getLocation({
    type: 'gcj02',
    success: function(res) {
      wx.request({
        // url: LOCK_URL,
				url: MANAGER_LOCK_URL,//目前只有管理员版
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
			wx.setStorageSync(user.UsingCarDevice, info.deviceId);

			wx.setStorageSync(user.Level, info.level);

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

function urlProcess(urlStr) 
{
	var p = {};
	var name, value;
	var str = urlStr; //取得整个地址栏
	var num = str.indexOf("?")
	str = str.substr(num + 1); //取得所有参数   stringvar.substr(start [, length ]

	var arr = str.split("&"); //各个参数放到数组里

	for (var i = 0; i < arr.length; i++) {
		num = arr[i].indexOf("=");
		if (num > 0) {
			name = arr[i].substring(0, num);
			value = arr[i].substr(num + 1);
			p[name] = value;
		}
	}
	return p;
} 

function parseMAC(buffer) {
	var hexArr = Array.prototype.map.call(
		new Uint8Array(buffer),
		function (bit) {
			return ('00' + bit.toString(16)).toUpperCase().slice(-2)
		}
	)
	return hexArr.join(':');
}

function loginSystem(the, success, fail) {
	
	var that = the;
	wx.login({
		success: function (res) {
			// success
			wx.getUserInfo({
				success: function (res) {
					// success
					console.log(res.rawData);
					var rawData = JSON.parse(res.rawData);
					wx.setStorageSync('avatarUrl', rawData.avatarUrl);
					// wx.setStorageSync('userNickName', rawData.nickName);
					wx.setStorageSync('wxNickName', rawData.nickName);

					// that.setData({
					// 	avatar: wx.getStorageSync('avatarUrl'),
					// });
				},
				fail: function () {
					// fail
				},
				complete: function () {
					// complete
				}
			})
		},
		fail: function () {
			// fail
		},
		complete: function () {
			// complete
		}
	})

	var that_ = that;
	//登录
	login.login(
		() => {

			// 检查是否有注册过
			register.checkRegister(
				(userRegisterResult) => {
					console.log('check register : ' + JSON.stringify(userRegisterResult));
					//如果没注册过，则注册
					var registerInfo = userRegisterResult.data.data;
					if (registerInfo == null) {
						wx.setStorageSync('alreadyRegister', 'no');
						wx.setStorageSync('logoutSystem', 'no');

						//转至注册页面
						wx.navigateTo({
							url: '../register/register',
							success: function (res) { },
							fail: function (res) { },
							complete: function (res) { },
						})
					}

					else {
						wx.setStorageSync('alreadyRegister', 'yes');
						wx.setStorageSync(user.CustomerID, registerInfo.customerId);
						wx.setStorageSync(user.Description, registerInfo.description);
						wx.setStorageSync(user.Status, registerInfo.status);
						wx.setStorageSync(user.UsingCar, registerInfo.carId);
						wx.setStorageSync(user.RecordID, registerInfo.recordId);
						wx.setStorageSync(user.UsingCarStatus, registerInfo.carStatus);
						wx.setStorageSync(user.UsingCarDevice, registerInfo.deviceId);

						wx.setStorageSync(user.Level, registerInfo.level);
						wx.setStorageSync(user.PhoneNum, registerInfo.phoneNum);

						wx.showToast({
							title: '已登录',
							duration: 1200
						});
						typeof success == "function" && success('login success');
						
					}



					that.setData({
						logoutSystem: wx.getStorageSync('logoutSystem'),
						alreadyRegister: wx.getStorageSync('alreadyRegister')
					});

				},
				(userRegisterResult) => {
					console.log(userRegisterResult);
				},
			);

		},
		()=>{
			typeof fail == "function" && fail('login fail');
		}
	);

	wx.setStorageSync('logoutSystem', 'no');

	return 'finish';
}

function qr2mac(qrId, success, fail){

	wx.request({
		url: QR_TO_MAC_URL,
		data: {
			qrId: qrId,
		},
		method: 'POST',
		success: function(res) {
			typeof success == "function" && success(res.data.data);
		},
		fail: function(res) {
			typeof fail == "function" && fail(res.data.data);
		},
		complete: function(res) {},
	})
}

function managerLock(the) {

	wx.setStorageSync('executeLock', 'no');
	wx.closeBLEConnection({
		deviceId: wx.getStorageSync(user.UsingCarDevice),
		success: function (res) {
			wx.closeBluetoothAdapter({
				success: function (res) { },
				fail: function (res) { },
				complete: function (res) { },
			})
		},
		fail: function (res) { },
		complete: function (res) { },
	});

	wx.showLoading({
		title: '关锁中···',
		mask: true,
	})

	var that = the;

	if (wx.getStorageSync(user.Level) == 1) {
		lock(
			wx.getStorageSync(user.CustomerID),
			wx.getStorageSync(user.UsingCar),
			wx.getStorageSync(user.RecordID),
			(result) => {
				console.log(result);

				wx.hideLoading();
				wx.reLaunch({
					url: 'index',
					success: function (res) { },
					fail: function (res) { },
					complete: function (res) { },
				})
			},
			() => {
				wx.hideLoading();


			}
		);
	}


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
	urlProcess: urlProcess,
	parseMAC: parseMAC,

	connectDevice: connectDevice,

	loginSystem: loginSystem,
	qr2mac: qr2mac,

	managerLock: managerLock

}