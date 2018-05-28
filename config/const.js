var appkey ='5af943b55332c642348031b8'; //云巴
// const appkey = '593f70a892d52db210f73a09'; //蚁步
// const appkey = "5a5313615a3870cf7b5c3feb";   //幸福

const customServer = {
  phone:'0373-7129560'
}

var service = {
  baseUrlStat1: 'http://192.168.43.141:8080',
  baseUrlBle1: 'http://192.168.43.141:39788',
  baseUrlReg1: 'http://192.168.43.141:9001',
  // baseUrlOd:'https://abj-elockaccount-1.yunba.io:9001',
  baseUrl: 'https://abj-elogic-test1.yunba.io:4145',
  baseUrlStat: 'https://abj-elogic-test1-stat.yunba.io',
  baseUrlBle: 'https://abj-elogic-test1-ble.yunba.io',
  baseUrlReg: 'https://abj-elogic-test1-reg.yunba.io',
  baseUrlCap: 'https://abj-elogic-test1-cap.yunba.io',
  wssAddr: 'wss://bike-websocket.yunba.io'
  // wssAddr: 'wss://abj-logcabin-1.yunba.io'
}

var BASE_URL={

  URL_VERIFY_REALNAME: service.baseUrlReg + '/verify',

/**
 * 验证码相关  https://abj-elogic-test1-cap.yunba.io -> https://abj-elogic-test1:4145
 */
  // URL_REQUEST_CAPTCHA: service.baseUrlReg + '/request_captcha',
  // URL_CHECK_CPATCHA: service.baseUrlReg + '/check_captcha',
  URL_REQUEST_CAPTCHA: service.baseUrlCap + '/request_captcha',
  URL_CHECK_CPATCHA: service.baseUrlCap + '/check_captcha',

  

/**
 * 缴纳押金相关
 * https://abj-elogic-test1-pay.yunba.io ->
 * https://abj-elogic-test1.yunba.io:4145
 */

  URL_PAYMENT : service.baseUrlCap + '/payment',

  URL_REFUND_DEPOSIT: service.baseUrlCap + '/payment?refund=true',  //退押金错误

  URL_REFUND_BALANCE: service.baseUrlCap + '/payment?refund_balance=true',

  

  URL_BALANCE : service.baseUrlCap + '/balance',



  URL_CONFIG: service.baseUrlReg + '/config',

  // URL_GET_OPENID: service.baseUrlReg + '/wechat_micro_program_open_id',

  URL_GET_OPENID: service.baseUrlCap+ '/wechat_micro_program_open_id',

  

  URL_EXTRA: service.baseUrlReg + '/extra_account_info',

  URL_ACCOUNT_STATUS: service.baseUrlReg + '/account_status',

  URL_SESSION: service.baseUrlStat + '/session',
  URL_SESSION_DETAIL: service.baseUrlStat + '/session_details',
  URL_BLE_INFO: service.baseUrlBle + '/ble_info' 
}

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";

  for (var i = 0; i < 10; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const BLEServerUUIDList = {
  SERVICE_UUID: "0000FFF0-0000-1000-8000-00805F9B34FB",//serverUUID
  WRITE_DATA_UUID: "0000FFF1-0000-1000-8000-00805F9B34FB",//writeUUID
  READ_DATA_UUID: "0000FFF2-0000-1000-8000-00805F9B34FB" //readUUID
}

const BLEServerUUIDList_xingfu = {
  SERVICE_UUID: "0000FEE7-0000-1000-8000-00805F9B34FB",//serverUUID
  READ_DATA_UUID: "000036F6-0000-1000-8000-00805F9B34FB",//writeUUID
  WRITE_DATA_UUID: "000036F5-0000-1000-8000-00805F9B34FB" //readUUID
}



//充值相关状态值
const recharge = {
  recharge4deposit:1,
  recharge4balance:2,
  recharge4pay:3
}

// 开锁进度相关
const UnlockPhases = {
  SCAN_PHASES                :30,   // indicate current state is scanning for specific lock by ble local name
  CONNECT_PHASES             :40,   // indicate current state is connecting the specific lock (scan success)
  SERVICE_DISCOVER_PHASES    :45,   // indicate current state is discovering service (connect success)
  FIRE_UNLOCK_REQUEST_PHASES :50,   // indicate current state is fire unlock request to server (discover service success)
  POLL_SESSION_PHASES        :55,   // indicate current state is polling ride session (fire unlock request success)
  UNLOCK_SUCCESS             :100,  // indicate unlock success
}

const UnlockTopic = {
    TOPIC_UNLOCK_TO_SERVER :",ybl/",    // this topic is used in fire unlock request
    TOPIC_UNLOCK :",yblc",              // this topic is used in receive unlock status
    TOPIC_BLE_PENETRATE :",yble",       // this topic is used in transmission the data between ble lock and server
}

var options = {
	appkey: '56a0a88c4407a3cd028ac2fe',
	token: 'EgKIFBJJuoh8KpBaiEwvXQBQ93Rxlk3NAIAGybx/0cWAmQPrC2HKv4tLWVzB4q4Y8HGCTnG0I/IkuVaM5tK1XA=='
};

module.exports={
  appkey: appkey,
  service: service,
  BASE_URL: BASE_URL,
  makeId: makeid,
  BLEServerUUIDList: BLEServerUUIDList,
  BLEServerUUIDList_xingfu: BLEServerUUIDList_xingfu,
  customServer: customServer,
  recharge:recharge,
  UnlockPhases: UnlockPhases,
  UnlockTopic: UnlockTopic,
	options: options,
}