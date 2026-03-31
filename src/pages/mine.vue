<template>
  <view class="mine-page">
    <u-navbar
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      bg-color="transparent"
      left-icon=""
      title=""
    >
      <template #right>
        <view class="nav-actions">
          <view class="nav-icon" @tap="goScan">
            <u-icon name="scan" color="#1f2b38" size="20" />
          </view>
          <view class="nav-icon" @tap="goSetting">
            <u-icon name="setting" color="#1f2b38" size="20" />
          </view>
        </view>
      </template>
    </u-navbar>

    <scroll-view class="page-scroll" scroll-y>
      <view class="hero-wrap">
        <view class="hero-panel">
          <view class="profile-row" @tap="goProfile">
            <image class="avatar" :src="avatarUrl" mode="aspectFill" />
            <view class="profile-main">
              <view class="nickname-row">
                <text class="nickname">{{ displayName }}</text>
                <image class="nickname-badge" :src="currentVipMedal" mode="aspectFit" @tap.stop="goBadgeCenter" />
              </view>
              <text class="account">{{ maskedPhone }}</text>
            </view>
            <text class="profile-link">{{ mineText.editProfile }}</text>
          </view>

          <view class="stat-row">
            <view v-for="item in statList" :key="item.key" class="stat-item">
              <text class="stat-value">{{ item.value }}</text>
              <text class="stat-label">{{ item.label }}</text>
            </view>
          </view>

          <view class="vip-card" @tap="goMemberCenter">
            <image class="vip-card__bg" :src="currentVipBackground" mode="aspectFill" />
            <view class="vip-card__mask" />
            <view class="vip-card__inner">
              <view class="vip-card__left">
                <text class="vip-card__tag">{{ mineText.currentLevel }}</text>
                <text class="vip-card__title">{{ memberTitle }}</text>
                <text class="vip-card__desc">{{ memberSubTitle }}</text>
                <view class="vip-card__progress">
                  <view class="vip-card__progress-track" />
                  <view class="vip-card__progress-fill" :style="{ width: `${growthPercent}%` }" />
                  <view class="vip-card__progress-dot" :style="{ left: `${growthPercent}%` }" />
                </view>
                <view class="vip-card__foot">
                  <text>{{ currentGrowth }} / {{ nextGrowthTarget }}</text>
                  <text>{{ growthHint }}</text>
                </view>
              </view>

              <view class="vip-card__right">
                <image class="vip-card__medal" :src="currentVipMedal" mode="aspectFit" />
                <view class="vip-card__action">{{ mineText.myBenefits }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="content-wrap">
        <view class="section-card">
          <view class="section-head">
            <text class="section-title">{{ mineText.ordersTitle }}</text>
            <text class="section-link" @tap="goMallOrders">{{ mineText.allOrders }}</text>
          </view>
          <view class="order-grid">
            <view
              v-for="item in orderEntryList"
              :key="item.key"
              class="order-item"
              @tap="handleOrderEntry(item.key)"
            >
              <view class="order-item__icon">
                <u-badge
                  v-if="item.badge"
                  :value="item.badge"
                  absolute
                  :offset="[8, 8]"
                />
                <u-icon :name="item.icon" :color="item.color" size="24" />
              </view>
              <text class="order-item__name">{{ item.name }}</text>
            </view>
          </view>
        </view>

        <view class="checkin-card" @tap="goCheckin">
          <view class="checkin-card__main">
            <text class="checkin-card__title">{{ mineText.checkinTitle }}</text>
            <text class="checkin-card__desc">{{ checkinDesc }}</text>
          </view>
          <view class="checkin-card__btn">{{ summary.signedToday ? mineText.checkedToday : mineText.receiveNow }}</view>
        </view>

        <view class="section-card section-card--tools">
          <view class="section-head">
            <text class="section-title">{{ mineText.toolsTitle }}</text>
          </view>
          <view class="tool-grid">
            <view
              v-for="item in quickActions"
              :key="item.key"
              class="tool-item"
              @tap="handleQuickAction(item.key)"
            >
              <view class="tool-item__icon">
                <view v-if="item.key === 'wallet'" class="wallet-icon">
                  <view class="wallet-icon__body" />
                  <view class="wallet-icon__slot" />
                  <view class="wallet-icon__dot" />
                </view>
                <u-icon v-else :name="item.icon" color="#1f2b38" size="22" />
              </view>
              <text class="tool-item__name">{{ item.name }}</text>
            </view>
          </view>
        </view>
      </view>

      <SafeArea position="bottom" background-color="#f7f4f1" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import store from '@/store'
import { getCheckinSummary, getLevelList, getMemberDetail } from '@/api/mobile/member'
import { getInteractionSummary } from '@/api/mobile/interaction'
import { getMobileMessageSummary } from '@/api/mobile/messageCenter'

const mineText = {
  growthLabel: '\u6210\u957f\u503c',
  editProfile: '\u7f16\u8f91\u8d44\u6599',
  myBenefits: '\u6211\u7684\u6743\u76ca',
  totalIncome: '\u7d2f\u8ba1\u6536\u76ca(\u5143)',
  accountBalance: '\u8d26\u6237\u4f59\u989d(\u5143)',
  wallet: '\u94b1\u5305',
  badgeCenter: '\u5fbd\u7ae0\u4e2d\u5fc3',
  ordersTitle: '\u6211\u7684\u8ba2\u5355',
  allOrders: '\u5168\u90e8\u8ba2\u5355',
  checkinTitle: '\u7b7e\u5230 | \u9886\u597d\u793c',
  checkedToday: '\u4eca\u65e5\u5df2\u7b7e',
  receiveNow: '\u7acb\u5373\u9886\u53d6',
  toolsTitle: '\u5e38\u7528\u5de5\u5177',
  loginNow: '\u7acb\u5373\u767b\u5f55',
  loginHint: '\u767b\u5f55\u540e\u540c\u6b65\u4f1a\u5458\u6570\u636e',
  defaultMember: '\u5408\u521b\u65b0\u624b',
  maxLevel: '\u5f53\u524d\u5df2\u8fbe\u5230\u6700\u9ad8\u7b49\u7ea7',
  currentLevel: '\u5f53\u524d\u7b49\u7ea7',
  fullBenefits: '\u5f53\u524d\u7b49\u7ea7\u6743\u76ca\u5df2\u5168\u90e8\u89e3\u9501',
  upgradePrefix: '\u5347\u7ea7\u81f3',
  upgradeSuffix: '\u540e\u89e3\u9501\u66f4\u591a\u6743\u76ca',
  nextLevelPrefix: '\u8fd8\u5dee ',
  nextLevelSuffix: ' \u6210\u957f\u503c\u53ef\u5347\u7ea7\u4e0b\u4e00\u7b49\u7ea7',
  checkinDescPrefix: '\u8fde\u7eed\u7b7e\u5230',
  checkinDescSuffix: '\u5929\u53ef\u9886\u53d6\u795e\u79d8\u5927\u793c\u5305'
}

const memberDetail = ref<Record<string, any>>({})
const summary = ref<Record<string, any>>({})
const interactionSummary = ref<Record<string, any>>({})
const levels = ref<any[]>([])
const unreadMessageCount = ref(0)

const userProfile = computed<Record<string, any>>(() => store.state.user.userProfile || {})
const avatarUrl = computed(() => userProfile.value.avatar || '/static/images/profile.jpg')
const displayName = computed(() => userProfile.value.nickName || userProfile.value.userName || mineText.loginNow)
const maskedPhone = computed(() => {
  const phone = String(userProfile.value.phonenumber || userProfile.value.userName || '')
  if (!phone) return mineText.loginHint
  if (phone.length < 7) return phone
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
})

const sortedLevels = computed(() =>
  levels.value.slice().sort((a, b) => Number(a.requiredGrowth || 0) - Number(b.requiredGrowth || 0))
)
const currentLevel = computed(() => {
  const currentId = String(memberDetail.value.levelId || '')
  return sortedLevels.value.find((item) => String(item.id) === currentId) || sortedLevels.value[0] || {}
})
const nextLevel = computed(() => {
  const currentGrowthValue = Number(memberDetail.value.growthValue || 0)
  return sortedLevels.value.find((item) => Number(item.requiredGrowth || 0) > currentGrowthValue)
})
const currentGrowth = computed(() => Number(memberDetail.value.growthValue || 0))
const nextGrowthTarget = computed(() => Number(nextLevel.value?.requiredGrowth || currentLevel.value?.requiredGrowth || currentGrowth.value || 100))
const growthPercent = computed(() => {
  const currentRequired = Number(currentLevel.value?.requiredGrowth || 0)
  const nextRequired = Number(nextLevel.value?.requiredGrowth || currentRequired || 1)
  if (!nextLevel.value || nextRequired <= currentRequired) return 100
  const ratio = ((currentGrowth.value - currentRequired) / (nextRequired - currentRequired)) * 100
  return Math.max(6, Math.min(100, Number(ratio.toFixed(2))))
})
const growthHint = computed(() => {
  if (!nextLevel.value) return mineText.maxLevel
  return `${mineText.upgradePrefix}${nextLevel.value.levelCode || nextLevel.value.levelName}${mineText.upgradeSuffix}`
})

const memberTitle = computed(() => `${memberDetail.value.levelCode || 'Lv.1'} ${normalizeLevelName(memberDetail.value.levelName) || mineText.defaultMember}`)
const memberSubTitle = computed(() => {
  if (!nextLevel.value) return mineText.fullBenefits
  const gap = Math.max(0, Number(nextLevel.value.requiredGrowth || 0) - currentGrowth.value)
  return `${mineText.nextLevelPrefix}${gap}${mineText.nextLevelSuffix}`
})
const statList = computed(() => [
  { key: 'publish', label: '\u53d1\u5e03', value: interactionSummary.value.workCount ?? 0 },
  { key: 'favorite', label: '\u6536\u85cf', value: interactionSummary.value.favoriteCount ?? 0 },
  { key: 'like', label: '\u83b7\u8d5e', value: interactionSummary.value.likeCount ?? 0 },
  { key: 'comment', label: '\u8bc4\u8bba', value: interactionSummary.value.commentCount ?? 0 }
])

const orderEntryList = computed(() => [
  { key: 'pay', name: '\u5f85\u4ed8\u6b3e', icon: 'rmb-circle-fill',  badge: '' },
  { key: 'ship', name: '\u5f85\u53d1\u8d27', icon: 'car-fill',  badge: '' },
  { key: 'receive', name: '\u5f85\u6536\u8d27', icon: 'bag-fill',  badge: '' },
  { key: 'comment', name: '\u5f85\u8bc4\u4ef7', icon: 'chat-fill',  badge: '' },
  { key: 'after', name: '\u552e\u540e', icon: 'coupon-fill',  badge: '' }
])

const quickActions = [
  { key: 'wallet', name: '\u94b1\u5305', icon: '' },
  { key: 'favorite', name: '\u6211\u7684\u6536\u85cf', icon: 'heart' },
  { key: 'service', name: '\u670d\u52a1\u4e13\u533a', icon: 'server-man' },
  { key: 'history', name: '\u5386\u53f2\u8bb0\u5f55', icon: 'clock' },
  { key: 'activity', name: '\u6d3b\u52a8\u4e2d\u5fc3', icon: 'gift' },
  { key: 'task', name: '\u6bcf\u5468\u4efb\u52a1', icon: 'calendar' },
  { key: 'address', name: '\u6536\u8d27\u5730\u5740', icon: 'map' }
]

const currentVipBackground = computed(() => {
  const code = String(memberDetail.value.levelCode || 'V1').toUpperCase()
  const assetMap: Record<string, string> = {
    V1: '/static/images/vip/v1-bg.png',
    V2: '/static/images/vip/v2-bg.png',
    V3: '/static/images/vip/v3-bg.png',
    V4: '/static/images/vip/v4-bg.png',
    V5: '/static/images/vip/v5-bg.png',
    V6: '/static/images/vip/v6-bg.png',
    V7: '/static/images/vip/v7-bg.png',
    SVIP7: '/static/images/vip/v7-bg.png'
  }
  return assetMap[code] || '/static/images/vip/v1-bg.png'
})
const currentVipMedal = computed(() => {
  const code = String(memberDetail.value.levelCode || 'V1').toUpperCase()
  const assetMap: Record<string, string> = {
    V1: '/static/images/vip/v1-hz.png',
    V2: '/static/images/vip/v2-hz.png',
    V3: '/static/images/vip/v3-hz.png',
    V4: '/static/images/vip/v4-hz.png',
    V5: '/static/images/vip/v5-hz.png',
    V6: '/static/images/vip/v6-hz.png',
    V7: '/static/images/vip/v7-hz.png',
    SVIP7: '/static/images/vip/v7-hz.png'
  }
  return assetMap[code] || '/static/images/vip/v1-hz.png'
})

const checkinDesc = computed(
  () => `${mineText.checkinDescPrefix}${summary.value.continuousDays ?? 0}${mineText.checkinDescSuffix}`
)

function normalizeLevelName(value?: string) {
  return String(value || '')
    .replace(/^V\d+\s*/i, '')
    .replace(/^SVIP\d+\s*/i, '')
    .trim()
}

function formatBadgeValue(value: number) {
  return value > 99 ? '99+' : String(value)
}

function formatMoney(value?: number | string) {
  return ((Number(value) || 0) / 100).toFixed(2)
}

async function loadData() {
  if (!store.state.user.token) {
    memberDetail.value = {}
    summary.value = {}
    interactionSummary.value = {}
    levels.value = []
    unreadMessageCount.value = 0
    return
  }

  try {
    await store.dispatch('GetUserProfile')
    const [detailRes, summaryRes, levelRes, interactionRes, messageRes] = await Promise.all([
      getMemberDetail(),
      getCheckinSummary(),
      getLevelList(),
      getInteractionSummary(),
      getMobileMessageSummary()
    ])
    memberDetail.value = detailRes.data || {}
    summary.value = summaryRes.data || {}
    levels.value = levelRes.data || []
    interactionSummary.value = interactionRes.data || {}
    unreadMessageCount.value = Number(messageRes.data?.unreadTotal || 0)
  } catch (error) {
    console.error('load mine page failed', error)
  }
}

function ensureLogin(next: () => void) {
  if (!store.state.user.token) {
    uni.navigateTo({ url: '/pages/login' })
    return
  }
  next()
}

function goProfile() {
  ensureLogin(() => uni.navigateTo({ url: '/pages_mine/pages/info/edit' }))
}

function goMessages() {
  ensureLogin(() => uni.switchTab({ url: '/pages/messages' }))
}

function goSetting() {
  ensureLogin(() => uni.navigateTo({ url: '/pages_mine/pages/setting/index' }))
}

function goScan() {
  ensureLogin(() => uni.navigateTo({ url: '/pages/qrcode-scan' }))
}

function goMemberCenter() {
  ensureLogin(() => uni.navigateTo({ url: '/pages/member-center' }))
}

function goBadgeCenter() {
  ensureLogin(() => uni.navigateTo({ url: '/pages/member-badge-center' }))
}

function goCheckin() {
  ensureLogin(() => uni.navigateTo({ url: '/pages/member-checkin' }))
}

function goBalance(tab = 0) {
  ensureLogin(() => uni.navigateTo({ url: `/pages/member-balance?tab=${tab}` }))
}

function goMallOrders() {
  ensureLogin(() => uni.navigateTo({ url: '/pages_mall/pages/order/list' }))
}

function handleOrderEntry(key: string) {
  const tabMap: Record<string, number> = { pay: 1, ship: 2, receive: 3, comment: 4, after: 5 }
  ensureLogin(() => uni.navigateTo({ url: `/pages_mall/pages/order/list?tab=${tabMap[key] ?? 0}` }))
}

function handleQuickAction(key: string) {
  const actionMap: Record<string, () => void> = {
    favorite: () => uni.navigateTo({ url: '/pages/interaction-center?tab=2' }),
    wallet: () => goBalance(0),
    service: () => uni.switchTab({ url: '/pages/messages' }),
    history: () => uni.navigateTo({ url: '/pages/interaction-center?tab=0' }),
    activity: () => uni.navigateTo({ url: '/pages/member-club' }),
    task: goCheckin,
    address: () => uni.navigateTo({ url: '/pages_template/pages/address/index' })
  }
  ensureLogin(() => actionMap[key]?.())
}

onShow(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.mine-page {
  min-height: 100vh;
  background: #f5f8ff;
}

.page-scroll {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f8ff 0%, #f5f8ff 100%);
}

:deep(.u-navbar) {
  background: transparent !important;
}

:deep(.u-navbar__content) {
  background: transparent !important;
}

:deep(.u-navbar__content__left),
:deep(.u-navbar__content__right) {
  padding: 0 24rpx;
}

.nav-left {
  position: relative;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.nav-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 12rpx 30rpx rgba(109, 96, 92, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-wrap {
  padding: 16rpx 24rpx 0;
}

.hero-panel {
  padding: 6rpx 0 0;
}

.profile-row {
  display: flex;
  align-items: center;
}

.avatar {
  width: 108rpx;
  height: 108rpx;
  border-radius: 54rpx;
  background: #ffffff;
  flex-shrink: 0;
}

.profile-main {
  flex: 1;
  min-width: 0;
  margin-left: 18rpx;
}

.nickname {
  font-size: 38rpx;
  font-weight: 700;
  color: #40302d;
}

.nickname-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.nickname-badge {
  width: 42rpx;
  height: 42rpx;
  flex-shrink: 0;
}

.account {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #6f605d;
}

.profile-link {
  font-size: 24rpx;
  color: #8b7f7b;
  white-space: nowrap;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8rpx;
  margin-top: 30rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: #2f2928;
}

.stat-label {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #7d7270;
}

.vip-card {
  position: relative;
  margin-top: 28rpx;
  height: 340rpx;
  border-radius: 28rpx;
  overflow: hidden;
}

.vip-card__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.vip-card__mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.08) 100%);
}

.vip-card__inner {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 22rpx 22rpx 18rpx 26rpx;
}

.vip-card__left {
  flex: 1;
  min-width: 0;
  padding-top: 6rpx;
}

.vip-card__tag {
  display: inline-flex;
  align-items: center;
  height: 36rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: rgba(94, 86, 70, 0.34);
  color: #ffffff;
  font-size: 18rpx;
}

.vip-card__title {
  display: block;
  margin-top: 16rpx;
  font-size: 60rpx;
  line-height: 1;
  font-weight: 800;
  color: #4e371f;
}

.vip-card__desc {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: rgba(108, 83, 49, 0.84);
  line-height: 1.5;
}

.vip-card__action {
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

.vip-card__progress {
  position: relative;
  margin-top: 30rpx;
  width: 400rpx;
  height: 20rpx;
}

.vip-card__progress-track {
  position: absolute;
  inset: 0;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 0 0 1rpx rgba(137, 109, 61, 0.14);
}

.vip-card__progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 20rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #b89a56 0%, #f0db93 100%);
  box-shadow: 0 6rpx 14rpx rgba(184, 154, 86, 0.24);
}

.vip-card__progress-dot {
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

.vip-card__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: 20px;
  width: 400rpx;
  gap: 20rpx;
  margin-top: 16rpx;
  font-size: 22rpx;
  color: rgba(102, 83, 53, 0.7);
}

.vip-card__right {
  width: 212rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: -80rpx;
}

.vip-card__medal {
  width: 272rpx;
  height: 272rpx;
}

.content-wrap {
  padding: 0 26rpx 0 26rpx;
}

.section-card {
  margin-top: 22rpx;
  padding: 28rpx 24rpx;
  border-radius: 30rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 22rpx rgba(210, 220, 241, 0.44);
}

.section-card--tools {
  padding-bottom: 10rpx;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2c2422;
}

.section-link {
  font-size: 24rpx;
  color: #9aa3af;
}

.order-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 30rpx;
}

