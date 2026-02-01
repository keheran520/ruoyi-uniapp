<template>
  <!-- TAC验证码组件 - 使用TAC开发者的uni-app适配版 -->
  <view class="tac-captcha-overlay" v-if="visible">
    <!-- TAC验证码容器 -->
    <view class="tac-captcha-container">
      <view class="tac-header">
        <text class="tac-title">安全验证</text>
        <text class="tac-close" @click="closeTac">✕</text>
      </view>
      
      <!-- TAC验证码内容区域 -->
      <view class="tac-content">
        <!-- 滑块验证码组件 -->
        <view v-if="currentCaptcha.target.captcha && currentCaptcha.target.captcha.type === 'SLIDER'" class="captcha-wrapper">
          <captcha-slider 
            :captcha-data="currentCaptcha.target.captcha" 
            :tip="tip"
            :captcha-valid="captchaValid">
          </captcha-slider>
        </view>
        
        <!-- 拼接还原验证码组件 -->
        <view v-if="currentCaptcha.target.captcha && currentCaptcha.target.captcha.type === 'CONCAT'" class="captcha-wrapper">
          <captcha-concat 
            :captcha-data="currentCaptcha.target.captcha" 
            :tip="tip"
            :captcha-valid="captchaValid">
          </captcha-concat>
        </view>
        
        <!-- 不支持的验证码类型提示 -->
        <view 
          v-if="currentCaptcha.target.captcha && !['SLIDER', 'CONCAT'].includes(currentCaptcha.target.captcha.type)"
          class="unsupported-captcha">
          <view class="unsupported-icon">⚠</view>
          <view class="unsupported-content">
            <text class="unsupported-text">暂不支持此验证码类型</text>
            <text class="unsupported-type">类型: {{ currentCaptcha.target.captcha.type }}</text>
            <text class="unsupported-hint">正在自动切换...</text>
          </view>
        </view>
        
        <!-- 其他验证类型可以后续添加 -->
        <!-- <captcha-rotate v-if="currentCaptcha.target.captcha && currentCaptcha.target.captcha.type === 'ROTATE'"/> -->
        <!-- <captcha-click v-if="currentCaptcha.target.captcha && currentCaptcha.target.captcha.type === 'WORD_IMAGE_CLICK'"/> -->
      </view>
      
      <!-- 底部操作按钮 -->
      <view class="slider-bottom">
        <view class="close-btn" @click="closeTac"></view>
        <view class="refresh-btn" @click="refresh"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import config from '@/config'
import { getBehaviorCaptcha } from '@/api/login'
import CaptchaSlider from './captcha-slider.vue'
import CaptchaConcat from './captcha-concat.vue'

// Props
interface Props {
  visible: boolean
  type?: string
  contact?: string
  captchaType?: string  // 验证码类型：SLIDER, CONCAT, ROTATE, WORD_IMAGE_CLICK
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  type: 'sms',
  contact: '',
  captchaType: 'SLIDER'
})

// Emits
const emit = defineEmits<{
  validSuccess: [res: any, c: any, tac: any]
  validFail: [res: any, c: any, tac: any]
  btnRefreshFun: [el: any, tac: any]
  btnCloseFun: [el: any, tac: any]
}>()

// 验证码数据
const tip = ref<{
  msg: string
  type?: number
  showTips?: boolean
}>({
  msg: "拖动滑块完成拼图"
})

const currentCaptcha = ref<{
  target: {
    id: string
    captcha: {
      type: string
      backgroundImage: string
      templateImage: string
      backgroundImageHeight?: number
      backgroundImageWidth?: number
      templateImageWidth?: number
      templateImageHeight?: number
      data?: any
    }
  }
}>({
  target: {
    id: '',
    captcha: {
      type: 'SLIDER',
      backgroundImage: "",
      templateImage: ""
    }
  }
})

