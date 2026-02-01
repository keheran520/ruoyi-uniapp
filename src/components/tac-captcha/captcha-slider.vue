<template>
  <view class="tianai-captcha-slider">
    <view class="tip">
      <view class="move-track-font">
        拖动滑块完成拼图
      </view>
    </view>
    <view class="content">
      <view class="bg-img-div">
        <image
            :src="captchaData.backgroundImage"
            class="bg-img">
        </image>
      </view>
      <view class="slider-img-div" :style="{left: sliderMove + 'px'}">
        <image :src="captchaData.templateImage" class="slider-move-img"></image>
      </view>
      <view :class="['tips',tip.showTips&&'tips-on',(tip.type==1)&&'tips-success', (tip.type!=1)&& 'tips-error']">
        {{ tip.msg }}
      </view>
    </view>
    <view class="slider-move">
      <view class="slider-move-track">
        <view class="slider-move-track-mask" :style="{width: sliderMove+'px'}"></view>
        <view class="slider-move-btn" :style="{transform:'translate('+sliderMove+'px, 0px)'}" @touchstart="touchstart"
             @touchmove="touchmove" @touchend="touchend"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
interface Props {
  captchaData: {
    backgroundImage: string
    templateImage: string
    backgroundImageWidth?: number
    backgroundImageHeight?: number
    templateImageWidth?: number
    templateImageHeight?: number
    data?: any
  }
  tip: {
    msg?: string
    type?: number
    showTips?: boolean
  }
  captchaValid: (data: any) => void
}

const props = defineProps<Props>()

// 数据
const sliderMove = ref(0)
const requestData = ref<any>({})
// 滑块移动范围 - 使用标准尺寸
const endX = 245 // 300 - 55 = 245

// 工具函数：获取轨迹数据
function getTrackByEvent(event: any, requestData: any) {
  let touchEvent: any;
  if (event.touches && event.touches.length > 0) {
    touchEvent = event.touches[0];
  } else if (event.changedTouches && event.changedTouches.length > 0) {
    touchEvent = event.changedTouches[0];
  } else {
    throw new Error("未知的event");
  }
  
  // 使用pageX/pageY而不是clientX/clientY，确保坐标准确
  const clientX = Math.round(touchEvent.pageX || touchEvent.clientX || 0);
  const clientY = Math.round(touchEvent.pageY || touchEvent.clientY || 0);
  const type = event.type === "touchstart" ? "down" : event.type === "touchmove" ? "move" : event.type === "touchend" ? "up" : "click"
  
  return {
    x: clientX,
    y: clientY,
    type: type,
    t: new Date().getTime() - requestData.startTime.getTime()
  }
}

// 触摸开始
function touchstart(e: any) {
  console.log('滑块触摸开始:', e)
  
  // 阻止默认行为和事件冒泡
  e.preventDefault && e.preventDefault();
  e.stopPropagation && e.stopPropagation();
  
  let data: any = {
    startTime: new Date(),
    startX: Math.round(e.touches[0].pageX || e.touches[0].clientX || 0),
    startY: Math.round(e.touches[0].pageY || e.touches[0].clientY || 0),
    trackList: [] as any[],
    bgImageWidth: 300,
    bgImageHeight: 180,
    templateImageWidth: 55,
    templateImageHeight: 180,
  };
  
  data.trackList.push(getTrackByEvent(e, data));
  requestData.value = data;
}

// 触摸移动
function touchmove(e: any) {
  // 阻止默认行为和事件冒泡
  e.preventDefault && e.preventDefault();
  e.stopPropagation && e.stopPropagation();
  
  let data = requestData.value as any;
  if (!data || !data.trackList) return;
  
  const track = getTrackByEvent(e, data);
  data.trackList.push(track);
  
  let moveX = track.x - data.startX;
  // 限制滑块移动范围
  if (moveX >= 0 && moveX <= endX) {
    sliderMove.value = moveX;
  } else if (moveX < 0) {
    sliderMove.value = 0;
  } else if (moveX > endX) {
    sliderMove.value = endX;
  }
}

