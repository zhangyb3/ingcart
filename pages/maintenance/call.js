
var config = require("../../utils/config.js");
var user = require("../../utils/user.js");
var operation = require("../../utils/operation.js");

Page({
  data:{
    // 故障车周围环境图路径数组
    picUrls: [],
    // 故障车编号和备注
    faultCar: {
      id: null,
      desc: "",
    },
    // 故障类型数组
    faults: [],
    // 选取图片提示
    actionText: "拍照/相册",
    // 提交按钮的背景色，未勾选类型时无颜色
    btnBgc: "",
    // 复选框的value，此处预定义，然后循环渲染到页面
    checkboxItemsValue: [
      {
        checked: false,
        value: "锁",
        faultType: 1,
      },
      {
        checked: false,
        value: "车轮",
        faultType: 2,
      },
      {
        checked: false,
        value: "座椅",
        faultType: 3,
      },
      {
        checked: false,
        value: "刹车",
        faultType: 4,
      },
      {
        checked: false,
        value: "二维码",
        faultType: 5,
      },
      {
        checked: false,
        value: "雨蓬",
        faultType: 6,
      },
      {
        checked: false,
        value: "其它",
        faultType: 7,
      },
      
    ],

   
    wordsCountdown: 140,
    maintenanceQRId: null,
    faultDescription: null,
  },

// 页面加载
  onLoad:function(options){
    wx.setNavigationBarTitle({
      title: '报障维修'
    })
  },

// 勾选故障类型，获取类型值存入faults
  checkboxChange: function(e){
    console.log(e);
    let selectFaults = e.detail.value;
    if(selectFaults.length == 0){
     
    }else{
      this.setData({
        faults: selectFaults,
      })
    }   
  },

// 输入单车编号，存入faultCar
  carIdInput: function(e){
    this.setData({
      
      maintenanceQRId: e.detail.value,
    })
  },


// 输入备注 
  getTextInput: function (e) {
    var that = this;
    console.log(e.detail.value);
    that.data.faultDescription = e.detail.value;

   
    var leftLength = 140 - e.detail.value.length;
    that.setData({

      wordsCountdown: leftLength,
    });
    
  },

  //扫描故障车牌
  scanFaultCar:function(e) {
    var that = this;
    wx.scanCode({
      onlyFromCamera: true,
      success: function(res) {
        console.log(res);
        if(res.errMsg == 'scanCode:ok')
        {
					var parameters = operation.urlProcess(res.result);
					
          that.data.maintenanceQRId = parameters.id;
          that.setData({
						maintenanceQRId: parameters.id,
          })
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    });
  },


// 提交到服务器
  submitFaults: function(e){

    var that = this;
    //先获取位置再报修
    wx.getLocation({
      type: 'gcj02',
      complete: function (res) {
        wx.setStorageSync(user.Latitude, res.latitude);
        wx.setStorageSync(user.Longitude, res.longitude);

				if (that.data.faults.length > 0 && that.data.maintenanceQRId != null) {

          // switchFaultType(that.data.faults, that);

          wx.request({
            url: config.PytheRestfulServerURL + '/use/callRepair',
            data: {
              customerId: wx.getStorageSync(user.CustomerID),
              type: that.data.faults,
              qrId: that.data.maintenanceQRId,
              longitude: wx.getStorageSync(user.Longitude),
              latitude: wx.getStorageSync(user.Latitude),
              annotation: "haha"
            },
            method: 'POST',
            success: function (res) {
              console.log(res);
							if (res.data.status == 400) {
								wx.showModal({
									title: "提示",
									content: res.data.msg,
									showCancel: false,
									confirmText: '我知道了',
									success: function (res) { },
									fail: function (res) { },
									complete: function (res) { },
								})
							}
							else
							{
								wx.showToast({
									title: res.data.data,
									duration: 1500,
									success: function (res) {
									},
									fail: function (res) { },
									complete: function (res) { 

									},
								});
								wx.navigateBack({
									delta: 1,
								});
							}
              
            }
          })
        } 
				else 
				{
					if (that.data.maintenanceQRId == null)
					{
						wx.showModal({
							title: "提示",
							content: '尚未输入车号',
							showCancel: false,
							confirmText: '我知道了',
							success: (res) => {
								if (res.confirm) {
									// 继续填
								} else {
									console.log("back")
									wx.navigateBack({
										delta: 1 // 回退前 delta(默认为1) 页面
									})
								}
							}
						})
					}
					else
					{
						wx.showModal({
							title: "请填写反馈信息",
							content: '客服热线0755-29648606',
							showCancel: false,
							confirmText: '我知道了',
							success: (res) => {
								if (res.confirm) {
									// 继续填
								} else {
									console.log("back")
									wx.navigateBack({
										delta: 1 // 回退前 delta(默认为1) 页面
									})
								}
							}
						});
					}
          
        }

      },
    });
    
    
  }


})


function switchFaultType(selectFaults, the){

  for(var i = 0; i < selectFaults.length; i++)
  {
    switch (selectFaults[i])
    {
      case "锁":
        {
          selectFaults[i] = 1;
          break;
        };
      case "车轮":
        {
          selectFaults[i] = 2;
          break;
        };
      case "座椅":
        {
          selectFaults[i] = 3;
          break;
        };
      case "刹车":
        {
          selectFaults[i] = 4;
          break;
        };
      case "二维码":
        {
          selectFaults[i] = 5;
          break;
        };
      case "雨蓬":
        {
          selectFaults[i] = 6;
          break;
        };
      case "其它":
        {
          selectFaults[i] = 7;
          break;
        };
      
    }
  }

}