// 监听visible变化，初始化验证码
watch(() => props.visible, async (newVisible, oldVisible) => {
  console.log('TAC组件可见性变化:', { from: oldVisible, to: newVisible })
  
  if (newVisible) {
    console.log('TAC组件显示，准备加载验证码...')
    try {
      await nextTick()
      await refresh()
    } catch (error) {
      console.error('TAC验证码加载失败:', error)
      emit('btnCloseFun', null, null)
    }
  } else {
    console.log('TAC组件隐藏，清理数据...')
    destroyCaptcha()
  }
}, { immediate: false })

// 组件挂载时输出日志
onMounted(() => {
  console.log('TAC组件已挂载，当前 visible:', props.visible)
  console.log('TAC组件 props:', props)
})

// 验证码验证函数
function captchaValid(requestData: any) {
  console.log('开始验证滑块数据:', requestData)
  
  // 轨迹数据标准化处理（参考TAC开发者实现）
  if (requestData.trackList && requestData.trackList.length > 0) {
    for (let i = 0; i < requestData.trackList.length; i++) {
      let track = requestData.trackList[i];
      if (requestData.startX !== undefined && requestData.startY !== undefined) {
        track.x = track.x - requestData.startX;  // 转换为相对坐标
        track.y = track.y - requestData.startY;
      }
    }
  }
  
  // 清理不需要的字段
  delete requestData.startX;
  delete requestData.startY;
  delete requestData.left;
  delete requestData.top;
  
  // 发送验证请求
  const baseUrl = config.baseUrl || 'http://localhost:8080';
  uni.request({
    url: `${baseUrl}/captcha/check?type=${props.type}&contact=${encodeURIComponent(props.contact)}`,
    method: "POST",
    data: {
      id: currentCaptcha.value.target.id,
      data: requestData  // 直接发送轨迹数据
    },
    success: (res: any) => {
      console.log('验证响应:', res.data)
      let resData = res.data;
      
      if (resData.code !== 200) {
        // 校验失败
        showTips("请再试一次", 0, () => {
          refresh();
        })
        emit('validFail', resData, null, null)
      } else {
        // 校验成功
        showTips("验证成功", 1, () => {
          emit('validSuccess', resData, null, null)
        })
      }
    },
    fail: (error: any) => {
      console.error('验证请求失败:', error)
      showTips("网络错误，请重试", 0, () => {
        refresh();
      })
      emit('validFail', { code: 500, msg: '网络错误' }, null, null)
    }
  })
}

// 刷新验证码
async function refresh() {
  console.log('刷新验证码...')
  
  try {
    // 调用后端获取验证码数据
    const response = await getBehaviorCaptcha()
    console.log('获取验证码数据:', response)
    console.log('response.data:', response.data)
    console.log('response.data.captcha:', response.data?.captcha)
    
    // 处理响应数据结构
    let captchaInfo: any
    if (response && response.data) {
      captchaInfo = response.data
    } else if (response) {
      captchaInfo = response
    } else {
      throw new Error('获取验证码数据失败')
    }
    
    // 设置验证码数据 - 处理标准TAC格式
    const captchaData = {
      id: captchaInfo.id,
      captcha: {
        type: captchaInfo.captcha?.type || props.captchaType || 'SLIDER',
        backgroundImage: captchaInfo.captcha?.backgroundImage || captchaInfo.backgroundImage,
        templateImage: captchaInfo.captcha?.templateImage || captchaInfo.templateImage,
        backgroundImageHeight: captchaInfo.captcha?.backgroundImageHeight || captchaInfo.backgroundImageHeight || 360,
        backgroundImageWidth: captchaInfo.captcha?.backgroundImageWidth || captchaInfo.backgroundImageWidth || 600,
        templateImageWidth: captchaInfo.captcha?.templateImageWidth || captchaInfo.templateImageWidth || 110,
        templateImageHeight: captchaInfo.captcha?.templateImageHeight || captchaInfo.templateImageHeight || 360,
        data: captchaInfo.captcha?.data || captchaInfo.data
      }
    }
    
    if (!captchaData.id || !captchaData.captcha.backgroundImage) {
      console.error('验证码数据不完整:', captchaData)
      throw new Error('验证码数据不完整')
    }
    
    // 对于SLIDER类型，需要templateImage
    if (captchaData.captcha.type === 'SLIDER' && !captchaData.captcha.templateImage) {
      console.error('滑块验证码缺少templateImage:', captchaData)
      throw new Error('滑块验证码数据不完整')
    }
    
    doLoadCaptcha(captchaData)
    
    // 触发刷新回调
    emit('btnRefreshFun', null, null)
  } catch (error) {
    console.error('刷新验证码失败:', error)
  }
}

