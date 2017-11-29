

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

  },

// 页面加载
  onLoad: function (options) {

    wx.openBluetoothAdapter({
      success: function (res) {
        console.log(res.errMsg)
        // success  
        wx.showToast({
          title: "初始化蓝牙适配器成功",
          duration: 2000
        })
      },
      complete: function (res) {
        console.log(res);
      }
    })  

    // var testData = 'code';
    // var publicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDTu5u08Wel08uWM02GYYRlFXfmEHH7DAbSWufUdU8NlZrE/4BAOwqPMu/vMLdCi4GRHDSmWhoqjC5/7oKoALl6nFCAObtSl6RiWdc8KvcN1D45PASs8M/YPY+oa8iNYZA/drtgXEw4NniC0EB47miGVL4POyLOE3dJlk4LD/AjtQIDAQAB";
    // var encrypt = new JSEncrypt();
    // encrypt.setPublicKey(publicKey);
    // var data = encrypt.encrypt(testData);
    // wx.request({
    //   url: config.PytheRestfulServerURL + '/decode',
    //   data: data,
    //   method: 'GET',
    //   success: function(res) {},
    //   fail: function(res) {},
    //   complete: function(res) {
    //     console.log(res);
    //   },
    // });

    this.setData({
      timing: true,
    });

  },

// 页面显示
  onShow: function(){

    //检查用户是否已经注册，未注册则自动跳转到注册页面
    var that = this;

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
                operation.unlock(customerId,carId);
              
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



      // mapCtx.includePoints({
      //   padding: [10],
      //   points: [{
      //     latitude: latitude,
      //     longitude: longitude
      //   }]
      // });
      // mapCtx.translateMarker({
      //   markerId: 0,
      //   autoRotate: true,
      //   duration: 1000,
      //   destination: {
      //     latitude: latitude,
      //     longitude: longitude,
      //   },
      //   animationEnd() {
      //     console.log('animation end')
      //   }
      // });

        this.setData({
          markers: this.data._markers
        })
    }
  },

// 定位函数，移动位置到地图中心
  movetoPosition: function(){
    this.mapCtx.moveToLocation();
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
            wx.setStorageSync(user.CustomerID, registerInfo.id);
            wx.setStorageSync(user.Description, registerInfo.description);
            wx.setStorageSync(user.Status, registerInfo.status);
            wx.setStorageSync(user.UsingCar, registerInfo.carid);
            wx.setStorageSync(user.RecordID, registerInfo.recordid);
            wx.setStorageSync(user.UsingCarStatus, registerInfo.carstatus);

              wx.showToast({
                title: '已登录',
                duration: 1200
              });

            
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
  wx.getSystemInfo({
    success: (res) => {
      that.setData({
        controls: [{
          id: 1,
          iconPath: '/images/location.png',
          position: {
            left: 20,
            top: res.windowHeight - 80,
            width: 50,
            height: 50
          },
          clickable: true
        },
        {
          id: 2,
          iconPath: '/images/use.png',
          position: {
            left: res.windowWidth / 2 - 70,
            top: res.windowHeight - 72,
            width: 140,
            height: 34
          },
          clickable: true
        },
        {
          id: 3,
          iconPath: '/images/warn.png',
          position: {
            left: 20,
            top: res.windowHeight - 160,
            width: 50,
            height: 50
          },
          clickable: true
        },
        {
          id: 4,
          iconPath: '/images/marker.png',
          position: {
            left: res.windowWidth / 2 - 18,
            top: res.windowHeight / 2 - 36,
            width: 36,
            height: 36
          },
          clickable: true
        },
        {
          id: 5,
          iconPath: '/images/avatar.png',
          position: {
            left: res.windowWidth - 68,
            top: res.windowHeight - 80,
            width: 50,
            height: 50
          },
          clickable: true
        }]
      })
    }
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
        wx.showToast({
          title: result.msg,
          icon: "loading",
          duration: 500,
          mask: false,
        })
      }
      else
      {
        that.setData({
          markers: result.data,
        });
      }
    },
    fail: function(res) {},
    complete: function(res) {},
  })

}