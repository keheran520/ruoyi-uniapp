<template>
  <view class="interaction-page">
    <u-navbar
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      bg-color="#ffffff"
      left-icon="arrow-left"
      left-icon-color="#111827"
      title="互动中心"
      title-style="color: #111827; font-weight: 700;"
      @leftClick="goBack"
    />

    <view class="tabs-box">
      <u-tabs
        :list="tabList"
        :current="currentTab"
        line-width="28"
        line-color="#111827"
        active-style="color: #111827; font-weight: 700;"
        inactive-style="color: #6b7280;"
        @change="onTabChange"
      />
    </view>

    <scroll-view class="page-scroll" scroll-y @scrolltolower="loadList(false)">
      <view v-if="currentTab === 3" class="summary-card">
        <text class="summary-card__title">评论互动</text>
        <text class="summary-card__desc">当前累计评论 {{ summary.commentCount ?? 0 }} 条。评论详情入口后续我可以继续给你补成完整列表页。</text>
      </view>

      <view v-else-if="loading && !list.length" class="state-box">
        <u-loading-icon color="#3b82f6" size="24" />
        <text>加载中...</text>
      </view>

      <view v-else-if="!loading && !list.length" class="state-box state-box--empty">
        <u-icon name="grid" color="#9ca3af" size="28" />
        <text>暂无内容</text>
      </view>

      <view v-else class="card-list">
        <view v-for="item in list" :key="item.imageId || item.id" class="image-card" @tap="goDetail(item)">
          <image class="image-card__cover" :src="getCover(item)" mode="aspectFill" />
          <view class="image-card__body">
            <text class="image-card__title">{{ item.imageName || item.goodsName || '互动内容' }}</text>
            <text class="image-card__meta">点赞 {{ item.likeCount || 0 }} · 评论 {{ item.commentCount || 0 }}</text>
          </view>
        </view>
      </view>

      <SafeArea position="bottom" background-color="#f5f7fb" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getInteractionSummary, getMyImages, getLikedImages, getFavoritedImages } from '@/api/mobile/interaction'

const tabList = [{ name: '作品' }, { name: '点赞' }, { name: '收藏' }, { name: '评论' }]
const currentTab = ref(0)
const list = ref<any[]>([])
const summary = ref<Record<string, any>>({})
const pageNum = ref(1)
const pageSize = 10
const loading = ref(false)
const finished = ref(false)

function getCover(item: Record<string, any>) {
  return item.url || item.imageUrl || String(item.goodsGalleryUrls || '').split(',').filter(Boolean)[0] || '/static/images/profile.jpg'
}

async function loadSummary() {
  try {
    const res = await getInteractionSummary()
    summary.value = res.data || {}
  } catch (error) {
    console.error('加载互动概览失败', error)
  }
}

async function loadList(refresh = false) {
  if (currentTab.value === 3) return
  if (loading.value || (!refresh && finished.value)) return
  loading.value = true
  try {
    const targetPage = refresh ? 1 : pageNum.value
    const params = { pageNum: targetPage, pageSize }
    const res = currentTab.value === 0 ? await getMyImages(params) : currentTab.value === 1 ? await getLikedImages(params) : await getFavoritedImages(params)
    const rows = res.rows || []
    list.value = refresh ? rows : [...list.value, ...rows]
    finished.value = rows.length < pageSize
    pageNum.value = targetPage + 1
  } catch (error) {
    console.error('加载互动列表失败', error)
  } finally {
    loading.value = false
  }
}

function onTabChange(event: Record<string, any>) {
  currentTab.value = event?.index ?? 0
  pageNum.value = 1
  finished.value = false
  list.value = []
  loadList(true)
}

function goDetail(item: Record<string, any>) {
  const id = item.imageId || item.id
  if (!id) return
  uni.navigateTo({ url: `/pages/detail?id=${id}` })
}

function goBack() {
  uni.navigateBack()
}

onLoad((options) => {
  const tab = Number(options?.tab ?? 0)
  if ([0, 1, 2, 3].includes(tab)) currentTab.value = tab
  loadSummary()
  loadList(true)
})
</script>

<style lang="scss" scoped>
.interaction-page { min-height: 100vh; background: #f5f7fb; }
.tabs-box { padding: 16rpx 24rpx 0; }
.page-scroll { height: calc(100vh - 180rpx); padding: 20rpx 24rpx 0; box-sizing: border-box; }
.state-box, .summary-card {
  border-radius: 28rpx;
  background: #ffffff;
  padding: 28rpx 24rpx;
  color: #6b7280;
}
.state-box {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 24rpx;
}
.summary-card__title { display: block; font-size: 30rpx; font-weight: 700; color: #111827; }
.summary-card__desc { display: block; margin-top: 10rpx; font-size: 23rpx; line-height: 1.6; color: #6b7280; }
.card-list { display: grid; gap: 16rpx; }
.image-card {
  display: flex;
  gap: 16rpx;
  padding: 18rpx;
  border-radius: 26rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 28rpx rgba(190, 198, 214, 0.12);
}
.image-card__cover { width: 140rpx; height: 140rpx; border-radius: 20rpx; flex-shrink: 0; }
.image-card__body { flex: 1; min-width: 0; }
.image-card__title { display: block; font-size: 28rpx; font-weight: 700; color: #111827; }
.image-card__meta { display: block; margin-top: 10rpx; font-size: 22rpx; color: #6b7280; }
</style>
