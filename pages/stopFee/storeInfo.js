//logs.js
var util = require('../../utils/util.js');
var config = require("../../utils/config.js");

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
  },
  onLoad: function () {
    var that=this;
    wx.getSystemInfo({
      success: function (res) {
         that.setData({
           winHeight: res.windowHeight
         })        
      }
    })
  },
  
  runTime:function(){
    var that = this;
    that.setData({
      display: 'block'
    })
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
    })
  },
 
//  弹窗的确定按钮
  sure: function () {
    var that = this;
    var storeRunTime = that.data._stratTime + '-' + that.data._endTime;
    that.setData({
      display: 'none',
      storeRunTime: storeRunTime
    })
  },
  
  // 店铺编码只能输入数字
  numberType:function(e){
   console.log(e.detail.value);
   var storeCode = e.detail.value;
   this.setData({
     storeCode: storeCode.replace(/[^0-9]/g,'')
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
		if(this.data.storeName == null || this.data.storeCode == null)
		{
			wx.showModal({
				title: '提示',
				content: '请填写完整信息',
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
							location_name: that.data.storeCode
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


})
