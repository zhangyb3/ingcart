var app = getApp();
var register = require("../../utils/register.js");
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var login = require("../../utils/login.js");
var operation = require("../../utils/operation.js");
var pay = require("../../utils/pay.js");
var IngcartSdk = require('../../lib/ingcart-lock-manager'); 

var app = getApp()
Page({
  data: {
    scale: 15,
		latitude: 22.60204,
		longitude: 113.978616,

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
    wHeight:0,

		amount:0,
    isNoEnough:true,

    coverView: wx.canIUse('cover-view'),
    isShowendUseTip:false,

		qrIdFromWX:null,
    
    endUseCarState:0,
		backFrom:null,
		pStatus:0,

		status:null,
		
		zoneNoticeImg:null,
		showZoneNotice:false,
		waitGprsOn: false,
		gprsOn: false,

		hotline:'',

		hotspotOn: false,
		showHotspotNotice: true,
		notifyLock: false,

		selfReturn: false,
    selfReturnDelay: false,
		selfReturnSuccess: false,
    selfReturnSuccessDelay: false,
		selfReturnFail: false,
    selfReturn4:false,
    delay:true,
    s1countdown: '确定3(s)',
    test:false,
    blueFlag: false,
    showT1: false,
    showT2: false,
    showTFuli: true,
    showTFuliTS: false,
    scanToUnlockStatus:0,
    lyqrId:'',
    zoo:false,
    wxts:false,
    wxts2:false,
    carId:'',
  },

// 页面加载
  onLoad: function (parameters) {
    var that=this;
		getUserLocation(that);
		

		// that.data.status = parameters.status;
		that.data.unlockQR = parameters.unlock;
		that.data.backFrom = parameters.backFrom;
		// that.data.coupon = parameters.coupon;
		// that.data.couponCode = parameters.couponCode;

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          wHeight: res.windowHeight,
					
        })
        console.log(res.windowHeight)
				
      }
    })
    
		wx.setStorageSync('alreadyRegister', 'no');

		wx.setStorageSync('unlock_mode', 'ble');
		wx.setStorageSync('never_show_gprs_notice', true);

		// this.data.fromPage = parameters.from;
		
		if(this.data.fromPage == 'processing')
		{
			wx.setStorageSync('reload', 'yes');
		}

		this.data.qrIdFromWX = operation.urlProcess(decodeURIComponent(parameters.q)).id ;
		console.log("qrIdFromWX!!!!!!!!!!!!!!!!!!!!!!!!!", this.data.qrIdFromWX);
		that.data.from = parameters.from;
		
    wx.showShareMenu({
      withShareTicket: true
    });

		

  },

	onReady: function(){
		wx.getLocation({
			type: 'wgs84',
			altitude: true,
			success: function (res) {
				wx.setStorageSync(user.Latitude, res.latitude);
				wx.setStorageSync(user.Longitude, res.longitude);
			},
			fail: function (res) { },
			complete: function (res) { },
		});
	},

