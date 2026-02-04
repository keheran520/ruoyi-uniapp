<template>
  <view class="xhs-cell" :class="{'xhs-cell--clickable': clickable}" @tap="handleClick">
    <view class="xhs-cell__icon" v-if="$slots.icon || icon">
      <slot name="icon">
        <u-icon v-if="icon" :name="icon" :color="iconColor" :size="iconSize"></u-icon>
      </slot>
    </view>
    
    <view class="xhs-cell__content">
      <text class="xhs-cell__title">{{ title }}</text>
      <text class="xhs-cell__label" v-if="label">{{ label }}</text>
    </view>
    
    <view class="xhs-cell__value" v-if="value || $slots.value">
      <slot name="value">
        <text>{{ value }}</text>
      </slot>
    </view>
    
    <view class="xhs-cell__arrow" v-if="isLink">
      <u-icon name="arrow-right" color="#d8d8d8" size="14"></u-icon>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number], // 支持字符串和数字
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  iconColor: {
    type: String,
    default: '#333'
  },
  iconSize: {
    type: [String, Number],
    default: 20
  },
  isLink: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['tap', 'click'])

const handleClick = () => {
  if (props.clickable) {
    emit('tap')
    emit('click') // 兼容旧代码
  }
}
</script>

<style lang="scss" scoped>
.xhs-cell {
  display: flex;
  align-items: center;
  padding: 32rpx 40rpx;
  background: #fff;
  position: relative;
  transition: background 0.15s;
  
  &--clickable:active {
    background: #f7f7f7;
  }
  
  &__icon {
    margin-right: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44rpx;
    height: 44rpx;
  }
  
  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 44rpx;
  }
  
  &__title {
    font-size: 30rpx;
    color: #333;
    line-height: 1.5;
    font-weight: 400;
  }
  
  &__label {
    margin-top: 4rpx;
    font-size: 24rpx;
    color: #999;
    line-height: 1.4;
  }
  
  &__value {
    margin-right: 16rpx;
    font-size: 26rpx;
    color: #999;
  }
  
  &__arrow {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
