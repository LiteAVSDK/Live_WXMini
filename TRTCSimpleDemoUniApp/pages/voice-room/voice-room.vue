<template>
  <view class="container">
    <view class="user-seat-pusher">
      <view class="avatar" @click="roleChange">
        <image v-if="isPresenter()" :src="defaultAvatar" mode="scaleToFill" />
      </view>
      <view class="nick">{{isPresenter() ? pageOptions.userId : '（自己）'}}</view>
    </view>
    <view class="user-container">
      <view class="user-seat" v-for="index in 6" :key="index">
        <view class="avatar">
          <image v-if="playerList[index]" :src="getUserAvatarImage(index+1)" mode="scaleToFill" />
        </view>
        <view v-if="playerList[index]" class="nick">{{playerList[index].userID}}</view>
        <view v-else class="nick">虚以待位</view>
      </view>
    </view>
    <view class="button-group">
      <view class="button-box" v-if="isPresenter()">
        <image class="button-icon" :src="getStaticImage(`audio-${pusher.enableMic}`)" mode="scaleToFill" @click="pusherAudioHandler" />
      </view>
      <view class="button-box">
        <image class="button-icon" :src="getStaticImage('hangup-red')" mode="scaleToFill" @click="hangup" />
      </view>
      <view class="button-box">
        <image class="button-icon" :src="getStaticImage(`speaker-${soundMode === 'speaker'}`)" mode="scaleToFill" @click="soundModeChange" />
      </view>
    </view>

    <live-pusher class="live-pusher" :mode="pusher.mode" :autopush="pusher.autopush" :url="pusher.url"
      :enable-mic="pusher.enableMic" :enable-camera="pusher.enableCamera" @statechange="_pusherStateChangeHandler"
      @netstatus="_pusherNetStatusHandler" @error="_pusherErrorHandler" @bgmstart="_pusherBGMStartHandler"
      @bgmprogress="_pusherBGMProgressHandler" @bgmcomplete="_pusherBGMCompleteHandler"
      @audiovolumenotify="_pusherAudioVolumeNotify"></live-pusher>
    <live-player class="live-player" v-for="item in playerList" :key="item.streamID" :id="item.streamID"
      :data-userid="item.userID" :data-streamid="item.streamID" :data-streamtype="item.streamType" :src="item.src"
      :mode="item.mode" :autoplay="item.autoplay" :mute-audio="item.muteAudio" :mute-video="item.muteVideo"
      :orientation="item.orientation" :object-fit="item.objectFit" :background-mute="item.enableBackgroundMute"
      :min-cache="item.minCache" :max-cache="item.maxCache" :sound-mode="item.soundMode"
      :enable-recv-message="item.enableRecvMessage" :auto-pause-if-navigate="item.autoPauseIfNavigate"
      :auto-pause-if-open-native="item.autoPauseIfOpenNative" :debug="item.debug" @statechange="_playerStateChange"
      @fullscreenchange="_playerFullscreenChange" @netstatus="_playerNetStatus"
      @audiovolumenotify="_playerAudioVolumeNotify"></live-player>
  </view>
</template>

<script>
import {
  genTestUserSig,
} from '@/debug/GenerateTestUserSig'
import {
  defaultAvatar,
} from '../../utils/const'
import { getUserAvatarImage, getStaticImage } from '@/utils/common'
import TRTC from '@/lib/trtc-wx'
export default {
  data() {
    return {
      defaultAvatar,
      TRTC: null,
      pusher: {},
      pageOptions: {},
      playerList: [],
      soundMode: 'speaker', // speaker:扬声器,ear:话筒
    }
  },
  onLoad(options) {
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
    getUserAvatarImage,
    getStaticImage,
    isPresenter() {
      return this.pageOptions.role === 'presenter'
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
        enableMic: this.isPresenter(),
      })
      this.TRTC.getPusherInstance().start() // 开始推流（autoPush的模式下不需要）
    },
    exitRoom() {
      const { pusher, playerList } = this.TRTC.exitRoom()
      this.pusher =  pusher
      this.playerList = playerList
    },

    // 页面交互点击事件
    roleChange() {
      uni.showModal({
        title: '提示',
        content: `切换为${this.isPresenter() ? '观众（仅收听）' : '主播（可发言）'}`,
        success: (res) => {
          if (res.confirm) {
            this.pageOptions.role = this.isPresenter() ? 'audience' : 'presenter'
            this.setPusherAttributesHandler({ enableMic: this.isPresenter() })
            uni.showToast({
              title: '切换成功',
              icon: 'none',
            })
          } else if (res.cancel) {
            uni.showToast({
              title: '已取消',
              icon: 'none',
            })
          }
        },
      })
    },
    pusherAudioHandler() {
      this.setPusherAttributesHandler({ enableMic: !this.pusher.enableMic })
      console.log(this.pusher.enableMic)
    },
    hangup() {
      this.exitRoom()
      uni.navigateBack()
    },
    // 切换扬声器与听筒播放
    soundModeChange() {
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
        this.setPlayerAttributesHandler(player, { soundMode: this.soundMode })
      })
      uni.showToast({
        title: toastMessage,
        icon: 'none',
      })
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
      // 远端用户退出
      this.TRTC.on(TRTC_EVENT.REMOTE_USER_LEAVE, (event) => {
        console.error('* room REMOTE_USER_LEAVE', event)
        this.playerList = event.data.playerList
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
        console.error('* room REMOTE_AUDIO_REMOVE', event)
        const {
          player,
        } = event.data
        this.setPlayerAttributesHandler(player, {
          muteAudio: true,
        })
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
  @import './voice-room.scss';
</style>
