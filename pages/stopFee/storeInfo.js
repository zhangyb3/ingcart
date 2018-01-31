//logs.js
var util = require('../../utils/util.js');
const stratTimes = []
for (let i = 0; i <= 23; i++) {
  stratTimes.push(i+':00')
}
Page({
  data: {
    winHeight:0,
    display:'none',  //是否显示弹窗
    inputValue:'',  
    stratTime: stratTimes,
    storeRunTime:'9:00-18:00',
    stratTime1: '',
    endTime1:'',
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
     stratTime1: this.data.stratTime[val[0]],
     endTime1: this.data.stratTime[val[1]],     
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
    var storeRunTime = that.data.stratTime1 + '-' + that.data.endTime1;
    that.setData({
      display: 'none',
      storeRunTime: storeRunTime
    })
  },
  
  // 店铺编码只能输入数字
  numberType:function(e){
   console.log(e.detail.value);
   var inputValue = e.detail.value;
   this.setData({
     inputValue: inputValue.replace(/[^0-9]/g,'')
   })
  }
})
