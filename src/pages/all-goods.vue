<template>
  <view class="goods-page">
    <view class="page-head">
      <view class="status-space" :style="{ height: `${statusBarHeight}px` }" />
      <view class="nav-row">
        <text class="nav-title">分类</text>
      </view>
    </view>

    <view class="content-shell">
      <view class="left-panel">
        <view
          v-for="item in primaryCategories"
          :key="item.id"
          class="left-item"
          :class="{ 'left-item--active': String(activeCategoryId) === String(item.id) }"
          @tap="selectCategory(item.id)"
        >
          <text>{{ item.name }}</text>
        </view>
      </view>

      <scroll-view class="right-panel" scroll-y @scrolltolower="loadGoods(false)">
        <view
          v-for="item in currentGoods"
          :key="item.id"
          class="goods-item"
          @tap="goGoodsDetail(item)"
        >
          <image class="goods-item__thumb" :src="item.cover" mode="aspectFill" />
          <view class="goods-item__body">
            <text class="goods-item__title">{{ item.title }}</text>
            <text class="goods-item__desc">{{ item.desc }}</text>
            <view class="goods-item__price">
              <text class="goods-item__price-now">{{ item.price }}</text>
              <text v-if="item.originPrice" class="goods-item__price-old">{{ item.originPrice }}</text>
            </view>
          </view>
        </view>
        <view class="list-footer">{{ finished ? '没有更多商品了' : '上拉继续加载' }}</view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMallCategoryList, getMallGoodsList } from '@/api/mobile/mall'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)
const allCategories = ref<any[]>([])
const activeCategoryId = ref<string | number>('all')
const goodsMap = ref<Record<string, any[]>>({})
const pageNum = ref(1)
const pageSize = 10
const finished = ref(false)
const loading = ref(false)

const fallbackPrimaryCategories = [{ id: 'all', name: '全部' }]

const primaryCategories = computed(() => {
  const roots = allCategories.value.filter((item) => Number(item.parentId || 0) === 0 || !item.parentId)
  if (!roots.length) return fallbackPrimaryCategories
  return [
    ...fallbackPrimaryCategories,
    ...roots.map((item) => ({
      id: item.id,
      name: item.name || '分类'
    }))
  ]
})

const currentGoods = computed(() => {
  const key = String(activeCategoryId.value || 'all')
  const source = goodsMap.value[key] || goodsMap.value.all || []
  return source.map((item: any, index: number) => ({
    id: item.id || index + 1,
    title: item.name || `商品${index + 1}`,
    desc: item.subTitle || item.brief || '暂无商品描述',
    price: formatMoney(item.price),
    originPrice: Number(item.originalPrice) ? formatMoney(item.originalPrice) : '',
    cover: getCover(item)
  }))
})

watch(activeCategoryId, () => {
  pageNum.value = 1
  finished.value = false
  loadGoods(true)
})

function formatMoney(value?: number | string) {
  return `¥${((Number(value) || 0) / 100).toFixed(2)}`
}

function getCover(item: Record<string, any>) {
  return String(item?.galleryUrls || '')
    .split(',')
    .filter(Boolean)[0] || '/static/images/banner/banner01.jpg'
}

async function loadCategories() {
  try {
    const res = await getMallCategoryList()
    const list = res.data || []
    allCategories.value = list
    activeCategoryId.value = 'all'
  } catch (error) {
    console.error('加载商品分类失败', error)
  }
}

async function loadGoods(refresh = false) {
  if (loading.value || (!refresh && finished.value)) return
  loading.value = true
  try {
    const targetPage = refresh ? 1 : pageNum.value
    const categoryId = activeCategoryId.value !== 'all' ? activeCategoryId.value : undefined
    const res = await getMallGoodsList({ pageNum: targetPage, pageSize, categoryId })
    const rows = res.rows || res.data || []
    const key = String(activeCategoryId.value || 'all')
    goodsMap.value[key] = refresh ? rows : [...(goodsMap.value[key] || []), ...rows]
    finished.value = rows.length < pageSize
    pageNum.value = targetPage + 1
  } catch (error) {
    console.error('加载商品失败', error)
  } finally {
    loading.value = false
  }
}

function selectCategory(id: string | number) {
  if (String(activeCategoryId.value) === String(id)) return
  activeCategoryId.value = id
}

function goGoodsDetail(item: { id: number; title: string }) {
  uni.navigateTo({ url: `/pages/escort-detail?id=${item.id}&title=${encodeURIComponent(item.title)}` })
}

onLoad(async () => {
  await loadCategories()
  await loadGoods(true)
})
</script>

<style lang="scss" scoped>
.goods-page {
  min-height: 100vh;
  background: #f4f4f4;
}

.page-head {
  padding: 0 24rpx 24rpx;
  background: #f5f8ff;
}

.nav-row {
  display: flex;
  align-items: center;
  padding: 22rpx 0 18rpx;
}

.nav-title {
  flex-shrink: 0;
  font-size: 42rpx;
  font-weight: 700;
  color: #1f2530;
}

.content-shell {
  display: flex;
  min-height: calc(100vh - 140rpx);
  background: #ffffff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  overflow: hidden;
}

.left-panel {
  width: 200rpx;
  background: #f4f4f4;
}

.left-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 104rpx;
  padding: 0 12rpx;
  font-size: 28rpx;
  color: #333333;
  background: #f4f4f4;
}

.left-item--active {
  color: #517bff;
  background: #ffffff;
  font-weight: 600;
}

.left-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 28rpx;
  width: 6rpx;
  height: 44rpx;
  border-radius: 999rpx;
  background: #5b73ff;
}

.right-panel {
  flex: 1;
  height: calc(100vh - 140rpx);
  padding: 16rpx 18rpx 24rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.goods-item {
  display: flex;
  gap: 18rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.goods-item__thumb {
  width: 176rpx;
  height: 176rpx;
  border-radius: 18rpx;
  flex-shrink: 0;
  background: #eef2f7;
}

.goods-item__body {
  flex: 1;
  min-width: 0;
}

.goods-item__title {
  display: block;
  font-size: 34rpx;
  line-height: 1.35;
  color: #2a2a2a;
  font-weight: 700;
}

.goods-item__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  line-height: 1.55;
  color: #9c9c9c;
}

.goods-item__price {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
  margin-top: 16rpx;
}

.goods-item__price-now {
  font-size: 44rpx;
  color: #ff6e47;
  font-weight: 700;
}

.goods-item__price-old {
  font-size: 25rpx;
  color: #b9b9b9;
  text-decoration: line-through;
}

.list-footer {
  padding: 18rpx 0 8rpx;
  text-align: center;
  font-size: 22rpx;
  color: #9ca3af;
}
</style>
