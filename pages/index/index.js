const app = getApp()
Page({
    data: {},
    onLoad: () => {

    },
    onShow() {},
    uploadImages: function () {
        let that = this
        wx.chooseImage({
            count: 1,
            success(res) {
                that.upload(res.tempFilePaths[0])
            }
        })
    },
    upload: function (filePath) {
        wx.showLoading({
            title: '正在上传',
            mask: true,
        })
        var req = function () {
            return new Promise((resolve, reject) => {
                wx.uploadFile({
                    url: app.globalData.address + '/api/io/upload', //仅为示例，非真实的接口地址
                    filePath: filePath,
                    name: 'file',
                    header: {
                        Cookie: app.globalData.cookie,
                    },
                    success(res) {
                        if (res.statusCode == 200) {
                            resolve(res.data)
                        } else if (res.statusCode == 401) { //未登录
                            reject("未登录")
                        } else {
                            reject(res.data)
                        }
                    },
                    fail(res) {
                        reject("请求超时")
                    },
                })
            })
        };
        req().then((res) => {
            var data = JSON.parse(res).data
            wx.setClipboardData({
                data: app.globalData.address + "/s/" + app.decimalTo62(data.id) + data.ext,
            })
        }).catch(
            res => {
                console.log(res)
                switch (res) {
                    case "请求超时":
                        wx.showToast({
                            title: '请求超时',
                            icon: "none",
                        })
                        break;
                    case "未登录":
                        app.promiseLogin().then((res) => {
                            this.upload(filePath)
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
    },
    //使用说明
    historyUpload: function (event) {
        wx.navigateTo({
            url: '../history/history',
        })
    }
})