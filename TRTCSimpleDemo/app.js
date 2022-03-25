// app.js
import Aegis from './static/aegis'
import {genTestUserSig} from './debug/GenerateTestUserSig'
App({
  onLaunch: function() {
    const { model, system, statusBarHeight } = wx.getSystemInfoSync()
    let headHeight
    if (/iphone\s{0,}x/i.test(model)) {
      headHeight = 88
    } else if (system.indexOf('Android') !== -1) {
      headHeight = 68
    } else {
      headHeight = 64
    }

    this.globalData.headerHeight = headHeight
    this.globalData.statusBarHeight = statusBarHeight
    this.aegisInit()
    this.aegisReportEvent('onLaunch', 'onLaunch-success')
  },
  aegisInit() {
    wx.aegis = new Aegis({
      id: 'iHWefAYqxqlqtLQVcA', // 项目key
      reportApiSpeed: true, // 接口测速
      reportAssetSpeed: true, // 静态资源测速
      pagePerformance: true, // 开启页面测速
    });
  },
  aegisReportEvent(name, ext1) {
    if(!this.aegisReportEvent[name]) {
      wx.aegis.reportEvent({
        name,
        ext1,
        ext2: 'wxSimpleDemo',
        ext3: genTestUserSig('').sdkAppID,
      })
      this.aegisReportEvent[name] = true
    }
  },
  globalData: {
    headerHeight: 0,
    statusBarHeight: 0,
  },
})
