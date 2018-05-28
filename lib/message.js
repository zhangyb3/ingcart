/**
 * 警告弹窗
 * 形参说明：
 *  msg：警告信息，6字以内
 *  dur：显示时间
 *  URL：跳转url
 */
exports.warning = function(msg, dur, url) {
  var dura = 0;
  try {
    dura = (dur !== undefined ? dur : 1500)
  } catch (err) {
    console.error(err);
  }
  var _data_ = arguments;
  wx.showToast({
    title: msg,
    image: '../../image/guide_icon.png',
    mask: true,
    duration: dura || 1500,
    success: function () {
      if (_data_[2]) {
        setTimeout(function () {
          wx.redirectTo({
            url: _data_[2]
          })
        }, dura + 200)
      }
    }
  });
};
/**
 * 确认弹窗
 * 形参说明：
 *  msg：需要显示的信息，6字以内
 *  dur：显示时间
 *  URL：跳转url
 */
exports.right=function(msg, dur, url) {
  var dura = 0;
  try {
    dura = (dur != undefined ? dur : 1500)
  } catch (err) {
    console.log(err);
  }
  var _data_ = arguments;
  wx.showToast({
    title: msg,
    image: '../../image/right.png',
    mask: true,
    duration: dura || 1500,
    success: function () {
      if (_data_[2]) {
        setTimeout(function () {
          wx.redirectTo({
            url: _data_[2]
          })
        }, dura + 200)
      }
    }
  });
};

exports.modal=function(msg, url) {
  var _data_ = arguments;
  wx.showModal({
    title: '提示',
    content: _data_[0],
    confirmColor: '#ff0000',
    confirmText: '确定',
    showCancel: false,
    success: function (res) {
      if (res.confirm) {
        try {
          wx.redirectTo({
            url: _data_[1],
          })
        } catch (err) {

        }

      } else {
        try {
          if (_data_[1] !== '') {
            wx.redirectTo({
              url: _data_[1],
            })
          }
        } catch (err) {

        }
      }
    }
  });
}