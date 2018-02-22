//logs.js
var util = require('../../utils/util.js');
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");

const stratTimes = []
for (let i = 0; i <= 23; i++) {
	if(i < 10)
	{
		i = '0'+i;
	}
  stratTimes.push(i+':00')
}
Page({
  data: {
    winHeight:0,
    display:'none',  //是否显示弹窗
    storeCode:null,
    stratTime: stratTimes,
    storeRunTime:'09:00-18:00',
		_stratTime: '09:00',
    _endTime:'18:00',
    value:[0,0],
		addPadding: 20,
		scrollViewHeight: 0,
		scrollTop: 0,
		isTextarea: false
  },
  onLoad: function () {
    var that=this;
		that.getRect();
    wx.getSystemInfo({
      success: function (res) {
         that.setData({
           winHeight: res.windowHeight
         })        
      }
    })
  },
  
	getRect: function () {
		var that = this;
		wx.createSelectorQuery().select('.store-info').boundingClientRect(function (rect) {
			that.setData({
				scrollViewHeight: rect.height  // 节点的高度
			})

		}).exec()
	},

	runTime: function () {
		var that = this;
		that.setData({
			display: 'block'
		});
		if (that.data.display == 'block') {
			this.setData({
				isTextarea: true
			})
		} else {
			this.setData({
				isTextarea: false
			})
		}

	},
  
  // 营业时间
  changeRunTime:function(e){
    console.log(e.detail.value);
   const val = e.detail.value;
   this.setData({
     _stratTime: this.data.stratTime[val[0]],
     _endTime: this.data.stratTime[val[1]],     
   })
  },
  
	// 弹窗的取消按钮
	close: function () {
		var that = this;
		that.setData({
			display: 'none'
		});
		if (that.data.display == 'block') {
			this.setData({
				isTextarea: true
			})
		} else {
			this.setData({
				isTextarea: false
			})
		}
	},
 
//  弹窗的确定按钮
  sure: function () {
    var that = this;
    var storeRunTime = that.data._stratTime + '-' + that.data._endTime;
    that.setData({
      display: 'none',
      storeRunTime: storeRunTime
    });
		if (that.data.display == 'block') {
			this.setData({
				isTextarea: true
			})
		} else {
			this.setData({
				isTextarea: false
			})
		}
  },
  
  // 店铺编码只能输入数字
  numberType:function(e){
   console.log(e.detail.value);
   var storeCode = e.detail.value;
   this.setData({
     storeCode: storeCode//.replace(/[^0-9]/g,'')
   })

  },


	getStoreName:function(e){
		console.log(e);
		this.data.storeName = e.detail.value;
	},

	getStoreDescription: function (e) {
		console.log(e);
		this.data.storeDescription = e.detail.value;
	},

	managerAddStore:function(e){
		if(this.data.storeName == null || this.data.storeCode == null || this.data.storeCode.length != 7)
		{
			wx.showModal({
				title: '提示',
				content: '请完整填写正确信息',
				showCancel: false,
				confirmText: '我知道了',
				confirmColor: '',
				success: function(res) {},
				fail: function(res) {},
				complete: function(res) {},
			})
		}
		else
		{
			var that= this;
			wx.getLocation({
				type: "gcj02",
				success: (res) => {
					that.setData({
						longitude: res.longitude,
						latitude: res.latitude
					});

					wx.request({
						url: config.PytheRestfulServerURL + '/insert/store/',
						data: {
							name: that.data.storeName,
							description: that.data.storeDescription,
							store_hours: that.data.storeRunTime,
							longitude: that.data.longitude,
							latitude: that.data.latitude,
							location_name: that.data.storeCode,
							dealer: wx.getStorageSync(user.PhoneNum),
						},
						method: 'POST',
						success: function(res) {
							if (res.data.status == 200) {
								wx.showToast({
									title: res.data.data.toString(),
									icon: '',
									image: '',
									duration: 2000,
									mask: true,
									success: function (res) { },
									fail: function (res) { },
									complete: function (res) { },
								})
							}
							if (res.data.status == 400) {
								wx.showModal({
									title: '提示',
									content: res.data.msg,
									showCancel: false,
									confirmText: '我知道了',
									confirmColor: '',
									success: function (res) { },
									fail: function (res) { },
									complete: function (res) { },
								})
							}
						},
						fail: function(res) {},
						complete: function(res) {},
					})

				}
			});
		}
	},

	focuPadding: function () {
		var that = this;

		this.setData({
			addPadding: 150,
		});

		setTimeout(function () {
			that.setData({
				scrollTop: 210
			})
		}, 300);
		// this.getRect();

	},

	blurPadding: function () {
		this.setData({
			addPadding: 20,
			scrollTop: 0
		})
		// this.getRect();
	},

	focuPadding1: function () {
		var that = this;
		this.setData({
			addPadding: 250,
		});

		setTimeout(function () {
			that.setData({
				scrollTop: 170
			})
		}, 300);
		// this.getRect();
	},


})
