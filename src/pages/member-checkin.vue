<template>
  <view class="checkin-page">
    <view class="page-header">
      <view class="status-space" :style="{ height: `${statusBarHeight}px` }" />
      <view class="page-header__row">
        <view class="page-header__back" @tap="goBack">
          <u-icon name="arrow-left" color="#1f2b38" size="20" />
        </view>
        <view class="page-header__main">
          <text class="page-header__title">签到</text>
          <text class="page-header__desc">连续签到可获得积分与成长值奖励</text>
        </view>
      </view>
    </view>

    <scroll-view class="page-scroll" scroll-y>
      <view class="hero-wrap">
        <view class="hero-orb hero-orb--left" />
        <view class="hero-orb hero-orb--right" />
        <view class="hero-card">
          <text class="hero-card__tag">{{ member.levelName || '会员签到' }}</text>
          <text class="hero-card__title">今天也来签到吧</text>
          <text class="hero-card__desc">坚持每日签到，可以领取积分、成长值奖励，并逐步解锁专属徽章。</text>

          <view class="reward-grid">
            <view class="reward-item">
              <text class="reward-item__value">{{ summary.continuousDays ?? 0 }}</text>
              <text class="reward-item__label">连续签到</text>
            </view>
            <view class="reward-item reward-item--soft">
              <text class="reward-item__value">{{ summary.totalCheckinDays ?? 0 }}</text>
              <text class="reward-item__label">累计签到</text>
            </view>
            <view class="reward-item reward-item--mint">
              <text class="reward-item__value">+{{ summary.rewardPoints ?? 0 }}</text>
              <text class="reward-item__label">今日积分</text>
            </view>
            <view class="reward-item reward-item--gold">
              <text class="reward-item__value">+{{ summary.rewardGrowth ?? 0 }}</text>
              <text class="reward-item__label">今日成长</text>
            </view>
          </view>

          <view class="hero-card__action" :class="{ 'hero-card__action--done': summary.signedToday }" @tap="handleCheckin">
            {{ summary.signedToday ? '今日已签到' : '立即签到' }}
          </view>
        </view>
      </view>

      <view class="content-shell">
        <view class="panel">
          <view class="panel__head">
            <text class="panel__title">签到日历</text>
            <text class="panel__desc">最近 7 天签到状态</text>
          </view>
          <view class="calendar-grid">
            <view
              v-for="day in calendarDays"
              :key="day.date"
              class="calendar-item"
              :class="{ 'calendar-item--checked': day.checked, 'calendar-item--today': day.today }"
            >
              <text class="calendar-item__day">{{ day.label }}</text>
              <text class="calendar-item__mark">{{ day.checked ? '已签' : day.today ? '今天' : '未签' }}</text>
            </view>
          </view>
        </view>

        <view class="panel panel--soft">
          <view class="panel__head">
            <text class="panel__title">成长进度</text>
            <text class="panel__desc">{{ member.levelName || '普通会员' }}</text>
          </view>
          <view class="growth-card">
            <view class="growth-card__row">
              <text>当前成长值</text>
              <text>{{ member.growthValue ?? 0 }}</text>
            </view>
            <view class="growth-bar">
              <view class="growth-bar__track" />
              <view class="growth-bar__fill" :style="{ width: `${progressPercent}%` }" />
              <view class="growth-bar__dot" :style="{ left: `${progressPercent}%` }" />
            </view>
            <text class="growth-card__desc">{{ nextLevelText }}</text>
          </view>
        </view>

        <view class="panel">
          <view class="panel__head">
            <text class="panel__title">已解锁徽章</text>
            <text class="panel__desc">{{ unlockedBadgeList.length }} 枚</text>
          </view>
          <view v-if="unlockedBadgeList.length" class="badge-flow">
            <view v-for="badge in unlockedBadgeList" :key="badge" class="badge-chip">{{ badge }}</view>
          </view>
          <view v-else class="empty-box">
            <u-icon name="gift" color="#8ea0bb" size="18" />
            <text>继续签到，你的第一枚徽章很快就会点亮</text>
          </view>
        </view>
      </view>

      <SafeArea position="bottom" background-color="#f5f8ff" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { checkin, getCheckinSummary, getLevelList, getMemberInfo } from '@/api/mobile/member'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)
const member = ref<Record<string, any>>({})
const summary = ref<Record<string, any>>({})
const levels = ref<any[]>([])

const unlockedBadgeList = computed<string[]>(() => summary.value.unlockedBadgeNames || [])
const sortedLevels = computed(() => levels.value.slice().sort((a, b) => Number(a.requiredGrowth || 0) - Number(b.requiredGrowth || 0)))
const currentLevel = computed(() => sortedLevels.value.find((item) => String(item.id) === String(member.value.levelId)))
const nextLevel = computed(() => {
  const growthValue = Number(member.value.growthValue || 0)
  return sortedLevels.value.find((item) => Number(item.requiredGrowth || 0) > growthValue)
})

const progressPercent = computed(() => {
  const growthValue = Number(member.value.growthValue || 0)
  const currentRequired = Number(currentLevel.value?.requiredGrowth || 0)
  const nextRequired = Number(nextLevel.value?.requiredGrowth || 0)
  if (!nextLevel.value || nextRequired <= currentRequired) return 100
  const ratio = ((growthValue - currentRequired) / (nextRequired - currentRequired)) * 100
  return Math.max(8, Math.min(100, Number(ratio.toFixed(1))))
})

