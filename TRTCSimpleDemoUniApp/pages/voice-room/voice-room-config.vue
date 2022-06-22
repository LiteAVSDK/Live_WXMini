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
    <radio-group @change="roleChange" class="radio-box">
      	<label v-for="item in roleList" :key="item.value" class="radio-row">
					<view>
						<radio :value="item.value" :checked="item.value === role" />
					</view>
					<view>{{item.label}}</view>
				</label>
    </radio-group>
    <view class="button-group">
      <button @click="enterRoom">进入房间</button>
    </view>
	</view>
</template>

<script>
import { randomNumber, randomString } from '@/utils/common'
export default {
  data() {
    return {
      roleList: [
        { label: '主播（可发言）', value: 'presenter' },
        { label: '观众（仅收听）', value: 'audience' },
      ],
      role: 'presenter',
      roomId: randomNumber(50000, 90000),
      userId: randomString(),
    }
  },
  onLoad() {
  },
  methods: {
    roleChange(e) {
      this.role = e.detail.value
      console.log(e, this.role)
    },
    enterRoom() {
      console.log(this.roomId, this.userId)
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
        url: `./voice-room?role=${this.role}&roomId=${this.roomId}&userId=${this.userId}`,
      })
    },
  },
}
</script>
<style lang="scss">
@import './voice-room-config.scss';
</style>