// 加载验证码数据
function doLoadCaptcha(data: any) {
  destroyCaptcha(() => {
    setTimeout(() => {
      openCaptcha(data);
    }, 300)
  })
}

// 打开验证码
function openCaptcha(data: any) {
  console.log('打开验证码:', data)
  
  // 检查验证码类型是否支持
  const supportedTypes = ['SLIDER', 'CONCAT'];
  const captchaType = data.captcha?.type;
  
  if (captchaType && !supportedTypes.includes(captchaType)) {
    console.warn(`⚠️ 不支持的验证码类型: ${captchaType}，自动刷新获取新验证码...`);
    
    // 显示不支持的类型（会触发UI提示）
    currentCaptcha.value.target = data;
    
    // 1秒后自动刷新
    setTimeout(() => {
      refresh();
    }, 1000);
    
    return;
  }
  
  currentCaptcha.value.target = data
}

// 销毁验证码
function destroyCaptcha(callback?: Function) {
  if (currentCaptcha.value.target.id) {
    setTimeout(() => {
      currentCaptcha.value.target = {
        id: '',
        captcha: {
          type: props.captchaType || 'SLIDER',
          backgroundImage: "",
          templateImage: ""
        }
      }
      tip.value = { msg: "拖动滑块完成拼图" }
      
      if (callback) {
        callback();
      }
    }, 200)
  } else {
    if (callback) {
      callback();
    }
  }
}

// 显示提示信息
function showTips(msg: string, type: number, callback?: Function) {
  tip.value = {
    msg: msg,
    type: type,        // 0-错误，1-成功
    showTips: true,
  }
  
  // 延时执行回调
  if (callback) {
    setTimeout(callback, 1000);
  }
}

// 关闭TAC验证码
function closeTac() {
  console.log('关闭TAC验证码')
  destroyCaptcha()
  emit('btnCloseFun', null, null)
}

// 组件卸载时清理
onUnmounted(() => {
  destroyCaptcha()
})
</script>

<style scoped>
.tac-captcha-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tac-captcha-container {
  width: 90%;
  max-width: 350px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  padding: 8px;
  border: 1px solid #ccc;
}

.tac-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e5e5;
  background: linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%);
}

.tac-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.5px;
}

.tac-close {
  font-size: 22px;
  color: #999;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.tac-close:active {
  background-color: #f0f0f0;
  color: #666;
}

.tac-content {
  height: auto;
  min-height: 260px;
  width: 100%;
  position: relative;
  overflow: hidden;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.captcha-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unsupported-captcha {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 40px 20px;
  text-align: center;
}

.unsupported-icon {
  font-size: 64px;
  margin-bottom: 20px;
  color: #faad14;
}

.unsupported-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.unsupported-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  display: block;
}

.unsupported-type {
  font-size: 14px;
  color: #666;
  display: block;
}

.unsupported-hint {
  font-size: 13px;
  color: #999;
  display: block;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.slider-bottom {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 12px;
  gap: 12px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
  position: relative;
}

.close-btn::before,
.close-btn::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 2px;
  background-color: #666;
  border-radius: 1px;
}

.close-btn::before {
  transform: rotate(45deg);
}

.close-btn::after {
  transform: rotate(-45deg);
}

.close-btn:active {
  background-color: #f5f5f5;
  border-color: #d0d0d0;
}

.refresh-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
  position: relative;
}

.refresh-btn::before {
  content: '↻';
  font-size: 20px;
  color: #666;
  font-weight: bold;
}

.refresh-btn:active {
  background-color: #f5f5f5;
  border-color: #d0d0d0;
  transform: rotate(180deg);
}

</style>
