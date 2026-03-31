<template>
  <view class="member-page">
    <u-navbar
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      bg-color="#ffffff"
      left-icon="arrow-left"
      left-icon-color="#1f2b38"
      title=""
      @leftClick="goBack"
    >
      <template #right>
        <view class="header-action" @tap="goRulePage">
          <u-icon name="coupon" color="#1f2b38" size="20" />
        </view>
      </template>
    </u-navbar>

    <scroll-view class="page-scroll" scroll-y>
      <view class="profile-head">
        <image class="profile-head__avatar" :src="avatarUrl" mode="aspectFill" />
        <view class="profile-head__main">
          <text class="profile-head__name">{{ displayName }}</text>
          <text class="profile-head__sub">{{ memberLabel }}</text>
        </view>
        <view class="profile-head__stats">
          <view class="mini-stat">
            <text class="mini-stat__value">{{ memberDetail.levelCode || 'V1' }}</text>
            <text class="mini-stat__label">{{ memberText.currentLevel }}</text>
          </view>
          <view class="mini-stat">
            <text class="mini-stat__value">{{ memberDetail.points ?? 0 }}</text>
            <text class="mini-stat__label">{{ memberText.points }}</text>
          </view>
          <view class="mini-stat">
            <text class="mini-stat__value">{{ summary.continuousDays ?? 0 }}</text>
            <text class="mini-stat__label">{{ memberText.continuousCheckin }}</text>
          </view>
        </view>
      </view>

      <view class="vip-swiper-wrap">
        <swiper
          class="vip-swiper"
          :current="swiperCurrent"
          :circular="displayLevels.length > 1"
          previous-margin="22rpx"
          next-margin="22rpx"
          @change="onSwiperChange"
        >
          <swiper-item v-for="(level, index) in displayLevels" :key="level.id || level.levelCode || index">
            <view class="vip-level-card" :class="{ 'vip-level-card--active': swiperCurrent === index }">
              <image class="vip-level-card__bg" :src="getLevelBackground(level, index)" mode="aspectFill" />
              <view class="vip-level-card__mask" />
              <view class="vip-level-card__inner">
                <view class="vip-level-card__left">
                  <text class="vip-level-card__tag">{{ isCurrentLevel(level) ? memberText.currentTag : memberText.pendingTag }}</text>
                  <text class="vip-level-card__code">{{ level.levelCode || `V${index + 1}` }}</text>
                  <text class="vip-level-card__title">{{ memberText.growthNeed }}{{ level.requiredGrowth ?? 0 }}</text>
                  <text class="vip-level-card__desc">{{ getLevelDescription(level) }}</text>
                  <view class="vip-level-card__progress">
                    <view class="vip-level-card__progress-track" />
                    <view class="vip-level-card__progress-fill" :style="{ width: `${getLevelProgress(level)}%` }" />
                    <view class="vip-level-card__progress-dot" :style="{ left: `${getLevelProgress(level)}%` }" />
                  </view>
                  <view class="vip-level-card__step">
                    <text>{{ level.levelCode || `V${index + 1}` }}</text>
                    <text>{{ getNextCode(level, index) }}</text>
                  </view>
                </view>

                <view class="vip-level-card__right">
                  <image class="vip-level-card__medal" :src="getLevelMedal(level, index)" mode="aspectFit" />
                  <view class="vip-level-card__button">{{ isCurrentLevel(level) ? memberText.currentButton : memberText.upgradeButton }}</view>
                </view>
              </view>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <view class="section-head section-head--rights">
        <view>
          <text class="section-head__title">{{ memberText.myRights }}</text>
          <text class="section-head__count">({{ rightsList.length }})</text>
        </view>
        <text class="section-head__link" @tap="goRulePage">{{ memberText.rules }}</text>
      </view>

      <view class="rights-list">
        <view v-for="item in rightsList" :key="item.key" class="right-card">
          <view class="right-card__copy">
            <text class="right-card__title">{{ item.title }}</text>
            <text class="right-card__desc">{{ item.desc }}</text>
          </view>
          <view class="right-card__icon">
            <u-icon :name="item.icon" color="#567fbe" size="26" />
          </view>
        </view>
      </view>

      <SafeArea position="bottom" background-color="#ffffff" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import store from '@/store'
import { getCheckinSummary, getLevelList, getMemberDetail } from '@/api/mobile/member'

