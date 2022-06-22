<template>
  <view class="container">
    <view class="title"><text>实时音视频</text></view>
    <view class="tips"><text>以下将展示小程序实时音视频能力，由腾讯云提供技术支持</text></view>
    <view class="guide-box">
      <view class="single-box" :id="index" @click="handleEntry(item.navigateTo)" v-for="(item, index) in entryInfos"
        :key="index">
        <image class="icon" mode="aspectFit" :src="item.icon" role="img"></image>
        <view class="label">{{ item.title }}</view>
        <view class="desc">{{ item.desc }}</view>
      </view>
    </view>
    <view class="logo-box">
      <image class="logo" src="/static/images/logo.png"></image>
    </view>
  </view>
</template>

<script>
const app = getApp()
export default {
  data() {
    return {
      template: '1v1',
      headerHeight: app.globalData.headerHeight,
      statusBarHeight: app.globalData.statusBarHeight,
      entryInfos: [{
        icon: '/static/images/call.png',
        title: '语音聊天室',
        desc: 'voice-room',
        navigateTo: '/pages/voice-room/voice-room-config',
      },
      {
        icon: '/static/images/doubleroom.png',
        title: '双人通话',
        desc: 'video-call',
        navigateTo: '/pages/video-call/video-call-config',
      },
      {
        icon: '/static/images/multiroom.png',
        title: '多人会议',
        desc: 'meetting-room',
        navigateTo: '/pages/meeting-room/meeting-room-config',
      },
      ],
    }
  },
  onLoad() {},
  methods: {
    handleEntry(url) {
      uni.navigateTo({
        url,
      })
    },
  },
}
</script>
<style lang="scss">
  @import "./index.scss";
</style>
