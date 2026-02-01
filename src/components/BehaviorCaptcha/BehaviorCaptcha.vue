<template>
  <view v-if="visible" class="captcha-overlay" @tap.self="handleClose">
    <view class="captcha-container" @tap.stop>
      <!-- 头部 -->
      <view class="captcha-header">
        <text class="captcha-title">安全验证</text>
        <view class="captcha-close" @tap="handleClose">
          <u-icon name="close" size="20" color="#666"></u-icon>
        </view>
      </view>
      
      <!-- 验证码内容 -->
      <view class="captcha-content">
        <!-- 背景图片 -->
        <view class="captcha-bg-box">
          <image 
            v-if="captchaData.backgroundImage" 
            :src="captchaData.backgroundImage" 
            mode="widthFix" 
            class="captcha-bg-img"
            @load="onImageLoad"
          ></image>
          
          <!-- 滑块图片 -->
          <image 
            v-if="captchaData.sliderImage" 
            :src="captchaData.sliderImage" 
            mode="widthFix" 
            class="captcha-slider-img"
            :style="{ left: sliderLeft + 'px' }"
          ></image>
        </view>
        
        <!-- 提示文字 -->
        <view class="captcha-tips">
          <text>{{ statusText }}</text>
        </view>
        
        <!-- 滑动条 -->
        <view class="captcha-track">
          <view class="track-bg">
            <view class="track-fill" :style="{ width: trackWidth + 'px' }"></view>
            <view 
              class="track-btn" 
              :class="{ moving: isMoving, success: verifySuccess, fail: verifyFail }"
              :style="{ left: trackWidth + 'px' }"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
            >
              <u-icon 
                :name="verifySuccess ? 'checkbox-mark' : 'arrow-right'" 
                size="18" 
                :color="verifySuccess ? '#fff' : '#666'"
              ></u-icon>
            </view>
          </view>
          <view class="track-text">{{ trackText }}</view>
        </view>
      </view>
      
      <!-- 底部操作 -->
      <view class="captcha-footer">
        <view class="refresh-btn" @tap="handleRefresh">
          <u-icon name="reload" size="18" color="#667eea"></u-icon>
          <text>刷新</text>
        </view>
      </view>
    </view>
    
    <!-- 加载中 -->
    <view v-if="loading" class="captcha-loading">
      <u-loading-icon mode="circle" color="#667eea"></u-loading-icon>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { genBehaviorCaptcha, checkBehaviorCaptcha } from '@/utils/behaviorCaptcha';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  tenantId: {
    type: String,
    default: '000000'
  }
});

