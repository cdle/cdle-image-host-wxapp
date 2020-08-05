const app = getApp()
Page({
  data: {
    homeio: null,
    address: app.globalData.address,
    content: null,
    showActionsheet: [false, 0],
    groups: [{
        text: '复制链接',
        value: 1
      },
      {
        text: '预览',
        value: 2
      },
      {
        text: '删除',
        type: 'warn',
        value: 3
      }
    ]
  },
  onLoad: function () {
    this.onPullDownRefresh()
  },
  //下拉刷新
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '加载中...',
    })
    this.promiseLoadData().then((data) => {
      for (var i in data) {
        data[i].name = app.decimalTo62(data[i].id) + data[i].ext
      }
      this.setData({
        content: data,
      })
      wx.hideLoading()
    }).catch(
      res => {
        switch (res) {
          case "请求超时":
            wx.showToast({
              title: '请求超时',
              icon: "none",
            })
            break;
          case "未登录":
            app.promiseLogin().then((res) => {
              this.onPullDownRefresh()
            })
            break;
          default:
            wx.showToast({
              title: res,
              icon: "none",
            })
            break;
        }
      }
    )
    wx.stopPullDownRefresh()
  },
  //获取数据
  promiseLoadData: function () {
    let that = this
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.address + '/api/io/upload',
        method: 'GET',
        header: {
          Cookie: app.globalData.cookie,
        },
        success: function (res) {
          if (res.statusCode == 200) {
            that.data.homeio = res.header.Homeio
            resolve(res.data.data)
          } else if (res.statusCode == 401) {
            reject("未登录")
          } else {
            reject(res.data)
          }
        },
        fail: function (res) {
          reject("请求超时")
        },
      })
    })
  },
  //点击图片
  clickImage: function (event) {
    this.setData({
      showActionsheet: [true, event.currentTarget.dataset.id]
    })
  },
  //点击sheet选项
  clickSheetButton: function (e) {
    var id = parseInt(this.data.showActionsheet[1])
    var head = app.globalData.address + "/s/"
    var name = ""
    var content = this.data.content
    for (var i in content) {
      if (content[i].id == id) {
        name = content[i].name
        break
      }
    }
    this.setData({
      showActionsheet: [false, 0]
    })
    switch (e.detail.value) {
      case 1: //将链接复制到剪切板
        wx.setClipboardData({
          data: app.globalData.address + "/s/" + name,
        })
        break;
      case 2: //预览图片
        var urls = Array()
        var current = 0
        if (this.data.homeio) {
          head = "http://" + this.data.homeio + ":1010/s/"
        }
        for (var key in content) {
          if (content[key].id == id) {
            current = key
          }
          if(this.data.homeio){
            urls.push(head + content[key].hash + content[key].ext)
          }else{
            urls.push(head + content[key].name)
          }
        }
        wx.previewImage({
          current: urls[current],
          urls: urls,
        })
        break;
      case 3: //删除图片
        let that = this
        wx.request({
          url: app.globalData.address + '/api/io/upload/' + id,
          method: 'DELETE',
          header: {
            Cookie: app.globalData.cookie,
          },
          success: function (res) {
            if (res.statusCode == 200) {
              var content = that.data.content
              for (var i in content) {
                if (content[i].id == id) {
                  content[i].hidden = true
                }
              }
              that.setData({
                content: content
              })
            }
          },
        })
        break;
    }
  },
})