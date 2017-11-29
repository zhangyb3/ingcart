
var config = require('./config')
var user = require('./user')
var app = getApp();

const CHECK_REGISTER_URL = `${config.PytheRestfulServerURL}/customer/register/check`;//校验是否注册

const SEND_PHONENUM_REGISTER_URL = `${config.PytheRestfulServerURL}/message/verification/`;//发送手机号注册

/**
 * 检查是否已注册
 */
var checkRegister = (success,fail) => {
    wx.request({
      url: CHECK_REGISTER_URL,
      data: {
        // SessionID: wx.getStorageSync(user.SessionID),
        openId : wx.getStorageSync(user.OpenID),
        unionId: wx.getStorageSync(user.UnionID),
      },
      method: 'POST', 
      success: function(res){
        typeof success == "function" && success(res)
      },
      fail: function() {
        typeof success == "function" && fail(res)
      },
      
    })
}

/**
 * 发送验证码
 */
function sendVerificationCode(registerPhonenumber) 
{
    console.log("send verification code");
    wx.request({
      url: SEND_PHONENUM_REGISTER_URL,
      data: {
        
        // openid : wx.getStorageSync(user.OpenID),
        mobile : registerPhonenumber,
      },
      method: 'POST', 
      success: function(res){
        console.log(res);
        typeof success == "function" && success(res)
      },
      fail: function() {
        console.log(res);
        typeof success == "function" && fail(res)
      },
      
    })
}

function commitRegister(the)
{
  var that = the;
  

    wx.request({
      url: config.PytheRestfulServerURL + '/customer/register/',
      data: {
        
        name: wx.getStorageSync('wxNickName'),
        phoneNum: wx.getStorageSync('registerPhoneNum'),
        verificationCode: wx.getStorageSync('verificationCode'),
        
        openId: wx.getStorageSync(user.OpenID),
        unionId: wx.getStorageSync(user.UnionID),
      },
      method: 'POST',
      success: function (res) {
        // success
        console.log(res);
        if (res.data.data == null) {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              }
            }
          });

          that.setData({
            lock_register: false,
          });
        }
        else if (res.data.data.id != null) {
          wx.setStorageSync(user.CustomerID, res.data.data.id);

          wx.setStorageSync(user.Description, res.data.data.description);
          wx.setStorageSync(user.Status, res.data.data.status);

          wx.setStorageSync(user.UsingCar, registerInfo.carid);
          wx.setStorageSync(user.RecordID, registerInfo.recordid);
          wx.setStorageSync(user.UsingCarStatus, registerInfo.carstatus);

          //判断注册是否成功，成功则返回index页面
          wx.setStorageSync('alreadyRegister', 'yes');
          
          wx.navigateBack({
            delta: 1,
          })
          
        }

      },
      fail: function () {
        // fail
        wx.showModal({
          title: '提示',
          content: '登录失败，请重试',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        });

        that.setData({
          lock_register: false,
        });
      },

    });
  
}



module.exports = {
    checkRegister : checkRegister,
    sendVerificationCode : sendVerificationCode,
    commitRegister: commitRegister,
    
}