const nextLevelText = computed(() => {
  if (!nextLevel.value) return '当前已达到最高等级，继续保持每日活跃'
  const gap = Math.max(0, Number(nextLevel.value.requiredGrowth || 0) - Number(member.value.growthValue || 0))
  return `距离 ${nextLevel.value.levelName} 还差 ${gap} 成长值`
})

const calendarDays = computed(() => {
  const checkedSet = new Set(summary.value.checkedDates || [])
  const days: Array<{ date: string; label: string; checked: boolean; today: boolean }> = []
  const today = new Date()
  for (let index = 6; index >= 0; index -= 1) {
    const temp = new Date(today)
    temp.setDate(today.getDate() - index)
    const date = `${temp.getFullYear()}-${`${temp.getMonth() + 1}`.padStart(2, '0')}-${`${temp.getDate()}`.padStart(2, '0')}`
    days.push({
      date,
      label: `${temp.getMonth() + 1}/${temp.getDate()}`,
      checked: checkedSet.has(date),
      today: index === 0
    })
  }
  return days
})

async function loadData() {
  try {
    const [memberRes, summaryRes, levelRes] = await Promise.all([getMemberInfo(), getCheckinSummary(), getLevelList()])
    member.value = memberRes.data || {}
    summary.value = summaryRes.data || {}
    levels.value = levelRes.data || []
  } catch (error) {
    console.error('load checkin page failed', error)
  }
}

async function handleCheckin() {
  if (summary.value.signedToday) return
  try {
    await checkin()
    uni.showToast({ title: '签到成功', icon: 'success' })
    await loadData()
  } catch (error) {
    console.error('checkin failed', error)
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
.checkin-page {
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
  background: radial-gradient(circle, rgba(255, 228, 174, 0.92) 0%, rgba(255, 228, 174, 0) 72%);
}

.hero-orb--right {
  width: 260rpx;
  height: 260rpx;
  right: -70rpx;
  top: 40rpx;
  background: radial-gradient(circle, rgba(184, 216, 255, 0.94) 0%, rgba(184, 216, 255, 0) 72%);
}

.hero-card {
  position: relative;
  z-index: 1;
  padding: 30rpx 24rpx 24rpx;
  border-radius: 34rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(247, 251, 255, 0.98) 100%);
  box-shadow: 0 16rpx 34rpx rgba(182, 201, 234, 0.18);
}

.hero-card__tag {
  display: inline-flex;
  align-items: center;
  height: 38rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: #eef5ff;
  color: #5d8fff;
  font-size: 20rpx;
}

.hero-card__title {
  display: block;
  margin-top: 14rpx;
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

.reward-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 24rpx;
}

.reward-item {
  padding: 20rpx 16rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #eef4ff 0%, #f8fbff 100%);
}

.reward-item--soft {
  background: linear-gradient(135deg, #fff0eb 0%, #fff8f5 100%);
}

.reward-item--mint {
  background: linear-gradient(135deg, #e7fff6 0%, #f6fffb 100%);
}

.reward-item--gold {
  background: linear-gradient(135deg, #fff2d8 0%, #fffaf0 100%);
}

.reward-item__value {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2b38;
}

.reward-item__label {
  display: block;
  margin-top: 8rpx;
  font-size: 21rpx;
  color: #8090a7;
}

.hero-card__action {
  margin-top: 24rpx;
  height: 76rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #7aa6ff 0%, #5d8fff 100%);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-card__action--done {
  background: #dbe7ff;
  color: #5d7cb8;
}

.content-shell {
  padding: 22rpx 26rpx 24rpx;
}

.panel {
  margin-top: 18rpx;
  padding: 24rpx 22rpx;
  border-radius: 30rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 30rpx rgba(182, 201, 234, 0.16);
}

.panel--soft {
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.panel__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 14rpx;
  margin-bottom: 18rpx;
}

.panel__title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2b38;
}

.panel__desc {
  font-size: 22rpx;
  color: #8fa0b8;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14rpx;
}

.calendar-item {
  padding: 18rpx 10rpx;
  border-radius: 22rpx;
  background: #f7faff;
  text-align: center;
}

.calendar-item--checked {
  background: linear-gradient(135deg, #fff0ce 0%, #ffe0a2 100%);
}

.calendar-item--today {
  box-shadow: inset 0 0 0 2rpx #7aa6ff;
}

.calendar-item__day {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #1f2b38;
}

.calendar-item__mark {
  display: block;
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #8596ae;
}

.growth-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18rpx;
  font-size: 24rpx;
  color: #6d7d93;
}

.growth-bar {
  position: relative;
  height: 22rpx;
}

.growth-bar__track {
  position: absolute;
  inset: 0;
  border-radius: 999rpx;
  background: #e3ecfb;
}

.growth-bar__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 22rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #7aa6ff 0%, #5d8fff 100%);
  box-shadow: 0 8rpx 16rpx rgba(93, 143, 255, 0.2);
}

.growth-bar__dot {
  position: absolute;
  top: 50%;
  width: 26rpx;
  height: 26rpx;
  margin-left: -13rpx;
  border-radius: 50%;
  background: #ffffff;
  border: 4rpx solid #5d8fff;
  transform: translateY(-50%);
  box-shadow: 0 8rpx 18rpx rgba(93, 143, 255, 0.22);
}

.growth-card__desc {
  display: block;
  margin-top: 16rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: #7f8fa5;
}

.badge-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.badge-chip {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #eef4ff 0%, #f7fbff 100%);
  font-size: 22rpx;
  color: #587db8;
}

.empty-box {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 22rpx;
  color: #8ea0bb;
}
</style>
