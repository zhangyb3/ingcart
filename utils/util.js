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


var keyStr = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv"
  + "wxyz0123456789+/" + "=";  

function encode(input) {
  var input = "" + input;
  var output = "";
  var chr1, chr2, chr3 = "";
  var enc1, enc2, enc3, enc4 = "";
  var i = 0;
  do {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;
    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2)
      + keyStr.charAt(enc3) + keyStr.charAt(enc4);
    chr1 = chr2 = chr3 = "";
    enc1 = enc2 = enc3 = enc4 = "";
  } while (i < input.length);

  return output;
}  

module.exports = {
  formatTime: formatTime,
  replaceStr: replaceStr,
  encode: encode
}