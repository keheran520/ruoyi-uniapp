<template>
  <view class="asset-page">
    <view class="asset-header">
      <view class="status-space" :style="{ height: `${statusBarHeight}px` }" />
      <view class="asset-header__row">
        <view class="asset-header__back" @tap="goBack">
          <u-icon name="arrow-left" color="#1f2b38" size="20" />
        </view>
        <view class="asset-header__main">
          <text class="asset-header__title">钱包</text>
          <text class="asset-header__desc">账户资产与变动记录</text>
        </view>
      </view>
    </view>

    <scroll-view class="page-scroll" scroll-y @scrolltolower="fetchPage(false)">
      <view class="hero-panel">
        <view class="hero-panel__glow hero-panel__glow--left" />
        <view class="hero-panel__glow hero-panel__glow--right" />
        <view class="wallet-card">
          <text class="wallet-card__tag">WALLET OVERVIEW</text>
          <text class="wallet-card__title">会员钱包</text>
          <text class="wallet-card__desc">统一查看余额、积分、成长值及变动明细</text>

          <view class="wallet-grid">
            <view class="wallet-metric">
              <text class="wallet-metric__label">累计收益</text>
              <text class="wallet-metric__value">{{ formatMoney(summary.totalIncome || summary.incomeAmount || 0) }}</text>
            </view>
            <view class="wallet-metric wallet-metric--blue">
              <text class="wallet-metric__label">账户余额</text>
              <text class="wallet-metric__value">{{ formatMoney(summary.balance || 0) }}</text>
            </view>
          </view>

          <view class="summary-row">
            <view class="summary-pill">
              <text class="summary-pill__label">余额</text>
              <text class="summary-pill__value">{{ formatMoney(summary.balance || 0) }}</text>
            </view>
            <view class="summary-pill summary-pill--mint">
              <text class="summary-pill__label">积分</text>
              <text class="summary-pill__value">{{ summary.points ?? 0 }}</text>
            </view>
            <view class="summary-pill summary-pill--gold">
              <text class="summary-pill__label">成长值</text>
              <text class="summary-pill__value">{{ summary.growthValue ?? 0 }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="content-shell">
        <view class="tabs-card">
          <u-tabs
            :list="tabList"
            :current="currentTab"
            line-width="28"
            line-color="#5d8fff"
            item-style="height: 72rpx;"
            active-style="color: #24427c; font-weight: 700;"
            inactive-style="color: #8d99ac;"
            @change="onTabChange"
          />
        </view>

        <view class="intro-card">
          <text class="intro-card__title">{{ currentTabTitle }}</text>
          <text class="intro-card__desc">{{ currentTabDesc }}</text>
        </view>

        <view v-if="loading && !list.length" class="state-box">
          <u-loading-icon color="#5d8fff" size="24" />
          <text>正在加载记录...</text>
        </view>

        <view v-else-if="!loading && !list.length" class="state-box state-box--empty">
          <u-icon name="coupon" color="#95a7c9" size="26" />
          <text>暂无记录</text>
        </view>

        <view v-else class="record-list">
          <view v-for="(row, index) in list" :key="index" class="record-card">
            <view class="record-card__top">
              <view class="record-card__meta">
                <text class="record-card__title">{{ typeLabel(row) }}</text>
                <text class="record-card__time">{{ formatDateTime(row.createTime || row.updateTime || row.operTime || row.sendTime) }}</text>
              </view>
              <text class="record-card__amount" :class="{ 'record-card__amount--plus': amountNum(row) >= 0 }">
                {{ amountText(row) }}
              </text>
            </view>

            <text v-if="changeSummary(row)" class="record-card__values">{{ changeSummary(row) }}</text>
            <text v-if="row.remark" class="record-card__remark">{{ row.remark }}</text>
          </view>

          <view class="footer-tip">{{ finished ? '没有更多记录了' : '上拉加载更多' }}</view>
        </view>
      </view>

      <SafeArea position="bottom" background-color="#f5f8ff" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getBalanceLog, getGrowthLog, getMemberInfo, getPointsLog } from '@/api/mobile/member'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0)
const currentTab = ref(0)
const tabList = ref([{ name: '余额' }, { name: '积分' }, { name: '成长值' }])
const summary = ref<Record<string, any>>({ balance: 0, points: 0, growthValue: 0 })
const list = ref<any[]>([])
const pageNum = ref(1)
const pageSize = 20
const loading = ref(false)
const finished = ref(false)