const memberText = {
  currentLevel: '\u5f53\u524d\u7b49\u7ea7',
  points: '\u79ef\u5206',
  continuousCheckin: '\u8fde\u7b7e',
  currentTag: '\u5f53\u524d\u7b49\u7ea7',
  pendingTag: '\u672a\u8fbe\u6210',
  growthNeed: '\u6210\u957f\u503c\u9700\u8fbe\u5230',
  currentButton: '\u5f53\u524d\u7b49\u7ea7',
  upgradeButton: '\u52a0\u901f\u5347\u7ea7',
  myRights: '\u6211\u7684\u6743\u76ca',
  rules: '\u6743\u76ca\u8bf4\u660e',
  memberUser: '\u4f1a\u5458\u7528\u6237',
  memberExpert: '\u5408\u521b\u8fbe\u4eba',
  allUnlocked: '\u5df2\u89e3\u9501\u5f53\u524d\u7b49\u7ea7\u5168\u90e8\u6743\u76ca',
  nextLevelPrefix: '\u8fd8\u5dee ',
  nextLevelSuffix: ' \u6210\u957f\u503c\u53ef\u5347\u7ea7\u4e0b\u4e00\u7b49\u7ea7',
  lockSuffix: ' \u6210\u957f\u503c\u89e3\u9501',
  rightsToast: '\u6743\u76ca\u8bf4\u660e\u6574\u7406\u4e2d'
}

const memberDetail = ref<Record<string, any>>({})
const summary = ref<Record<string, any>>({})
const levels = ref<any[]>([])
const swiperCurrent = ref(0)

const userProfile = computed<Record<string, any>>(() => store.state.user.userProfile || {})
const avatarUrl = computed(() => userProfile.value.avatar || '/static/images/profile.jpg')
const displayName = computed(() => userProfile.value.nickName || userProfile.value.userName || memberText.memberUser)
const memberLabel = computed(() => `${memberDetail.value.levelCode || 'Lv.1'} ${normalizeLevelName(memberDetail.value.levelName) || memberText.memberExpert}`)

const displayLevels = computed(() =>
  levels.value.slice().sort((a, b) => Number(a.requiredGrowth || 0) - Number(b.requiredGrowth || 0))
)

const currentLevel = computed(() => {
  const levelId = String(memberDetail.value.levelId || '')
  return displayLevels.value.find((item) => String(item.id) === levelId) || displayLevels.value[0] || {}
})

const nextLevel = computed(() => {
  const currentGrowthValue = Number(memberDetail.value.growthValue || 0)
  return displayLevels.value.find((item) => Number(item.requiredGrowth || 0) > currentGrowthValue)
})

const rightsList = computed(() => [
  {
    key: 'parking',
    title: '\u514d\u8d39\u505c\u8f66 3 \u5c0f\u65f6',
    desc: '3\u6b21/\u6708\uff0c\u6bcf\u6b21\u53ef\u5728\u5408\u4f5c\u573a\u9986\u4eab\u53d7\u514d\u8d39\u505c\u8f66 3 \u5c0f\u65f6',
    icon: 'car'
  },
  {
    key: 'birthday',
    title: '\u751f\u65e5\u60ca\u559c',
    desc: '\u751f\u65e5\u5f53\u5929\u53ef\u9886\u53d6\u4e13\u5c5e\u4f1a\u5458\u60ca\u559c\u793c\u5305\u548c\u8282\u65e5\u95ee\u5019',
    icon: 'coupon'
  },
  {
    key: 'try',
    title: '\u4f18\u5148\u8bd5\u73a9\u6743\u76ca',
    desc: '\u65b0\u670d\u52a1\u4e0a\u65b0\u65f6\uff0c\u53ef\u4f18\u5148\u4f53\u9a8c\u9650\u5b9a\u73a9\u6cd5\u548c\u9996\u53d1\u5185\u5bb9',
    icon: 'gift'
  },
  {
    key: 'points',
    title: '\u79ef\u5206\u6743\u76ca',
    desc: '\u5546\u57ce\u6d88\u8d39\u6ee1\u6307\u5b9a\u91d1\u989d\u65f6\uff0c\u53ef\u989d\u5916\u8fd4\u8fd8\u4f1a\u5458\u79ef\u5206',
    icon: 'integral-fill'
  },
  {
    key: 'service',
    title: '\u4e13\u5c5e\u5ba2\u670d\u901a\u9053',
    desc: '\u4f1a\u5458\u53ef\u4eab\u53d7\u66f4\u5feb\u54cd\u5e94\u7684\u4e13\u5c5e\u670d\u52a1\u548c\u8ba2\u5355\u8ddf\u8fdb',
    icon: 'kefu-ermai'
  },
  {
    key: 'discount',
    title: '\u4f1a\u5458\u6298\u6263',
    desc: '\u90e8\u5206\u5546\u54c1\u4e0e\u966a\u73a9\u670d\u52a1\u53ef\u4eab\u4f1a\u5458\u7b49\u7ea7\u4e13\u5c5e\u6298\u6263',
    icon: 'tags'
  },
  {
    key: 'medal',
    title: '\u8eab\u4efd\u5fbd\u7ae0\u5c55\u793a',
    desc: '\u5728\u4e2a\u4eba\u4e3b\u9875\u3001\u4e92\u52a8\u5e7f\u573a\u5c55\u793a\u4e13\u5c5e\u4f1a\u5458\u7b49\u7ea7\u5fbd\u7ae0',
    icon: 'star'
  }
])

