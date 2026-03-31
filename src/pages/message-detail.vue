<template>
  <view class="detail-page">
    <view class="page-header">
      <view class="status-space" :style="{ height: `${statusBarHeight}px` }" />
      <view class="page-header__row">
        <view class="page-header__back" @tap="goBack">
          <u-icon name="arrow-left" color="#1f2b38" size="20" />
        </view>
        <view class="page-header__main">
          <text class="page-header__title">消息详情</text>
          <text class="page-header__desc">查看完整消息内容</text>
        </view>
      </view>
    </view>

    <scroll-view class="detail-scroll" scroll-y>
      <view class="detail-shell">
        <view class="detail-card">
          <text class="detail-card__title">{{ title }}</text>
          <text class="detail-card__time">{{ time }}</text>
          <rich-text class="detail-card__content" :nodes="contentNodes" />
        </view>
      </view>
      <SafeArea position="bottom" background-color="#f5f8ff" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)
const title = ref('消息详情')
const time = ref('')
const content = ref('')

const contentNodes = computed(() => normalizeHtml(content.value || '<p>暂无内容</p>'))

function normalizeHtml(html: string) {
  const source = String(html || '')
  if (!source.trim()) return '<p>暂无内容</p>'
  return source
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
}

function goBack() {
  uni.navigateBack()
}

onLoad((options) => {
  title.value = decodeURIComponent(options?.title || '消息详情')
  time.value = decodeURIComponent(options?.time || '')
  content.value = decodeURIComponent(options?.content || '')
})
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #f5f8ff;
}

.page-header {
  padding: 0 26rpx 8rpx;
  background: linear-gradient(180deg, #f5f8ff 0%, #edf4ff 100%);
}

.page-header__row {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  padding: 18rpx 0 16rpx;
}

.page-header__back {
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(182, 201, 234, 0.28);
}

.page-header__main {
  flex: 1;
}

.page-header__title {
  display: block;
  font-size: 38rpx;
  font-weight: 700;
  color: #1f2b38;
}

.page-header__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8392a7;
}

.detail-scroll {
  height: calc(100vh - 120rpx);
}

.detail-shell {
  padding: 0 26rpx 24rpx;
}

.detail-card {
  padding: 28rpx 24rpx;
  border-radius: 30rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 30rpx rgba(182, 201, 234, 0.16);
}

.detail-card__title {
  display: block;
  font-size: 38rpx;
  line-height: 1.5;
  font-weight: 700;
  color: #1f2b38;
}

.detail-card__time {
  display: block;
  margin-top: 12rpx;
  font-size: 23rpx;
  color: #97a5b8;
}

.detail-card__content {
  display: block;
  margin-top: 26rpx;
  font-size: 28rpx;
  line-height: 1.85;
  color: #415063;
  word-break: break-word;
}

:deep(.detail-card__content img) {
  max-width: 100%;
  border-radius: 18rpx;
}
</style>
