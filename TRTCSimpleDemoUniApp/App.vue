<script>
import { genTestUserSig } from './debug/GenerateTestUserSig.js'
import Aegis from './lib/aegis.js'

export default {
  onLaunch() {
    console.log('App Launch')
    this.aegisInit()
    this.aegisReportEvent('onLaunch', 'onLaunch-success')
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  },
  globalData: {
    aegis: null,
  },
  methods: {
	  aegisInit() {
	    this.globalData.aegis = new Aegis({
	      id: 'iHWefAYqxqlqtLQVcA', // 项目key
	      reportApiSpeed: true, // 接口测速
	      reportAssetSpeed: true, // 静态资源测速
	      pagePerformance: true, // 开启页面测速
	    })
	  },
	  aegisReportEvent(name, ext1) {
	    if (!this.aegisReportEvent[name]) {
	      this.globalData.aegis.reportEvent({
	        name,
	        ext1,
	        ext2: 'wxSimpleDemoUniApp',
	        ext3: genTestUserSig('').sdkAppID,
	      })
	      this.aegisReportEvent[name] = true
	    }
	  },
  },
}
</script>

<style>
	/*每个页面公共css */
</style>