function normalizeLevelName(value?: string) {
  return String(value || '')
    .replace(/^V\d+\s*/i, '')
    .replace(/^SVIP\d+\s*/i, '')
    .trim()
}

function isCurrentLevel(level: Record<string, any>) {
  return String(level.id) === String(memberDetail.value.levelId)
}

function getLevelGap(level: Record<string, any>) {
  return Math.max(0, Number(level.requiredGrowth || 0) - Number(memberDetail.value.growthValue || 0))
}

function getLevelDescription(level: Record<string, any>) {
  if (isCurrentLevel(level)) {
    if (!nextLevel.value) return memberText.allUnlocked
    const gap = Math.max(0, Number(nextLevel.value.requiredGrowth || 0) - Number(memberDetail.value.growthValue || 0))
    return `${memberText.nextLevelPrefix}${gap}${memberText.nextLevelSuffix}`
  }
  return `${memberText.nextLevelPrefix}${getLevelGap(level)}${memberText.lockSuffix}`
}

function getLevelProgress(level: Record<string, any>) {
  if (isCurrentLevel(level)) {
    const currentRequired = Number(currentLevel.value?.requiredGrowth || 0)
    const nextRequired = Number(nextLevel.value?.requiredGrowth || currentRequired || 1)
    if (!nextLevel.value || nextRequired <= currentRequired) return 100
    const ratio = ((Number(memberDetail.value.growthValue || 0) - currentRequired) / (nextRequired - currentRequired)) * 100
    return Math.max(8, Math.min(100, Number(ratio.toFixed(2))))
  }
  if (Number(memberDetail.value.growthValue || 0) >= Number(level.requiredGrowth || 0)) return 100
  const ratio = (Number(memberDetail.value.growthValue || 0) / Math.max(Number(level.requiredGrowth || 1), 1)) * 100
  return Math.max(6, Math.min(88, Number(ratio.toFixed(2))))
}

function getLevelBackground(level: Record<string, any>, index: number) {
  const code = String(level.levelCode || `V${index + 1}`).toUpperCase()
  const map: Record<string, string> = {
    V1: '/static/images/vip/v1-bg.png',
    V2: '/static/images/vip/v2-bg.png',
    V3: '/static/images/vip/v3-bg.png',
    V4: '/static/images/vip/v4-bg.png',
    V5: '/static/images/vip/v5-bg.png',
    V6: '/static/images/vip/v6-bg.png',
    V7: '/static/images/vip/v7-bg.png',
    SVIP7: '/static/images/vip/v7-bg.png'
  }
  return map[code] || '/static/images/vip/v1-bg.png'
}

function getLevelMedal(level: Record<string, any>, index: number) {
  const code = String(level.levelCode || `V${index + 1}`).toUpperCase()
  const map: Record<string, string> = {
    V1: '/static/images/vip/v1-hz.png',
    V2: '/static/images/vip/v2-hz.png',
    V3: '/static/images/vip/v3-hz.png',
    V4: '/static/images/vip/v4-hz.png',
    V5: '/static/images/vip/v5-hz.png',
    V6: '/static/images/vip/v6-hz.png',
    V7: '/static/images/vip/v7-hz.png',
    SVIP7: '/static/images/vip/v7-hz.png'
  }
  return map[code] || '/static/images/vip/v1-hz.png'
}

function getNextCode(level: Record<string, any>, index: number) {
  const next = displayLevels.value[index + 1]
  return next?.levelCode || level.levelCode || `V${index + 1}`
}

async function loadData() {
  try {
    await store.dispatch('GetUserProfile')
    const [detailRes, summaryRes, levelRes] = await Promise.all([getMemberDetail(), getCheckinSummary(), getLevelList()])
    memberDetail.value = detailRes.data || {}
    summary.value = summaryRes.data || {}
    levels.value = levelRes.data || []

    const currentIndex = displayLevels.value.findIndex((item) => String(item.id) === String(memberDetail.value.levelId))
    swiperCurrent.value = currentIndex >= 0 ? currentIndex : 0
  } catch (error) {
    console.error('load member center failed', error)
  }
}

function onSwiperChange(event: Record<string, any>) {
  swiperCurrent.value = Number(event?.detail?.current || 0)
}

function goBack() {
  uni.navigateBack()
}

function goRulePage() {
  uni.showToast({
    title: memberText.rightsToast,
    icon: 'none'
  })
}

