<template>
  <view class="notice-page">
    <view class="header">
      <view class="status-space" :style="{ height: `${statusBarHeight}px` }" />
      <view class="header__row">
        <view class="header__back" @tap="goBack">
          <u-icon name="arrow-left" color="#2b2b2b" size="20" />
        </view>
        <text class="header__title">微信通知</text>
        <view class="header__placeholder" />
      </view>
    </view>

    <view class="notice-card">
      <text class="notice-card__title">开启微信通知</text>
      <text class="notice-card__desc">开启后可接收订单变更、客服通知、服务提醒等重要消息。</text>
      <view class="notice-card__row">
        <text class="notice-card__label">接收微信模板通知</text>
        <switch :checked="enabled" color="#5f8fff" @change="handleSwitch" />
      </view>
    </view>

    <view class="tips-card">
      <text class="tips-card__title">可接收内容</text>
      <text class="tips-card__item">1. 新订单和订单状态变更</text>
      <text class="tips-card__item">2. 陪玩接单、改期、取消通知</text>
      <text class="tips-card__item">3. 系统公告和会员权益提醒</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)
const enabled = ref(false)

function handleSwitch(e: any) {
  enabled.value = !!e.detail.value
  uni.showToast({
    title: enabled.value ? '已开启' : '已关闭',
    icon: 'none'
  })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.notice-page {
  min-height: 100vh;
  background: #f7f8fc;
  padding: 0 24rpx 30rpx;
}

.header__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0 18rpx;
}

.header__back,
.header__placeholder {
  width: 64rpx;
}

.header__title {
  font-size: 34rpx;
  font-weight: 600;
  color: #242424;
}

.notice-card,
.tips-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 10rpx 28rpx rgba(54, 69, 109, 0.06);
}

.notice-card__title,
.tips-card__title {
  display: block;
  font-size: 32rpx;
  color: #2d2d2d;
  font-weight: 700;
}

.notice-card__desc {
  display: block;
  margin-top: 16rpx;
  font-size: 25rpx;
  line-height: 1.6;
  color: #85889b;
}

.notice-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30rpx;
}

.notice-card__label {
  font-size: 28rpx;
  color: #313131;
}

.tips-card {
  margin-top: 20rpx;
}

.tips-card__item {
  display: block;
  margin-top: 16rpx;
  font-size: 25rpx;
  line-height: 1.6;
  color: #727272;
}
</style>
