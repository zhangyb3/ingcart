
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

		unitpriceText:'用车每半小时收费5元，请注意使用时长',
		securityHint: '出于对儿童的安全健康考虑，建议您搭配车套使用',
		avatar: wx.getStorageSync('avatarUrl'),

		//计时中标记不可点击
		markerClickable: true,
  },

// 页面加载
  onLoad: function (parameters) {

		wx.setStorageSync('alreadyRegister', 'no');

		this.data.fromPage = parameters.from;
		
		if(this.data.fromPage == 'processing')
		{
			wx.setStorageSync('reload', 'yes');
		}
		
		
    wx.showShareMenu({
      withShareTicket: true
    });

  },

// 页面显示
  onShow: function(){

		

		wx.getSystemInfo({
			success: (res) => {
				wx.setStorageSync('windowWidth', res.windowWidth);
				wx.setStorageSync('windowHeight', res.windowHeight);
				wx.setStorageSync('platform', res.platform);
				console.log('platform', res.platform);
				this.setData({
					mapHeight: res.windowHeight - 60,
					holding: false,
					timing: false,
				});
			}
		});

		if (wx.getStorageSync('alreadyRegister') == 'no' || wx.getStorageSync('reload') == 'yes') 
		{

			wx.showLoading({
				title: '',
				mask: true,
				success: function (res) { },
				fail: function (res) { },
				complete: function (res) { },
			});

			var that = this;
			operation.loginSystem(
				this,
				() => {

					wx.hideLoading();
					// checkBluetooth(that);
					refreshPage(that);

					// checkUsingCarStatus(that,
					// 	(checkResult) => {
					// 		wx.hideLoading();

					// 		refreshPage(that);

					// 		console.log('using car', wx.getStorageSync('UsingCar'));
					// 		if (wx.getStorageSync(user.UsingCarStatus) == 1) 
					// 		{

					// 			if(wx.getStorageSync('platform') == 'ios')
					// 			{

					// 				wx.closeBluetoothAdapter({
					// 					success: function (res) {
					// 						wx.openBluetoothAdapter({
					// 							success: function (res) {

					// 								wx.showLoading({
					// 									title: '加载纪录',
					// 									mask: true,
					// 									success: function (res) { },
					// 									fail: function (res) { },
					// 									complete: function (res) { },
					// 								});

					// 								//ios情况下，先搜索已经发现的设备，再搜索没发现的，找到符合的设备就去连接
					// 								wx.startBluetoothDevicesDiscovery({
					// 									services: ['FEE7'],
					// 									allowDuplicatesKey: true,
					// 									interval: 0,
					// 									success: function (res) {

															
					// 										wx.onBluetoothDeviceFound(function (res) {
					// 											if (res.devices[0].deviceId == wx.getStorageSync(user.UsingCarDevice)) {
					// 												wx.stopBluetoothDevicesDiscovery({
					// 													success: function (res) {

					// 														operation.connectDevice(that,
					// 															wx.getStorageSync(user.UsingCarDevice),
					// 															(tokenFrameHexStr) => {
					// 																wx.hideLoading();
					// 																if (tokenFrameHexStr.slice(0, 8) == '05080100') {


					// 																	//检测到关锁成功信号
					// 																	wx.setStorageSync('executeLock', 'yes');
					// 																	operation.managerLock(that);
					// 																	// wx.navigateTo({
					// 																	// 	url: 'processing?operation=lock',
					// 																	// 	success: function (res) { },
					// 																	// 	fail: function (res) { },
					// 																	// 	complete: function (res) { },
					// 																	// })
					// 																	refreshPage(that);

					// 																}

					// 															},
					// 														);
					// 													},
					// 													fail: function (res) { },
					// 													complete: function (res) { },
					// 												})
					// 											}
					// 										})
					// 									},
					// 									fail: function (res) { },
					// 									complete: function (res) { },
					// 								})





					// 							},
					// 							fail: function (res) { },
					// 							complete: function (res) { },
					// 						})
					// 					},
					// 					fail: function (res) { },
					// 					complete: function (res) { },
					// 				});

					// 			}
					// 			else
					// 			{
					// 				//android版监听
					// 				operation.connectDevice(that,
					// 					wx.getStorageSync(user.UsingCarDevice),
					// 					(tokenFrameHexStr) => {
					// 						wx.hideLoading();
					// 						if (tokenFrameHexStr.slice(0, 8) == '05080100') {


					// 							//检测到关锁成功信号
					// 							wx.setStorageSync('executeLock', 'yes');
					// 							operation.managerLock(that);
					// 							// wx.navigateTo({
					// 							// 	url: 'processing?operation=lock',
					// 							// 	success: function (res) { },
					// 							// 	fail: function (res) { },
					// 							// 	complete: function (res) { },
					// 							// })
					// 							refreshPage(that);

					// 						}

					// 					},
					// 				);
					// 			}
								

					// 		}
							


					// 	},
					// );

				}
			);

		}
		else
		{
			var that = this;
			
			// checkBluetooth(that);
			
			// wx.showLoading({
			// 	title: '加载中',
			// 	mask: true,
			// 	success: function (res) { },
			// 	fail: function (res) { },
			// 	complete: function (res) { },
			// });
			refreshPage(that);

			// checkUsingCarStatus(that,
			// 	(checkResult) => {
			// 		wx.hideLoading();

			// 		refreshPage(that);

			// 		console.log('using car', wx.getStorageSync('UsingCar'));
			// 		if (wx.getStorageSync(user.UsingCarStatus) == 1) 
			// 		{
						
			// 			{
			// 				wx.getConnectedBluetoothDevices({
			// 					services: ['FEE7'],
			// 					success: function (res) {
			// 						//检查是否已连接目标设备
			// 						var connected = false;
			// 						for (var count = 0; count < res.devices.length; count++) {

			// 							if (res.devices[count].deviceId == wx.getStorageSync(user.UsingCarDevice)) {
			// 								connected = true;
			// 							}
			// 						}
			// 						//没连接则连接
			// 						if (connected == false)
			// 						{
			// 							wx.showModal({
			// 								title: '',
			// 								content: 'not connected',
			// 								confirmText: '',
			// 								confirmColor: '',
			// 								success: function(res) {},
			// 								fail: function(res) {},
			// 								complete: function(res) {},
			// 							})
			// 							if (wx.getStorageSync('platform') == 'ios') {

			// 								wx.closeBluetoothAdapter({
			// 									success: function (res) {
			// 										wx.openBluetoothAdapter({
			// 											success: function (res) {

			// 												wx.showLoading({
			// 													title: '加载纪录',
			// 													mask: true,
			// 													success: function (res) { },
			// 													fail: function (res) { },
			// 													complete: function (res) { },
			// 												});

			// 												//ios情况下，先搜索已经发现的设备，再搜索没发现的，找到符合的设备就去连接
			// 												wx.startBluetoothDevicesDiscovery({
			// 													services: ['FEE7'],
			// 													allowDuplicatesKey: true,
			// 													interval: 0,
			// 													success: function (res) {
			// 														wx.onBluetoothDeviceFound(function (res) {
			// 															if (res.devices[0].deviceId == wx.getStorageSync(user.UsingCarDevice)) {
			// 																wx.stopBluetoothDevicesDiscovery({
			// 																	success: function (res) {

			// 																		operation.connectDevice(that,
			// 																			wx.getStorageSync(user.UsingCarDevice),
			// 																			(tokenFrameHexStr) => {
			// 																				wx.hideLoading();
			// 																				if (tokenFrameHexStr.slice(0, 8) == '05080100') {


			// 																					//检测到关锁成功信号
			// 																					wx.setStorageSync('executeLock', 'yes');
			// 																					operation.managerLock(that);
			// 																					// wx.navigateTo({
			// 																					// 	url: 'processing?operation=lock',
			// 																					// 	success: function (res) { },
			// 																					// 	fail: function (res) { },
			// 																					// 	complete: function (res) { },
			// 																					// })
			// 																					refreshPage(that);



			// 																				}

			// 																			},
			// 																		);
			// 																	},
			// 																	fail: function (res) { },
			// 																	complete: function (res) { },
			// 																})
			// 															}
			// 														})
			// 													},
			// 													fail: function (res) { },
			// 													complete: function (res) { },
			// 												})





			// 											},
			// 											fail: function (res) { },
			// 											complete: function (res) { },
			// 										})
			// 									},
			// 									fail: function (res) { },
			// 									complete: function (res) { },
			// 								});

			// 							}
			// 							else
			// 							{
			// 								//android版监听
			// 								operation.connectDevice(that,
			// 									wx.getStorageSync(user.UsingCarDevice),
			// 									(tokenFrameHexStr) => {
			// 										wx.hideLoading();
			// 										if (tokenFrameHexStr.slice(0, 8) == '05080100') {


			// 											//检测到关锁成功信号
			// 											wx.setStorageSync('executeLock', 'yes');
			// 											operation.managerLock(that);
			// 											// wx.navigateTo({
			// 											// 	url: 'processing?operation=lock',
			// 											// 	success: function (res) { },
			// 											// 	fail: function (res) { },
			// 											// 	complete: function (res) { },
			// 											// })
			// 											refreshPage(that);



			// 										}

			// 									},
			// 								);
			// 							}

			// 						}
			// 					},
			// 						fail: function (res) { },
			// 						complete: function (res) { },
			// 				});
			// 			}
						
										
			// 		}
					
					

			// 	},
			// 	()=>{
			// 		wx.hideLoading();
			// 	}
			// );
		}
	
    

    // 创建地图上下文，移动当前位置到地图中心
    this.mapCtx = wx.createMapContext("ingcartMap");
    this.movetoPosition()

	
		
  },


