<template>
  <view class="container">
    <view class="input-box">
      <view class="input-row">
        <view class="title">房间号：</view>
        <input type="text" v-model="roomId" placeholder="请输入房间号" placeholder-class="placeholder">
      </view>
      <view class="input-row">
        <view class="title">用户名：</view>
        <input type="text" v-model="userId" placeholder="请输入用户名" placeholder-class="placeholder">
      </view>
    </view>
    <view class="options-box">
      <label class="options-row">
        <view class="title">视频</view>
        <switch :checked="enableCamera" color="#006eff" @change="configChange('enableCamera', $event.detail.value)" />
      </label>
      <label class="options-row">
        <view class="title">音频</view>
        <switch :checked="enableMic" color="#006eff" @change="configChange('enableMic', $event.detail.value)" />
      </label>
    </view>
    <view class="button-group">
      <button @click="enterRoom">进入房间</button>
    </view>
  </view>
</template>

<script>
import {
  randomNumber,
  randomString,
} from '@/utils/common'
export default {
  data() {
    return {
      roomId: randomNumber(50000, 90000),
      userId: randomString(),
      enableMic: true,
      enableCamera: true,
    }
  },
  onLoad() {},
  methods: {
    enterRoom() {
      if (!this.roomId) {
        uni.showToast({
          title: '请输入房间号',
          icon: 'none',
        })
        return
      }
      if (!this.userId) {
        uni.showToast({
          title: '请输入用户名',
          icon: 'none',
        })
        return
      }
      wx.navigateTo({
        url: `./meeting-room?enableCamera=${this.enableCamera}&enableMic=${this.enableMic}&roomId=${this.roomId}&userId=${this.userId}`,
      })
    },

    configChange(key, value) {
      this[key] = value
      console.log(value, typeof value, this[key])
    },
  },
}
</script>
<style lang="scss">
  @import './meeting-room-config.scss';
</style>
