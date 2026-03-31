<template>
  <view class="home-page">
    <scroll-view class="page-scroll" scroll-y>
      <view class="hero-section">
        <view class="status-space" :style="{ height: `${statusBarHeight}px` }"/>

        <view class="top-bar">
          <text class="top-bar__title">首页</text>
          <view class="search-bar" @tap="goSearch">
            <u-icon name="search" color="#9aa0aa" size="18"/>
            <text class="search-bar__placeholder">搜索关键词</text>
          </view>
        </view>

        <view class="hero-banner" @tap="goAllGoods">
          <image class="hero-banner__image" src="/static/images/banner/banner02.jpg" mode="aspectFill"/>
          <view class="hero-banner__mask"/>
          <view class="hero-banner__content">
            <text class="hero-banner__headline">{{ bannerTitle }}</text>
            <text class="hero-banner__subline">{{ bannerSubtitle }}</text>
            <view class="hero-banner__btn">参与集结</view>
          </view>
        </view>
      </view>

      <view class="content-shell">
        <view class="notice-card" @tap="goNoticeList">
          <u-icon name="volume" color="#7d99ff" size="16"/>
          <text class="notice-card__text">{{ noticeText }}</text>
          <text class="notice-card__text">叮，未成年人禁止下单，发现有打手私聊加各位用户老板。</text>
          <u-icon name="arrow-right" color="#b6bec9" size="14"/>
        </view>

        <scroll-view class="game-strip" scroll-x show-scrollbar="false">
          <view class="game-strip__inner">
            <view
                v-for="item in displayGames"
                :key="item.id"
                class="game-entry"
                @tap="goAllGoods"
            >
              <image
                v-if="item.picUrl"
                class="game-entry__image"
                :src="item.picUrl"
                mode="aspectFill"
              />
              <view v-else class="game-entry__icon" :style="{ background: item.bg }">
                <text>{{ item.short }}</text>
              </view>
              <text class="game-entry__name">{{ item.name }}</text>
            </view>
          </view>
        </scroll-view>

        <view class="section-head">
          <text class="section-head__title">服务专区</text>
        </view>

        <view class="home-card-panel">
          <view class="home-card-layout">
            <view class="home-card home-card--main" @tap="handleFeatureTap(primaryCard.action)">
              <image class="home-card__bg" src="/static/images/home-card/card-bg-main.png" mode="stretch"/>
              <view class="home-card__top">
                <text class="home-card__title">{{ primaryCard.title }}</text>
                <u-icon name="arrow-right" color="#1f2530" size="14"/>
              </view>
              <text class="home-card__sub">{{ primaryCard.sub }}</text>
              <image class="home-card__asset home-card__asset--heart" :src="primaryCard.asset" mode="widthFix"/>
              <view class="home-card__add">
                <image src="/static/images/home-card/card-add.png" mode="aspectFit"/>
              </view>
              <view class="home-card__footer">
                <text class="home-card__footer-text">23款游戏已更新</text>
                <view class="home-card__thumbs">
                  <image v-for="item in primaryCard.thumbs" :key="item" :src="item" mode="aspectFill"/>
                  <view class="home-card__view">
                    <image src="/static/images/home-card/card-view.png" mode="aspectFit"/>
                  </view>
                </view>

              </view>
            </view>

            <view class="home-card-column">
              <view
                  v-for="item in sideCards"
                  :key="item.id"
                  class="home-card home-card--side"
                  :class="item.className"
                  @tap="handleFeatureTap(item.action)"
              >
                <image class="home-card__bg" :src="item.bg" mode="stretch"/>
                <view class="home-card__top">
                  <text class="home-card__title">{{ item.title }}</text>
                  <u-icon name="arrow-right" color="#1f2530" size="14"/>
                </view>
                <text class="home-card__sub">{{ item.sub }}</text>
                <view class="home-card__user-row">
                  <view class="home-card__avatars">
                    <view v-for="avatar in item.users" :key="avatar" class="home-card__avatar">{{ avatar }}</view>
                  </view>
                  <text class="home-card__user-text">{{ item.userText }}</text>
                </view>
                <image class="home-card__asset home-card__asset--side" :src="item.asset" mode="aspectFit"/>
              </view>
            </view>
          </view>
        </view>

        <view class="section-head section-head--goods">
          <text class="section-head__title">推荐商品</text>
          <text class="section-head__more" @tap="goAllGoods">更多</text>
        </view>

        <view class="goods-list">
          <view
              v-for="item in displayGoods"
              :key="item.id"
              class="goods-card"
              @tap="goServiceDetail(item)"
          >
            <image class="goods-card__cover" :src="item.cover" mode="aspectFill"/>
            <view class="goods-card__body">
              <text class="goods-card__title">{{ item.title }}</text>
              <text class="goods-card__desc">{{ item.desc }}</text>
              <view class="goods-card__footer">
                <text class="goods-card__price">{{ item.price }}</text>
                <text class="goods-card__btn">查看</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {onLoad} from '@dcloudio/uni-app'
