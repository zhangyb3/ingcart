//logs.js
var util = require('../../utils/util.js');
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
    year1: date.getFullYear(),
    year: date.getFullYear(),
    months: months,
    month1: date.getMonth() + 1,
    month: date.getMonth()+1,
    days: days,
    day1: date.getDate(),
    day: date.getDate(),
    hours:hours,
    hour1: date.getHours(),
    hour: date.getHours(),
    minutes: minutes,
    minute1: date.getMinutes(),
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
      year1: this.data.year,
      month1: this.data.month,
      day1: this.data.day,
      hour1: this.data.hour,
      minute1: this.data.minute      
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
     
  }
})
