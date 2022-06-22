<template>
  <view class="container">
    <scroll-view class="scroll-view" scroll-y>
      <view class="live-container">
        <live-pusher class="live-pusher" :mode="pusher.mode" :autopush="pusher.autopush" :url="pusher.url"
          :enable-mic="pusher.enableMic" :enable-camera="pusher.enableCamera" :beauty="pusher.beautyLevel"
          @statechange="_pusherStateChangeHandler" @netstatus="_pusherNetStatusHandler" @error="_pusherErrorHandler"
          @bgmstart="_pusherBGMStartHandler" @bgmprogress="_pusherBGMProgressHandler"
          @bgmcomplete="_pusherBGMCompleteHandler" @audiovolumenotify="_pusherAudioVolumeNotify"></live-pusher>
        <view class="button-group">
        </view>
        <view class="audio-volume" v-if="pusher.enableMic">
          <image class="image" :src="getStaticImage('micro-open')"></image>
          <view class="audio-active" :style="'height:' + pusher.volume + '%'">
            <image class="image" :src="getStaticImage('audio-active')"></image>
          </view>
        </view>
      </view>
      <view class="live-container" v-for="item in playerList" :key="item.streamID">
        <live-player class="live-player" :id="item.streamID" :data-userid="item.userID" :data-streamid="item.streamID"
          :data-streamtype="item.streamType" :src="item.src" :mode="item.mode" :autoplay="item.autoplay"
          :mute-audio="item.muteAudio" :mute-video="item.muteVideo" :orientation="item.orientation"
          :object-fit="item.objectFit" :background-mute="item.enableBackgroundMute" :min-cache="item.minCache"
          :max-cache="item.maxCache" :sound-mode="item.soundMode" :enable-recv-message="item.enableRecvMessage"
          :auto-pause-if-navigate="item.autoPauseIfNavigate" :auto-pause-if-open-native="item.autoPauseIfOpenNative"
          :debug="item.debug" @statechange="_playerStateChange" @fullscreenchange="_playerFullscreenChange"
          @netstatus="_playerNetStatus" @audiovolumenotify="_playerAudioVolumeNotify"></live-player>
        <view class="button-group mute-button">
          <view class="button-box">
            <image class="button-icon" :src="getStaticImage(`${item.muteAudio ? 'mute-mic-white' : 'micro-open'}`)"
              mode="scaleToFill" @click="mutePlayerHandle('muteAudio', item)" />
          </view>
          <view class="button-box">
            <image class="button-icon" :src="getStaticImage(`${item.muteVideo ? 'mute-camera-white' : 'camera'}`)"
              mode="scaleToFill" @click="mutePlayerHandle('muteVideo', item)" />
          </view>
        </view>
        <view class="audio-volume" v-if="item.hasAudio">
          <image class="image" :src="getStaticImage('micro-open')"></image>
          <view class="audio-active" :style="'height:' + item.volume + '%'">
            <image class="image" :src="getStaticImage('audio-active')"></image>
          </view>
        </view>
      </view>
    </scroll-view>
    <view class="button-group">
      <view class="button-box">
        <image class="button-icon" :src="getStaticImage(`audio-${pusher.enableMic}`)" mode="scaleToFill"
          @click="pusherAudioHandler" />
      </view>
      <view class="button-box">
        <image class="button-icon" :src="getStaticImage(`camera-${pusher.enableCamera}`)" mode="scaleToFill"
          @click="pusherCameraHandler" />
      </view>
      <view class="button-box">
        <image class="button-icon" :src="getStaticImage(`beauty-${pusher.beautyLevel === 9 }`)" mode="scaleToFill"
          @click="pusherBeautyHandler" />
      </view>
      <view class="button-box">
        <image class="button-icon" :src="getStaticImage(`list`)" mode="scaleToFill" @click="userListHandle" />
      </view>
      <view class="button-box red">
        <image class="button-icon" :src="getStaticImage(`hangup`)" mode="scaleToFill" @click="hangup" />
      </view>
    </view>

    <uni-popup ref="user-list" background-color="rgba(0, 0, 0, 0.8)">
      <view class="user-list">
        <view class="title">用户列表：</view>
        <scroll-view scroll-y class="user-list-scroll-view">
          <view class="user-row" v-for="item in playerList" :key="item.userID">
            <view class="name">{{item.userID}}</view>
            <view class="button-group">
              <view class="button-box">
                <image class="button-icon" :src="getStaticImage(`${item.muteAudio ? 'mute-mic-white' : 'micro-open'}`)"
                  mode="scaleToFill" @click="mutePlayerHandle('muteAudio', item)" />
              </view>
              <view class="button-box">
                <image class="button-icon" :src="getStaticImage(`${item.muteVideo ? 'mute-camera-white' : 'camera'}`)"
                  mode="scaleToFill" @click="mutePlayerHandle('muteVideo', item)" />
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import {
  genTestUserSig,
} from '@/debug/GenerateTestUserSig'
import {
  getStaticImage,
} from '@/utils/common'

