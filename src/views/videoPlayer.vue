<template>
    <div>
        <div class="player-container">
            <video-player class="vjs-custom-skin" :options="playerOptions"></video-player>
        </div>
        <p @click="getVideoPic" style="text-align: center;margin: 10px auto;cursor:pointer"> 点击拍照</p>
        <img style="width: 100%;height: auto;" :src="previewImg" alt="">
    </div>
</template>

<script>
//引入video样式
import 'video.js/dist/video-js.css'
import 'vue-video-player/src/custom-theme.css'

//引入hls.js
import 'videojs-contrib-hls.js/src/videojs.hlsjs'

import html2canvas from 'html2canvas'

export default {
  data() {
    return {
      playerOptions: {
        playbackRates: [0.7, 1.0, 1.5, 2.0], //播放速度
        autoplay: false, //如果true,浏览器准备好时开始回放。
        controls: true, //控制条
        preload: 'auto', //视频预加载
        muted: true, //默认情况下将会消除任何音频。
        loop: false, //导致视频一结束就重新开始。
        language: 'zh-CN',
        aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: [
          {
            type: 'application/x-mpegURL',
            src: 'http://ivi.bupt.edu.cn/hls/cctv5phd.m3u8'
          }
        ],
        poster: 'http://static.smartisanos.cn/pr/img/video/video_03_cc87ce5bdb.jpg', //你的封面地址
        width: document.documentElement.clientWidth,
        notSupportedMessage: '无法播放' //允许覆盖Video.js无法播放媒体源时显示的默认信息。
      },
      previewImg: '',
      dataurl: ''
    }
  },
  methods: {
    getVideoPic() {
      let video = document.getElementsByClassName('vjs-tech')[0]
      console.log(video)
      let canvas = document.createElement('canvas')
      let w = window.innerWidth

      let h = (window.innerWidth / 16) * 9
      canvas.width = w
      canvas.height = h
      console.log(canvas)
      const ctx = canvas.getContext('2d')

      ctx.drawImage(video, 0, 0, w, h)
      ctx.drawImage(video, 0, 0, w, h)
      this.previewImg = canvas.toDataURL('image/png')
      console.log(this.previewImg)
    }
  },
  computed: {}
}
</script>
