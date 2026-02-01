<template>
  <view 
    :class="['safe-area', position]" 
    :style="safeAreaStyle"
  ></view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  // 位置：top 或 bottom
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom'].includes(value)
  },
  // 背景色
  backgroundColor: {
    type: String,
    default: '#ffffff'
  }
});

const safeAreaInsets = ref({
  top: 0,
  bottom: 0
});

// 获取安全区域信息
onMounted(() => {
  // 使用uni.getSystemInfoSync获取系统信息
  const systemInfo = uni.getSystemInfoSync();
  
  // 获取状态栏高度（顶部安全区域）
  safeAreaInsets.value.top = systemInfo.statusBarHeight || 0;
  
  // 获取底部安全区域高度
  if (systemInfo.safeAreaInsets) {
    safeAreaInsets.value.bottom = systemInfo.safeAreaInsets.bottom || 0;
  } else if (systemInfo.safeArea) {
    // 兼容旧版本API
    const screenHeight = systemInfo.screenHeight;
    const safeAreaBottom = systemInfo.safeArea.bottom;
    safeAreaInsets.value.bottom = screenHeight - safeAreaBottom;
  }
  
  console.log('安全区域信息:', safeAreaInsets.value);
});

// 计算样式
const safeAreaStyle = computed(() => {
  const height = props.position === 'top' 
    ? safeAreaInsets.value.top 
    : safeAreaInsets.value.bottom;
  
  return {
    height: `${height}px`,
    backgroundColor: props.backgroundColor
  };
});
</script>

<style lang="scss" scoped>
.safe-area {
  width: 100%;
  flex-shrink: 0;
  
  &.top {
    // 顶部安全区域
  }
  
  &.bottom {
    // 底部安全区域
  }
}
</style>
