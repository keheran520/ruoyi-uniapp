<template>
  <view class="xhs-cell-group">
    <view class="xhs-cell-group__title" v-if="title">
      <text>{{ title }}</text>
    </view>
    <view class="xhs-cell-group__wrapper">
      <slot></slot>
    </view>
  </view>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.xhs-cell-group {
  margin-bottom: 24rpx;
  
  &__title {
    padding: 0 30rpx 16rpx;
    font-size: 26rpx;
    color: #999;
    line-height: 1.5;
  }
  
  &__wrapper {
    background: #fff;
    border-radius: 16rpx; // 添加圆角
    margin: 0 20rpx; // 左右边距
    overflow: hidden; // 确保子元素不超出圆角
    
    // 添加分隔线（从左边开始，最后一项不显示）
    ::v-deep .xhs-cell:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 0; // 从左边开始
      right: 0;
      bottom: 0;
      height: 1rpx;
      background: #f0f0f0;
    }
  }
}
</style>
