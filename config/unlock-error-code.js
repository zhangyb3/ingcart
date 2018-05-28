let unlock_error_code = {
	ERROR_UNKNOWN_LOCK                   : 98,
    ERROR_SCAN_WITHOUT_LOCATION_PERMISSION : 99,
    ERROR_SCAN_TIMEOUT                  : 100,
    ERROR_CONNECT_TIMEOUT               : 101,
    ERROR_CONNECT_STATUS                : 102,
    ERROR_SERVICES_DISCOVERED           : 103,
    ERROR_CONNECT                       : 104,
    ERROR_GET_CHARACTERISTICS           : 105,
    ERROR_RECONNECT                     : 106,
    ERROR_FIRE_UNLOCK_REQUEST_FAILED    : 107,
    ERROR_QUERY_LOCK_INFO               : 108,
    ERROR_OBTAIN_BLUETOOTH_ADAPTER      : 109,
    ERROR_UNLOCK_TIMEOUT                : 110,
    ERROR_UNLOCK_ACTIVITY_EXIST         : 111,
    ERROR_RESTOREING                    : 112,
    ERROR_NOT_BLE_LOCK                  : 113,
    ERROR_RESTORE_TIMEOUT               : 114,
    ERROR_LOCK_OPENED                   : 115,
    ERROR_LOCK_LOCKED                   : 116,
    ERROR_SERVER_TIMEOUT                : 117,
    ERROR_SCAN_ERROR                    : 118,
}

module.exports={
  UNLOCK_ERROR_CODE: unlock_error_code
}