.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.order-item__icon {
  position: relative;
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #eef4ff 0%, #dfe9ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-item__name {
  margin-top: 14rpx;
  font-size: 24rpx;
  color: #706563;
}

.checkin-card {
  margin-top: 22rpx;
  padding: 0 28rpx;
  min-height: 126rpx;
  border-radius: 28rpx;
  background: linear-gradient(90deg, #eef4ff 0%, #dfe8ff 100%);
  box-shadow: 0 10rpx 22rpx rgba(210, 220, 241, 0.42);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.checkin-card__main {
  flex: 1;
}

.checkin-card__title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #3553a4;
}

.checkin-card__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #7d89a6;
}

.checkin-card__btn {
  min-width: 148rpx;
  height: 64rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: #5d8fff;
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  row-gap: 28rpx;
  margin-top: 28rpx;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tool-item__icon {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: #f4f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wallet-icon {
  position: relative;
  width: 36rpx;
  height: 28rpx;
}

.wallet-icon__body {
  position: absolute;
  left: 2rpx;
  right: 0;
  bottom: 0;
  height: 24rpx;
  border-radius: 10rpx;
  background: linear-gradient(180deg, #7aa6ff 0%, #4d83f6 100%);
  box-shadow: 0 6rpx 12rpx rgba(93, 143, 255, 0.18);
}

.wallet-icon__slot {
  position: absolute;
  top: 0;
  left: 0;
  width: 18rpx;
  height: 10rpx;
  border-radius: 8rpx 8rpx 0 0;
  background: #a9c4ff;
}

.wallet-icon__dot {
  position: absolute;
  right: 8rpx;
  top: 12rpx;
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: #ffffff;
}

.tool-item__name {
  margin-top: 14rpx;
  font-size: 24rpx;
  color: #473f3d;
}
</style>
