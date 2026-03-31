<template>
  <view class="message-page">
    <view class="page-head">
      <view class="status-space" :style="{ height: `${statusBarHeight}px` }" />
      <view class="top-actions">
        <text class="page-title">消息</text>
      </view>
      <view v-if="!wechatNoticeEnabled" class="notice-enable">
        <text class="notice-enable__text">开启通知后，可实时接收系统、订单、提醒与公告消息</text>
        <view class="notice-enable__btn" @tap="goWechatNotice">去开启</view>
        <view class="notice-enable__close" @tap="hideBanner">×</view>
      </view>
    </view>

    <view class="summary-card">
      <text class="summary-card__label">未读消息</text>
      <text class="summary-card__value">{{ unreadTotal }}</text>
      <text class="summary-card__sub">消息将按最新时间自动排序</text>
    </view>

    <view class="message-list">
      <view
        v-for="item in messageCategories"
        :key="item.key"
        class="message-card"
        @tap="goMessageList(item)"
      >
        <view class="message-card__icon" :style="{ background: item.color }">
          <u-icon :name="item.icon" color="#ffffff" size="24" />
        </view>
        <view class="message-card__body">
          <view class="message-card__title-row">
            <text class="message-card__title">{{ item.label }}</text>
            <text v-if="item.unreadCount" class="message-card__mark">{{ item.unreadCount }}</text>
          </view>
          <text class="message-card__sub">{{ item.summary }}</text>
        </view>
        <text class="message-card__time">{{ item.timeText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMobileMessageSummary } from '@/api/mobile/messageCenter'
import { setMessageTabBadge } from '@/utils/messageBadge'

type MessageCategoryItem = {
  key: string
  label: string
  icon: string
  color: string
  unreadCount: number
  summary: string
  timeText: string
}

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)
const wechatNoticeEnabled = ref(false)
const unreadTotal = ref(0)
const summaryRows = ref<any[]>([])

const categoryMeta: Record<string, { label: string; icon: string; color: string }> = {
  system: { label: '系统消息', icon: 'info-circle', color: 'linear-gradient(180deg, #66a6ff 0%, #4c85ff 100%)' },
  order: { label: '订单消息', icon: 'shopping-cart', color: 'linear-gradient(180deg, #ffa85c 0%, #ff8d3a 100%)' },
  remind: { label: '提醒消息', icon: 'clock', color: 'linear-gradient(180deg, #7fdc7b 0%, #59c95f 100%)' },
  notice: { label: '通知公告', icon: 'bell', color: 'linear-gradient(180deg, #8a8ffb 0%, #747af3 100%)' }
}

const messageCategories = computed<MessageCategoryItem[]>(() => {
  return ['system', 'order', 'remind', 'notice'].map((key) => {
    const source = summaryRows.value.find((item) => item.key === key) || {}
    return {
      key,
      label: categoryMeta[key].label,
      icon: categoryMeta[key].icon,
      color: categoryMeta[key].color,
      unreadCount: Number(source.unreadCount || 0),
      summary: source.title || source.content || '暂无消息',
      timeText: formatDateTime(source.sendTime)
    }
  })
})

async function loadSummary() {
  try {
    const res = await getMobileMessageSummary()
    unreadTotal.value = Number(res.data?.unreadTotal || 0)
    summaryRows.value = res.data?.categories || []
    setMessageTabBadge(unreadTotal.value)
  } catch (error) {
    console.error('加载消息中心摘要失败', error)
  }
}

function formatDateTime(value?: string) {
  if (!value) return ''
  return String(value).replace('T', ' ').slice(5, 16)
}

function goMessageList(item: { key: string; label: string }) {
  uni.navigateTo({
    url: `/pages/message-list?type=${item.key}&title=${encodeURIComponent(item.label)}`
  })
}

function goWechatNotice() {
  uni.navigateTo({
    url: '/pages/message-notification'
  })
}

function hideBanner() {
  wechatNoticeEnabled.value = true
}

function handleRefresh() {
  loadSummary()
}

onMounted(() => {
  uni.$on('message-center-refresh', handleRefresh)
})

onUnmounted(() => {
  uni.$off('message-center-refresh', handleRefresh)
})

onShow(() => {
  loadSummary()
})
</script>

<style lang="scss" scoped>
.message-page {
  min-height: 100vh;
  background: #f5f8ff;
  padding: 0 24rpx 36rpx;
}

.top-actions {
  display: flex;
  align-items: center;
  padding: 22rpx 0 18rpx;
}

.page-title {
  font-size: 42rpx;
  font-weight: 700;
  color: #1f2530;
}

.notice-enable {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 12rpx 18rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #edf4ff 0%, #f8fbff 100%);
}

.notice-enable__text {
  flex: 1;
  font-size: 24rpx;
  color: #8aa2da;
}

.notice-enable__btn {
  min-width: 126rpx;
  height: 54rpx;
  border-radius: 999rpx;
  background: #5f8fff;
  color: #ffffff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-enable__close {
  color: #b6c2db;
  font-size: 34rpx;
  line-height: 1;
}

.summary-card {
  margin-top: 26rpx;
  padding: 28rpx 24rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #ffffff 0%, #eef4ff 100%);
  box-shadow: 0 12rpx 28rpx rgba(184, 201, 234, 0.28);
}

.summary-card__label {
  display: block;
  font-size: 24rpx;
  color: #92a0b8;
}

.summary-card__value {
  display: block;
  margin-top: 10rpx;
  font-size: 64rpx;
  line-height: 1;
  font-weight: 700;
  color: #1f2530;
}

.summary-card__sub {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #9ca8bc;
}

.message-list {
  margin-top: 26rpx;
}

.message-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #edf1f7;
}

.message-card__icon {
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-card__body {
  flex: 1;
  min-width: 0;
}

.message-card__title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.message-card__title {
  font-size: 34rpx;
  color: #2a2a2a;
  font-weight: 600;
}

.message-card__mark {
  min-width: 34rpx;
  height: 34rpx;
  padding: 0 10rpx;
  border-radius: 999rpx;
  background: #eef2ff;
  color: #5f8fff;
  font-size: 22rpx;
  line-height: 34rpx;
  text-align: center;
}

.message-card__sub {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #9ca5b4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-card__time {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #b0b0b0;
}
</style>
