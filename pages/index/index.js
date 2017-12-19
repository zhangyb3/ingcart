

var register = require("../../utils/register.js");
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var login = require("../../utils/login.js");
// var JSEncrypt = require("../../utils/jsencrypt.js");
var operation = require("../../utils/operation.js");

var app = getApp()
Page({
  data: {
    scale: 18,
    latitude: 0,
    longitude: 0,

    timing: false,
    usingMinutes: 0,

    holding: false,
    countingMinutes: 0,

    selection_after_lock: false,
    select_hold_time: false,
    notify_bill: false,
    notify_arrearage: false,
    unlock_progress: false,
    unlock_status: false,
    show_store_detail: false,

  },

// 页面加载
  onLoad: function (parameters) {

		
    this.setData({
      mapHeight: wx.getStorageSync('windowHeight'),
    });

		var fromPage = parameters.from;
		if (fromPage == 'processing') {
			checkUsingCarStatus(this);
		}


    wx.openBluetoothAdapter({
      success: function (res) { },
    });

  

    wx.showShareMenu({
      withShareTicket: true
    });

  },

// 页面显示
  onShow: function(){

    //检查用户是否已经注册，未注册则自动跳转到注册页面
    var that = this;

		checkUsingCarStatus(that);

    if (wx.getStorageSync('alreadyRegister') == 'no' && wx.getStorageSync('logoutSystem') == 'no') {
      wx.navigateTo({
        url: '../register/register',
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
    }

    if (wx.getStorageSync('alreadyRegister') == 'no' && wx.getStorageSync('logoutSystem') == 'yes') {
      var result = loginSystem(this);
      console.log(result);
    }

    if (wx.getStorageSync('logoutSystem') == 'yes') {
      var alreadyRegister = wx.getStorageSync('alreadyRegister');
      wx.clearStorageSync();
      wx.setStorageSync('logoutSystem', 'yes');
      wx.setStorageSync('alreadyRegister', alreadyRegister);
      this.setData({
        logoutSystem: wx.getStorageSync('logoutSystem'),
        alreadyRegister: wx.getStorageSync('alreadyRegister'),
      });
    }

    if (wx.getStorageSync('alreadyRegister') == 'yes' && wx.getStorageSync('logoutSystem') == 'no') {
      this.setData({
        logoutSystem: wx.getStorageSync('logoutSystem'),
        alreadyRegister: wx.getStorageSync('alreadyRegister'),
      });
    }

		

    //刷新页面
    refreshPage(this);

    // 创建地图上下文，移动当前位置到地图中心
    this.mapCtx = wx.createMapContext("ingcartMap");
    this.movetoPosition()

		
  },
// 地图控件点击事件
  bindcontroltap: function(e){


    // 判断点击的是哪个控件 e.controlId代表控件的id，在页面加载时的第3步设置的id
    switch(e.controlId){
      // 点击定位控件
      case 1: this.movetoPosition();
        break;
      // 点击立即用车，判断当前是否可以用车
      case 2: 
        {
          var that = this;
          wx.scanCode({
            onlyFromCamera: true,
            success: function(res) {
              console.log(res);
              if (res.errMsg == 'scanCode:ok') {
                var carId = res.result;
                var customerId = wx.getStorageSync(user.CustomerID);
                var recordId = wx.getStorageSync(user.RecordID);
                
                //开锁
								wx.navigateTo({
									url: 'processing?from=index&carId=' + carId + '&operation=unlock',
									success: function(res) {},
									fail: function(res) {},
									complete: function(res) {},
								})
                
                // operation.unlock(that, customerId,carId,
                //   (result)=>{
                //     console.log(result);
                //     if(result.status == 200)
                //     {
                      
                //       //成功即启动计时器
                //       that.setData({
                //         // timing: true,
                        
                //       });
											
                //       //每分钟刷新一下
                //       var myVar = setInterval(
                //         function () { refreshUsingMinutes(that) },
                //         1000 * 60);
                //     }
                //     else
                //     {
                //       if(result.status == 300)
                //       {
                //         that.setData({
                //           notify_arrearage: true,
                //           arrearage_amount: result.data,
                //         });
                //       }
                //       else{
                //         that.setData({
                //           unlock_progress: false,
                //           unlock_status: true,
                //           unlock_status_image: '/images/unlock_' + result.status + '.png',
                //         });
                //       }
                      
                //     }
                    
                //   },
                //   ()=>{}
                // );

                //关锁
                // wx.showLoading({
                //   title: '关锁中···',
                //   mask: true,
                // })
                // operation.lock(customerId, carId, recordId,
                //   (result) => {
                //     console.log(result);
                //     if (result.status == 200) {
                //       that.setData({
                //         selection_after_lock: true,
                //       });
                //     }
                //     wx.hideLoading();
                //   },
                //   () => { 
                //     wx.hideLoading();
                //   }
                // );
              
              }

            },
            fail: function(res) {},
            complete: function(res) {},
          })
          
          break;
        }
      // 点击保障控件，跳转到报障页
      case 3: wx.navigateTo({
          url: '../maintenance/call'
        });
        break;
      // 点击头像控件，跳转到个人中心
      case 5: wx.navigateTo({
          url: '../my/display'
        });
        break; 
      default: break;
    }
  },

// 地图视野改变事件
  changeRegion: function(e){
    // 拖动地图，获取附件单车位置
    console.log(e);
    // 停止拖动，显示单车位置
    if(e.type == "end")
    {
      var mapCtx = wx.createMapContext("ingcartMap");
      var locationLatitude, locationLongitude;

      var that = this;
      //获取当前地图的中心经纬度
      mapCtx.getCenterLocation({
        success: function (res) {
          console.log(res);
          locationLatitude = res.latitude;
          locationLongitude = res.longitude;

          //显示附近的车
          showNearbyCars(locationLongitude,locationLatitude,that);
        }
      });


        
    }
  },

// 定位函数，移动位置到地图中心
  movetoPosition: function(){
    this.mapCtx.moveToLocation();
  },



  cancelHolding:function(e){
    var that = this;
    operation.cancelHolding(wx.getStorageSync(user.CustomerID),
    (result)=>{
      
      that.setData({
        holding: false,
        notify_bill: true,
        price: result.data.price,
        duration: result.data.time,
				mapHeight: wx.getStorageSync('windowHeight'),
      });

    });
  },

  disappearUnlockStatus:function(e){
    this.setData({
      unlock_status: false,
    });
  },

  toCharge:function(e){
    this.setData({
      notify_arrearage: false,
    });
    wx.navigateTo({
      url: '../../wallet/charge',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  markerTap:function(e){
    
    var markerId = e.markerId;
    var marker = null;
    for(var count = 0; count < this.data.markers.length; count++)
    {
      //找到点击的标记
      if(this.data.markers[count].id == markerId)
      {
        marker = this.data.markers[count];
        break;
      }
    }

    //请求详情
    if(marker.type == 0)
    {
      //无操作
    }
    if(marker.type == 1)
    {
      var that = this;
      //显示店面详情
      wx.request({
        url: config.PytheRestfulServerURL + '/store/location',
        data: {
          storeId: marker.id
        },
        method: 'GET',
        success: function(res) {
          that.setData({
            show_store_detail: true,
            check_store: res.data.data,
						mapHeight: wx.getStorageSync('windowHeight') - 100,
          });
        },
        fail: function(res) {},
        complete: function(res) {},
      })
    }
  },


  returnToIndexPage:function(e){
    this.setData({
      show_store_detail: false,
    });
  },

  disappearStoreDetail:function(e){
    this.setData({
			mapHeight: wx.getStorageSync('windowHeight'),
			show_store_detail: false,
		});
		showControls(this);
  },

  onUnload:function(){

    wx.closeBluetoothAdapter({
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })

    wx.clearStorageSync();
  }

})


function loginSystem(that) {

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

              wx.showToast({
                title: '已登录',
                duration: 1200
              });

						checkUsingCarStatus(that);
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

    }
  );

  wx.setStorageSync('logoutSystem', 'no');

  return 'finish';
}

function refreshPage(the){

  var that = the;
  // 1.获取定时器，用于判断是否已经在计费
  // this.timer = options.timer;

  // 2.获取并设置当前位置经纬度
  wx.getLocation({
    type: "gcj02",
    success: (res) => {
      that.setData({
        longitude: res.longitude,
        latitude: res.latitude
      });

      // 4.请求服务器，显示附近的单车，用marker标记
      showNearbyCars(res.longitude, res.latitude, that);
    }
  });

  // 3.设置地图控件的位置及大小，通过设备宽高定位
  showControls(that);

  

}

function showControls(the){
	var that = the;
	that.setData({
		controls: [{
			id: 1,
			iconPath: '/images/location.png',
			position: {
				left: 15,
				top: wx.getStorageSync('windowHeight') - 60,
				width: 40,
				height: 40
			},
			clickable: true
		},
		{
			id: 2,
			iconPath: '/images/use.png',
			position: {
				left: wx.getStorageSync('windowWidth') / 2 - 105,
				top: wx.getStorageSync('windowHeight') - 72,
				width: 210,
				height: 51
			},
			clickable: true
		},
		{
			id: 3,
			iconPath: '/images/warn.png',
			position: {
				left: 15,
				top: wx.getStorageSync('windowHeight') - 100,
				width: 40,
				height: 40
			},
			clickable: true
		},
		{
			id: 4,
			iconPath: '/images/marker.png',
			position: {
				left: wx.getStorageSync('windowWidth') / 2 - 18,
				top: wx.getStorageSync('windowHeight') / 2 - 36,
				width: 36,
				height: 36
			},
			clickable: true
		},
		{
			id: 5,
			iconPath: '/images/avatar.png',
			position: {
				left: wx.getStorageSync('windowWidth') - 50,
				top: wx.getStorageSync('windowHeight') - 60,
				width: 40,
				height: 40
			},
			clickable: true
		}]
	});
}

function showNearbyCars(longitude,latitude,the){

  var that = the;
  wx.request({
    url: config.PytheRestfulServerURL + '/map/carShow',
    data: {
      longitude: longitude,
      latitude: latitude
    },
    method: 'GET',
    success: function(res) {
      console.log(res);
      var result = res.data;
      if(result.status == 300)
      {
        // wx.showToast({
        //   title: result.msg,
        //   icon: "loading",
        //   duration: 500,
        //   mask: false,
        // })
      }
      else
      {
        var markers = result.data;
        for (var k = 0; k < markers.length; k++) 
        {
          if (markers[k].type == 0)
          {
            markers[k].iconPath = '/images/car.png';
          }
          if (markers[k].type == 1) {
            markers[k].iconPath = '/images/store.png';
          }
          markers[k].width = 43;
          markers[k].height = 47;
        }
        that.setData({
          markers: markers,
        });
      }
    },
    fail: function(res) {},
    complete: function(res) {},
  })

}




function refreshUsingMinutes(the){

  var that = the;
  operation.checkUsingMinutes(
    wx.getStorageSync(user.UsingCar),
    (result) => {
      if (result.status == 200) {
        that.data.usingMinutes = result.data.time;
        that.setData({
          timing: true,
          usingMinutes: result.data.time,
					mapHeight: wx.getStorageSync('windowHeight') - 180,
        });

        
      }
			
    },
  ); 

}

function refreshHoldingMinutes(the) {

  var that = the;
  operation.checkHoldingMinutes(
    wx.getStorageSync(user.CustomerID),
    (result) => {
      if (result.status == 200) {
        that.data.holdingMinutes = result.data.time;
        that.setData({
          holding: true,
          holdingMinutes: result.data.time,
					mapHeight: wx.getStorageSync('windowHeight') - 80,
        });

      }
      else
      {
        that.setData({
          holding: false,
          notify_bill: true,
          price: result.data.price,
          duration: result.data.time,
					mapHeight: wx.getStorageSync('windowHeight'),
        });
        // wx.showModal({
        //   title: '状态 ' + result.status,
        //   content: result.msg,
        //   confirmText: '',
        //   confirmColor: '',

        // });
      }
    },
  );

}



function checkUsingCarStatus(the)
{
	var that = the;
	//检查用车状态
	if (wx.getStorageSync(user.UsingCar) != null) {

		if (wx.getStorageSync(user.UsingCarStatus) == 2) {
			//检查是否保留用车，显示
			operation.checkHoldingMinutes(
				wx.getStorageSync(user.CustomerID),
				(result) => {
					if (result.status == 200) {
						that.data.holdingMinutes = result.data.time;
						that.setData({
							holding: true,
							holdingMinutes: result.data.time,
							mapHeight: wx.getStorageSync('windowHeight') - 80,
						});

						var myVar = setInterval(
							function () { refreshHoldingMinutes(that) },
							1000 * 60);
					}
					else {
						that.setData({
							holding: false,
							notify_bill: true,
							price: result.data.price,
							duration: result.data.time,
							mapHeight: wx.getStorageSync('windowHeight'),
						});

					}
				},
			);
		}

		else if (wx.getStorageSync(user.UsingCarStatus) == 1) {

			//监听蓝牙状态
			wx.onBLECharacteristicValueChange(function (res) {

				console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`);
				console.log(operation.ab2hex(res.value) + " arraybuffer length: " + res.value.byteLength);//坑，非16字节标准数据


				var encryptedTokenFrame = res.value.slice(0, 16);


				//解密载有令牌的通信帧
				operation.decryptFrame(
					wx.arrayBufferToBase64(encryptedTokenFrame),
					(res) => {
						console.log('decrypt token frame: ', res);
						var tokenFrameHexStr = (operation.ab2hex(wx.base64ToArrayBuffer(res)));
						console.log('token: ' + tokenFrameHexStr.substring(0, 32) + ' ,head: ' + tokenFrameHexStr.slice(0, 2));
						


						if (tokenFrameHexStr.slice(0, 8) == '05080100') {

							//检测到关锁成功信号

							wx.navigateTo({
								url: '/pages/index/processing?operation=lock',
								success: function (res) { },
								fail: function (res) { },
								complete: function (res) { },
							})

						}

					}
				);


			});

			
			//检查是否用车，显示
			operation.checkUsingMinutes(
				wx.getStorageSync(user.UsingCar),
				(result) => {
					if (result.status == 200) {
						that.data.usingMinutes = result.data.time;
						that.setData({
							timing: true,
							usingMinutes: result.data.time,
							mapHeight: wx.getStorageSync('windowHeight') - 180,
						});

						var myVar = setInterval(
							function () { refreshUsingMinutes(that) },
							1000 * 60);
					}
				},
			);
		}
		else {
			that.setData({
				timing: false,
				holding: false,
				mapHeight: wx.getStorageSync('windowHeight'),
			});

		}

	}
}