onShow(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.member-page {
  min-height: 100vh;
  background: #ffffff;
}

.page-scroll {
  min-height: 100vh;
  padding-bottom: 30rpx;
}

:deep(.u-navbar__content__right) {
  padding-right: 24rpx;
}

.header-action {
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  background: #f6f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-head {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx 0;
}

.profile-head__avatar {
  width: 92rpx;
  height: 92rpx;
  border-radius: 20rpx;
  background: #f0f2f7;
  flex-shrink: 0;
}

.profile-head__main {
  flex: 1;
  min-width: 0;
  margin-left: 18rpx;
}

.profile-head__name {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #222222;
}

.profile-head__sub {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #7a8492;
}

.profile-head__stats {
  display: flex;
  gap: 20rpx;
}

.mini-stat {
  text-align: center;
}

.mini-stat__value {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: #242b35;
}

.mini-stat__label {
  display: block;
  margin-top: 6rpx;
  font-size: 20rpx;
  color: #818a98;
}

.vip-swiper-wrap {
  margin-top: 58rpx;
}

.vip-swiper {
  height: 370rpx;
}

.vip-level-card {
  position: relative;
  height: 340rpx;
  margin: 0 6rpx;
  border-radius: 28rpx;
  overflow: hidden;
  transform: scale(0.92);
  transform-origin: center center;
  transition: transform 220ms ease, box-shadow 220ms ease, opacity 220ms ease;
  opacity: 0.8;
}

.vip-level-card--active {
  transform: scale(1);
  opacity: 1;
}

.vip-level-card__bg,
.vip-level-card__mask {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.vip-level-card__mask {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.08) 100%);
}

.vip-level-card__inner {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 22rpx 22rpx 18rpx 26rpx;
  display: flex;
  justify-content: space-between;
}

.vip-level-card__left {
  flex: 1;
  min-width: 0;
  padding-top: 6rpx;
}

.vip-level-card__tag {
  display: inline-flex;
  align-items: center;
  height: 36rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: rgba(94, 86, 70, 0.34);
  color: #ffffff;
  font-size: 18rpx;
}

.vip-level-card__code {
  display: block;
  margin-top: 16rpx;
  font-size: 68rpx;
  line-height: 1;
  font-weight: 800;
  color: #4e371f;
}

.vip-level-card__title {
  display: block;
  margin-top: 14rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #6a512f;
}

.vip-level-card__desc {
  display: block;
  margin-top: 16rpx;
  font-size: 22rpx;
  color: rgba(108, 83, 49, 0.84);
}

.vip-level-card__progress {
  position: relative;
  margin-top: 20rpx;
  width: 300rpx;
  height: 20rpx;
}

.vip-level-card__progress-track {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 0 0 1rpx rgba(137, 109, 61, 0.14);
}

.vip-level-card__progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 20rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #b89a56 0%, #f0db93 100%);
  box-shadow: 0 6rpx 14rpx rgba(184, 154, 86, 0.24);
}

.vip-level-card__progress-dot {
  position: absolute;
  top: 50%;
  width: 24rpx;
  height: 24rpx;
  margin-left: -12rpx;
  border-radius: 50%;
  background: #fff8e7;
  border: 4rpx solid #cfb16d;
  box-shadow: 0 6rpx 16rpx rgba(184, 154, 86, 0.3);
  transform: translateY(-50%);
}

.vip-level-card__step {
  display: flex;
  justify-content: space-between;
  width: 300rpx;
  margin-top: 16rpx;
  font-size: 18rpx;
  color: rgba(102, 83, 53, 0.7);
}

.vip-level-card__right {
  width: 212rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: -80rpx;
}

.vip-level-card__medal {
  width: 272rpx;
  height: 272rpx;
}

.vip-level-card__button {
  width: 144rpx;
  height: 58rpx;
  border-radius: 999rpx;
  background: #33333f;
  color: #ffffff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18rpx 24rpx 0;
}

.section-head--rights {
  margin-top: 12rpx;
}

.section-head__title,
.section-head__count {
  font-size: 34rpx;
  font-weight: 700;
  color: #222222;
}

.section-head__count {
  margin-left: 8rpx;
  font-weight: 500;
}

.section-head__link {
  font-size: 24rpx;
  color: #8c8f96;
}

.rights-list {
  padding: 20rpx 24rpx 0;
}

.right-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 18rpx;
  padding: 30rpx 24rpx;
  border-radius: 8rpx;
  background: #f7f8fa;
}

.right-card__copy {
  flex: 1;
  min-width: 0;
}

.right-card__title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #202020;
}

.right-card__desc {
  display: block;
  margin-top: 10rpx;
  font-size: 23rpx;
  line-height: 1.7;
  color: #8c8f96;
}

.right-card__icon {
  width: 90rpx;
  height: 90rpx;
  border-radius: 4rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