import {getMallCategoryList, getMallGoodsList, getMallHome, getMallNoticeList} from '@/api/mobile/mall'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)
const homeData = ref<Record<string, any>>({})
const remoteCategories = ref<any[]>([])
const remoteGoods = ref<any[]>([])
const noticeList = ref<any[]>([])

const fallbackGames = [
  {id: 1, name: '三角洲行动', short: '△', bg: 'linear-gradient(135deg, #173039 0%, #2fe59b 100%)'},
  {id: 2, name: '英雄联盟', short: 'L', bg: 'linear-gradient(135deg, #efd685 0%, #7194ff 100%)'},
  {id: 3, name: '王者荣耀', short: '王', bg: 'linear-gradient(135deg, #f5df8e 0%, #d4b356 100%)'},
  {id: 4, name: '和平精英', short: '和', bg: 'linear-gradient(135deg, #4e4b3b 0%, #cbad55 100%)'},
  {id: 5, name: '永劫无间', short: '永', bg: 'linear-gradient(135deg, #7b1b1b 0%, #d54d40 100%)'}
]

const primaryCard = {
  title: '收藏中心',
  sub: '45个收藏',
  action: 'goods',
  asset: '/static/images/home-card/card-favorite.png',
  thumbs: [
    '/static/images/banner/banner01.jpg',
    '/static/images/banner/banner02.jpg',
    '/static/images/banner/banner03.jpg'
  ]
}

const sideCards = [
  {
    id: 1,
    title: '休闲社区',
    sub: '游戏讨论社区',
    userText: '279个游戏社区',
    users: ['游', '社', '区'],
    asset: '/static/images/home-card/card-leisure.png',
    bg: '/static/images/home-card/card-bg-side.png',
    className: 'home-card--pink',
    action: 'messages'
  },
  {
    id: 2,
    title: '游戏中心',
    sub: '在线游戏中心',
    userText: '24.9w用户正在玩',
    users: ['热', '门', '玩'],
    asset: '/static/images/home-card/card-game.png',
    bg: '/static/images/home-card/card-bg-side-alt.png',
    className: 'home-card--blue',
    action: 'escort'
  }
]

const bannerTitle = computed(() => homeData.value.bannerTitle || '三角洲行动即将来袭')
const bannerSubtitle = computed(() => homeData.value.bannerSubtitle || '特战干员集结')

const noticeText = computed(() => {
  const latest = noticeList.value[0]
  return latest?.messageTitle || latest?.messageContent || '暂无通知公告'
})

const displayGames = computed(() => {
  if (!remoteCategories.value.length) return fallbackGames
  return remoteCategories.value.slice(0, 8).map((item, index) => ({
    id: item.id || index + 1,
    name: item.name || `分类${index + 1}`,
    short: String(item.name || '分').slice(0, 2),
    bg: fallbackGames[index % fallbackGames.length].bg,
    picUrl: item.picUrl || ''
  }))
})

const displayGoods = computed(() => {
  const source = (homeData.value.recommendGoods?.length ? homeData.value.recommendGoods : remoteGoods.value).slice(0, 4)
  return source.map((item: any, index: number) => ({
    id: item.id || index + 1,
    title: item.name || `推荐服务${index + 1}`,
    desc: item.subTitle || item.brief || '精品服务，支持快速下单和查看详情',
    price: formatMoney(item.price),
    cover: getCover(item)
  }))
})