// 页面显示
  onShow: function(){
		var that = this;
		refreshPage(that);
		that.setData({
			latitude: wx.getStorageSync(user.Latitude) || that.data.latitude,
			longitude: wx.getStorageSync(user.Longitude) || that.data.longitude,
		});
		
		

		// if(this.data.backFrom == 'charge')
		// {
		// 	var tempAmount = wx.getStorageSync(user.Amount);
		// 	wx.showLoading({
		// 		title: '数据更新中',
		// 		mask: true,
		// 		success: function(res) {},
		// 		fail: function(res) {},
		// 		complete: function(res) {},
		// 	});

		// 	var info = null;
		// 	var intervalId = setInterval(
		// 		function () { 
		// 			wx.request({
		// 				url: config.PytheRestfulServerURL + '/customer/select',
		// 				data: {
		// 					customerId: wx.getStorageSync(user.CustomerID)
		// 				},
		// 				method: 'GET',
		// 				dataType: '',
		// 				success: function (res) {
		// 					console.log(res);
		// 					info = res.data.data;
							

		// 					wx.setStorageSync(user.CustomerID, info.customerId);
		// 					wx.setStorageSync(user.Description, info.description);
		// 					wx.setStorageSync(user.Status, info.status);
		// 					wx.setStorageSync(user.UsingCar, info.carId);
		// 					wx.setStorageSync(user.RecordID, info.recordId);
		// 					wx.setStorageSync(user.UsingCarStatus, info.carStatus);
		// 					wx.setStorageSync(user.Amount, info.amount);
		// 					wx.setStorageSync(user.PStatus, info.pStatus);
						
		// 					that.setData({		
		// 						amount: info.amount,
		// 						pStatus: info.pStatus,
		// 					});

							
		// 				},
		// 				fail: function (res) { },
		// 				complete: function (res) {

		// 				},
		// 			});

		// 			console.log('interval', intervalId);
		// 			if (wx.getStorageSync(user.Amount) != tempAmount) {
		// 				wx.hideLoading();
		// 				clearInterval(intervalId);
		// 			}				
		// 		},
		// 		1000
		// 	);
			

		// }	

		if (wx.getStorageSync('alreadyRegister') == 'no' || wx.getStorageSync('reload') == 'yes' || that.data.from == 'outside') {

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

					// app.ingcartLockManager = new IngcartSdk.IngcartLockManager(app.options);

					checkUsingCarStatus(that,
						(checkResult) => {
							wx.hideLoading();

              if (that.data.qrIdFromWX == '0000000' && that.data.pStatus == 2)
							{
								that.data.qrIdFromWX = null;
								if(wx.getStorageSync(user.Hotspot) == 1 )
								{
									var date = new Date();
									//确在用车
									if (wx.getStorageSync(user.UsingCar) > 0) {
										//在还车点附近
										if (wx.getStorageSync(user.Hotspot) == 1 && wx.getStorageSync(user.LockLevel) >= 3) {
											wx.request({
												url: config.PytheRestfulServerURL + '/manage/urgent/refund/',//小程序版退费
												data: {
													phoneNum: wx.getStorageSync(user.UsingCar),
													date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':00',
													managerId: -1,
												},
												method: 'POST',
												success: function (res) {
													wx.hideLoading();
													that.setData({
														selfReturn: false,
													});
													if (res.data.status == 200) {
														// wx.showToast({
														// 	title: res.data.msg,
														// 	icon: '',
														// 	image: '',
														// 	duration: 5000,
														// 	mask: true,
														// 	success: function (res) { },
														// 	fail: function (res) { },
														// 	complete: function (res) { },
														// })
														that.setData({
															selfReturnSuccess: true,
														});
													}
													if (res.data.status == 400) {
														// wx.showModal({
														// 	title: '提示',
														// 	content: res.data.msg,
														// 	showCancel: false,
														// 	confirmText: '我知道了',
														// 	success: function (res) { },
														// 	fail: function (res) { },
														// 	complete: function (res) { },
														// })
                            console.log("toBe1")
														that.setData({
															selfReturnFail: true,
														});
													}
												},
												fail: function (res) { },
												complete: function (res) { },
											});
										}
										else {
											console.log('other situation !!!!!!!!!!');
										}

									}
									//没有行程
									else {
										wx.hideLoading();
										that.setData({
											selfReturn: false,
										});
										wx.showModal({
											title: '提示',
											content: '用户尚无行程，押金退款失败',
											showCancel: false,
											confirmText: '我知道了',
											success: function (res) { },
											fail: function (res) { },
											complete: function (res) { },
										})
									}
								}
								if (wx.getStorageSync(user.Hotspot) == 0)
								{
									wx.showModal({
										title: '提示',
										content: '车锁未关闭，请关锁稍候重试',
										showCancel: false,
										confirmText: '我知道了',
										success: function (res) { },
										fail: function (res) { },
										complete: function (res) { },
									});
                } else if (wx.getStorageSync(user.Hotspot) == 3){
                  wx.showModal({
                    title: '提示',
                    content: '不在还车范围内，请推至还车点',
                    showCancel: false,
                    confirmText: '我知道了',
                    success: function (res) { },
                    fail: function (res) { },
                    complete: function (res) { },
                  });
                }
								
							}

							

							if (that.data.qrIdFromWX != null && wx.getStorageSync('alreadyRegister') == 'yes'
                && that.data.qrIdFromWX != '0000000') {

								var qrId = that.data.qrIdFromWX;
								console.log("!!!!!!!!!!!!qrIdFromWX!!!!!!!!", this.data.qrIdFromWX);
                that.setData({
                  lyqrId: this.data.qrIdFromWX,
                  showT2:true
                })
               
                // wx.showModal({
                //   title: '提示',
                //   content: 'XXXX',
                //   showCancel: false,
                //   confirmText: '我知道了',
                //   success: function (res) {
                //     wx.request({
                //       url: config.PytheRestfulServerURL + '/select/lockLevel/carId',
                //       data: {
                //         carId: that.data.lyqrId,
                //       },
                //       method: 'GET',
                //       success: function (res) {
                //         var result = res.data;
                //         if (result.data == 1) {
                //           checkBluetooth(that);
                //         } else {
                //           gotoUnlock(that, qrId);
                //         }
                //       },
                //       fail: function (res) {
                //       },
                //       complete: function (res) {
                //       }
                      
                //     });

                //     that.setData({
                //       qrIdFromWX: null,
                //     });
                //    },
                // })
							}

							if (that.data.showZoneNotice == true) {
								wx.request({
									url: config.PytheRestfulServerURL + '/prompt/select',
									data: {
										description: wx.getStorageSync(user.UsingCarLevel),
									},
									method: 'GET',
									success: function (res) {
										if (res.data.status == 200) {
											that.setData({
												showZoneNotice: true,
												zoneNoticeImg: config.PytheRestfulServerURL + res.data.data,
												hotline: res.data.data.hotline,
											});
										}

									},
									fail: function (res) { },
									complete: function (res) { },
								})
							}

							if (that.data.unlockQR != null) {

								var qrId = that.data.unlockQR;
								//去开锁
								gotoUnlock(that, qrId);
								that.setData({
									unlockQR: null,
									from: null,
								});
							}



						},
						(checkResult) => {


						}
					);

				}
			);

		}

		else {
			var that = this;

			//checkBluetooth(that);

			if (that.data.qrIdFromWX != null && wx.getStorageSync('alreadyRegister') == 'yes'
        && that.data.qrIdFromWX != '0000000') {

				var qrId = that.data.qrIdFromWX;
				//去开锁
				gotoUnlock(that, qrId);
				that.setData({
					qrIdFromWX: null,
				});
			}

			// wx.showLoading({
			// 	title: '加载中',
			// 	mask: true,
			// 	success: function (res) { },
			// 	fail: function (res) { },
			// 	complete: function (res) { },
			// });
			// refreshPage(that);

			checkUsingCarStatus(that,
				(checkResult) => {
					// wx.hideLoading();

					// refreshPage(that);

					if (that.data.showZoneNotice == true) {
						wx.request({
							url: config.PytheRestfulServerURL + '/prompt/select',
							data: {
								description: wx.getStorageSync(user.UsingCarLevel),
							},
							method: 'GET',
							success: function (res) {
								if (res.data.status == 200) {
									that.setData({
										showZoneNotice: that.data.showZoneNotice,
										zoneNoticeImg: config.PytheRestfulServerURL + res.data.data,
									});
								}

							},
							fail: function (res) { },
							complete: function (res) { },
						})
					}


				},
				() => {
					wx.hideLoading();
				}
			);
		}

		if (wx.getStorageSync(user.CustomerID) != null && that.data.unlockQR != null && that.data.backFrom == 'payToUse') {
			// wx.navigateTo({
			// 	url: 'charging?unlock=' + that.data.unlockQR ,
			// 	success: function (res) { },
			// 	fail: function (res) { },
			// 	complete: function (res) { },
			// });
			that.data.backFrom == null;

			if (that.data.unlockQR.length == 7) {
				gotoUnlock(that, that.data.unlockQR);
			}
			else
			{
				wx.showLoading({
					title: '进入行程中...',
					mask: true,
					success: function (res) { },
					fail: function (res) { },
					complete: function (res) { },
				});

				var count = 0;
				var checkWebUnlockInterval = setInterval(
					function () {


						operation.normalUpdateCustomerStatus(
							wx.getStorageSync(user.CustomerID),
							() => {
								console.log('update !!!!!!!!!!!!!!!!!!!!!!!!!');
								checkUsingCarStatus(that,
									(result) => {
										if (count >= 2 || wx.getStorageSync(user.UsingCar) > 0) {
											console.log('count', count);
											wx.hideLoading();
										}
										if (count >= 10 || wx.getStorageSync(user.UsingCar) > 0) {

											clearInterval(checkWebUnlockInterval);
										}
									},
								);

							},
						);



						count++;

					},
					2000
				);
			}

			
			
			
			// var that = this;
			// var originalAmount = that.data.originalAmount;
			// var count = 0;
			
			// var checkAmountIntervalId = setInterval(
			// 	function () {
			// 		count++;
			// 		console.log('check bill !!!!!!!!!!!!!!!', count);

			// 		if (count > 5) {
			// 			wx.hideLoading();
			// 			clearInterval(checkAmountIntervalId);
			// 			wx.showModal({
			// 				title: '提示',
			// 				content: '充值暂未到账，请稍后重试',
			// 				showCancel: false,
			// 				confirmText: '我知道了',
			// 				success: function (res) { 
			// 					that.data.backFrom = null;
			// 				},
			// 				fail: function (res) { },
			// 				complete: function (res) { },
			// 			})
			// 		}

			// 		wx.request({
			// 			url: config.PytheRestfulServerURL + '/wx/query/order',
			// 			data: {
			// 				customerId: wx.getStorageSync(user.CustomerID),
			// 				out_trade_no: wx.getStorageSync('last_out_trade_no'),
			// 			},
			// 			method: 'POST',
			// 			success: function (res) {

			// 				console.log(wx.getStorageSync(user.CustomerID), wx.getStorageSync('last_out_trade_no'));
			// 				if(res.data.status == 200)
			// 				{
			// 					wx.hideLoading();
			// 					clearInterval(checkAmountIntervalId);
			// 					var qrId = that.data.unlockQR;

								
			// 					//去开锁
			// 					gotoUnlock(that, qrId);
								
								
								
			// 				}
			// 				else
			// 				{
			// 					console.log('pay error !!!!!!!!!!!!!!!',res.data);
			// 					// wx.showModal({
			// 					// 	title: '提示',
			// 					// 	content: res.data.status.toString(),
			// 					// 	showCancel: false,
			// 					// 	confirmText: '我知道了',
			// 					// 	success: function(res) {},
			// 					// 	fail: function(res) {},
			// 					// 	complete: function(res) {},
			// 					// })
			// 				}
							

			// 			},
			// 			fail: function (res) { },
			// 			complete: function (res) {

			// 			},
			// 		});

			// 	},
			// 	1000
			// );


		}	

		wx.getSystemInfo({
			success: (res) => {
				wx.setStorageSync('windowWidth', res.windowWidth);
				wx.setStorageSync('windowHeight', res.windowHeight);
				wx.setStorageSync('platform', res.platform);
				console.log('platform', res.platform);
				this.setData({
					mapHeight: wx.getStorageSync('windowHeight'),
					holding: false,
					timing: false,
				});
			}
		});

		if (wx.getStorageSync(user.UsingCarStatus) == 1 || that.data.status == 'unlock' ) 
		{
			
			
			// wx.showLoading({
			// 	title: '数据刷新中...',
			// 	mask: true,
			// 	success: function (res) { },
			// 	fail: function (res) { },
			// 	complete: function (res) { },
			// });

			var that = this;
		
			
			checkUsingCarStatus(that,
				(checkResult) => {
					// wx.hideLoading();
					// refreshPage(that);

					that.setData({
						// timing: true,
						hotling:''||wx.getStorageSync('hotline'),
					});
					
				},
			);

		}

		//使用赠券
		if (that.data.useCoupon == true) 
		{
			that.data.useCoupon = false;
			
			wx.scanCode({
				onlyFromCamera: false,
				success: function (res) {
					console.log(res);
					if (res.errMsg == 'scanCode:ok') {

						
						var parameters = operation.urlProcess(res.result);
						var qrId = parameters.id;
            that.setData({
              carId:qrId
            })

						//特殊锁处理
						if (qrId.slice(0, 'MCA'.length) == 'MCA') {
							qrId = qrId.substring(3);
						}

						wx.getLocation({
							type: 'wgs84',
							altitude: true,
							success: function (res) {
								wx.setStorageSync(user.Latitude, res.latitude);
								wx.setStorageSync(user.Longitude, res.longitude);
							},
							fail: function (res) { },
							complete: function (res) { },
						});

						//去开锁
						gotoUnlock(that, qrId);

					}

				},
				fail: function (res) {
					
				},
				complete: function (res) { },
			});
		}

		if(wx.getStorageSync('unlock_mode') == 'gprs' && wx.getStorageSync('never_show_gprs_notice') == true)
		{
			if (wx.getStorageSync('unlockingQR').length == 8)
			{
				that.setData({
					waitGprsOn: true,
					waitGprsOnNoticeImg: config.PytheRestfulServerURL + '/xcx/wait_gprs_on_new.png',
				});	
			}
			wx.setStorageSync('never_show_gprs_notice', false);
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
      //点击立即用车，判断当前是否可以用车
      // case 2: 
      //   {
      //     var that = this;
			// 		// if (wx.getStorageSync(user.UsingCar) == null || wx.getStorageSync(user.UsingCarStatus) == 2)
			// 		{
			
			// 			wx.scanCode({
			// 				onlyFromCamera: false,
			// 				success: function (res) {
			// 					console.log(res);
			// 					if (res.errMsg == 'scanCode:ok') {
			// 						var parameters = operation.urlProcess(res.result); console.log(parameters);
			// 						var qrId = parameters.id;

			// 						wx.getLocation({
			// 							type: 'wgs84',
			// 							altitude: true,
			// 							success: function(res) {
			// 								wx.setStorageSync(user.Latitude, res.latitude);
			// 								wx.setStorageSync(user.Longitude, res.longitude);
			// 							},
			// 							fail: function(res) {},
			// 							complete: function(res) {},
			// 						});

			// 						//去开锁
			// 						gotoUnlock(that,qrId);

			// 					}

			// 				},
			// 				fail: function (res) { },
			// 				complete: function (res) { },
			// 			})
			// 		}
          
          
      //     break;
      //   }
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
				mapHeight: wx.getStorageSync('windowHeight') ,
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
  
  // 结束用车
  endUseCar:function(){
    var that=this;

    if (that.data.pStatus == 0){
      if (that.data.endUseCarState == 0) {
        that.setData({
          isShowendUseTip: true,
          endUseCarState: 1
        });
      }else{
        that.setData({
          isShowendUseTip: false,
          endUseCarState: 0
        })
      }
    }
    if (that.data.pStatus == 1) {
      if (that.data.endUseCarState == 0) {
        wx.showLoading({
          title: '车锁检测(15秒)',
          mask: true,
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
        var gstim = setInterval(function () {
          if (wx.getStorageSync(user.Hotspot) == 2) {
            clearInterval(gstim);
            wx.hideLoading();
            that.setData({
              isShowendUseTip: true,
              endUseCarState: 1
            });

          } else {
            console.log("fail to unlock!!!!")
          }
        }, 3000);
        setTimeout(function () {
          clearInterval(gstim);
          wx.hideLoading();
          that.setData({
            isShowendUseTip: true,
            endUseCarState: 1
          });
          // if (wx.getStorageSync(user.Hotspot) == 0) {
          //   wx.showModal({
          //     title: '提示',
          //     content: '车锁未关闭，请关锁稍候重试',
          //     showCancel: false,
          //     confirmText: '我知道了',
          //     success: function (res) { },
          //     fail: function (res) { },
          //     complete: function (res) { },
          //   });
          // } else if (wx.getStorageSync(user.Hotspot) == 3) {
          //   wx.showModal({
          //     title: '提示',
          //     content: '不在还车范围内，请推至还车点',
          //     showCancel: false,
          //     confirmText: '我知道了',
          //     success: function (res) { },
          //     fail: function (res) { },
          //     complete: function (res) { },
          //   });
          // }
        }, 15000);
      }else{
        that.setData({
          isShowendUseTip: false,
          endUseCarState: 0
        })
      }
     
    }
		if (that.data.pStatus == 2 )
		{
			wx.showLoading({
				title: '车锁检测(15秒)',
				mask: true,
				success: function(res) {},
				fail: function(res) {},
				complete: function(res) {},
			})
      var gstim = setInterval(function () {
        if (wx.getStorageSync(user.Hotspot) == 1 || wx.getStorageSync(user.Hotspot) == 2 || wx.getStorageSync(user.Hotspot) == 3) {
          clearInterval(gstim);
          wx.hideLoading();
          clearTimeout(gstimRange);
          that.setData({
            selfReturn: true,
          });
         
        }else{
            console.log("fail to unlock!!!!")
        }
      }, 3000);
      var gstimRange = setTimeout(function () {
        clearInterval(gstim);
        wx.hideLoading();
        if (wx.getStorageSync(user.Hotspot) == 0) {
          wx.showModal({
            title: '提示',
            content: '车锁未关闭，请关锁稍候重试',
            showCancel: false,
            confirmText: '我知道了',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          });
        
        }
      }, 15000);
			
		}
    if (that.data.pStatus == 3){
      console.log("公众号模式来啦！！！！29")  
                that.setData({
            selfReturn: true,
          });
      // wx.showLoading({
      //   title: '车锁检测(15秒)',
      //   mask: true,
      //   success: function (res) { },
      //   fail: function (res) { },
      //   complete: function (res) { },
      // })
      // var gstim = setInterval(function () {
      //   if (wx.getStorageSync(user.Hotspot) == 2) {
      //     clearInterval(gstim);
      //     wx.hideLoading();
      //     clearTimeout(gstimRange);
      //     that.setData({
      //       selfReturn: true,
      //     });

      //   } else {
      //     console.log("fail to unlock!!!!")
      //   }
      // }, 3000);
      // var gstimRange = setTimeout(function () {
      //   clearInterval(gstim);
      //   wx.hideLoading();
      //   that.setData({
      //     selfReturn: true,
      //   }); 
      // }, 15000);
    }
    if (that.data.pStatus == 4) {
      console.log("公众号模式（不判断）来啦！！！！29")
      that.setData({
        selfReturn: true,
      });
    }
    
  },

  // 关闭结束用车提示
  closeUseTip:function(){
		var that = this;
    that.setData({
      isShowendUseTip: false,
       endUseCarState: 0
    })
  },

	customerFinishUsing:function(e){
		var formId = e.detail.formId;
		var that  = this;

		wx.showLoading({
			title: '结束行程中...',
			mask: true,
			success: function(res) {},
			fail: function(res) {},
			complete: function(res) {},
		})
		wx.getLocation({
			type: 'wgs84',
			altitude: true,
			success: function(res) {
				wx.setStorageSync(user.Latitude, res.latitude);
				wx.setStorageSync(user.Longitude, res.longitude);

			},
			fail: function(res) {
				
			},
			complete: function(res) {
			
			},
		});

		if (wx.getStorageSync(user.UsingCarStatus) >= 1) {
			var lockStatusResult = null;

			var int = setTimeout(
				function () {
					if (lockStatusResult == null) {
						wx.hideLoading();
						//20秒后依然查不到锁状态，放弃，断开连接，并刷新页面
						wx.closeBLEConnection({
							deviceId: wx.getStorageSync(user.UsingCarDevice),
							success: function (res) { },
							fail: function (res) { },
							complete: function (res) { },
						})
						// wx.showModal({
						// 	title: '提示',
						// 	content: '暂时无法查询锁的信息，请稍后重试',
						// 	showCancel: false,
						// 	confirmText: '我知道了',
						// 	success: function(res) {
						// 		if(res.confirm)
						// 		{
						// 			that.onShow();
						// 		}
						// 	},
						// 	fail: function(res) {},
						// 	complete: function(res) {},
						// })
					}
				},
				1000 * 20
			);

			//检查用车的锁状态
			// operation.checkLockStatus(that,
			// 	(result) => {
			// 		lockStatusResult = result;
			// 		wx.hideLoading();


			// 		if (lockStatusResult == 0)
			// 		{
			// 			//锁未关闭，不予结算
			// 			wx.showModal({
			// 				title: '提示',
			// 				content: '请先关闭车锁',
			// 				showCancel: false,
			// 				confirmText: '我知道了',
			// 				success: function(res) {},
			// 				fail: function(res) {},
			// 				complete: function(res) {},
			// 			})
			// 		}
			// 		else if (lockStatusResult == 1)
			// 		{
			// 			//锁已关闭，可以结算

			
			setTimeout(
				function(){
					wx.request({
						url: config.PytheRestfulServerURL + '/customer/urgent/lock/',
						data: {
							recordId: wx.getStorageSync(user.RecordID),
							carId: wx.getStorageSync(user.UsingCar),
							customerId: wx.getStorageSync(user.CustomerID),
							longitude: wx.getStorageSync(user.Longitude),
							latitude: wx.getStorageSync(user.Latitude),
							formId: formId,
						},
						method: 'POST',
						success: function (res) {
							wx.hideLoading();
							that.setData({
								timing: false,
								isShowendUseTip: false,
							});
							if (res.data.status == 200) {
								
								that.setData({
									selfReturn: false,
								});
							}
							else {
								wx.showModal({
									title: '提示',
									content: res.data.msg,
									showCancel: false,
									confirmText: '我知道了',
									success: function (res) { },
									fail: function (res) { },
									complete: function (res) { },
								})
							}

						},
						fail: function (res) {
							wx.hideLoading();
						},
						complete: function (res) { },
					});
				},
				2000
			);


			// 		}
			// 		else
			// 		{

			// 		}

			// 	}, 
			// 	(result)=>{
			// 		wx.hideLoading();

			// 	}
			// )

		}


	
	},

  // 去充值
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
  wxts: function (e) {
    var that = this;
    that.setData({
      isNotEnough: false,
      wxts: true,
    });

  },
	payToUse:function(e){
		var that= this;
		that.data.originalAmount = wx.getStorageSync(user.Amount);

		that.setData({
      wxts:false
		});

		// wx.showLoading({
		// 	title: '账单处理中...',
		// 	mask: true,
		// 	success: function(res) {},
		// 	fail: function(res) {},
		// 	complete: function(res) {},
		// });

		//直接去付款而非充值
    wx.setStorageSync("czCarId", that.data.carId)
		pay.requestOrder(that, wx.getStorageSync(user.PhoneNum), that.data.price, 0, that.data.unlockQR,
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
                wx.showLoading({
                  title: '请稍等',
                })
                setTimeout(
                  function () {
                    wx.hideLoading();
                  },
                  1000 * 5
                );
								var pages = getCurrentPages();
								var indexPage = pages[0];

								//屏蔽下面一行指令，不等待用户点击充值完成即在后台调用开锁接口
								indexPage.data.backFrom = 'payToUse';


								// wx.redirectTo({
								// 	url: 'index/charging?unlock=' + that.data.unlockQR + '&backFrom=payToUse',
								// 	success: function(res) {},
								// 	fail: function(res) {},
								// 	complete: function(res) {},
								// })
								// gotoUnlock(that, that.data.unlockQR);
								
													
							}
							
						},
						() => { });
				}
			},
			() => { });

	},

	confirmArrearage:function(e){
		var that = this;
		that.setData({
			isNotEnough: false,
			
		});
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
    // if(marker.type == 1 && this.data.markerClickable == true)
    // {
    //   var that = this;
    //   //显示店面详情
    //   wx.request({
    //     url: config.PytheRestfulServerURL + '/store/detail',
    //     data: {
    //       storeId: marker.id
    //     },
    //     method: 'GET',
    //     success: function(res) {
    //       that.setData({
    //         show_store_detail: true,
		// 				holding: false,
    //         check_store: res.data.data,
		// 				mapHeight: wx.getStorageSync('windowHeight') - 120 ,
    //       });
    //     },
    //     fail: function(res) {},
    //     complete: function(res) {},
    //   })
    // }
  },


  returnToIndexPage:function(e){
    this.setData({
      show_store_detail: false,
    });
  },

  disappearStoreDetail:function(e){
    this.setData({
			mapHeight: wx.getStorageSync('windowHeight') ,
			show_store_detail: false,
			holding: false,
		});
		showControls(this);
  },


	//cover-view版扫码开锁
	scanToUnlock:function(e){
		var that = this;
		scanToUnlock(that);
	},

	//隐藏景区提示框
	disappearZoneNotice:function(e){
		var that = this;
		that.setData({
			showZoneNotice:false,
			zoneNoticeImg:null,
		});
	},

	//gprs提示
	showGprsNotice:function(e){
		var that = this;
		that.setData({
			waitGprsOn: false,
			gprsOn: true,
			gprsOnNoticeImg: config.PytheRestfulServerURL + '/xcx/gprs_on_to_unlock.png',
		});
	},

	//删除gprs提示
	disappearGprsNotice:function(e){
		var that = this;
		that.setData({
			waitGprsOn: false,
			gprsOn: false,
		});
		// scanToUnlock(that);
	},

	//拨打热线
	callHotline:function(e){
		var that = this;
		wx.makePhoneCall({
			phoneNumber: that.data.hotline,
			success: function(res) {},
			fail: function(res) {},
			complete: function(res) {},
		})
	},


	//热点还车退押金
	hotspotReturnDeposit:function(e){
    if (this.data.jxcountdown == '退押金') {
    var that = this;
    wx.request({
      url: config.PytheRestfulServerURL + '/manage/urgent/refund/',
      data: {
        phoneNum: wx.getStorageSync(user.UsingCar),
        managerId: -1,
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status == 200) {
          that.setData({
            showHotspotNotice: false,
            hotspotOn: false,
            notifyLock: true,
          });
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
    }
		
	},

	//热点不管
	hotspotHoldOn: function (e) {
    if (this.data.jxcountdown == '继续行程') {
      var that = this;
      that.setData({
        showHotspotNotice: false,
      });
      var templeIgnoreHotspot = setTimeout(
        function () {
          that.setData({
            showHotspotNotice: true,
          });
        },
        1000 * 60 * 2
      );
    }
	},

	//取消锁车提示
	disappearLockNotice: function (e) {
		var that = this;
		that.setData({
			notifyLock: false,
			selfReturnSuccess: false,
			selfReturnFail: false,
      selfReturnSuccessDelay: false,
		});
		
	},

  //取消提示
  closeZoo: function (e) {
    var that = this;
    that.setData({
      wxts2: false,
    });

  },

	//自行还车扫码停止计费
	selfReturnToRefund: function () {


    
		 var that = this;
    if(that.data.pStatus == 3){
      wx.scanCode({
        onlyFromCamera: true,
        success: function (res) {
          if (res.errMsg == 'scanCode:ok') {
          if (res.rawData == 'aHR0cDovL3dlaXhpbi5xcS5jb20vci9waWpkeGRQRU40NUlyWmVtOTMyMA==') {
            that.setData({
              selfReturn: false
            })
            var date = new Date();
            //确在用车
            if (wx.getStorageSync(user.UsingCar) > 0) {
              //在还车点附近
                wx.showLoading({
                  title: '退款检测(15秒)',
                  mask: true,
                  success: function (res) { },
                  fail: function (res) { },
                  complete: function (res) { },
                })
                var gstims = setInterval(function () {
                  if (wx.getStorageSync(user.Hotspot) == 2) {
                    clearInterval(gstim);
                    wx.hideLoading();
                    clearTimeout(gstimRange);
                    wx.request({
                      url: config.PytheRestfulServerURL + '/manage/urgent/refund/',//小程序版退费
                      data: {
                        phoneNum: wx.getStorageSync(user.UsingCar),
                        date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':00',
                        managerId: -1,
                      },
                      method: 'POST',
                      success: function (res) {
                        wx.hideLoading();
                        that.setData({
                          selfReturn: false,
                        });
                        if (res.data.status == 200) {
                          that.setData({
                            selfReturnSuccess: true,
                          });
                        }
                      },
                      fail: function (res) { },
                      complete: function (res) { },
                    });

                  } else {
                    console.log("fail to unlock!!!!")
                  }
                }, 3000);
                var gstimsRange = setTimeout(function () {
                  clearInterval(gstims);
                  wx.hideLoading();
                  if (wx.getStorageSync(user.Hotspot) == 4) {
                    that.setData({
                      selfReturn4: true
                    })
                  }else{
                    that.setData({
                      selfReturnDelay: true
                    })
                  }
                },15000);
            }
            //没有行程
            else {
              wx.hideLoading();
              that.setData({
                selfReturn: false,
              });
              wx.showModal({
                title: '提示',
                content: '用户尚无行程，押金退款失败',
                showCancel: false,
                confirmText: '我知道了',
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { },
              })
            }
          }


        }

        	},
      });
    } else if (that.data.pStatus == 4  || that.data.pStatus == 1){
      wx.scanCode({
        onlyFromCamera: true,
        success: function (res) {
          if (res.rawData == 'aHR0cDovL3dlaXhpbi5xcS5jb20vci9waWpkeGRQRU40NUlyWmVtOTMyMA==') {
            that.setData({
              selfReturn: false
            })
            var date = new Date();
            //确在用车
            if (wx.getStorageSync(user.UsingCar) > 0) {
                    wx.hideLoading();
                    wx.request({
                      url: config.PytheRestfulServerURL + '/manage/urgent/refund/',//小程序版退费
                      data: {
                        phoneNum: wx.getStorageSync(user.UsingCar),
                        date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':00',
                        managerId: -1,
                      },
                      method: 'POST',
                      success: function (res) {
                        wx.hideLoading();
                        that.setData({
                          selfReturn: false,
                        });
                        if (res.data.status == 200) {
                          that.setData({
                            selfReturnSuccess: true,
                          });
                        }
                        if (res.data.status == 400) {
                          that.setData({
                            selfReturnFail: true,
                          });
                        }
                      },
                      fail: function (res) { },
                      complete: function (res) { },
                    });

            }
            //没有行程
            else {
              wx.hideLoading();
              that.setData({
                selfReturn: false,
              });
              wx.showModal({
                title: '提示',
                content: '用户尚无行程，押金退款失败',
                showCancel: false,
                confirmText: '我知道了',
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { },
              })
            }
          }
        }
      });
    }else{
      wx.scanCode({
        onlyFromCamera: true,
        success: function (res) {
          console.log(res);
          if (res.errMsg == 'scanCode:ok') {


          	var parameters = operation.urlProcess(res.result);
          	var qrId = parameters.id;
            if (qrId == '0000000') {
            that.setData({
              selfReturn: false
            })
            var date = new Date();
            //确在用车
            if (wx.getStorageSync(user.UsingCar) > 0) {
              //在还车点附近
              if ((wx.getStorageSync(user.Hotspot) == 1 || wx.getStorageSync(user.Hotspot) == 2 || wx.getStorageSync(user.Hotspot) == 3) && wx.getStorageSync(user.LockLevel) >= 3) {
                console.log("我是zhaozha，我现在慌的一批")
                wx.showLoading({
                  title: '退款检测(15秒)',
                  mask: true,
                  success: function (res) { },
                  fail: function (res) { },
                  complete: function (res) { },
                })
                var gstims = setInterval(function () {
                  if (wx.getStorageSync(user.Hotspot) == 2) {
                    wx.hideLoading();
                    wx.request({
                      url: config.PytheRestfulServerURL + '/manage/urgent/refund/',//小程序版退费
                      data: {
                        phoneNum: wx.getStorageSync(user.UsingCar),
                        date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':00',
                        managerId: -1,
                      },
                      method: 'POST',
                      success: function (res) {
                        wx.hideLoading();
                        that.setData({
                          selfReturn: false,
                        });
                        if (res.data.status == 200) {
                          // wx.showToast({
                          // 	title: res.data.msg,
                          // 	icon: '',
                          // 	image: '',
                          // 	duration: 5000,
                          // 	mask: true,
                          // 	success: function (res) { },
                          // 	fail: function (res) { },
                          // 	complete: function (res) { },
                          // })
                          clearTimeout(gstimsRange);
                          clearInterval(gstims);
                          that.setData({
                            selfReturnSuccess: true,
                          });
                        }
                        if (res.data.status == 400) {
                          // wx.showModal({
                          // 	title: '提示',
                          // 	content: res.data.msg,
                          // 	showCancel: false,
                          // 	confirmText: '我知道了',
                          // 	success: function (res) { },
                          // 	fail: function (res) { },
                          // 	complete: function (res) { },
                          // })
                          console.log("toBe2")
                          console.log(res.data.msg)
                          that.setData({
                            selfReturnFail: true,
                          });
                        }
                      },
                      fail: function (res) { },
                      complete: function (res) { },
                    });

                  } else {
                    console.log("fail to unlock!!!!")
                  }
                }, 3000);
                var gstimsRange = setTimeout(function () {
                  clearInterval(gstims);
                  wx.hideLoading();
                  if (wx.getStorageSync(user.Hotspot) == 0) {
                    wx.showModal({
                      title: '提示',
                      content: '车锁未关闭，请关锁稍候重试',
                      showCancel: false,
                      confirmText: '我知道了',
                      success: function (res) { },
                      fail: function (res) { },
                      complete: function (res) { },
                    });
                  } else if (wx.getStorageSync(user.Hotspot) == 3) {
                    wx.showModal({
                      title: '提示',
                      content: '不在还车范围内，请推至还车点',
                      showCancel: false,
                      confirmText: '我知道了',
                      success: function (res) { },
                      fail: function (res) { },
                      complete: function (res) { },
                    });
                  }
                }, 15000);

              }
              else {
                console.log('other situation !!!!!!!!!!');
              }

            }
            //没有行程
            else {
              wx.hideLoading();
              that.setData({
                selfReturn: false,
              });
              wx.showModal({
                title: '提示',
                content: '用户尚无行程，押金退款失败',
                showCancel: false,
                confirmText: '我知道了',
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { },
              })
            }
          }


        }

         	},
      });
    }


    
	},

	selfReturnHoldOn:function(){

      var that = this;
      that.setData({
        selfReturn: false,
      });
    
	},

  selfReturn4HoldOn: function () {

    var that = this;
    that.setData({
      selfReturn4: false,
    });

  },


  //自行还车扫码停止计费
  selfReturnToRefundDelay: function () {
                  var that = this;
                  that.setData({
                    selfReturnDelay: false
                  })
                  var date = new Date();
                  wx.request({
                    url: config.PytheRestfulServerURL + '/manage/urgent/refund/',//小程序版退费
                    data: {
                      phoneNum: wx.getStorageSync(user.UsingCar),
                      date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':00',
                      managerId: -1,
                    },
                    method: 'POST',
                    success: function (res) {
                      wx.hideLoading();
                      wx.hideLoading();
                      that.setData({
                        selfReturn: false,
                      });
                      if (res.data.status == 200) {
                        that.setData({
                          selfReturnSuccess: true,
                        });
                      }
                    },
                    fail: function (res) { },
                    complete: function (res) { },
                  });
    // if (that.data.pStatus == 4 || that.data.pStatus == 3 || that.data.pStatus == 1) {
    //   wx.scanCode({
    //     onlyFromCamera: true,
    //     success: function (res) {
    //       if (res.rawData == 'aHR0cDovL3dlaXhpbi5xcS5jb20vci9waWpkeGRQRU40NUlyWmVtOTMyMA==') {
    //         that.setData({
    //           selfReturnDelay: false
    //         })
    //         var date = new Date();
    //         //确在用车
    //         if (wx.getStorageSync(user.UsingCar) > 0) {
    //           wx.hideLoading();
    //           wx.request({
    //             url: config.PytheRestfulServerURL + '/manage/urgent/refund/delay',//小程序版退费
    //             data: {
    //               phoneNum: wx.getStorageSync(user.UsingCar),
    //               date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':00',
    //               managerId: -1,
    //             },
    //             method: 'POST',
    //             success: function (res) {
    //               // wx.hideLoading();
    //               // that.setData({
    //               //   selfReturn: false,
    //               // });
    //               // if (res.data.status == 200) {
    //               //   that.setData({
    //               //     selfReturnSuccess: true,
    //               //   });
    //               // }
    //               // if (res.data.status == 400) {
    //               //   that.setData({
    //               //     selfReturnFail: true,
    //               //   });
    //               // }
    //             },
    //             fail: function (res) { },
    //             complete: function (res) { },
    //           });
    //           wx.hideLoading();
    //           that.setData({
    //             selfReturnSuccessDelay: true,
    //             delay:false
    //           });
    //         }
    //         //没有行程
    //         else {
    //           wx.hideLoading();
    //           that.setData({
    //             selfReturn: false,
    //           });
    //           wx.showModal({
    //             title: '提示',
    //             content: '用户尚无行程，押金退款失败',
    //             showCancel: false,
    //             confirmText: '我知道了',
    //             success: function (res) { },
    //             fail: function (res) { },
    //             complete: function (res) { },
    //           })
    //         }
    //       }
    //     }
    //   });
    // } else {
    //   wx.scanCode({
    //     onlyFromCamera: true,
    //     success: function (res) {
    //       console.log(res);
    //       if (res.errMsg == 'scanCode:ok') {


    //         var parameters = operation.urlProcess(res.result);
    //         var qrId = parameters.id;
    //         if (qrId == '0000000') {
    //           that.setData({
    //             selfReturn: false
    //           })
    //           var date = new Date();
    //           //确在用车
    //           if (wx.getStorageSync(user.UsingCar) > 0) {
    //             //在还车点附近
    //             if ((wx.getStorageSync(user.Hotspot) == 1 || wx.getStorageSync(user.Hotspot) == 2 || wx.getStorageSync(user.Hotspot) == 3) && wx.getStorageSync(user.LockLevel) >= 3) {
    //               console.log("我是zhaozha，我现在慌的一批")
    //               wx.showLoading({
    //                 title: '退款检测(15秒)',
    //                 mask: true,
    //                 success: function (res) { },
    //                 fail: function (res) { },
    //                 complete: function (res) { },
    //               })
    //               var gstims = setInterval(function () {
    //                 if (wx.getStorageSync(user.Hotspot) == 2) {
    //                   wx.hideLoading();
    //                   wx.request({
    //                     url: config.PytheRestfulServerURL + '/manage/urgent/refund/',//小程序版退费
    //                     data: {
    //                       phoneNum: wx.getStorageSync(user.UsingCar),
    //                       date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':00',
    //                       managerId: -1,
    //                     },
    //                     method: 'POST',
    //                     success: function (res) {
    //                       wx.hideLoading();
    //                       that.setData({
    //                         selfReturn: false,
    //                       });
    //                       if (res.data.status == 200) {
    //                         // wx.showToast({
    //                         // 	title: res.data.msg,
    //                         // 	icon: '',
    //                         // 	image: '',
    //                         // 	duration: 5000,
    //                         // 	mask: true,
    //                         // 	success: function (res) { },
    //                         // 	fail: function (res) { },
    //                         // 	complete: function (res) { },
    //                         // })
    //                         clearTimeout(gstimsRange);
    //                         clearInterval(gstims);
    //                         that.setData({
    //                           selfReturnSuccess: true,
    //                         });
    //                       }
    //                       if (res.data.status == 400) {
    //                         // wx.showModal({
    //                         // 	title: '提示',
    //                         // 	content: res.data.msg,
    //                         // 	showCancel: false,
    //                         // 	confirmText: '我知道了',
    //                         // 	success: function (res) { },
    //                         // 	fail: function (res) { },
    //                         // 	complete: function (res) { },
    //                         // })
    //                         console.log("toBe2")
    //                         console.log(res.data.msg)
    //                         that.setData({
    //                           selfReturnFail: true,
    //                         });
    //                       }
    //                     },
    //                     fail: function (res) { },
    //                     complete: function (res) { },
    //                   });

    //                 } else {
    //                   console.log("fail to unlock!!!!")
    //                 }
    //               }, 3000);
    //               var gstimsRange = setTimeout(function () {
    //                 clearInterval(gstims);
    //                 wx.hideLoading();
    //                 if (wx.getStorageSync(user.Hotspot) == 0) {
    //                   wx.showModal({
    //                     title: '提示',
    //                     content: '车锁未关闭，请关锁稍候重试',
    //                     showCancel: false,
    //                     confirmText: '我知道了',
    //                     success: function (res) { },
    //                     fail: function (res) { },
    //                     complete: function (res) { },
    //                   });
    //                 } else if (wx.getStorageSync(user.Hotspot) == 3) {
    //                   wx.showModal({
    //                     title: '提示',
    //                     content: '不在还车范围内，请推至还车点',
    //                     showCancel: false,
    //                     confirmText: '我知道了',
    //                     success: function (res) { },
    //                     fail: function (res) { },
    //                     complete: function (res) { },
    //                   });
    //                 }
    //               }, 15000);

    //             }
    //             else {
    //               console.log('other situation !!!!!!!!!!');
    //             }

    //           }
    //           //没有行程
    //           else {
    //             wx.hideLoading();
    //             that.setData({
    //               selfReturn: false,
    //             });
    //             wx.showModal({
    //               title: '提示',
    //               content: '用户尚无行程，押金退款失败',
    //               showCancel: false,
    //               confirmText: '我知道了',
    //               success: function (res) { },
    //               fail: function (res) { },
    //               complete: function (res) { },
    //             })
    //           }
    //         }


    //       }

    //     },
    //   });
    // }



  },

  selfReturnHoldOnDelay: function () {

    var that = this;
    that.setData({
      selfReturnDelay: false,
    });

  },

  showT1: function () {
      var that = this;
      that.setData({
        showT1: true,
        s1countdown:'确定3(s)',
        scanToUnlockStatus: '0'
      });
      var count = 3;
      var tim = setInterval(function () {
        that.setData({
          s1countdown: '确定' + --count + '(s)'
        })
      }, 1000);
      setTimeout(function () {
        clearInterval(tim);
        that.setData({
          s1countdown: '确定',
          scanToUnlockStatus:'scanToUnlock'
        })

      }, 3000);
  },

  showFuli: function () {
    var that = this;
    that.setData({
      showTFuli: false,
      showTFuliTS: true,
    });
    
  },

  hideFuli: function () {
    var that = this;
    that.setData({
      showTFuli: true,
      showTFuliTS: false,
    });
    wx.navigateToMiniProgram({
      appId: 'wxae5c9bca05f25503',
      path: 'pages/shelf/shelf',
      envVersion: 'release',
      success(res) {
        // 打开成功
      }
    })

  },

  DToUnlock: function () {
   
    var that = this;
    that.setData({
      showT2:false
    })
    wx.request({
      url: config.PytheRestfulServerURL + '/select/lockLevel/carId',
      data: {
        carId: that.data.lyqrId,
      },
      method: 'GET',
      success: function (res) {
        var result = res.data;
        if (result.data == 1) {
          checkBluetooth(that);
        } else {
          gotoUnlock(that, that.data.lyqrId);
        }
      },
      fail: function (res) {
      },
      complete: function (res) {
      }

    });

    that.setData({
      qrIdFromWX: null,
    });


  },

  hiddenT1: function () {
    var that = this;
    that.setData({
      s1countdown: '确定3(s)',
      showT1: false,
    });
  },

  onUnload:function(){

		// app.ingcartLockManager = null;

    wx.closeBluetoothAdapter({
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })

    wx.clearStorageSync();

		
  },

  // 优惠活动
  toActivity: function () {
    wx.navigateTo({
      url: '../activity/activity',
    })
  },
  
  // 报修
  toRepair: function () {
		var that = this;
		wx.showModal({
			title: '',
			content: '如果行程中不能开锁，请拨打' + (that.data.hotline || '4001-151-606'),
			showCancel: true,
			cancelText: '取消',
			confirmText: '拨打热线',
			success: function (res) {
				if (res.cancel) {

				}
				if (res.confirm) {
					wx.makePhoneCall({
						phoneNumber: that.data.hotline || '4001-151-606',
						success: function (res) { },
						fail: function (res) { },
						complete: function (res) { },
					})
				}
			},
			fail: function (res) { },
			complete: function (res) { },
		});
    // wx.navigateTo({
    //   url: '../maintenance/call',
    // })
  },
  
  // 去充值
  toRecharge:function(){
    this.setData({
      isNotEnough: false,
    });
    // wx.navigateTo({
    //   url: '../my/rechargePage',
    // });

  },

	// 去我的页面
	toMy: function () {
		
		wx.navigateTo({
			url: '../my/display',
		});

	},
  
})




function refreshPage(the){

  var that = the;
  // 1.获取定时器，用于判断是否已经在计费
  // this.timer = options.timer;

  // 2.获取并设置当前位置经纬度
  wx.getLocation({
    type: "wgs84",
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

  //4.运动轨迹画线
	showPolyline(that);

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
					top: wx.getStorageSync('windowHeight') -80,
					
					width: 40,
					height: 40
				},
				clickable: true
			},
			// {
			// 	id: 2,
			// 	iconPath: '/images/use.png',
			// 	position: {
			// 		left: wx.getStorageSync('windowWidth') / 2 - 105,
			// 		top: wx.getStorageSync('windowHeight') - 12 -80,
					
			// 		width: 210,
			// 		height: 51
			// 	},
			// 	clickable: true
			// },
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
					top: wx.getStorageSync('windowHeight') / 2 - 36,
					
					width: 36,
					height: 36
				},
				clickable: true
			},
			// {
			// 	id: 5,
			// 	iconPath: '/images/avatar.png',
			// 	position: {
			// 		left: wx.getStorageSync('windowWidth') - 50,
			// 		top: wx.getStorageSync('windowHeight') - 60 -20,
					
			// 		width: 40,
			// 		height: 40
			// 	},
			// 	clickable: true
			// }
		]
	});
}

