<template>
  <view class="goods-page">
    <u-navbar :fixed="true" :placeholder="true" :safe-area-inset-top="true" bg-color="#ffffff" left-icon="arrow-left" left-icon-color="#111827" title="商品详情" title-style="color: #111827; font-weight: 700;" @leftClick="goBack" />
    <scroll-view class="page-scroll" scroll-y>
      <view v-if="goods.id" class="detail-wrap">
        <image class="goods-cover" :src="coverUrl" mode="aspectFill" />
        <view class="summary-card">
          <text class="goods-name">{{ goods.name }}</text>
          <text class="goods-sub">{{ goods.subTitle || goods.brief || '精选商城商品' }}</text>
          <view class="price-row">
            <text class="price">{{ formatMoney(goods.price) }}</text>
            <text v-if="goods.originalPrice" class="price-original">{{ formatMoney(goods.originalPrice) }}</text>
            <text class="price-unit">/ {{ goods.unitName || '件' }}</text>
          </view>
          <view class="tag-row"><text v-for="tag in tagList" :key="tag" class="tag">{{ tag }}</text></view>
        </view>
        <view class="panel"><text class="panel-title">服务说明</text><text class="panel-text">{{ goods.brief || '暂无服务简介' }}</text></view>
        <view class="panel"><text class="panel-title">商品详情</text><text class="panel-text">{{ goods.detail || goods.remark || '暂无详细描述' }}</text></view>
        <view class="panel">
          <text class="panel-title">服务信息</text>
          <view class="info-row"><text class="info-label">服务区域</text><text class="info-value">{{ goods.serviceRegions || '未配置' }}</text></view>
          <view class="info-row"><text class="info-label">服务类型</text><text class="info-value">{{ goods.serviceType || '通用服务' }}</text></view>
          <view class="info-row"><text class="info-label">销量</text><text class="info-value">{{ goods.orderCount || 0 }}</text></view>
          <view class="info-row"><text class="info-label">收藏</text><text class="info-value">{{ goods.favoriteCount || 0 }}</text></view>
        </view>
        <view class="bottom-actions">
          <u-button plain type="primary" shape="circle" @click="goOrderList">查看订单</u-button>
          <u-button type="primary" shape="circle" @click="showActionTips">下单能力下一步接入</u-button>
        </view>
      </view>
      <view v-else class="state-box"><u-loading-icon color="#3b82f6" size="24" /><text>加载商品详情中...</text></view>
      <SafeArea position="bottom" background-color="#f5f7fb" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMallGoodsDetail } from '@/api/mobile/mall'

const goods = ref<Record<string, any>>({})
const coverUrl = computed(() => String(goods.value.galleryUrls || '').split(',').filter(Boolean)[0] || '/static/images/profile.jpg')
const tagList = computed(() => String(goods.value.serviceTags || '').split(',').map((item) => item.trim()).filter(Boolean))
function formatMoney(value?: number | string) { return `¥${((Number(value) || 0) / 100).toFixed(2)}` }
async function loadData(id: string | number) {
  try {
    const res = await getMallGoodsDetail(id)
    goods.value = res.data || {}
  } catch (error) {
    console.error('加载商品详情失败', error)
    uni.showToast({ title: '商品详情加载失败', icon: 'none' })
  }
}
function showActionTips() { uni.showToast({ title: '下单与支付链路下一步接入', icon: 'none' }) }
function goOrderList() { uni.navigateTo({ url: '/pages_mall/pages/order/list' }) }
function goBack() { uni.navigateBack() }
onLoad((options) => { if (options?.id) loadData(options.id) })
</script>

<style lang="scss" scoped>
.goods-page { min-height: 100vh; background: #f5f7fb; }
.detail-wrap { padding: 24rpx; }
.goods-cover { width: 100%; height: 520rpx; border-radius: 32rpx; }
.summary-card, .panel { margin-top: 20rpx; padding: 28rpx 24rpx; border-radius: 28rpx; background: #ffffff; }
.goods-name { display: block; font-size: 36rpx; font-weight: 700; color: #111827; }
.goods-sub { display: block; margin-top: 12rpx; font-size: 24rpx; color: #6b7280; line-height: 1.6; }
.price-row { display: flex; align-items: baseline; gap: 12rpx; margin-top: 18rpx; }
.price { font-size: 40rpx; font-weight: 700; color: #ef4444; }
.price-original, .price-unit { font-size: 22rpx; color: #9ca3af; }
.price-original { text-decoration: line-through; }
.tag-row { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 18rpx; }
.tag { padding: 8rpx 14rpx; border-radius: 999rpx; background: #eff6ff; color: #1d4ed8; font-size: 20rpx; }
.panel-title { display: block; font-size: 30rpx; font-weight: 700; color: #111827; }
.panel-text { display: block; margin-top: 18rpx; font-size: 26rpx; color: #4b5563; line-height: 1.8; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid #eef2f7; }
.info-row:last-child { border-bottom: none; padding-bottom: 0; }
.info-label { font-size: 24rpx; color: #6b7280; }
.info-value { font-size: 26rpx; color: #111827; text-align: right; }
.bottom-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16rpx; margin-top: 20rpx; }
.state-box { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12rpx; color: #6b7280; font-size: 24rpx; }
</style>
