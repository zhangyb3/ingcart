const config=require('../config/const');
const Promisify = require('module/es6-Promise');
const request = require('./request');

exports.getStorage = function(key){
  let result = wx.getStorageSync(key);
  return result;
}

exports.setStorage = function(key,value){
  return wx.setStorageSync(key, value);
}

exports.redirectTo=function(url){
  return new Promisify(function(success,fail){
    wx.redirectTo({
      url:url,
      success:success,
      fail:fail
    })
  })
}

exports.getLocation = function(){
  return new Promisify(function(success,fail){
    wx.getLocation({
      success:success,
      fail:fail
    })
  })
}

exports.scanCode=function(obj){
  return new Promise((resolve,reject)=>{
    obj.success = function(res){
      resolve(res);
    }

    obj.fail = function(res){
      reject(res);
    }
    wx.scanCode(obj);
  });
}

exports.getOpenId = function(appkey){
  return new Promise(function(success,fail){
    wx.login({
      success:function(res){
        var options = {
          url: config.BASE_URL.URL_GET_OPENID,
          data:{
            appkey:config.appkey,
            code:res.code
          }
        };
        request.GET(options)
        .then(function(res){
          success(res);
        })
        .catch(err=>{
          fail(err)
        })
      },
      fail:fail
    })
  })
}

exports.removeStorage = function(obj){
  return new Promisify(function(success,fail){
    obj.success = function(res){
      success(res);
    };
    obj.fail = function(res){
      fail(res);
    };
    wx.removeStorage(obj);
  });
}

exports.showModal = function(obj){
  return new Promisify(function(success,fail){
    obj.success = function(res){
      success(res);
    };
    obj.fail = function(res){
      fail(res);
    };
    return wx.showModal(obj);
  })
}

exports.checkSession = function(obj){
  return new Promisify(function(success,fail){
    
    obj = obj || {};
    obj.success = function(res){
      success(res);
    };
    obj.fail = function(res){
      fail(res);
    };
    wx.checkSession(obj);
  })
}

exports.getStorageSync = function(obj){
  return new Promisify(function(success,fail){
    obj = obj || {};
    obj.success = function(res){
      success(res);
    };
    obj.fail = function(res){
      fail(res);
    };
    wx.getStorage(obj);
  })
}

exports.requestPayment = function(obj){
  return new Promisify(function(success,fail){
    obj = obj || {};
    obj.success = function(res){
      success(res);
    };
    obj.fail = function(res){
      fail(res);
    }
    wx.requestPayment(obj);
  });
}