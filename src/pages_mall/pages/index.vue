<template>
  <view class="mall-page">
    <u-navbar
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      bg-color="#ffffff"
      left-icon="arrow-left"
      left-icon-color="#111827"
      title="商城"
      title-style="color: #111827; font-weight: 700;"
      @leftClick="goBack"
    />
    <scroll-view class="page-scroll" scroll-y @scrolltolower="loadGoods(false)">
      <view class="search-bar" @tap="showSearchTips">
        <u-icon name="search" color="#6b7280" size="18" />
        <text>{{ keywords || '搜索商品、服务、关键词' }}</text>
      </view>
      <view class="hero-card">
        <text class="hero-kicker">移动商城</text>
        <text class="hero-title">精选商品与会员权益专区</text>
        <text class="hero-desc">分类、推荐和订单都统一接入 mobile 模块，兼容微信小程序、H5 和 App。</text>
      </view>

      <view v-if="recommendGoods.length" class="section">
        <view class="section-head"><text class="section-title">推荐商品</text><text class="section-extra">{{ recommendGoods.length }} 件</text></view>
        <scroll-view class="recommend-scroll" scroll-x>
          <view class="recommend-row">
            <view v-for="item in recommendGoods" :key="item.id" class="recommend-card" @tap="goGoodsDetail(item.id)">
              <image class="recommend-cover" :src="getCover(item)" mode="aspectFill" />
              <text class="recommend-name">{{ item.name }}</text>
              <text class="recommend-price">{{ formatMoney(item.price) }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="section">
        <view class="section-head"><text class="section-title">分类导航</text><text class="section-extra">{{ categoryList.length }} 类</text></view>
        <scroll-view class="category-scroll" scroll-x>
          <view class="category-row">
            <view class="category-chip" :class="{ 'category-chip--active': currentCategory === '' }" @tap="switchCategory('')">全部</view>
            <view v-for="item in categoryList" :key="item.id" class="category-chip" :class="{ 'category-chip--active': String(currentCategory) === String(item.id) }" @tap="switchCategory(item.id)">
              {{ item.name }}
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="section">
        <view class="section-head"><text class="section-title">商品列表</text><text class="section-extra">{{ total }} 件</text></view>
        <view v-if="loading && !goodsList.length" class="state-box"><u-loading-icon color="#3b82f6" size="24" /><text>加载商品中...</text></view>
        <view v-else-if="!loading && !goodsList.length" class="state-box state-box--empty"><u-icon name="shopping-cart" color="#9ca3af" size="28" /><text>当前没有符合条件的商品</text></view>
        <view v-else class="goods-list">
          <view v-for="item in goodsList" :key="item.id" class="goods-card" @tap="goGoodsDetail(item.id)">
            <image class="goods-cover" :src="getCover(item)" mode="aspectFill" />
            <view class="goods-main">
              <text class="goods-name">{{ item.name }}</text>
              <text class="goods-sub">{{ item.subTitle || item.brief || '精选商城商品' }}</text>
              <view class="goods-tags"><text v-for="tag in splitText(item.serviceTags).slice(0, 3)" :key="tag" class="goods-tag">{{ tag }}</text></view>
              <view class="goods-foot">
                <view><text class="goods-price">{{ formatMoney(item.price) }}</text><text v-if="item.originalPrice" class="goods-original">{{ formatMoney(item.originalPrice) }}</text></view>
                <text class="goods-unit">{{ item.unitName || '件' }}</text>
              </view>
            </view>
          </view>
          <view class="footer-tip">{{ finished ? '没有更多商品了' : '上拉继续加载' }}</view>
        </view>
      </view>
      <SafeArea position="bottom" background-color="#f5f7fb" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getMallCategoryList, getMallGoodsList, getMallHome } from '@/api/mobile/mall'

const homeData = ref<Record<string, any>>({})
const categoryList = ref<any[]>([])
const goodsList = ref<any[]>([])
const total = ref(0)
const keywords = ref('')
const currentCategory = ref<string | number>('')
const pageNum = ref(1)
const pageSize = 10
const loading = ref(false)
const finished = ref(false)
const recommendGoods = computed<any[]>(() => homeData.value.recommendGoods || [])

