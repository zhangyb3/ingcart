var Ingcart = require('./ingcart.min')
var config = require('../config/const')
var wxApi = require('./wxApi')
var code = require('../config/unlock-error-code')
var request = require('./request')

var IngcartLockManager = function(setup) {
	const _this = this;
	this.ingcart = null;
	this.subJourneyMsgToken = null;
	this.subUnlockProgressToken = null;
	this.lock_cb = function() {};
	this.forceUseBle = true;

	config.appkey = setup.appkey;

	if (typeof setup.token == undefined) {
		var options = {
			phone: config.identifier_key,
			captcha: ''
		}
		request.checkCaptcha(options)
		.then(function(result){
			if (result.statusCode == 200) {
				wx.setStorageSync('userInfo', result.data);
			} else {

			}
		})
		.catch(err => {

		})
	} else {
		wx.setStorageSync('userInfo', {token: setup.token});
	}
	
	Ingcart.reinit(this);
	this.subscribeJourneyMessage();
	this.ingcart.setSessionFinishCB(function() {
		console.log("IngcartLockManager session finished");
		// session finished, first, we unsubscribe the journey message
		_this.ingcart.pubsub.unsubscribe(_this.subJourneyMsgToken);
		// notify close lock event
		_this.lock_cb();
	});
}

IngcartLockManager.prototype.unlock = function(bike_id, latitude, longitude, unlock_cb, unlock_fail_cb, lock_cb, useBle = true) {
	const _this = this;
	this.forceUseBle = useBle;
	this.unlock_progress = 0;
	this.unlock_fail_cb = unlock_fail_cb || function(code) {};
	this.unlock_cb = unlock_cb || function(progress) {};
	this.lock_cb = lock_cb || function() {};

	this.unlock_latitude = latitude;
	this.unlock_longitude = longitude;
	this.unlock_bikeid = bike_id;
  this.unlock_type=1;
	this.scanBLETimeoutTimer = null;
	this.ingcart.setOnUnlockDataTransmissionListener(function(up) {
		_this.notifyUnlockProgress(_this.unlock_progress + 5)
	});

	// before unlock, we call reinit to reconnect socket.id
	Ingcart.reinit(this);

  console.log("IngcartLockManager init bluetooth success ");
  var options = {
    url: config.BASE_URL.URL_BLE_INFO,
    data: {
      appkey: config.appkey,
      bike_number: _this.unlock_bikeid || wxApi.getStorage('bikeId')
    }
  }
  console.log("IngcartLockManager query ble info options", options);

  _this.ingcart.requestBLEInfo(options)
    .then(function (res) {
      if (res.statusCode == 200) {
        let bleInfo = res.data;
        console.log("IngcartLockManager get ble info success", bleInfo);
        wxApi.setStorage('BLEInfo', bleInfo);
        _this.ingcart.BLE_INFO = bleInfo;
        //-------------------------------------------------使用gprs开锁
        if (_this.forceUseBle == false) {
          new Promise(function (resolve, rejiect) {
            _this.unlock_type=0;
            _this.fireUnlockRequest();
            resolve();
          }).then(res => {
            _this.notifyUnlockProgress(config.UnlockPhases.POLL_SESSION_PHASES);
            _this.ingcart.pubsub.subscribe('unlocking',function(result){
              _this.notifyUnlockProgress(100);
            })

            
          }).catch(err => {
            console.log('gprs', err);
          })
        }
        //-------------------------------------------------使用蓝牙开锁
        else{
          _this.ingcart.initBluetooth()
            .then(function (result) {
              wx.closeBluetoothAdapter({
                success: function (result) {
                  wx.openBluetoothAdapter({
                    success: function (result) {
                      _this.handleBLEInfo(res.data);
                    },
                  });
                },
                fail: function () {
                  wx.openBluetoothAdapter({
                    success: function (result) {
                      _this.handleBLEInfo(res.data);
                    },
                  });
                }
              });
            })
            .catch(err => {
              // init bluetooth failed, may need ask user to open bluetooth in settings
              _this.notifyUnlockError(code.UNLOCK_ERROR_CODE.ERROR_OBTAIN_BLUETOOTH_ADAPTER);
            })       
        }


      }
    })

}

