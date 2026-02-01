<template>
  <view class="captcha-page">
    <web-view 
      :src="captchaUrl" 
      @message="handleMessage"
    ></web-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const captchaUrl = ref('');
let resolveCallback = null;
let rejectCallback = null;

onLoad((options) => {
  const apiBase = options.apiBase || '/dev-api';
  const tenantId = options.tenantId || '000000';
  
  // 构建验证码页面URL
  // #ifdef H5
  captchaUrl.value = `/static/captcha.html?apiBase=${encodeURIComponent(apiBase)}&tenantId=${tenantId}`;
  // #endif
  
  // #ifndef H5
  // 小程序和APP使用完整URL
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3002' 
    : window.location.origin;
  captchaUrl.value = `${baseUrl}/static/captcha.html?apiBase=${encodeURIComponent(apiBase)}&tenantId=${tenantId}`;
  // #endif
  
  console.log('验证码页面URL:', captchaUrl.value);
});

// 监听webview消息
function handleMessage(event) {
  console.log('收到webview消息:', event);
  
  const data = event.detail.data[0];
  
  if (data.type === 'captcha_success') {
    // 验证成功
    const captchaId = data.captchaId;
    console.log('验证成功，captchaId:', captchaId);
    
    // 将结果保存到全局
    getApp().globalData.captchaResult = {
      success: true,
      captchaId: captchaId
    };
    
    // 返回上一页
    setTimeout(() => {
      uni.navigateBack();
    }, 500);
  } else if (data.type === 'captcha_close') {
    // 用户关闭
    getApp().globalData.captchaResult = {
      success: false,
      error: '用户关闭验证码'
    };
    
    uni.navigateBack();
  }
}
</script>

<style lang="scss" scoped>
.captcha-page {
  width: 100%;
  height: 100vh;
}
</style>