function formatMoney(value?: number | string) { return `¥${((Number(value) || 0) / 100).toFixed(2)}` }
function splitText(value?: string) { return String(value || '').split(',').map((item) => item.trim()).filter(Boolean) }
function getCover(item: Record<string, any>) { return String(item.galleryUrls || '').split(',').filter(Boolean)[0] || '/static/images/profile.jpg' }
async function loadHomeData() {
  try {
    const [homeRes, categoryRes] = await Promise.all([getMallHome(), getMallCategoryList()])
    homeData.value = homeRes.data || {}
    categoryList.value = categoryRes.data || []
  } catch (error) {
    console.error('加载商城首页失败', error)
  }
}
async function loadGoods(refresh = false) {
  if (loading.value || (!refresh && finished.value)) return
  loading.value = true
  try {
    const targetPage = refresh ? 1 : pageNum.value
    const res = await getMallGoodsList({ pageNum: targetPage, pageSize, categoryId: currentCategory.value || undefined, keywords: keywords.value || undefined })
    const rows = res.rows || []
    goodsList.value = refresh ? rows : [...goodsList.value, ...rows]
    total.value = res.total || goodsList.value.length
    finished.value = rows.length < pageSize
    pageNum.value = targetPage + 1
  } catch (error) {
    console.error('加载商品列表失败', error)
    uni.showToast({ title: '商品加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
function switchCategory(categoryId: string | number) {
  if (String(currentCategory.value) === String(categoryId)) return
  currentCategory.value = categoryId
  pageNum.value = 1
  finished.value = false
  loadGoods(true)
}
function goGoodsDetail(goodsId: string | number) { uni.navigateTo({ url: `/pages_mall/pages/goods/detail?id=${goodsId}` }) }
function showSearchTips() { uni.showToast({ title: '搜索页下一步继续补充', icon: 'none' }) }
function goBack() { uni.navigateBack() }
onLoad(() => { loadHomeData(); loadGoods(true) })
onShow(() => { if (!categoryList.value.length) loadHomeData() })
</script>

<style lang="scss" scoped>
.mall-page { min-height: 100vh; background: #f5f7fb; }
.page-scroll { min-height: 100vh; }
.search-bar { margin: 24rpx 24rpx 0; padding: 0 24rpx; height: 84rpx; border-radius: 24rpx; background: #ffffff; display: flex; align-items: center; gap: 14rpx; color: #6b7280; font-size: 24rpx; }
.hero-card { margin: 20rpx 24rpx 0; padding: 30rpx; border-radius: 32rpx; background: linear-gradient(135deg, #111827 0%, #1f3b65 62%, #2563eb 100%); }
.hero-kicker, .hero-desc { display: block; color: rgba(255, 255, 255, 0.74); }
.hero-kicker { font-size: 22rpx; }
.hero-title { display: block; margin-top: 10rpx; font-size: 40rpx; font-weight: 700; color: #ffffff; }
.hero-desc { margin-top: 14rpx; font-size: 24rpx; line-height: 1.6; }
.section { margin-top: 20rpx; padding: 0 24rpx; }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 700; color: #111827; }
.section-extra { font-size: 22rpx; color: #6b7280; }
.recommend-scroll, .category-scroll { white-space: nowrap; }
.recommend-row, .category-row { display: inline-flex; gap: 14rpx; }
.recommend-card { width: 240rpx; padding: 18rpx; border-radius: 26rpx; background: #ffffff; }
.recommend-cover { width: 100%; height: 180rpx; border-radius: 20rpx; }
.recommend-name { display: block; margin-top: 14rpx; font-size: 26rpx; color: #111827; font-weight: 600; line-height: 1.5; }
.recommend-price { display: block; margin-top: 10rpx; font-size: 28rpx; font-weight: 700; color: #ef4444; }
.category-chip { padding: 14rpx 24rpx; border-radius: 999rpx; background: #ffffff; color: #6b7280; font-size: 24rpx; }
.category-chip--active { background: #111827; color: #ffffff; }
.state-box { padding: 80rpx 24rpx; border-radius: 28rpx; background: #ffffff; display: flex; flex-direction: column; align-items: center; gap: 12rpx; color: #6b7280; font-size: 24rpx; }
.state-box--empty { color: #9ca3af; }
.goods-list { display: flex; flex-direction: column; gap: 16rpx; }
.goods-card { display: flex; gap: 18rpx; padding: 20rpx; border-radius: 28rpx; background: #ffffff; }
.goods-cover { width: 180rpx; height: 180rpx; border-radius: 24rpx; flex-shrink: 0; }
.goods-main { flex: 1; min-width: 0; }
.goods-name { display: block; font-size: 28rpx; font-weight: 700; color: #111827; }
.goods-sub { display: block; margin-top: 10rpx; font-size: 22rpx; color: #6b7280; line-height: 1.6; }
.goods-tags { display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 12rpx; }
.goods-tag { padding: 6rpx 12rpx; border-radius: 999rpx; background: #eff6ff; color: #1d4ed8; font-size: 20rpx; }
.goods-foot { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 16rpx; }
.goods-price { font-size: 30rpx; font-weight: 700; color: #ef4444; }
.goods-original { margin-left: 10rpx; font-size: 22rpx; color: #9ca3af; text-decoration: line-through; }
.goods-unit { font-size: 22rpx; color: #6b7280; }
.footer-tip { padding: 12rpx 0 8rpx; text-align: center; font-size: 22rpx; color: #9ca3af; }
</style>