const emit = defineEmits(['update:modelValue', 'success', 'fail', 'close']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const loading = ref(false);
const captchaData = ref({
  id: '',
  backgroundImage: '',
  sliderImage: '',
  backgroundImageWidth: 0,
  backgroundImageHeight: 0,
  sliderImageWidth: 0,
  sliderImageHeight: 0
});

const isMoving = ref(false);
const startX = ref(0);
const currentX = ref(0);
const sliderLeft = ref(0);
const trackWidth = ref(0);
const maxTrackWidth = ref(300); // 最大滑动距离
const verifySuccess = ref(false);
const verifyFail = ref(false);
const trackRecords = ref([]); // 记录滑动轨迹

const statusText = computed(() => {
  if (verifySuccess.value) return '验证成功';
  if (verifyFail.value) return '验证失败，请重试';
  if (loading.value) return '加载中...';
  return '拖动滑块完成拼图';
});

const trackText = computed(() => {
  if (verifySuccess.value) return '验证成功';
  if (verifyFail.value) return '验证失败';
  if (isMoving.value) return '松开验证';
  return '向右拖动滑块填充拼图';
});

// 初始化验证码
async function initCaptcha() {
  loading.value = true;
  verifySuccess.value = false;
  verifyFail.value = false;
  trackWidth.value = 0;
  sliderLeft.value = 0;
  trackRecords.value = [];
  
  try {
    const res = await genBehaviorCaptcha(props.tenantId);
    if (res.code === 200 && res.data) {
      captchaData.value = {
        id: res.data.id,
        backgroundImage: res.data.backgroundImage,
        sliderImage: res.data.sliderImage,
        backgroundImageWidth: res.data.backgroundImageWidth || 300,
        backgroundImageHeight: res.data.backgroundImageHeight || 150,
        sliderImageWidth: res.data.sliderImageWidth || 60,
        sliderImageHeight: res.data.sliderImageHeight || 150
      };
      // 根据实际图片宽度设置最大滑动距离
      maxTrackWidth.value = captchaData.value.backgroundImageWidth - captchaData.value.sliderImageWidth - 10;
    }
  } catch (error) {
    console.error('获取验证码失败:', error);
    uni.showToast({
      title: '获取验证码失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 图片加载完成
function onImageLoad(e) {
  // 可以在这里获取图片实际尺寸
  console.log('图片加载完成', e);
}

// 触摸开始
function handleTouchStart(e) {
  if (verifySuccess.value || verifyFail.value || loading.value) return;
  
  isMoving.value = true;
  startX.value = e.touches[0].pageX;
  currentX.value = trackWidth.value;
  
  // 记录开始时间
  trackRecords.value = [{
    x: 0,
    y: 0,
    time: Date.now()
  }];
}

// 触摸移动
function handleTouchMove(e) {
  if (!isMoving.value) return;
  
  const moveX = e.touches[0].pageX - startX.value;
  let newWidth = currentX.value + moveX;
  
  // 限制滑动范围
  if (newWidth < 0) newWidth = 0;
  if (newWidth > maxTrackWidth.value) newWidth = maxTrackWidth.value;
  
  trackWidth.value = newWidth;
  sliderLeft.value = newWidth;
  
  // 记录滑动轨迹
  trackRecords.value.push({
    x: Math.round(newWidth),
    y: 0,
    time: Date.now()
  });
}

// 触摸结束
async function handleTouchEnd(e) {
  if (!isMoving.value) return;
  
  isMoving.value = false;
  
  // 如果滑动距离太短，重置
  if (trackWidth.value < 10) {
    resetTrack();
    return;
  }
  
  // 提交验证
  await submitVerify();
}

// 提交验证
async function submitVerify() {
  loading.value = true;
  
  try {
    // 计算滑动百分比
    const percentage = (sliderLeft.value / maxTrackWidth.value) * 100;
    
    const res = await checkBehaviorCaptcha({
      id: captchaData.value.id,
      data: JSON.stringify({
        x: Math.round(sliderLeft.value),
        y: 0,
        percentage: percentage,
        trackArr: trackRecords.value
      })
    });
    
    if (res.code === 200 && res.data === true) {
      // 验证成功
      verifySuccess.value = true;
      setTimeout(() => {
        emit('success', captchaData.value.id);
        handleClose();
      }, 500);
    } else {
      // 验证失败
      verifyFail.value = true;
      setTimeout(() => {
        resetTrack();
        handleRefresh();
      }, 1000);
      emit('fail');
    }
  } catch (error) {
    console.error('验证失败:', error);
    verifyFail.value = true;
    setTimeout(() => {
      resetTrack();
      handleRefresh();
    }, 1000);
    emit('fail');
  } finally {
    loading.value = false;
  }
}

// 重置滑动条
function resetTrack() {
  trackWidth.value = 0;
  sliderLeft.value = 0;
  trackRecords.value = [];
  verifyFail.value = false;
}

// 刷新验证码
function handleRefresh() {
  initCaptcha();
}

// 关闭验证码
function handleClose() {
  visible.value = false;
  emit('close');
  // 延迟重置，避免动画显示重置过程
  setTimeout(() => {
    resetTrack();
    verifySuccess.value = false;
  }, 300);
}

// 监听显示状态
watch(() => props.modelValue, (val) => {
  if (val) {
    initCaptcha();
  }
});
</script>

<style lang="scss" scoped>
.captcha-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.captcha-container {
  width: 660rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.captcha-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .captcha-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1a1a1a;
  }
  
  .captcha-close {
    padding: 10rpx;
  }
}

.captcha-content {
  padding: 40rpx;
}

.captcha-bg-box {
  position: relative;
  width: 100%;
  height: 320rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  
  .captcha-bg-img {
    width: 100%;
    height: 100%;
    display: block;
  }
  
  .captcha-slider-img {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: auto;
    transition: left 0.1s linear;
  }
}

.captcha-tips {
  text-align: center;
  margin-bottom: 30rpx;
  
  text {
    font-size: 26rpx;
    color: #666;
  }
}

.captcha-track {
  position: relative;
  
  .track-bg {
    position: relative;
    height: 80rpx;
    background: #f5f7fa;
    border-radius: 40rpx;
    overflow: hidden;
    
    .track-fill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: 40rpx;
      transition: width 0.1s linear;
    }
    
    .track-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 80rpx;
      height: 80rpx;
      background: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.15);
      transition: left 0.1s linear;
      
      &.moving {
        box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.4);
      }
      
      &.success {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      &.fail {
        background: #ff4d4f;
      }
    }
  }
  
  .track-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 26rpx;
    color: #999;
    white-space: nowrap;
    pointer-events: none;
  }
}

.captcha-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 40rpx 40rpx;
  
  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 10rpx;
    padding: 16rpx 32rpx;
    background: #f5f7fa;
    border-radius: 40rpx;
    
    text {
      font-size: 26rpx;
      color: #667eea;
    }
    
    &:active {
      background: #ebeef5;
    }
  }
}

.captcha-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
}
</style>
