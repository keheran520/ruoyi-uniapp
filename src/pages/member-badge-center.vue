<template>
  <view class="badge-page">
    <view class="page-header">
      <view class="status-space" :style="{ height: `${statusBarHeight}px` }" />
      <view class="page-header__row">
        <view class="page-header__back" @tap="goBack">
          <u-icon name="arrow-left" color="#1f2b38" size="20" />
        </view>
        <view class="page-header__main">
          <text class="page-header__title">徽章中心</text>
          <text class="page-header__desc">签到与成长达成后即可点亮对应徽章</text>
        </view>
      </view>
    </view>

    <scroll-view class="page-scroll" scroll-y>
      <view class="hero-wrap">
        <view class="hero-orb hero-orb--left" />
        <view class="hero-orb hero-orb--right" />
        <view class="hero-card">
          <text class="hero-card__tag">BADGE CENTER</text>
          <text class="hero-card__title">我的会员徽章</text>
          <text class="hero-card__desc">累计获得 {{ badgeList.length }} 枚徽章，继续签到与成长可解锁更多专属成就。</text>
        </view>
      </view>

      <view class="content-shell">
        <view v-if="badgeList.length" class="badge-grid">
          <view v-for="badge in badgeList" :key="badge.badgeId || badge.badgeCode" class="badge-card">
            <view class="badge-card__icon-wrap">
              <image v-if="badge.badgeIcon" class="badge-card__icon" :src="badge.badgeIcon" mode="aspectFill" />
              <view v-else class="badge-card__fallback">{{ getBadgeShortName(badge) }}</view>
            </view>
            <text class="badge-card__name">{{ badge.badgeName || badge.badgeCode || '会员徽章' }}</text>
            <text class="badge-card__desc">{{ getBadgeDesc(badge) }}</text>
          </view>
        </view>

        <view v-else class="empty-box">
          <u-icon name="gift" color="#8ea0bb" size="20" />
          <text>当前还没有获得徽章，先从签到和成长任务开始吧</text>
        </view>
      </view>

      <SafeArea position="bottom" background-color="#f5f8ff" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMemberDetail } from '@/api/mobile/member'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)
const memberDetail = ref<Record<string, any>>({})
const badgeList = computed(() => memberDetail.value.badgeList || [])

function getBadgeShortName(badge: Record<string, any>) {
  return String(badge.badgeName || badge.badgeCode || '徽章').slice(0, 2)
}

function getBadgeDesc(badge: Record<string, any>) {
  if (badge.badgeDesc) return badge.badgeDesc
  if (badge.conditionType === 'checkin_streak') return `连续签到 ${badge.conditionValue || 0} 天解锁`
  if (badge.conditionType === 'checkin_total') return `累计签到 ${badge.conditionValue || 0} 次解锁`
  return '会员成长成就徽章'
}

async function loadData() {
  try {
    const res = await getMemberDetail()
    memberDetail.value = res.data || {}
  } catch (error) {
    console.error('load badge center failed', error)
  }
}

function goBack() {
  uni.navigateBack()
}

onShow(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.badge-page {
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

.page-scroll {
  min-height: 100vh;
}

.hero-wrap {
  position: relative;
  padding: 0 26rpx;
  overflow: hidden;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(26rpx);
}

.hero-orb--left {
  width: 260rpx;
  height: 260rpx;
  left: -60rpx;
  top: 10rpx;
  background: radial-gradient(circle, rgba(255, 221, 156, 0.9) 0%, rgba(255, 221, 156, 0) 72%);
}

.hero-orb--right {
  width: 260rpx;
  height: 260rpx;
  right: -70rpx;
  top: 40rpx;
  background: radial-gradient(circle, rgba(190, 219, 255, 0.94) 0%, rgba(190, 219, 255, 0) 72%);
}

.hero-card {
  position: relative;
  z-index: 1;
  padding: 30rpx 24rpx;
  border-radius: 34rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(247, 251, 255, 0.98) 100%);
  box-shadow: 0 16rpx 34rpx rgba(182, 201, 234, 0.18);
}

.hero-card__tag {
  display: block;
  font-size: 20rpx;
  letter-spacing: 2rpx;
  color: #8ea0ba;
}

.hero-card__title {
  display: block;
  margin-top: 10rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: #1f2b38;
}

.hero-card__desc {
  display: block;
  margin-top: 10rpx;
  font-size: 23rpx;
  line-height: 1.6;
  color: #7f8fa5;
}

.content-shell {
  padding: 22rpx 26rpx 24rpx;
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.badge-card,
.empty-box {
  border-radius: 30rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 30rpx rgba(182, 201, 234, 0.16);
}

.badge-card {
  padding: 24rpx 20rpx;
}

.badge-card__icon-wrap {
  width: 92rpx;
  height: 92rpx;
  border-radius: 26rpx;
  background: linear-gradient(135deg, #eef4ff 0%, #f8fbff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-card__icon,
.badge-card__fallback {
  width: 92rpx;
  height: 92rpx;
  border-radius: 26rpx;
}

.badge-card__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7aa6ff 0%, #5d8fff 100%);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
}

.badge-card__name {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #1f2b38;
}

.badge-card__desc {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: #7f8fa5;
}

.empty-box {
  padding: 32rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 23rpx;
  color: #8ea0bb;
}
</style>
