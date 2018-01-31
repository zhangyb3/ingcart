//logs.js
var util = require('../../utils/util.js');
var config = require("../../utils/config.js");

const date = new Date()
const years = []
const months = []
const days = []
const hours = []
const minutes = []

for (let i = 2017; i <= date.getFullYear(); i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  if(i<10){
    i='0'+i;
  }
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  if (i < 10) {
    i = '0' + i;
  }
  days.push(i)
}

for (let i = 0; i <= 23; i++) {
  if (i < 10) {
    i = '0' + i;
  }
  hours.push(i)
}

for (let i = 0; i <= 59; i++) {
  if (i < 10) {
    i = '0' + i;
  }
  minutes.push(i)
}
Page({
  data: {
    winHeight:0,
    display:'none',  //是否显示弹窗
    checkTel:'none', //是否显示手机号码格式
    years: years,
    _year: date.getFullYear(),
    year: date.getFullYear(),
    months: months,
    _month: date.getMonth() + 1,
    month: date.getMonth()+1,
    days: days,
    _day: date.getDate(),
    day: date.getDate(),
    hours:hours,
    _hour: date.getHours(),
    hour: date.getHours(),
    minutes: minutes,
    _minute: date.getMinutes(),
    minute: date.getMinutes(),
    value: [0,0,0,0,0],
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
  
  // picker选择时间
  changeTime: function (e) {
    const val = e.detail.value;
    console.log(e.detail);
    this.setData({
      year: this.data.years[val[0]],
      month: this.data.months[val[1]],
      day: this.data.days[val[2]],
      hour: this.data.hours[val[3]],
      minute: this.data.minutes[val[4]]
    })
  },

//  点击停止时间的框
  getTime:function(){
     var that=this;
     that.setData({
       display:'block'
     })
  },

//  取消按钮
  close:function(){
    var that = this;
    that.setData({
      display: 'none'
    })
  },
  
  // 确定按钮
  sure: function () {
    var that = this;
    that.setData({
      display: 'none' ,
      _year: this.data.year,
      _month: this.data.month,
      _day: this.data.day,
      _hour: this.data.hour,
      _minute: this.data.minute      
    })
  },
 
//  输入失去焦点时，检查用户输入的手机号格式是否正确
  checkTelRight:function(e){
    var inputTel=e.detail.value;
    var regExp=/0?(13|14|15|18)[0-9]{9}/;
    if (!regExp.test(inputTel)){
      this.setData({
        checkTel: 'block'
      })
    }else{
      this.setData({
        checkTel: 'none'
      })
    }
     
  },

	getCustomerPhoneNum:function(e){
		console.log(e.detail.value);
		this.data.customerPhoneNum = e.detail.value;
	},

	managerStopFee:function(e){
		var that = this;
		wx.request({
			url: config.PytheRestfulServerURL + '/manage/urgent/lock/',
			data: {
				phoneNum: that.data.customerPhoneNum,
				date: that.data._year+'-'+that.data._month+'-'+that.data._day+' '+that.data._hour+':'+that.data._minute+':00',
			},
			method: 'POST',
			success: function (res) {
				if(res.data.status == 200)
				{
					wx.showToast({
						title: res.data.msg,
						icon: '',
						image: '',
						duration: 2000,
						mask: true,
						success: function(res) {},
						fail: function(res) {},
						complete: function(res) {},
					})
				}
				if(res.data.status == 400)
				{
					wx.showModal({
						title: '提示',
						content: res.data.msg,
						showCancel: false,
						confirmText: '我知道了',
						confirmColor: '',
						success: function(res) {},
						fail: function(res) {},
						complete: function(res) {},
					})
				}
			},
			fail: function (res) { },
			complete: function (res) { },
		})
	},

})