import TRTC from '@/lib/trtc-wx'

export default {
  data() {
    return {
      TRTC: null,
      pusher: {},
      pageOptions: {},
      playerList: [],
    }
  },
  onLoad(options) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        if (options[key] === 'false') options[key] = false
        if (options[key] === 'true') options[key] = true
      }
    }
    this.pageOptions = options
    uni.setNavigationBarTitle({
      title: `房间号：${options.roomId}`,
    })
  },
  onReady() {
    this.TRTC = new TRTC()
    this.init()
    this.bindTRTCRoomEvent()
    this.enterRoom(this.pageOptions)
  },
  methods: {
    getStaticImage,
    returnVolumeHeight(volum) {
      return `height: ${volum}%;`
    },
    // 页面交互点击事件
    pusherAudioHandler() {
      this.setPusherAttributesHandler({
        enableMic: !this.pusher.enableMic,
      })
    },
    pusherCameraHandler() {
      this.setPusherAttributesHandler({
        enableCamera: !this.pusher.enableCamera,
      })
    },
    pusherBeautyHandler() {
      const beautyLevel = this.pusher.beautyLevel === 0 ? 9 : 0
      this.setPusherAttributesHandler({
        beautyLevel,
      })
    },
    userListHandle() {
      this.$refs['user-list'].open()
    },
    hangup() {
      this.exitRoom()
      uni.navigateBack()
    },
    mutePlayerHandle(key, player) {
      this.setPlayerAttributesHandler(player, {
        [key]: !player[key],
      })
    },


    init() {
      this.pusher = this.TRTC.createPusher()
    },
    enterRoom(options) {
      const {
        roomId,
        userId,
      } = options
      const {
        sdkAppID,
        userSig,
      } = genTestUserSig(userId)
      this.pusher = this.TRTC.enterRoom({
        userID: userId,
        sdkAppID,
        userSig,
        roomID: roomId,
        enableMic: this.pageOptions.enableMic,
        enableCamera: this.pageOptions.enableCamera,
        beautyLevel: 9,
      })
      this.TRTC.getPusherInstance().start() // 开始推流（autoPush的模式下不需要）
    },
    exitRoom() {
      const {
        pusher,
        playerList,
      } = this.TRTC.exitRoom()
      this.pusher = pusher
      this.playerList = playerList
    },
    // 事件监听
    bindTRTCRoomEvent() {
      const TRTC_EVENT = this.TRTC.EVENT
      // 初始化事件订阅
      this.TRTC.on(TRTC_EVENT.LOCAL_JOIN, (event) => {
        console.log('* room LOCAL_JOIN', event)
      })
      this.TRTC.on(TRTC_EVENT.LOCAL_LEAVE, (event) => {
        console.log('* room LOCAL_LEAVE', event)
      })
      this.TRTC.on(TRTC_EVENT.ERROR, (event) => {
        console.log('* room ERROR', event)
      })
      this.TRTC.on(TRTC_EVENT.REMOTE_USER_JOIN, (event) => {
        console.log('* room REMOTE_USER_JOIN', event)
        const {
          userID,
        } = event.data
        uni.showToast({
          title: `${userID} 进入了房间`,
          icon: 'none',
        })
      })
      // 远端用户退出
      this.TRTC.on(TRTC_EVENT.REMOTE_USER_LEAVE, (event) => {
        console.log('* room REMOTE_USER_LEAVE', event)
        const {
          userID,
          playerList,
        } = event.data
        this.playerList = playerList
        uni.showToast({
          title: `${userID} 离开了房间`,
          icon: 'none',
        })
      })
      // 远端用户推送视频
      this.TRTC.on(TRTC_EVENT.REMOTE_VIDEO_ADD, (event) => {
        console.log('* room REMOTE_VIDEO_ADD', event)
        const {
          player,
        } = event.data
        // 开始播放远端的视频流，默认是不播放的
        this.setPlayerAttributesHandler(player, {
          muteVideo: false,
        })
      })
      // 远端用户取消推送视频
      this.TRTC.on(TRTC_EVENT.REMOTE_VIDEO_REMOVE, (event) => {
        console.log('* room REMOTE_VIDEO_REMOVE', event)
        const {
          player,
        } = event.data
        this.setPlayerAttributesHandler(player, {
          muteVideo: true,
        })
      })
      // 远端用户推送音频
      this.TRTC.on(TRTC_EVENT.REMOTE_AUDIO_ADD, (event) => {
        console.log('* room REMOTE_AUDIO_ADD', event)
        const {
          player,
        } = event.data
        this.setPlayerAttributesHandler(player, {
          muteAudio: false,
        })
      })
      // 远端用户取消推送音频
      this.TRTC.on(TRTC_EVENT.REMOTE_AUDIO_REMOVE, (event) => {
        console.log('* room REMOTE_AUDIO_REMOVE', event)
        const {
          player,
        } = event.data
        this.setPlayerAttributesHandler(player, {
          muteAudio: true,
        })
      })
      this.TRTC.on(TRTC_EVENT.REMOTE_AUDIO_VOLUME_UPDATE, (event) => {
        console.log('* room REMOTE_AUDIO_VOLUME_UPDATE', event)
        const {
          playerList,
        } = event.data
        this.playerList = playerList
      })
      this.TRTC.on(TRTC_EVENT.LOCAL_AUDIO_VOLUME_UPDATE, (event) => {
        // console.log('* room LOCAL_AUDIO_VOLUME_UPDATE', event)
        const {
          pusher,
        } = event.data
        this.pusher = pusher
      })
    },
    // 设置 pusher 属性
    setPusherAttributesHandler(options) {
      this.pusher = this.TRTC.setPusherAttributes(options)
    },

    // 设置某个 player 属性
    setPlayerAttributesHandler(player, options) {
      this.playerList = this.TRTC.setPlayerAttributes(player.streamID, options)
    },


    // 请保持跟 wxml 中绑定的事件名称一致
    _pusherStateChangeHandler(event) {
      this.TRTC.pusherEventHandler(event)
    },
    _pusherNetStatusHandler(event) {
      this.TRTC.pusherNetStatusHandler(event)
    },
    _pusherErrorHandler(event) {
      this.TRTC.pusherErrorHandler(event)
    },
    _pusherBGMStartHandler(event) {
      this.TRTC.pusherBGMStartHandler(event)
    },
    _pusherBGMProgressHandler(event) {
      this.TRTC.pusherBGMProgressHandler(event)
    },
    _pusherBGMCompleteHandler(event) {
      this.TRTC.pusherBGMCompleteHandler(event)
    },
    _pusherAudioVolumeNotify(event) {
      this.TRTC.pusherAudioVolumeNotify(event)
    },
    _playerStateChange(event) {
      this.TRTC.playerEventHandler(event)
    },
    _playerFullscreenChange(event) {
      this.TRTC.playerFullscreenChange(event)
    },
    _playerNetStatus(event) {
      this.TRTC.playerNetStatus(event)
    },
    _playerAudioVolumeNotify(event) {
      this.TRTC.playerAudioVolumeNotify(event)
    },
  },
}
</script>
<style lang="scss">
  @import './meeting-room.scss';
</style>
