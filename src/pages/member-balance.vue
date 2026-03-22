<template>
  <view class="page">
    <view class="summary-card">
      <view class="sum-item">
        <text class="label">余额(元)</text>
        <text class="val">{{ formatYuan(summary.balance) }}</text>
      </view>
      <view class="sum-item">
        <text class="label">积分</text>
        <text class="val">{{ summary.points ?? 0 }}</text>
      </view>
      <view class="sum-item">
        <text class="label">成长值</text>
        <text class="val">{{ summary.growthValue ?? 0 }}</text>
      </view>
    </view>

    <u-tabs
      :list="tabList"
      :current="currentTab"
      line-width="40"
      :scrollable="false"
      @change="onTabChange"
    />

    <view v-if="loading && list.length === 0" class="state">加载中...</view>
    <view v-else-if="!loading && list.length === 0" class="state muted">暂无记录</view>
    <view v-else class="list-block">
      <view v-for="(row, idx) in list" :key="idx" class="log-item">
        <view class="log-top">
          <text class="type">{{ typeLabel(row) }}</text>
          <text class="amount" :class="{ up: amountNum(row) >= 0 }">{{ amountText(row) }}</text>
        </view>
        <view v-if="row.remark" class="remark">{{ row.remark }}</view>
      </view>
      <view class="footer-tip">{{ finished ? '没有更多了' : '加载中...' }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { getMemberInfo, getBalanceLog, getPointsLog, getGrowthLog } from '@/api/mobile/member'

const currentTab = ref(0)
const tabList = ref([{ name: '余额' }, { name: '积分' }, { name: '成长值' }])
const summary = ref({ balance: 0, points: 0, growthValue: 0 })
const list = ref([])
const pageNum = ref(1)
const pageSize = 20
const loading = ref(false)
const finished = ref(false)

const formatYuan = (fen) => {
  const n = Number(fen) || 0
  return (n / 100).toFixed(2)
}

const amountNum = (row) => {
  if (currentTab.value === 0) return Number(row.changeAmount) || 0
  if (currentTab.value === 1) return Number(row.changePoints) || 0
  return Number(row.changeValue) || 0
}

const typeLabel = (row) => {
  const t = row.changeType
  if (currentTab.value === 0) {
    const m = { '1': '充值', '2': '消费', '3': '退款', '4': '系统调整' }
    return m[t] || '余额变动'
  }
  if (currentTab.value === 1) {
    const m = { '1': '签到', '2': '消费获得', '3': '兑换', '4': '过期', '5': '系统调整' }
    return m[t] || '积分变动'
  }
  const m = { '1': '消费获得', '2': '活动获得', '3': '签到获得', '4': '系统调整', '5': '过期扣除' }
  return m[t] || '成长值变动'
}

const amountText = (row) => {
  const n = amountNum(row)
  const prefix = n >= 0 ? '+' : ''
  if (currentTab.value === 0) {
    return `${prefix}${(n / 100).toFixed(2)} 元`
  }
  return `${prefix}${n}`
}

const fetchSummary = async () => {
  try {
    const res = await getMemberInfo()
    if (res.data) {
      summary.value = {
        balance: res.data.balance,
        points: res.data.points,
        growthValue: res.data.growthValue
      }
    }
  } catch (e) {
    console.error(e)
  }
}

const fetchPage = async (refresh) => {
  if (loading.value) return
  if (!refresh && finished.value) return
  loading.value = true
  try {
    const pn = refresh ? 1 : pageNum.value
    const params = { pageNum: pn, pageSize }
    let res
    if (currentTab.value === 0) res = await getBalanceLog(params)
    else if (currentTab.value === 1) res = await getPointsLog(params)
    else res = await getGrowthLog(params)

    const rows = res.rows || []
    if (refresh) {
      list.value = rows
    } else {
      list.value = list.value.concat(rows)
    }
    finished.value = rows.length < pageSize
    pageNum.value = pn + 1
  } catch (e) {
    console.error(e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const onTabChange = (e) => {
  const idx = e?.index ?? 0
  if (currentTab.value === idx) return
  currentTab.value = idx
  pageNum.value = 1
  finished.value = false
  fetchPage(true)
}

onReachBottom(() => {
  fetchPage(false)
})

onLoad((options) => {
  const t = options?.tab
  if (t === '1' || t === 1) currentTab.value = 1
  else if (t === '2' || t === 2) currentTab.value = 2
  fetchSummary()
  fetchPage(true)
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.summary-card {
  margin: 24rpx;
  padding: 32rpx;
  background: linear-gradient(135deg, #2c5f5d 0%, #1f3a3d 100%);
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  color: #fff;
}

.sum-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  .label {
    font-size: 24rpx;
    opacity: 0.85;
  }
  .val {
    font-size: 32rpx;
    font-weight: bold;
  }
}

.list-block {
  padding: 0 24rpx;
}

.log-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.log-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type {
  font-size: 28rpx;
  color: #333;
}

.amount {
  font-size: 30rpx;
  font-weight: 600;
  color: #e6a23c;
  &.up {
    color: #67c23a;
  }
}

.remark {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
}

.state {
  text-align: center;
  padding: 80rpx 0;
  font-size: 28rpx;
  color: #666;
  &.muted {
    color: #bbb;
  }
}

.footer-tip {
  text-align: center;
  padding: 24rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