const currentTabTitle = computed(() => tabList.value[currentTab.value]?.name || '钱包资产')
const currentTabDesc = computed(() => {
  if (currentTab.value === 0) return '查看充值、消费、退款等余额变动'
  if (currentTab.value === 1) return '查看签到奖励、兑换、过期等积分变动'
  return '查看会员成长值累计与等级成长记录'
})

function formatMoney(value?: number | string) {
  return `¥${((Number(value) || 0) / 100).toFixed(2)}`
}

function formatDateTime(value?: string) {
  if (!value) return '刚刚'
  return String(value).replace('T', ' ').slice(0, 16)
}

function amountNum(row: Record<string, any>) {
  if (currentTab.value === 0) return Number(row.changeAmount) || 0
  if (currentTab.value === 1) return Number(row.changePoints) || 0
  return Number(row.changeValue) || 0
}

function typeLabel(row: Record<string, any>) {
  const type = String(row.changeType ?? '')
  if (currentTab.value === 0) {
    return ({ '1': '余额充值', '2': '余额消费', '3': '订单退款', '4': '系统调整' } as Record<string, string>)[type] || '余额变动'
  }
  if (currentTab.value === 1) {
    return ({ '1': '签到奖励', '2': '消费获得', '3': '积分兑换', '4': '积分过期', '5': '系统调整' } as Record<string, string>)[type] || '积分变动'
  }
  return ({ '1': '消费成长', '2': '活动成长', '3': '签到成长', '4': '系统调整', '5': '过期扣减' } as Record<string, string>)[type] || '成长值变动'
}

function amountText(row: Record<string, any>) {
  const amount = amountNum(row)
  const prefix = amount >= 0 ? '+' : ''
  return currentTab.value === 0 ? `${prefix}${formatMoney(amount)}` : `${prefix}${amount}`
}

function changeSummary(row: Record<string, any>) {
  if (row.pointsBefore != null && row.pointsAfter != null) return `变更前 ${row.pointsBefore} / 变更后 ${row.pointsAfter}`
  if (row.growthBefore != null && row.growthAfter != null) return `变更前 ${row.growthBefore} / 变更后 ${row.growthAfter}`
  if (row.balanceBefore != null && row.balanceAfter != null) {
    return `变更前 ${formatMoney(row.balanceBefore)} / 变更后 ${formatMoney(row.balanceAfter)}`
  }
  return ''
}

async function fetchSummary() {
  try {
    const res = await getMemberInfo()
    summary.value = res.data || {}
  } catch (error) {
    console.error('load member wallet summary failed', error)
  }
}

async function fetchPage(refresh = false) {
  if (loading.value || (!refresh && finished.value)) return
  loading.value = true
  try {
    const targetPage = refresh ? 1 : pageNum.value
    const params = { pageNum: targetPage, pageSize }
    const response =
      currentTab.value === 0
        ? await getBalanceLog(params)
        : currentTab.value === 1
          ? await getPointsLog(params)
          : await getGrowthLog(params)
    const rows = response.rows || response.data?.rows || []
    list.value = refresh ? rows : [...list.value, ...rows]
    finished.value = rows.length < pageSize
    pageNum.value = targetPage + 1
  } catch (error) {
    console.error('load member wallet logs failed', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function onTabChange(event: Record<string, any>) {
  const index = Number(event?.index ?? 0)
  if (index === currentTab.value) return
  currentTab.value = index
  pageNum.value = 1
  finished.value = false
  fetchPage(true)
}

function goBack() {
  uni.navigateBack()
}

onLoad((options) => {
  const tab = Number(options?.tab ?? 0)
  if ([0, 1, 2].includes(tab)) currentTab.value = tab
  fetchSummary()
  fetchPage(true)
})
</script>

<style lang="scss" scoped>
.asset-page {
  min-height: 100vh;
  background: #f5f8ff;
}

.asset-header {
  padding: 0 26rpx 8rpx;
  background: linear-gradient(180deg, #f5f8ff 0%, #edf4ff 100%);
}

.asset-header__row {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  padding: 18rpx 0 16rpx;
}

.asset-header__back {
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(182, 201, 234, 0.28);
}

.asset-header__main {
  flex: 1;
  min-width: 0;
}

.asset-header__title {
  display: block;
  font-size: 38rpx;
  font-weight: 700;
  color: #1f2b38;
}

.asset-header__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8392a7;
}

.page-scroll {
  min-height: 100vh;
}

.hero-panel {
  position: relative;
  padding: 0 26rpx;
  overflow: hidden;
}

.hero-panel__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(26rpx);
}

.hero-panel__glow--left {
  width: 260rpx;
  height: 260rpx;
  left: -60rpx;
  top: 10rpx;
  background: radial-gradient(circle, rgba(182, 216, 255, 0.95) 0%, rgba(182, 216, 255, 0) 72%);
}

.hero-panel__glow--right {
  width: 260rpx;
  height: 260rpx;
  right: -70rpx;
  top: 40rpx;
  background: radial-gradient(circle, rgba(255, 236, 205, 0.92) 0%, rgba(255, 236, 205, 0) 72%);
}

.wallet-card {
  position: relative;
  z-index: 1;
  padding: 30rpx 24rpx 24rpx;
  border-radius: 34rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(247, 251, 255, 0.98) 100%);
  box-shadow: 0 16rpx 34rpx rgba(182, 201, 234, 0.18);
}

.wallet-card__tag {
  display: block;
  font-size: 20rpx;
  letter-spacing: 2rpx;
  color: #8ea0ba;
}

.wallet-card__title {
  display: block;
  margin-top: 10rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: #1f2b38;
}

.wallet-card__desc {
  display: block;
  margin-top: 10rpx;
  font-size: 23rpx;
  line-height: 1.6;
  color: #7f8fa5;
}

.wallet-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 24rpx;
}