function formatMoney(value?: number | string) {
  return `¥${((Number(value) || 0) / 100).toFixed(2)}`
}

function getCover(item: Record<string, any>) {
  return String(item?.galleryUrls || '').split(',').filter(Boolean)[0] || '/static/images/banner/banner01.jpg'
}

async function loadHomeData() {
  try {
    const [homeRes, categoryRes, goodsRes, noticeRes] = await Promise.all([
      getMallHome(),
      getMallCategoryList(),
      getMallGoodsList({pageNum: 1, pageSize: 6}),
      getMallNoticeList({pageNum: 1, pageSize: 5})
    ])
    homeData.value = homeRes.data || {}
    remoteCategories.value = categoryRes.data || []
    remoteGoods.value = goodsRes.rows || goodsRes.data || []
    noticeList.value = noticeRes.rows || noticeRes.data?.rows || []
  } catch (error) {
    console.error('加载首页商城数据失败', error)
  }
}

function goSearch() {
  uni.navigateTo({url: '/pages/search'})
}

function goAllGoods() {
  uni.switchTab({url: '/pages/all-goods'})
}

function goMessages() {
  uni.switchTab({url: '/pages/messages'})
}

function goNoticeList() {
  uni.navigateTo({url: `/pages/message-list?type=notice&title=${encodeURIComponent('通知公告')}`})
}

function goEscortList() {
  uni.navigateTo({url: '/pages/escort-list?type=all'})
}

function handleFeatureTap(action: string) {
  if (action === 'goods') return goAllGoods()
  if (action === 'messages') return goMessages()
  goEscortList()
}

function goServiceDetail(item: { id: number; title: string }) {
  uni.navigateTo({url: `/pages/escort-detail?id=${item.id}&title=${encodeURIComponent(item.title)}`})
}

onLoad(() => {
  loadHomeData()
})
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: #f5f8ff;
}

.page-scroll {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f8ff 281rpx, #f5f8ff 100%);
}

.hero-section {
  padding: 0 24rpx 28rpx;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding-top: 18rpx;
}

.top-bar__title {
  flex-shrink: 0;
  font-size: 42rpx;
  font-weight: 700;
  color: #1f2530;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14rpx;
  height: 74rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #ffffff;
}

.search-bar__placeholder {
  font-size: 26rpx;
  color: #a4aab4;
}

.hero-banner {
  position: relative;
  margin-top: 20rpx;
  height: 292rpx;
  border-radius: 24rpx;
  overflow: hidden;
}