// 触摸结束
function touchend(e: any) {
  console.log('滑块触摸结束:', e)
  
  // 阻止默认行为和事件冒泡
  e.preventDefault && e.preventDefault();
  e.stopPropagation && e.stopPropagation();
  
  let data = requestData.value as any;
  if (!data || !data.trackList) return;
  
  data.trackList.push(getTrackByEvent(e, data));
  data.stopTime = new Date();
  
  console.log('发送验证数据:', data)
  props.captchaValid(data)
}
</script>

<style scoped>
.tianai-captcha-slider {
  z-index: 999;
  position: relative;
  left: 0;
  top: 0;
  user-select: none;
  transform-style: preserve-3d;
  will-change: transform;
  transition-duration: .5s;
  transition-timing-function: cubic-bezier(0.36, 0.3, 0.42, 1.5);
  text-align: left;
  box-sizing: content-box;
  width: 300px;
  height: 260px;
}

.tip {
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 15px;
  line-height: normal;
  color: #000;
}

.tips {
  height: 25px;
  width: 100%;
  position: absolute;
  bottom: -25px;
  left: 0;
  z-index: 999;
  font-size: 15px;
  line-height: 25px;
  color: #fff;
  text-align: center;
  transition: bottom .3s ease-in-out;
}

.tips.tips-error {
  background-color: #FF5D39;
}

.tips.tips-success {
  background-color: #39C522;
}

.tips.tips-on {
  bottom: 0;
}

.move-track-font {
  font-size: 15px;
}

.content {
  width: 100%;
  height: 180px;
  position: relative;
  overflow: hidden;
  background: #f0f0f0;
}

.bg-img-div {
  width: 100%;
  height: 100%;
  position: absolute;
  transform: translate(0px, 0px);
}

.bg-img {
  height: 180px;
  width: 300px;
  border-radius: 5px;
  object-fit: cover;
  display: block;
}

.slider-img-div {
  height: 180px;
  position: absolute;
  transform: translate(0px, 0px);
  width: 55px;
  left: 0;
  top: 0;
  z-index: 2;
}

.slider-move-img {
  height: 180px;
  width: 55px;
  object-fit: cover;
  display: block;
}

.slider-move {
  line-height: 38px;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
  color: #88949d;
  -moz-user-select: none;
  -webkit-user-select: none;
  user-select: none;
  filter: opacity(0.8);
  height: 34px;
  width: 100%;
  margin: 11px 0;
  position: relative;
}

.slider-move-track {
  position: relative;
  height: 32px;
  line-height: 32px;
  text-align: center;
  background: #f5f5f5;
  color: #999;
  transition: 0s;
  font-size: 14px;
  box-sizing: content-box;
  border: 1px solid #f5f5f5;
  border-radius: 4px;
}

.slider-move-track-mask {
  border-color: rgb(2, 152, 248);
  background-color: rgb(137, 210, 255);
  height: 100%;
}