.wallet-metric {
  padding: 22rpx 20rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #fff2e8 0%, #fff9f5 100%);
}

.wallet-metric--blue {
  background: linear-gradient(135deg, #eaf2ff 0%, #f7fbff 100%);
}

.wallet-metric__label {
  display: block;
  font-size: 22rpx;
  color: #8494ab;
}

.wallet-metric__value {
  display: block;
  margin-top: 12rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #1f2b38;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 22rpx;
}

.summary-pill {
  padding: 18rpx 12rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #eaf2ff 0%, #f8fbff 100%);
  text-align: center;
}

.summary-pill--mint {
  background: linear-gradient(135deg, #e8fff6 0%, #f5fffb 100%);
}

.summary-pill--gold {
  background: linear-gradient(135deg, #fff3da 0%, #fffaf0 100%);
}

.summary-pill__label {
  display: block;
  font-size: 20rpx;
  color: #8b9ab1;
}

.summary-pill__value {
  display: block;
  margin-top: 10rpx;
  font-size: 27rpx;
  font-weight: 700;
  color: #1f2b38;
}

.content-shell {
  padding: 22rpx 26rpx 24rpx;
}

.tabs-card,
.intro-card,
.record-card,
.state-box {
  border-radius: 30rpx;
  background: #ffffff;
  box-shadow: 0 14rpx 30rpx rgba(182, 201, 234, 0.16);
}

.tabs-card {
  padding: 8rpx 18rpx;
}

.intro-card {
  margin-top: 18rpx;
  padding: 22rpx 24rpx;
  background: linear-gradient(135deg, #eef5ff 0%, #ffffff 100%);
}

.intro-card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #1f2b38;
}

.intro-card__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: #7f8fa5;
}

.state-box {
  margin-top: 18rpx;
  padding: 88rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  font-size: 24rpx;
  color: #7f8fa5;
}

.state-box--empty {
  color: #9aa8bc;
}

.record-list {
  margin-top: 18rpx;
}

.record-card {
  margin-bottom: 16rpx;
  padding: 24rpx 22rpx;
}

.record-card__top {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
}

.record-card__meta {
  flex: 1;
  min-width: 0;
}

.record-card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #1f2b38;
}

.record-card__time {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #96a4b8;
}

.record-card__amount {
  font-size: 30rpx;
  font-weight: 700;
  color: #f06b7a;
}

.record-card__amount--plus {
  color: #2fb394;
}

.record-card__values,
.record-card__remark {
  display: block;
  margin-top: 14rpx;
  font-size: 23rpx;
  line-height: 1.6;
  color: #6d7d93;
}

.footer-tip {
  padding: 18rpx 0 10rpx;
  text-align: center;
  font-size: 22rpx;
  color: #96a4b8;
}
</style>
