<template>
  <!-- template 1v1 -->
  <view class="template-1v1">
    <view class="view-container player-container" v-for="item in playerList"
      :key="item.streamID">
      <live-player v-if="item.src && (item.hasVideo || item.hasAudio)" class="player" :id="item.streamID"
        :data-userid="item.userID" :data-streamid="item.streamID" :data-streamtype="item.streamType" :src="item.src"
        mode="RTC" :autoplay="item.autoplay" :mute-audio="item.muteAudio" :mute-video="item.muteVideo"
        :orientation="item.orientation" :object-fit="item.objectFit" :background-mute="item.enableBackgroundMute"
        :min-cache="item.minCache" :max-cache="item.maxCache" :sound-mode="item.soundMode"
        :enable-recv-message="item.enableRecvMessage" :auto-pause-if-navigate="item.autoPauseIfNavigate"
        :auto-pause-if-open-native="item.autoPauseIfOpenNative" :debug="debug" @statechange="_playerStateChange"
        @fullscreenchange="_playerFullscreenChange" @netstatus="_playerNetStatus"
        @audiovolumenotify="_playerAudioVolumeNotify" />
    </view>
    <view
      :class="['view-container', 'pusher-container',pusherClass]">
      <live-pusher class="pusher" :url="pusher.url" :mode="pusher.mode" :autopush="pusher.autopush"
        :enable-camera="pusher.enableCamera" :enable-mic="pusher.enableMic" :muted="!pusher.enableMic"
        :enable-agc="pusher.enableAgc" :enable-ans="pusher.enableAns" :enable-ear-monitor="pusher.enableEarMonitor"
        :auto-focus="pusher.enableAutoFocus" :zoom="pusher.enableZoom" :min-bitrate="pusher.minBitrate"
        :max-bitrate="pusher.maxBitrate" :video-width="pusher.videoWidth" :video-height="pusher.videoHeight"
        :beauty="pusher.beautyLevel" :whiteness="pusher.whitenessLevel" :orientation="pusher.videoOrientation"
        :aspect="pusher.videoAspect" :device-position="pusher.frontCamera" :remote-mirror="pusher.enableRemoteMirror"
        :local-mirror="pusher.localMirror" :background-mute="pusher.enableBackgroundMute"
        :audio-quality="pusher.audioQuality" :audio-volume-type="pusher.audioVolumeType"
        :audio-reverb-type="pusher.audioReverbType" :waiting-image="pusher.waitingImage" :debug="debug"
        @statechange="_pusherStateChangeHandler" @netstatus="_pusherNetStatusHandler" @error="_pusherErrorHandler"
        @bgmstart="_pusherBGMStartHandler" @bgmprogress="_pusherBGMProgressHandler"
        @bgmcomplete="_pusherBGMCompleteHandler" @audiovolumenotify="_pusherAudioVolumeNotify" />
      <view class="loading" v-if="playerList.length === 0">
        <view class="loading-img">
          <image :src="getStaticImage('loading')" class="rotate-img"></image>
        </view>
        <view class="loading-text">等待接听中...</view>
      </view>
    </view>
    <view class="handle-btns">
      <view class="btn-normal" @click="pusherAudioHandler">
        <image class="btn-image" :src="getStaticImage(`${pusher.enableMic ? 'audio-true' : 'audio-false'}`)"></image>
      </view>
      <view class="btn-normal" @click="pusherSwitchCamera">
        <image class="btn-image" :src="getStaticImage('switch')"></image>
      </view>
      <view class="btn-normal" @click="soundModeChange">
        <image class="btn-image"
          :src="getStaticImage(`${this.soundMode === 'ear' ? 'speaker-false' : 'speaker-true'}`)">
        </image>
      </view>
    </view>
    <view class="bottom-btns">
      <view class="btn-normal" @click="pusherBeautyHandler">
        <image class="btn-image" :src="getStaticImage(`${pusher.beautyLevel === 9 ? 'beauty-true' : 'beauty-false'}`)">
        </image>
      </view>
      <view class="btn-hangup" @click="hangup">
        <image class="btn-image" :src="getStaticImage('hangup')"></image>
      </view>
    </view>
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
      pusher: {},
      playerList: [],
      debug: '',
      soundMode: 'speaker',
    }
  },
  computed: {
    pusherClass() {
      // 因uni-app存在bug，因此使用此折中方案 https://github.com/dcloudio/uni-app/issues/1033
      return this.playerList.length > 0 ? '' : 'fullscreen'
    },
  },
  onLoad(options) {
    this.TRTC = new TRTC(this)
    this.init()
    this.bindTRTCRoomEvent()
    this.enterRoom(options)
  },
  onReady() {},
  onUnload() {
    this.exitRoom()
  },
  methods: {
    getStaticImage,
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
        enableCamera: true,
        enableMic: true,
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
    mutePlayerHandle(key, player) {
      this.setPlayerAttributesHandler(player, {
        [key]: !player[key],
      })
    },
    hangup() {
      this.exitRoom()
      uni.navigateBack()
    },
    // 切换扬声器与听筒播放
    soundModeChange() {
      if (this.playerList.length === 0) return
      const players = this.TRTC.getPlayerList()
      let toastMessage = ''
      switch (this.soundMode) {
        case 'speaker':
          this.soundMode = 'ear'
          toastMessage = '听筒播放'
          break
        case 'ear':
          this.soundMode = 'speaker'
          toastMessage = '扬声器播放'
          break
      }
      players.forEach((player) => {
        this.setPlayerAttributesHandler(player, {
          soundMode: this.soundMode,
        })
      })
      uni.showToast({
        title: toastMessage,
        icon: 'none',
      })
    },
    pusherSwitchCamera() {
      const frontCamera = this.pusher.frontCamera === 'front' ? 'back' : 'front'
      this.TRTC.getPusherInstance().switchCamera(frontCamera)
    },
    // 设置 pusher 属性
    setPusherAttributesHandler(options) {
      this.pusher = this.TRTC.setPusherAttributes(options)
    },

    // 设置某个 player 属性
    setPlayerAttributesHandler(player, options) {
      this.playerList = this.TRTC.setPlayerAttributes(player.streamID, options)
    },
    // 事件监听
    bindTRTCRoomEvent() {
      const TRTC_EVENT = this.TRTC.EVENT // 初始化事件订阅

      this.TRTC.on(TRTC_EVENT.LOCAL_JOIN, (event) => {
        console.log('* room LOCAL_JOIN', event) // // 进房成功，触发该事件后可以对本地视频和音频进行设置

        this.setPusherAttributesHandler({
          enableCamera: true,
        })
        this.setPusherAttributesHandler({
          enableMic: true,
        })
      })
      this.TRTC.on(TRTC_EVENT.LOCAL_LEAVE, (event) => {
        console.log('* room LOCAL_LEAVE', event)
      })
      this.TRTC.on(TRTC_EVENT.ERROR, (event) => {
        console.log('* room ERROR', event)
      }) // 远端用户退出

      this.TRTC.on(TRTC_EVENT.REMOTE_USER_LEAVE, (event) => {
        console.log('* room REMOTE_USER_LEAVE', event)
        const {
          playerList,
        } = event.data
        this.playerList = playerList
      }) // 远端用户推送视频

      this.TRTC.on(TRTC_EVENT.REMOTE_VIDEO_ADD, (event) => {
        console.log('* room REMOTE_VIDEO_ADD', event)
        const {
          player,
        } = event.data // 开始播放远端的视频流，默认是不播放的

        this.setPlayerAttributesHandler(player, {
          muteVideo: false,
        })
      }) // 远端用户取消推送视频

      this.TRTC.on(TRTC_EVENT.REMOTE_VIDEO_REMOVE, (event) => {
        console.log('* room REMOTE_VIDEO_REMOVE', event)
        const {
          player,
        } = event.data
        this.setPlayerAttributesHandler(player, {
          muteVideo: true,
        })
      }) // 远端用户推送音频

      this.TRTC.on(TRTC_EVENT.REMOTE_AUDIO_ADD, (event) => {
        console.log('* room REMOTE_AUDIO_ADD', event)
        const {
          player,
        } = event.data
        this.setPlayerAttributesHandler(player, {
          muteAudio: false,
        })
      }) // 远端用户取消推送音频

      this.TRTC.on(TRTC_EVENT.REMOTE_AUDIO_REMOVE, (event) => {
        console.log('* room REMOTE_AUDIO_REMOVE', event)
        const {
          player,
        } = event.data
        this.setPlayerAttributesHandler(player, {
          muteAudio: true,
        })
      })
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
@import './video-call.scss'
</style>
