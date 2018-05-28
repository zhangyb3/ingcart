const config = require('../config/const');
const Promisify = require('module/es6-Promise');

var $post = function (options) {
  return new Promise(function (success, fail) {
    wx.request({
      url: options.url,
      method: 'POST',
      data: options.data || {},
      header:options.header || {},
      success: success,
      fail: fail
    });
  })
}
var $get = function(options){
  return new Promise(function (success, fail) {
    wx.request({
      url: options.url,
      method: 'GET',
      data: options.data || {},
      header:options.header || {},
      success: success,
      fail: fail
    });
  })
}



var getCaptcha=function(phone,success,fail){
  var options={
    url: config.BASE_URL.URL_REQUEST_CAPTCHA,
    data:{
      phone:phone,
      appkey:config.appkey
    }
  };
  return $post(
    options
  )
}

var checkCaptcha = function(options,success,fail){
  var opts = {
    url: config.BASE_URL.URL_CHECK_CPATCHA,
    data:{
      phone:options.phone,
      captcha:options.captcha,
      appkey:config.appkey
    }
  };
  return $post(opts,success,fail);
}

var getConfig = function(options,success,fail){
  return $get(options,success,fail);
}

var POST = function(obj){
  return new Promisify(function(success,fail){
    obj = obj || {};
    obj.success = function(res){
      success(res);
    };
    obj.fail = function(res){
      fail(res);
    };
    obj.method = 'POST';
    // obj.dataType = obj.dataType || 'json';
    wx.request(obj);
  })
}

module.exports = {
  post: $post,
  GET: $get,
  getCaptcha:getCaptcha,
  checkCaptcha:checkCaptcha,
  getConfig:getConfig,
  POST:POST
}