// 地图控件点击事件
  bindcontroltap: function(e){


    // 判断点击的是哪个控件 e.controlId代表控件的id，在页面加载时的第3步设置的id
    switch(e.controlId){
      // 点击定位控件
      case 1: 
			{
					this.movetoPosition();
					
					break;
			}
      // 点击立即用车，判断当前是否可以用车
      case 2: 
        {
          var that = this;
					// if (wx.getStorageSync(user.UsingCar) == null || wx.getStorageSync(user.UsingCarStatus) == 2)
					{
			
						wx.scanCode({
							onlyFromCamera: true,
							success: function (res) {
								console.log(res);
								if (res.errMsg == 'scanCode:ok') {
									var parameters = operation.urlProcess(res.result); console.log(parameters);
									operation.qr2mac(parameters.id,
										(result)=>{

											var carId = result.id;
											var customerId = wx.getStorageSync(user.CustomerID);
											var recordId = wx.getStorageSync(user.RecordID);


											if (wx.getStorageSync('platform') == 'ios') 
											{
												//据说每次都要先关闭再打开适配器清理缓存,试一下
												wx.closeBluetoothAdapter({
													success: function (res) {

														wx.openBluetoothAdapter({
															success: function (res) {

																//开锁
																wx.startBluetoothDevicesDiscovery({
																	services: ['FEE7'],
																	allowDuplicatesKey: true,
																	interval: 0,
																	success: function (res) {
																		
																		
																	},
																	fail: function (res) {

																	},
																	complete: function (res) {

																	},
																});

																setTimeout(
																	function(){
																		wx.navigateTo({
																			url: 'processing?from=index&carId=' + carId + '&operation=unlock',
																			success: function (res) { },
																			fail: function (res) {

																			},
																			complete: function (res) { },
																		});
																	},
																	1000
																);

															},
															fail: function (res) {

															},
															complete: function (res) { },
														});

													},
													fail: function (res) {

													},
													complete: function (res) {
													},
												})

												
											}
											else {
												//android版开锁
												wx.closeBluetoothAdapter({
													success: function(res) {

														wx.openBluetoothAdapter({
															success: function(res) {

																wx.navigateTo({
																	url: 'processing?from=index&carId=' + carId + '&operation=unlock',
																	success: function (res) { },
																	fail: function (res) {

																	},
																	complete: function (res) { },
																});

															},
															fail: function(res) {},
															complete: function(res) {},
														})
													},
													fail: function(res) {},
													complete: function(res) {},
												})
												
											}

										},
										(result)=>{
											wx.showModal({
												title: '',
												content: result,
												confirmText: '我知道了',
											})
										}
									);
									
									

								}

							},
							fail: function (res) { },
							complete: function (res) { },
						})
					}
          
          
          break;
        }
      // 点击保障控件，跳转到报障页
      case 3: wx.navigateTo({
          url: '../maintenance/call'
        });
        break;
      // 点击头像控件，跳转到个人中心
      case 5: 
				
				
						wx.navigateTo({
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

		wx.showLoading({
			title: '取消中',
			mask: true,
			success: function (res) { },
			fail: function (res) { },
			complete: function (res) { },
		})
    var that = this;
    operation.cancelHolding(wx.getStorageSync(user.CustomerID),
    (result)=>{
      
      that.setData({
        holding: false,
        notify_bill: true,
        price: result.data.price,
        duration: result.data.time,
				mapHeight: wx.getStorageSync('windowHeight') -60,
      });

			wx.closeBluetoothAdapter({
				success: function(res) {
					wx.hideLoading();
					that.onShow();
				},
				fail: function(res) {},
				complete: function(res) {},
			})
			
			

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
    if(marker.type == 1 && this.data.markerClickable == true)
    {
      var that = this;
      //显示店面详情
      wx.request({
        url: config.PytheRestfulServerURL + '/store/detail',
        data: {
          storeId: marker.id
        },
        method: 'GET',
        success: function(res) {
          that.setData({
            show_store_detail: true,
						holding: false,
            check_store: res.data.data,
						mapHeight: wx.getStorageSync('windowHeight') - 120 -60,
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
			mapHeight: wx.getStorageSync('windowHeight') - 60,
			show_store_detail: false,
			holding: false,
		});
		showControls(this);
  },

  onUnload:function(){

		// stopUnload(this);

    wx.closeBluetoothAdapter({
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })

    wx.clearStorageSync();

		
  },

	

})




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
		controls: [
			{
				id: 1,
				iconPath: '/images/location.png',
				position: {
					left: 15,
					top: wx.getStorageSync('windowHeight') - 60 -80,
					
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
					top: wx.getStorageSync('windowHeight') - 72 -80,
					
					width: 210,
					height: 51
				},
				clickable: true
			},
			// {
			// 	id: 3,
			// 	iconPath: '/images/warn.png',
			// 	position: {
			// 		left: 15,
			// 		top: wx.getStorageSync('windowHeight') - 100 -80,
					
			// 		width: 40,
			// 		height: 40
			// 	},
			// 	clickable: true
			// },
			{
				id: 4,
				iconPath: '/images/marker.png',
				position: {
					left: wx.getStorageSync('windowWidth') / 2 - 18,
					top: wx.getStorageSync('windowHeight') / 2 - 36 -80,
					
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
					top: wx.getStorageSync('windowHeight') - 60 -80,
					
					width: 40,
					height: 40
				},
				clickable: true
			}
		]
	});
}

function showNearbyCars(longitude,latitude,the){

  var that = the;
  wx.request({
    url: config.PytheRestfulServerURL + '/map/show',
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
	if(wx.getStorageSync(user.UsingCarStatus) == 1)
	{
		operation.checkUsingMinutes(
			wx.getStorageSync(user.UsingCar),
			(result) => {
				if (result.status == 200) {
					that.data.usingMinutes = result.data.time;
					that.setData({
						// timing: true,
						holding: false,
						usingMinutes: result.data.time,
						mapHeight: wx.getStorageSync('windowHeight') - 180 - 60,
					});
					//此时图标不可点
					that.data.markerClickable = false;

				}

			},
		); 

	}
  
}

function refreshHoldingMinutes(the) {

  var that = the;
	if (wx.getStorageSync(user.UsingCarStatus) == 2)
	{
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
					//此时图标不可点
					that.data.markerClickable = false;
				}
				else {
					that.setData({
						holding: false,
						notify_bill: true,
						price: result.data.price,
						duration: result.data.time,
						mapHeight: wx.getStorageSync('windowHeight') - 60,
					});
					//此时图标可点
					that.data.markerClickable = true;
					
				}
			},
		);

	}
  
}



function checkUsingCarStatus(the, success, fail)
{
	var that = the;
	//检查用车状态
	if (wx.getStorageSync(user.UsingCar) != null) 
	{

		

		if (wx.getStorageSync(user.UsingCarStatus) == 2) 
		{
			//检查是否保留用车，显示
			operation.checkHoldingMinutes(
				wx.getStorageSync(user.CustomerID),
				(result) => {
					if (result.status == 200) {
						that.data.holdingMinutes = result.data.time;
						that.setData({
							holding: true,
							timing: false,
							holdingMinutes: result.data.time,
							mapHeight: wx.getStorageSync('windowHeight') - 80,
						});
						//此时图标不可点
						that.data.markerClickable = false;
						var myVar = setInterval(
							function () { refreshHoldingMinutes(that) },
							1000 * 60);

						typeof success == "function" && success('checked');
					}
					else 
					{
						that.setData({
							holding: false,
							notify_bill: true,
							price: result.data.price,
							duration: result.data.time,
							mapHeight: wx.getStorageSync('windowHeight') -60,
						});
						//此时图标不可点
						that.data.markerClickable = false;

						typeof success == "function" && success('checked');
					}
				},
			);
		}

		else if (wx.getStorageSync(user.UsingCarStatus) == 1) 
		{

	
			//检查用车时间，显示
			operation.checkUsingMinutes(
				wx.getStorageSync(user.UsingCar),
				(result) => {
					if (result.status == 200) {
						that.data.usingMinutes = result.data.time;
						that.setData({
							// timing: true,
							holding: false,
							usingMinutes: result.data.time,
							mapHeight: wx.getStorageSync('windowHeight') - 180 -60,
						});
						//此时图标不可点
						that.data.markerClickable = false;
						var myVar = setInterval(
							function () { refreshUsingMinutes(that) },
							1000 * 60);

						typeof success == "function" && success('checked');
					}
				},
			);
		}

		else if (wx.getStorageSync(user.UsingCarStatus) == 4)
		{
			setTimeout(
				function () { 
					checkUsingCarStatus(that); 
				},
				1000 * 5
			);
		}

		else {
			that.setData({
				timing: false,
				holding: false,
				mapHeight: wx.getStorageSync('windowHeight') -60,
			});
			//此时图标可点
			that.data.markerClickable = true;
			typeof success == "function" && success('checked');
		}

	}
	else
	{
		typeof success == "function" && success('checked');
	}
}

function checkBluetooth(the){

	
	var that = the;
	
	wx.openBluetoothAdapter({
		success: function (res) 
		{ 
			
			
			typeof success == "function" && success('open');
		},
		fail: function (res) {
			wx.hideLoading();
			wx.showModal({
				title: '蓝牙功能未启用',
				content: '请先开启手机蓝牙功能以便您使用',
				showCancel: false,
				confirmText: '我知道了',
				success: function (res) {
					
				 },
				fail: function (res) { },
				complete: function (res) { 
					// checkBluetooth(that);
				},
			})
		},
		complete: function (res) {
			// wx.hideLoading();
		 },
	});

}

function stopUnload(the){
	var that = the;
	wx.showModal({
		content: '阻止退出',
		confirmText: '',
		confirmColor: '',
		success: function(res) {
			stopUnload(that);
		},
		fail: function(res) {},
		complete: function(res) {},
	})
}