.slider-move-btn {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAABkCAYAAABU19jRAAAJcUlEQVR4nO2d63MT1xmHf9rV6mr5fgNMuSW+ENsY8N0EE2BMhinJNB8y/dD2Qz/0v+gMf0w/JHTKNJAhICwbsA02TpNAHEMgQIwNBSEb8F2rvXTeY1kjYyA+TmVJmfeZ8YiRWa9299E57/mdI63Dtm3E+RjAKTDMaj4F8AU9uyzMCQBn+EQxb+EjAF+RMH8AcJrPFLMGvCSMzWeKWSN/I2GiAFx8xpi1oPBZYiTQWRhGChaGkYKFYaRgYRgpWBhGChaGkYKFYaRgYRgpWBhGChaGkYKFYaRgYRgpWBhGChaGkYKFYaRgYRgpWBhGChaGkYKFYaRgYRgpWBhGChaGkYKFYaRgYRgpWBhGCiefrtShGwZiup74+4qqwu12Z/W7lIVJEfN6FDfv3sPXfYOIRRfpm1UQKC7EkQ+PYFtRcdZKw8KkiLsPJ/CfgSFcH7yOxWhU7MSluYQoR44fxdaCoqyUhoVJEfZ8FN99c1N0Sx6PR+zEMAz0XAgBNtB14hi25OXDkWXHxUVvinA4ln6ScTqdsGwbvRd7EPwyiEcvXyDbvpyHhUkRaq4fe/c3wEWSWFZiJySNYZroCYYQPHsBY1OTWSWNevLkyb/TYwa8lt8UAb8ftluDW9UwPj4hDs0Rb3JUVRXd09j9nwELKKgoR4HXlw2Hb3INkyK8mob9NdUwLROq4sCVKwMrdqRpGkzTFN0TaWR2HcKu0rKMr2lYmBTi1jS01dUt7UBx4PKlfvHP5JaGuqseIY0DjmOHsKukNKOPiYVJMU5VRXt9PSwboO+fvHJ5QEiiKEvlIz3S86HuHiiqAhw9iJ0lpRnb0rAwG4CqKHh/Tz0UhwOWaWGg/5oofEkmJLU4wfPdQia765CQJhNHJCzMBkEtSVtdLRw2YNo2hgaGEDMMMWpahrwJBUMUCkM9djgjE2EWZgOhFqW5rlbMKdm2heHBYUT1mCiAEW9pKKfpPh8Sj5mYCLMwG4zLqWJfTZWQgL5S++uhYURjBrR4S0MtUSYnwixMGvBoGvZUV4quh0S4Pjgsaho1XtOIcM8wxJCb+qmu33dljDS/CWEeTb/E/Pw89EUdebkBVBQWrnnbWVjQoMAtsT9asGDQhf8VUbnX5UJ9VaVoZahVuXZ1cMXoiaSJxWIiEab/dPj4UXFczjRrk/VJ70/hp/jhuxF89o9TGP1+FH6fD9OxGHw5Pnicb34/PJ2dweitu7hwLojvb47A9rhQmJeXGLm8iQeP/4uRH27h88/+iZhhYs40UFZQsK7XrqkqigvyYbk18VrHH74+EX74YAzRqI66mupE15UmzKwW5kEkgtFvRxA8ex7hJ2HMzczgzu0f8fjxExRt2YzcgB9udfUJjuo6Tv/7HE6f+pe4GHd//AkwLRhuDeXFRW+U5v7EI4yMjKI3GMLt0Tt4cO8BAoEcWJoTZYXrl6asqBC6U0GOy42HY+MrZi1JmoWFRZQW5sNyuVBeUpxOabJ7aiASjiB4/iKmnj+H5loaacwvLOL2jRF4AjnY8dc/I/DKbTdoSHvr8SO8DD/DzPSMWHrg1JwYvHZdpK2NVZWU26/aF3VDTyLP0N/bh4mJR3C7XZiZnRVdht/nx7u7tsOzzg5qORFWHAocigO9vX2Jronwej24cXMEbq8XrfW169rH/4usnq02o1FEo9FEE47luN22sTAzC0OPrd7ItnHn9h0MDg3D6/WKbZdHJqYRg26ar92XDgvD39zA2Ng4VKdTbEf7mpmeRX/fAPRfeRch+luNNTXICeSu+h3ti7okUzdgp3luO6uFUTUN9lLmnniOCkdKVnML8uB0r76rD72Di4qL4NI0IUnydpZlw/WmGsY00bRvDzZvKhfFKLAU9VOG8v7BdijW+i8kLX649yyMz0+fwVQksur...[1361 bytes truncated]");
  transform: translate(0px, 0px);
  position: absolute;
  top: -6px;
  left: 0;
  width: 63px;
  height: 45px;
  background-color: #fff;
  background-repeat: no-repeat;
  background-size: contain;
  border-radius: 5px;
}
</style>