.hero-banner__image, .hero-banner__mask {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-banner__mask {
  background: linear-gradient(90deg, rgba(15, 18, 24, .58) 0%, rgba(20, 24, 31, .14) 100%);
}

.hero-banner__content {
  position: absolute;
  right: 26rpx;
  top: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.hero-banner__headline {
  font-size: 24rpx;
  color: #dce8df;
}

.hero-banner__subline {
  margin-top: 8rpx;
  font-size: 52rpx;
  line-height: 1.05;
  font-weight: 800;
  color: #8ef489;
  text-align: right;
}

.hero-banner__btn {
  margin-top: 26rpx;
  min-width: 150rpx;
  height: 52rpx;
  padding: 0 22rpx;
  border-radius: 8rpx;
  background: linear-gradient(180deg, #8ced7a 0%, #56cf5c 100%);
  color: #173418;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-shell {
  padding: 0 24rpx 36rpx;
}

.notice-card {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-height: 76rpx;
  padding: 0 20rpx;
  border-radius: 18rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 22rpx rgba(210, 220, 241, .42);
}

.notice-card__text {
  flex: 1;
  font-size: 24rpx;
  line-height: 1.4;
  color: #6f7680;
}

.notice-card__text + .notice-card__text {
  display: none;
}

.game-strip {
  margin-top: 24rpx;
  white-space: nowrap;
}

.game-strip__inner {
  display: flex;
  gap: 24rpx;
  padding-right: 10rpx;
}

.game-entry {
  width: 108rpx;
  flex-shrink: 0;
}

.game-entry__icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 800;
}

.game-entry__image {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: block;
  background: #eef2f7;
}

.game-entry__name {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #49505b;
  line-height: 1.3;
  text-align: center;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30rpx;
}

.section-head__title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1f2530;
}

.section-head__more {
  font-size: 24rpx;
  color: #9aa3af;
}

.section-head--goods {
  margin-top: 34rpx;
}

.home-card-panel {
  margin-top: 20rpx;
}

.home-card-layout {
  display: flex;
  gap: 18rpx;
}

.home-card-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.home-card {
  position: relative;
  overflow: inherit;
  border-radius: 30rpx;
  background: transparent;
  box-shadow: none;
}

.home-card--main {
  width: 343rpx;
  min-height: 344rpx;
  padding: 24rpx 22rpx;
  box-sizing: border-box;
}

.home-card--side {
  min-height: 162rpx;
  padding: 20rpx 22rpx;
  box-sizing: border-box;
}

.home-card__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.home-card--pink {
  background: transparent;
}

.home-card--blue {
  background: transparent;
}

.home-card__top {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.home-card__top,
.home-card__sub,
.home-card__asset,
.home-card__add,
.home-card__view,
.home-card__footer,
.home-card__user-row {
  position: relative;
  z-index: 1;
}

.home-card__title {
  font-weight: 500;
  color: #2b2b2b;
  line-height: 1;
}

.home-card__sub {
  display: block;
  margin-top: 10rpx;
  font-size: 14px;
  color: #7b7b7b;
  line-height: 1.2;
}

.home-card__asset {
  position: absolute;
  pointer-events: none;
}

.home-card__asset--heart {
  top: 2rpx;
  right: 8rpx;
  width: 150rpx;
}

.home-card__asset--side {
  right: 8rpx;
  top: -16rpx;
  width: 116rpx;
  height: 116rpx;
}

.home-card__add{
  position: absolute;
  left: 26rpx;
  top: 112rpx;
  width: 54rpx;
  height: 54rpx;
  border-radius: 8rpx;
  background: #f8ebf1;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-card__add image {
  width: 28rpx;
  height: 28rpx;
}

.home-card__footer {
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  bottom: 18rpx;
}

.home-card__footer-text {
  display: block;
  font-size: 12px;
  color: #9aa1ad;
}

.home-card__thumbs {
  display: flex;
  gap: 8rpx;
  margin-top: 12rpx;
}

.home-card__thumbs image {
  width: 58rpx;
  height: 58rpx;
  border-radius: 6rpx;
}

.home-card__view image {
  width: 28rpx;
  height: 28rpx;
}

.home-card__view {
  width: 58rpx;
  height: 58rpx;
  border-radius: 6rpx;
  background: #f8ebf1;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-card__user-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 10rpx;
}

.home-card__avatars {
  display: flex;
}

.home-card__avatar {
  width: 34rpx;
  height: 34rpx;
  margin-right: -8rpx;
  border: 2rpx solid #ffffff;
  border-radius: 50%;
  background: linear-gradient(135deg, #9f7cff 0%, #4f87ff 100%);
  color: #ffffff;
  font-size: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-card__user-text {
  font-size: 12px;
  color: #a5acb6;
}

.goods-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 18rpx;
}

.goods-card {
  overflow: hidden;
  border-radius: 22rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 22rpx rgba(210, 220, 241, .44);
}

.goods-card__cover {
  width: 100%;
  height: 224rpx;
  display: block;
}

.goods-card__body {
  padding: 18rpx 18rpx 20rpx;
}

.goods-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #252a33;
}

.goods-card__desc {
  display: block;
  margin-top: 8rpx;
  min-height: 64rpx;
  font-size: 22rpx;
  line-height: 1.45;
  color: #878f9c;
}

.goods-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14rpx;
}

.goods-card__price {
  font-size: 32rpx;
  font-weight: 700;
  color: #5d8fff;
}

.goods-card__btn {
  min-width: 74rpx;
  height: 40rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: #eef4ff;
  color: #5d8fff;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