function showPolyline(the) {
	var that = the;
	that.setData({
		polyline: 
			[
				{
					points: 
						[
							{
							latitude: 24.780254,
							longitude: 113.699559

							}, 
							{
								longitude: 113.701855,
								latitude: 23.779778
							}
						],
						color: "#ff0000",
						width: 5,
						dottedLine: true,
						arrowLine: true,
				},
			], 
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
		//检查是否已手动关锁，假如已手动关锁，即转为保留用车状态
		//暂不实现

		//未手动关锁，不在保留用车状态
		operation.checkUsingMinutes(
			wx.getStorageSync(user.UsingCar),
			(result) => {
				console.log('check status !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
				if (result.status == 200) {
					that.data.usingMinutes = result.data.time;
					that.setData({
						timing: true,
						// holding: false,
						usingMinutes: result.data.time,
						mapHeight: wx.getStorageSync('windowHeight')  ,
						price: result.data.price,
						giving: wx.getStorageSync(user.UsingCarGiving),
						hotline: result.data.hotline,
						// pStatus: wx.getStorageSync(user.PStatus),
						pStatus: result.data.p_status,
					});
					wx.setStorageSync(user.LockLevel, result.data.car_level);
					wx.setStorageSync(user.Hotspot, result.data.hotspot);
					// if (wx.getStorageSync(user.Hotspot) == 1) {
					// 	that.setData({
					// 		selfReturn: true,
					// 	});
					// }
					
					// if (wx.getStorageSync(user.Hotspot) == 1) {
					// 	that.setData({
					// 		hotspotOn: true,
					// 		// showHotspotNotice: true,
					// 	});
						
					// }
					// if (wx.getStorageSync(user.Hotspot) == 0) {
					// 	that.setData({
					// 		hotspotOn: false,
					// 		// showHotspotNotice: true,
					// 	});

					// }
					//此时图标不可点
					that.data.markerClickable = false;

				}
				else{
					wx.setStorageSync(user.UsingCar, null);
					wx.setStorageSync(user.UsingCarStatus, 0);
					that.setData({
						timing: false,
						
					});
				}
			},
		); 

		// operation.normalUpdateCustomerStatus(
		// 	wx.getStorageSync(user.CustomerID),
		// 	() => {
		// 		that.setData({
		// 			amount: wx.getStorageSync(user.Amount),
		// 			price: wx.getStorageSync(user.UsingCarPrice),
		// 			pStatus: wx.getStorageSync(user.PStatus),
		// 		});
		// 	},
		// );

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
						mapHeight: wx.getStorageSync('windowHeight') - 20,
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
						mapHeight: wx.getStorageSync('windowHeight') ,
						pStatus: wx.getStorageSync(user.PStatus),
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
							mapHeight: wx.getStorageSync('windowHeight') - 20,
							pStatus: wx.getStorageSync(user.PStatus),
						});
						//此时图标不可点
						that.data.markerClickable = false;
						var myVar = setInterval(
							function () { 
								refreshHoldingMinutes(that);
								if (wx.getStorageSync(user.UsingCarStatus) != 2){
									clearInterval(myVar);
								}
							},
							1000 * 2);

						typeof success == "function" && success('checked');
					}
					else 
					{
						that.setData({
							holding: false,
							notify_bill: true,
							price: result.data.price,
							duration: result.data.time,
							mapHeight: wx.getStorageSync('windowHeight') ,
							pStatus: wx.getStorageSync(user.PStatus),
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
					
					if (result.status == 200) 
					{
						that.data.usingMinutes = result.data.time;
						that.setData({
							timing: true,
							holding: false,
							usingMinutes: result.data.time,
							mapHeight: wx.getStorageSync('windowHeight')  ,
							price: result.data.price,
							giving: wx.getStorageSync(user.UsingCarGiving),
							hotline: result.data.hotline,
							// pStatus: wx.getStorageSync(user.PStatus),
							pStatus: result.data.p_status,
							carId: wx.getStorageSync(user.UsingCar),
						});
						wx.setStorageSync(user.LockLevel, result.data.car_level);
						wx.setStorageSync(user.Hotspot, result.data.hotspot);
						// if (wx.getStorageSync(user.Hotspot) == 1) {
						// 	that.setData({
						// 		selfReturn: true,
						// 	});
						// }
						
						// if (wx.getStorageSync(user.Hotspot) == 1) {
						// 	that.setData({
						// 		hotspotOn: true,
						// 		// showHotspotNotice: true,
						// 	});
							
						// }
						// if (wx.getStorageSync(user.Hotspot) == 0) {
						// 	that.setData({
						// 		hotspotOn: false,
						// 		// showHotspotNotice: true,
						// 	});

						// }
						//此时图标不可点
						that.data.markerClickable = false;
						var myVar = setInterval(
							function () { 
								refreshUsingMinutes(that);
								if (wx.getStorageSync(user.UsingCarStatus) != 1) {
									clearInterval(myVar);
									that.setData({
										timing: false,
									});
								}
							},
							1000 * 10);

						
						
						typeof success == "function" && success('checked');
					}
					else
					{
						typeof success == "function" && success('checked but wrong');
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

		else if (wx.getStorageSync(user.UsingCarStatus) == 3)
		{
			
		}

		else {
			that.setData({
				timing: false,
				holding: false,
				mapHeight: wx.getStorageSync('windowHeight') ,
				pStatus: wx.getStorageSync(user.PStatus),
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
      success: function (res) {

        typeof success == "function" && success('open');
        that.setData({
          blueFlag:true
        })
        console.log("检测锁==========>>" + that.data.lyqrId)
        wx.request({
          url: config.PytheRestfulServerURL + '/select/lockLevel/carId',
          data: {
            carId: that.data.lyqrId,
          },
          method: 'GET',
          success: function (res) {
            var result = res.data;
            console.log('lock level zhaozha' + result.data)
            if (result.data == 1) {
              gotoUnlock(that, that.data.lyqrId);
            } 
            else {
              console.log('网络开锁失败====》》进入蓝牙开锁')
              {
                console.log("progress page", that.data.lyqrId);
                doUnlock(that, that.data.lyqrId);
              }

            }
          },
          fail: function (res) {
          },
          complete: function (res) {
          }
        });
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
            checkBluetooth(that);
          },
        })
      },
      complete: function (res) {
        // wx.hideLoading();
      },
    });

    //万一进来时没打开蓝牙
    if (app.ingcartLockManager == null) {
      // app.ingcartLockManager = new IngcartSdk.IngcartLockManager(app.options);
    }
}

function stopUnload(the){
	var that = the;
	wx.showModal({
		content: '阻止退出',
		confirmText: '确定',
		success: function(res) {
			stopUnload(that);
		},
		fail: function(res) {},
		complete: function(res) {},
	})
}

//去开锁
function gotoUnlock(the, qrId, success, fail)

{
  console.log('进入开锁......1')
  if (qrId==null){
    qrId = this.data.lyqrId
  }
  console.log(qrId)
	var that = the;
	that.data.backFrom = null;
	var type = 0;
	var code = 'no';
	if (that.data.coupon == 'oneDayTicket' && that.data.couponCode != null)
	{
	
		type = 1;
		code = that.data.couponCode;
		
	}
	wx.setStorageSync('using_coupon_code', code);
  console.log('qrId:' + qrId + 'type' + type + 'code' + code +'customerId'+wx.getStorageSync(user.CustomerID))
	wx.request({
		url: config.PytheRestfulServerURL + '/qr/unlock/prepare',
		data: {
			customerId: wx.getStorageSync(user.CustomerID),
			qrId: qrId,
			carId: qrId,
			type: type,
			code: code,
		},
		method: 'GET',
		success: function (res) {
			var result = res.data;
      if (result.data==null){
        wx.setStorageSync("descriptionOfGood", "")
      }else{
        wx.setStorageSync("descriptionOfGood", res.data.data.description)
      }
			if (result.status == 200) {

				// var continueToUnlock = true;
				that.setData({
					lockLevel: result.data.car_level,
				});
				console.log('lock level',that.data.lockLevel);
				if(that.data.lockLevel >= 3)
				{
          //checkBluetooth(that);
					wx.showLoading({
						title: '开锁中...',
						mask: true,
						success: function(res) {},
						fail: function(res) {},
						complete: function(res) {},
					})
					wx.request({
						url: config.PytheRestfulServerURL + '/web/unlock',
						data: {
							customerId: wx.getStorageSync(user.CustomerID),
							qrId: qrId,
							carId: qrId,
						},
						method: 'POST',
						success: function(res) {
							wx.hideLoading();
							if(res.data.status == 200)
							{
								
								wx.showToast({
									title: res.data.msg,
									icon: '',
									image: '',
									duration: 3000,
									mask: true,
									success: function(res) {},
									fail: function(res) {},
									complete: function(res) {},
								});
								operation.normalUpdateCustomerStatus(
									wx.getStorageSync(user.CustomerID),
									() => {
										checkUsingCarStatus(that);
									},
								);
                that.setData({
                  wxts2:true
                })
							}
							else
							{
								wx.hideLoading();
								console.log("redirect to progress page !!!!!!!!!!!!!!!!");
                that.setData({
                  lyqrId: qrId
                })
                checkBluetooth(that);
								
							}
							
						},
						fail: function(res) {},
						complete: function(res) {
							wx.hideLoading();
						},
					})
				}

				else
				{
          console.log('进入开锁......2')
					doUnlock(that, qrId);
				}
				

			}
			else {
				if (result.status == 300) {
					that.setData({
						isNotEnough: true,
						price: result.data.price,
						giving: result.data.giving,
						hints: result.data.annotation,
						pStatus: wx.getStorageSync(user.PStatus),
						unlockQR: qrId,
					});
					


				}
				else {


					wx.showModal({
						title: '提示',
						content: result.msg,
						showCancel: false,
						confirmText: '我知道了',
						success: function (res) {

						},
						fail: function (res) { },
						complete: function (res) { },
					})
				}

			}


		},
		fail: function (res) {
			typeof fail == "function" && fail(res);

		},
		complete: function (res) {

		}
	});

}


function getUserLocation(the) {
	console.log('location !!!!!!!!!!!!!!!');
	var that = the;
	wx.getLocation({
		type: "wgs84",
		success: (res) => {
			wx.setStorageSync(user.Latitude, res.latitude);
			wx.setStorageSync(user.Longitude, res.longitude);
		},
		fail: (res) => {
			wx.showModal({
				title: '提示',
				content: '如果不能提供位置，将无法使用很多功能',
				showCancel: true,
				cancelText: '拒绝',
				confirmText: '接受',
				success: function (res) {
					if (res.cancel) {
						wx.setStorageSync(user.Latitude, 22.60204);
						wx.setStorageSync(user.Longitude, 113.978616);
					}
					else
					{
						console.log('!!!!!!!!!!!!!!! unload !!!!!!!!!!!!!!!!');
						wx.openSetting({
							success: function(res) {
								//if(data.authSetting["scope.userLocation"] == true)
								{
									getUserLocation(that);
									that.onShow();
								}
							},
							fail: function(res) {},
							complete: function(res) {},
						})
					}
				},
				fail: function (res) { },
				complete: function (res) { },
			})
		}
	});
}

function scanToUnlock(the){

  var that = the;

  // if (wx.getStorageSync(user.UsingCar) == null || wx.getStorageSync(user.UsingCarStatus) == 2)
  {

    wx.scanCode({
      onlyFromCamera: false,
      success: function (res) {
        console.log(res);
        if (res.errMsg == 'scanCode:ok') {
          var parameters = operation.urlProcess(res.result); console.log(parameters);
          var qrId = parameters.id;
          that.setData({
            showT1: false,
            carId:qrId
          })
          //特殊锁处理
          if (qrId.slice(0, 'MCA'.length) == 'MCA') {
            qrId = qrId.substring(3);
          }
          if (qrId == '0000000') {
            that.setData({
              selfReturn: true,
            });

          }
          else {
            wx.getLocation({
              type: 'wgs84',
              altitude: true,
              success: function (res) {
                wx.setStorageSync(user.Latitude, res.latitude);
                wx.setStorageSync(user.Longitude, res.longitude);
              },
              fail: function (res) { },
              complete: function (res) { },
            });
            console.log(wx.getStorageSync(user.CustomerID))
            console.log(qrId)
            that.setData({
              lyqrId: qrId,
              selfReturn: false,
            })
            wx.request({
              url: config.PytheRestfulServerURL + '/select/lockLevel/carId',
              data: {
                carId: qrId,
              },
              method: 'GET',
              success: function (res) {
                var result = res.data;
                console.log('lock level zhaozha' + result.data )
                if (result.data==1){
                  if (that.data.blueFlag) {
                    console.log('lock level zhaozha   0')
                    gotoUnlock(that, qrId);
                  } else {
                    console.log('lock level zhaozha    1' )
                    checkBluetooth(that);
                  }
                }else{
                  gotoUnlock(that, qrId);
                }
              },
              fail: function (res) {
              },
              complete: function (res) {
              }
            });

            //获取锁类型
            // wx.request({
            //   url: config.PytheRestfulServerURL + '/select/lockLevel/carId',
            //   data: {
            //     carId: qrId,
            //   },
            //   method: 'GET',
            //   success: function (res) {
            //     var result = res.data;
            //     if (result.data == 1) {
            //       if (that.data.blueFlag) {
            //         gotoUnlock(that, qrId);
            //       } else {
            //         checkBluetooth(that);
            //       }
            //     } else {
            //       //去开锁
            //       gotoUnlock(that, qrId);
            //     }

            //   },
            //   fail: function (res) {

            //   },
            //   complete: function (res) {

            //   }
            // });

          }


        }

      },
      fail: function (res) { },
      complete: function (res) { },
    });

  }



}

function doUnlock(the, qrId){
	var that = the;
	var qrId = qrId;

	//通过检查，可以开锁
	operation.qr2mac(qrId,
		(result) => {

			var carId = result.mac;
			var customerId = wx.getStorageSync(user.CustomerID);
			var recordId = wx.getStorageSync(user.RecordID);

			if (qrId.length == 8) 
			{

				wx.navigateTo({
					url: 'processing?from=index&carId=' + qrId + '&qrId=' + qrId + '&operation=unlock',
					success: function (res) { },
					fail: function (res) {

					},
					complete: function (res) { },
				});
			}
			else 
			{

				if (wx.getStorageSync('platform') == 'ios') {
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
										function () {
											wx.hideLoading();
											wx.navigateTo({
												url: 'processing?from=index&carId=' + carId + '&qrId=' + qrId + '&operation=unlock',
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
						success: function (res) {

							wx.openBluetoothAdapter({
								success: function (res) {
									wx.hideLoading();
									wx.navigateTo({
										url: 'processing?from=index&carId=' + carId + '&qrId=' + qrId + '&operation=unlock',
										success: function (res) { },
										fail: function (res) {

										},
										complete: function (res) { },
									});

								},
								fail: function (res) { },
								complete: function (res) { },
							})
						},
						fail: function (res) { },
						complete: function (res) { },
					})

				}


			}


		},
		(result) => {
			wx.showModal({
				title: '',
				content: result,
				showCancel: false,
				confirmText: '我知道了',
			})
		}
	);
}
