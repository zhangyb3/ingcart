function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function replaceStr(source, posStart, posStop, newStr) {
  if (posStart < 0 || posStop >= source.length || source.length == 0 || posStart > posStop) {
    return "invalid parameters...";
  }
  var iBeginPos = 0, iEndPos = source.length;
  var sFrontPart = source.substr(iBeginPos, posStart);
  var sTailPart = source.substr(posStop, source.length);
  var sRet = sFrontPart + newStr + sTailPart;
  return sRet;
}  

module.exports = {
  formatTime: formatTime,
  replaceStr: replaceStr
}