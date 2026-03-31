<template>
  <view class="list-page">
    <u-navbar :fixed="true" :placeholder="true" :safe-area-inset-top="true" bg-color="transparent" left-icon="arrow-left" left-icon-color="#1a241f" title="护航大厅" title-style="color: #1a241f; font-weight: 700;" @leftClick="goBack" />
    <scroll-view class="page-scroll" scroll-y>
      <view class="page-shell">
        <view class="headline-card">
          <text class="headline-card__title">{{ pageTitle }}</text>
          <text class="headline-card__desc">按游戏、模式、段位和服务节奏快速找到适合你的车队与大神。</text>
        </view>
        <view class="filter-row">
          <view v-for="item in filters" :key="item.key" class="filter-pill" :class="{ 'filter-pill--active': activeFilter === item.key }" @tap="activeFilter = item.key">
            {{ item.label }}
          </view>
        </view>
        <view class="list-stack">
          <view v-for="item in filteredList" :key="item.id" class="hall-card" @tap="goDetail(item)">
            <view class="hall-card__cover" :style="{ background: item.cover }">
              <text class="hall-card__game">{{ item.game }}</text>
              <text class="hall-card__badge">{{ item.badge }}</text>
            </view>
            <view class="hall-card__body">
              <text class="hall-card__title">{{ item.title }}</text>
              <text class="hall-card__desc">{{ item.desc }}</text>
              <view class="hall-card__tags">
                <text v-for="tag in item.tags" :key="tag" class="hall-card__tag">{{ tag }}</text>
              </view>
              <view class="hall-card__footer">
                <view class="hall-card__price-wrap">
                  <text class="hall-card__price">¥{{ item.price }}</text>
                  <text class="hall-card__unit">{{ item.unit }}</text>
                </view>
                <text class="hall-card__cta">查看详情</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <SafeArea position="bottom" background-color="#eff2f0" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const currentType = ref('all')
const activeFilter = ref('all')
const filters = [{ key: 'all', label: '全部' }, { key: 'duo', label: '双排 / 多排' }, { key: 'voice', label: '语音陪练' }, { key: 'boost', label: '目标段位' }]
const hallList = [
  { id: 201, type: 'escort', filter: 'duo', game: '和平精英', badge: '四排护航', title: '王牌到战神稳分车队', desc: '适合想稳定冲榜的用户，可指定刚枪 / 运营 / 指挥风格。', price: '128', unit: '/局起', tags: ['战绩可查', '夜间档', '可语音'], cover: 'linear-gradient(135deg, #25352b 0%, #58755b 100%)' },
  { id: 202, type: 'escort', filter: 'voice', game: '无畏契约', badge: '定位赛护航', title: '枪线意识陪练包', desc: '边打边讲，适合新手提分和找回排位节奏。', price: '88', unit: '/小时', tags: ['定位赛', '复盘建议', '教学向'], cover: 'linear-gradient(135deg, #252730 0%, #545d6c 100%)' },
  { id: 203, type: 'boost', filter: 'boost', game: 'LOL手游', badge: '代练冲分', title: '翡翠到宗师目标单', desc: '支持加急、可查看服务进度，适合短期冲段。', price: '199', unit: '/单', tags: ['目标段位', '加急档', '全程可追踪'], cover: 'linear-gradient(135deg, #4e4123 0%, #8f7644 100%)' },
  { id: 204, type: 'all', filter: 'duo', game: 'CFM', badge: '爆破排位', title: '爆破车队上分服务', desc: '适合想稳定升段的爆破玩家，支持固定档期。', price: '76', unit: '/小时', tags: ['固定车队', '爆破排位', '连胜节奏'], cover: 'linear-gradient(135deg, #233038 0%, #4c6670 100%)' }
]

const pageTitle = computed(() => {
  if (currentType.value === 'boost') return '上分代练'
  if (currentType.value === 'escort') return '护航服务'
  if (currentType.value === 'hot') return '热门服务'
  return '全部服务'
})

const filteredList = computed(() =>
  hallList.filter((item) => {
    const matchType = currentType.value === 'all' || currentType.value === 'hot' || item.type === currentType.value || item.type === 'all'
    const matchFilter = activeFilter.value === 'all' || item.filter === activeFilter.value
    return matchType && matchFilter
  })
)

onLoad((options) => {
  currentType.value = String(options?.type || 'all')
})

function goBack() {
  uni.navigateBack()
}

function goDetail(item: Record<string, any>) {
  uni.navigateTo({ url: `/pages/escort-detail?id=${item.id}&title=${encodeURIComponent(item.title)}` })
}
</script>

<style lang="scss" scoped>
.list-page { min-height: 100vh; background: #eff2f0; }
.page-scroll { min-height: 100vh; }
.page-shell { padding: 16rpx 24rpx 32rpx; }
.headline-card { padding: 28rpx; border-radius: 30rpx; background: linear-gradient(135deg, #1b2621 0%, #304039 100%); }
.headline-card__title { display: block; font-size: 40rpx; font-weight: 800; color: #ffffff; }
.headline-card__desc { display: block; margin-top: 12rpx; font-size: 23rpx; line-height: 1.6; color: rgba(236, 244, 239, 0.72); }
.filter-row { display: flex; gap: 12rpx; overflow-x: auto; margin-top: 20rpx; padding-bottom: 6rpx; }
.filter-pill { flex-shrink: 0; padding: 14rpx 22rpx; border-radius: 999rpx; background: #f8faf8; color: #73817b; font-size: 22rpx; }
.filter-pill--active { background: #ff6c4f; color: #ffffff; font-weight: 700; }
.list-stack { display: flex; flex-direction: column; gap: 18rpx; margin-top: 18rpx; }
.hall-card { overflow: hidden; border-radius: 30rpx; background: #ffffff; box-shadow: 0 18rpx 40rpx rgba(39, 48, 42, 0.08); }
.hall-card__cover { min-height: 140rpx; padding: 22rpx; display: flex; justify-content: space-between; align-items: flex-start; }
.hall-card__game, .hall-card__badge { color: #ffffff; }
.hall-card__game { font-size: 30rpx; font-weight: 800; }
.hall-card__badge { padding: 8rpx 14rpx; border-radius: 999rpx; background: rgba(255, 255, 255, 0.14); font-size: 20rpx; }
.hall-card__body { padding: 22rpx; }
.hall-card__title { display: block; font-size: 30rpx; font-weight: 800; color: #1b2621; }
.hall-card__desc { display: block; margin-top: 10rpx; font-size: 22rpx; line-height: 1.6; color: #73807a; }
.hall-card__tags { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 16rpx; }
.hall-card__tag { padding: 8rpx 14rpx; border-radius: 999rpx; background: #f5f7f6; color: #687670; font-size: 20rpx; }
.hall-card__footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 18rpx; }
.hall-card__price { font-size: 40rpx; font-weight: 800; color: #ff643b; }
.hall-card__unit { margin-left: 6rpx; font-size: 20rpx; color: #89948f; }
.hall-card__cta { padding: 12rpx 22rpx; border-radius: 999rpx; background: #18211d; color: #eef6f0; font-size: 22rpx; }
</style>