IngcartLockManager.prototype.setUnlockSuccessCallback = function(unlock_success_cb) {
	this.unlock_success_cb = unlock_success_cb;
}

IngcartLockManager.prototype.setUnlockFailCallback = function(unlock_fail_cb) {
	this.unlock_fail_cb = unlock_fail_cb;
}

IngcartLockManager.prototype.setLockEventCallback = function(lock_cb) {
	this.lock_cb = lock_cb;
}

IngcartLockManager.prototype.handleBLEInfo = function(data) {
	const _this = this;
	this.ingcart.handleBLEInfo(data)
	.then(res => {
		wxApi.setStorage('BLE_TARGET_INFO', res);
		_this.scanBLETimeoutTimer = setTimeout(function(){
			_this.ingcart.stopBluetoothDevicesDiscovery()
			.then(res => {
				_this.notifyUnlockError(code.UNLOCK_ERROR_CODE.ERROR_SCAN_TIMEOUT);
			})
			.catch(error => {
				_this.notifyUnlockError(code.UNLOCK_ERROR_CODE.ERROR_SCAN_TIMEOUT);
			})
		}, 30000);
		return _this.ingcart.startBluetoothDevicesDiscovery(function(res) {
			console.log("IngcartLockManager scan result ", res);
			_this.ingcart.handleBLEFound(res)
			.then(result => {
				_this.notifyUnlockProgress(config.UnlockPhases.CONNECT_PHASES);
				clearTimeout(_this.scanBLETimeoutTimer);
				_this.scanBLETimeoutTimer = null;
				_this.ingcart.stopBluetoothDevicesDiscovery();
				_this.createBLEConnection(result);
			})
		});
	})
	.then(res => {
		// start bluetooth devices discovery success
		_this.notifyUnlockProgress(config.UnlockPhases.SCAN_PHASES);
	})
	.catch(error => {
		if (error.errMsg == 'NoBleInfoData') {
			_this.unlock_fail_cb(code.UNLOCK_ERROR_CODE.ERROR_UNKNOWN_LOCK);
		} else {
			_this.unlock_fail_cb(code.UNLOCK_ERROR_CODE.ERROR_SCAN_ERROR);
		}
	})
}

IngcartLockManager.prototype.createBLEConnection = function(peripheral) {
	console.log("IngcartLockManager	start create ble connection ", peripheral);
	const _this = this;
	_this.ingcart.createBLEConnection(peripheral)
	.then(res => {
		_this.notifyUnlockProgress(config.UnlockPhases.SERVICE_DISCOVER_PHASES);
		_this.ingcart.getBLEDeviceServices({
			deviceId: wxApi.getStorage('BLE_Target').deviceId || _this.ingcart.BLE_Target.deviceId
		})
		.then(res => {
			console.log("IngcartLockManager get ble services success ", res);
			var options = {
				deviceId: wxApi.getStorage('BLE_Target').deviceId || _this.ingcart.BLE_Target.deviceId,
				serviceId: _this.ingcart.BLE_ServerList.SERVICE_UUID || wxApi.getStorage('BLE_ServerList').SERVICE_UUID
			}
			return _this.ingcart.getBLEDeviceCharacteristics(options)
		})
		.then(res => {
			console.log("IngcartLockManager get ble characteristics success ", res);
			var serviceList = wxApi.getStorage('BLE_ServerList') || _this.ingcart.BLE_ServerList;
			var options = {
				deviceId: wxApi.getStorage('BLE_Target').deviceId || _this.ingcart.BLE_Target.deviceId,
				serviceId: serviceList.SERVICE_UUID,
				characteristicId: serviceList.READ_DATA_UUID,
				state: true
			}
			_this.ingcart.notifyBLECharacteristicValueChange(options)
			.then(res => {
				// set characteristic notification success, now fire unlock request to server
				_this.fireUnlockRequest();
				_this.notifyUnlockProgress(config.UnlockPhases.FIRE_UNLOCK_REQUEST_PHASES);
			})
			.catch(err => {
				_this.notifyUnlockError(code.UNLOCK_ERROR_CODE.ERROR_GET_CHARACTERISTICS);
			})
		})
		.catch(err => {
			console.log("IngcartLockManager err ", err);
			_this.notifyUnlockError(code.UNLOCK_ERROR_CODE.ERROR_SERVICES_DISCOVERED);
		})
	})
	.catch(err => {
		// create ble connection failed
		_this.notifyUnlockError(code.UNLOCK_ERROR_CODE.ERROR_CONNECT_STATUS);
	})
}

