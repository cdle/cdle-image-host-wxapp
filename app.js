//app.js
const tenToAny = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
App({
  onLaunch: function () {

  },
  globalData: {
    address: "http://42.194.210.249",
    // address: "http://127.0.0.1",
    userInfo: null,
    cookies: null,
  },
  promiseLogin: function() {
    let that = this
    wx.showLoading({
      title: '正在登录',
      mask:true,
    })
    return new Promise(function (resolve, reject) {
      wx.login({
        success: res => {
          wx.request({
            url: that.globalData.address+'/api/auth/login',
            data: {
              code: res.code
            },
            header: {},
            method: 'POST',
            dataType: 'json',
            responseType: 'text',
            success: function (res) {
              if(res.statusCode==200){
                that.globalData.cookie = res.cookies[0].split(";")[0]
                resolve("ok")
              }else{
                wx.showToast({
                  title: res.data,
                  icon:"none"
                })
                reject(res.data)
              }
              wx.hideLoading()
            },
            fail: function (res) {
              reject("网络超时")
              wx.showToast({
                title: "网络超时",
                icon:"none",
              })
            },
          })
        }
      })
    })
  },
  //转62进制
  decimalTo62: function (num) {
    var new_num_str = ""
    var remainder = 0
    var remainder_string = 0
    while (num != 0) {
      remainder = num % 62
      if (76 > remainder && remainder > 9) {
        remainder_string = tenToAny[remainder]
      } else {
        remainder_string = remainder.toString()
      }
      new_num_str = remainder_string + new_num_str
      num = (num - remainder) / 62
    }
    return new_num_str
  },
})