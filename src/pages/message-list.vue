<template>
  <view class="message-page">
    <view class="page-header">
      <view class="status-space" :style="{ height: `${statusBarHeight}px` }" />
      <view class="page-header__row">
        <view class="page-header__back" @tap="goBack">
          <u-icon name="arrow-left" color="#1f2b38" size="20" />
        </view>
        <view class="page-header__main">
          <text class="page-header__title">{{ pageTitle }}</text>
          <text class="page-header__desc">点击消息可查看详情并同步已读状态</text>
        </view>
        <view class="page-header__action" @tap="handleReadAll">全部已读</view>
      </view>
    </view>

    <scroll-view class="list-scroll" scroll-y @scrolltolower="loadList(false)">
      <view class="list-shell">
        <view
          v-for="item in list"
          :key="item.id"
          class="message-item"
          @tap="handleRead(item)"
        >
          <view class="message-item__avatar" :style="{ background: currentMeta.color }">
            <u-icon :name="currentMeta.icon" color="#ffffff" size="22" />
          </view>
          <view class="message-item__body">
            <view class="message-item__head">
              <text class="message-item__name">{{ item.title }}</text>
              <text class="message-item__time">{{ item.time }}</text>
            </view>
            <text class="message-item__content">{{ item.preview }}</text>
          </view>
          <view v-if="item.canRead && !item.isRead" class="message-item__dot" />
        </view>

        <view v-if="!loading && !list.length" class="state-box">
          <u-icon name="chat" color="#8ea0bb" size="22" />
          <text>暂无消息</text>
        </view>

        <view v-if="list.length" class="footer-tip">{{ finished ? '没有更多消息了' : '上拉加载更多' }}</view>
      </view>
      <SafeArea position="bottom" background-color="#f5f8ff" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getMobileMessageList, markMobileMessageRead, markMobileMessageReadAll } from '@/api/mobile/messageCenter'
import { refreshMessageTabBadge } from '@/utils/messageBadge'

type MessageRow = {
  id: number
  title: string
  time: string
  content: string
  preview: string
  isRead: boolean
  canRead: boolean
}

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)
const pageTitle = ref('消息列表')
const currentType = ref('system')
const list = ref<MessageRow[]>([])
const loading = ref(false)
const finished = ref(false)
const pageNum = ref(1)
const pageSize = 20

const metaMap: Record<string, { icon: string; color: string }> = {
  system: { icon: 'info-circle', color: 'linear-gradient(180deg, #66a6ff 0%, #4c85ff 100%)' },
  order: { icon: 'shopping-cart', color: 'linear-gradient(180deg, #ffa85c 0%, #ff8d3a 100%)' },
  remind: { icon: 'clock', color: 'linear-gradient(180deg, #7fdc7b 0%, #59c95f 100%)' },
  notice: { icon: 'bell', color: 'linear-gradient(180deg, #8a8ffb 0%, #747af3 100%)' }
}

const currentMeta = computed(() => metaMap[currentType.value] || metaMap.system)

async function loadList(refresh = true) {
  if (loading.value || (!refresh && finished.value)) return
  loading.value = true
  try {
    const targetPage = refresh ? 1 : pageNum.value
    const res = await getMobileMessageList({
      messageType: currentType.value,
      pageNum: targetPage,
      pageSize
    })
    const rows = res.rows || res.data?.rows || []
    const mapped = rows.map((item: Record<string, any>) => ({
      id: Number(item.logId || item.messageId || item.id || 0),
      title: item.messageTitle || '消息通知',
      time: formatDateTime(item.sendTime || item.createTime),
      content: item.messageContent || item.messageTitle || '',
      preview: buildPreview(item.messageContent || item.messageTitle || ''),
      isRead: String(item.isRead || 'Y') === 'Y',
      canRead: true
    }))
    list.value = refresh ? mapped : [...list.value, ...mapped]
    finished.value = mapped.length < pageSize
    pageNum.value = targetPage + 1
  } catch (error) {
    console.error('load message list failed', error)
  } finally {
    loading.value = false
  }
}

async function handleRead(item: MessageRow) {
  try {
    if (item.canRead && !item.isRead && item.id) {
      await markMobileMessageRead(item.id)
      item.isRead = true
      uni.$emit('message-center-refresh')
      await refreshMessageTabBadge()
    }
  } catch (error) {
    console.error('mark message read failed', error)
  }

  uni.navigateTo({
    url: `/pages/message-detail?title=${encodeURIComponent(item.title)}&time=${encodeURIComponent(item.time)}&content=${encodeURIComponent(item.content)}`
  })
}

async function handleReadAll() {
  try {
    await markMobileMessageReadAll({ messageType: currentType.value })
    list.value = list.value.map((item) => ({ ...item, isRead: true }))
    uni.$emit('message-center-refresh')
    await refreshMessageTabBadge()
    uni.showToast({ title: '已全部标记', icon: 'none' })
  } catch (error) {
    console.error('mark all message read failed', error)
  }
}

function formatDateTime(value?: string) {
  if (!value) return '刚刚'
  return String(value).replace('T', ' ').slice(0, 16)
}

function buildPreview(value?: string) {
  const text = String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
  return text || '暂无内容'
}

function goBack() {
  uni.navigateBack()
}

function handleRefresh() {
  loadList(true)
}

onLoad((options) => {
  currentType.value = options?.type || 'system'
  pageTitle.value = decodeURIComponent(options?.title || '消息列表')
  loadList(true)
})

onShow(() => {
  loadList(true)
})

onMounted(() => {
  uni.$on('message-center-refresh', handleRefresh)
})

onUnmounted(() => {
  uni.$off('message-center-refresh', handleRefresh)
})
</script>

<style lang="scss" scoped>
.message-page {
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
  min-width: 0;
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

.page-header__action {
  margin-top: 8rpx;
  padding: 0 20rpx;
  height: 56rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.9);
  color: #5d8fff;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  box-shadow: 0 10rpx 24rpx rgba(182, 201, 234, 0.18);
}

.list-scroll {
  height: calc(100vh - 120rpx);
}

.list-shell {
  padding: 0 26rpx 24rpx;
}

.message-item,
.state-box {
  border-radius: 30rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 30rpx rgba(182, 201, 234, 0.16);
}

.message-item {
  position: relative;
  display: flex;
  gap: 18rpx;
  padding: 24rpx 22rpx;
  margin-bottom: 16rpx;
}

.message-item__avatar {
  width: 84rpx;
  height: 84rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-item__body {
  flex: 1;
  min-width: 0;
}

.message-item__head {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
}

.message-item__name {
  flex: 1;
  min-width: 0;
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2b38;
}

.message-item__time {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #98a7ba;
}

.message-item__content {
  display: -webkit-box;
  margin-top: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 25rpx;
  line-height: 1.6;
  color: #72839a;
}

.message-item__dot {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #ff5b6a;
  box-shadow: 0 0 0 6rpx rgba(255, 91, 106, 0.12);
}

.state-box {
  margin-top: 20rpx;
  padding: 90rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  font-size: 24rpx;
  color: #8ea0bb;
}

.footer-tip {
  padding: 20rpx 0 10rpx;
  text-align: center;
  font-size: 22rpx;
  color: #96a4b8;
}
</style>