IngcartLockManager.prototype.fireUnlockRequest = function() {
	var unlock_options = {
		topic: config.UnlockTopic.TOPIC_UNLOCK_TO_SERVER + this.unlock_bikeid,
		msg: {
			u: wxApi.getStorage('userInfo').token,
			a: 0,
			lat: this.unlock_latitude,
			lng: this.unlock_longitude,
			ble: this.unlock_type // force use ble to unlock
		}
	};
	console.log("IngcartLockManager fire unlock request ", unlock_options);
	this.ingcart.publish(unlock_options);
}

IngcartLockManager.prototype.onSessionFinishedCB = function() {

}

IngcartLockManager.prototype.onBLEConnectionStateChangedCB = function() {

}

IngcartLockManager.prototype.subscribeJourneyMessage = function() {
	const _this = this;
	this.subJourneyMsgToken = this.ingcart.pubsub.subscribe('journey', function(topic, msg) {
		switch (msg.status) {
			case 0:
				// session detail
				break;
			case 13:
				console.log("IngcartLockManager session finished");
				// session finished, first, we unsubscribe the journey message
				_this.ingcart.pubsub.unsubscribe(_this.subJourneyMsgToken);
				// notify close lock event
				_this.lock_cb();
				var BLE_Target = wxApi.getStorage('BLE_Target') || _this.ingcart.BLE_Target;
				// TODO the session state must be update in ingcart self!
				_this.ingcart.sessionState = false;
				_this.ingcart.BLE_RECONNECTION = false;
				_this.ingcart.closeBLEConnection(BLE_Target.deviceId)
				.then(function (res) {

				})
				.catch(err => {

				})
		}
	});
	this.subUnlockProgressToken = this.ingcart.pubsub.subscribe('unlocking', function(topic, msg) {
		if (topic == 'unlocking') {
			if ((typeof msg.status) != 'undefined') {
				switch (msg.status) {
					case 0:
						// unlock success
						console.log("IngcartLockManager unlock success");
						_this.notifyUnlockProgress(100);
						_this.ingcart.setOnUnlockDataTransmissionListener(function(up){});
						break;
					case 1:
						break;
					default:
						_this.ingcart.BLE_CONNECTION = false;
						_this.notifyUnlockError(msg.status);
				}
			}
		}
	});
}

IngcartLockManager.prototype.unsubscribeJourneyMessage= function () {
    this.ingcart.pubsub.unsubscribe(this.subJourneyMsgToken);
    this.ingcart.pubsub.unsubscribe(this.subBleStateToken);
}

IngcartLockManager.prototype.notifyUnlockError = function(errorCode) {
	console.log("IngcartLockManager notifyUnlockError ", errorCode);
	var deviceId = wxApi.getStorage('BLE_Target').deviceId || app.ingcart.BLE_TARGET.deviceId;
	this.ingcart.closeBLEConnection(deviceId);
	this.unsubscribeJourneyMessage();
	this.unlock_fail_cb(errorCode);
}

IngcartLockManager.prototype.notifyUnlockProgress = function(progress) {
	this.unlock_cb(this.unlock_progress = (progress + 40));
	// this.unlock_cb(this.unlock_progress = progress);
}

IngcartLockManager.prototype.reinit = function() {
	Ingcart.reinit(this);
}

module.exports = {
	IngcartLockManager: IngcartLockManager,
}



