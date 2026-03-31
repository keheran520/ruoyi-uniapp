<template>
  <view class="order-page">
    <u-navbar
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      bg-color="#ffffff"
      left-icon="arrow-left"
      left-icon-color="#111827"
      title="我的订单"
      title-style="color: #111827; font-weight: 700;"
      @leftClick="goBack"
    />

    <view class="tabs-box">
      <u-tabs
        :list="tabList"
        :current="currentTab"
        line-width="32"
        line-color="#111827"
        active-style="color: #111827; font-weight: 700;"
        inactive-style="color: #6b7280;"
        @change="onTabChange"
      />
    </view>

    <scroll-view class="page-scroll" scroll-y @scrolltolower="loadOrders(false)">
      <view v-if="loading && !orderList.length" class="state-box">
        <u-loading-icon color="#3b82f6" size="24" />
        <text>正在加载订单...</text>
      </view>

      <view v-else-if="!loading && !orderList.length" class="state-box state-box--empty">
        <u-icon name="shopping-cart" color="#9ca3af" size="28" />
        <text>暂无订单记录</text>
      </view>

      <view v-else class="order-list">
        <view v-for="item in orderList" :key="item.id" class="order-card" @tap="goOrderDetail(item)">
          <view class="order-card__glow" />

          <view class="order-head">
            <view class="order-head__meta">
              <text class="order-sn">{{ item.orderSn || `订单 ${item.id}` }}</text>
              <text class="order-time">下单时间：{{ formatDateTime(item.createTime || item.payTime) }}</text>
            </view>
            <view class="status-badge" :class="`status-badge--${getStatusTheme(item.orderStatus)}`">
              {{ getStatusText(item.orderStatus) }}
            </view>
          </view>

          <view class="order-body">
            <image class="order-cover" :src="getCover(item)" mode="aspectFill" />

            <view class="order-main">
              <text class="order-name">{{ item.goodsName || '商城订单' }}</text>
              <text class="order-meta">服务区域：{{ item.serviceRegions || '未填写' }}</text>
              <text class="order-meta">服务标签：{{ item.serviceTags || '未填写' }}</text>

              <view class="order-tags">
                <text class="mini-tag">{{ getPaymentLabel(item.payType) }}</text>
                <text v-if="getStatusHint(item)" class="mini-tag mini-tag--soft">{{ getStatusHint(item) }}</text>
              </view>

              <view class="order-foot">
                <view>
                  <text class="order-price-label">实付金额</text>
                  <text class="order-price">{{ formatMoney(item.payAmount || item.price) }}</text>
                </view>
                <text class="order-arrow">查看详情</text>
              </view>
            </view>
          </view>

          <view class="action-row">
            <view
              v-for="action in getActions(item)"
              :key="action.key"
              class="action-btn"
              :class="{
                'action-btn--ghost': action.type === 'ghost',
                'action-btn--dark': action.type === 'dark',
                'action-btn--warn': action.type === 'warn'
              }"
              @tap.stop="handleAction(action, item)"
            >
              {{ action.label }}
            </view>
          </view>
        </view>

        <view class="footer-tip">{{ finished ? '没有更多订单了' : '上拉继续加载' }}</view>
      </view>

      <SafeArea position="bottom" background-color="#f5f7fb" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { cancelMallOrder, confirmMallOrderReceive, getMallOrderList } from '@/api/mobile/mall'

type OrderItem = Record<string, any>

type OrderAction = {
  key: string
  label: string
  type: 'ghost' | 'dark' | 'warn'
}

const STATUS_PENDING_PAY = '101'
const STATUS_CANCELLED = '102'
const STATUS_PENDING_DELIVERY = '201'
const STATUS_PENDING_RECEIVE = '301'
const STATUS_FINISHED = '401'
const STATUS_REFUNDED = '501'

const tabList = [
  { name: '全部' },
  { name: '待支付' },
  { name: '待发货' },
  { name: '待收货' },
  { name: '已完成' },
  { name: '已退款' }
]

const tabStatusList = ['', STATUS_PENDING_PAY, STATUS_PENDING_DELIVERY, STATUS_PENDING_RECEIVE, STATUS_FINISHED, STATUS_REFUNDED]
const currentTab = ref(0)
const orderList = ref<OrderItem[]>([])
const pageNum = ref(1)
const pageSize = 10
const loading = ref(false)
const finished = ref(false)

function formatMoney(value?: number | string) {
  return `￥${(Number(value) || 0).toFixed(2)}`
}

function formatDateTime(value?: string) {
  return value ? String(value).replace('T', ' ').slice(0, 16) : '暂无时间'
}

function getCover(item: OrderItem) {
  return String(item.goodsGalleryUrls || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)[0] || '/static/images/profile.jpg'
}

function getStatusText(status?: string) {
  const map: Record<string, string> = {
    [STATUS_PENDING_PAY]: '待支付',
    [STATUS_CANCELLED]: '已取消',
    [STATUS_PENDING_DELIVERY]: '待发货',
    [STATUS_PENDING_RECEIVE]: '待收货',
    [STATUS_FINISHED]: '已完成',
    [STATUS_REFUNDED]: '已退款'
  }
  return map[String(status || '')] || '处理中'
}

function getStatusTheme(status?: string) {
  const map: Record<string, string> = {
    [STATUS_PENDING_PAY]: 'warning',
    [STATUS_CANCELLED]: 'muted',
    [STATUS_PENDING_DELIVERY]: 'brand',
    [STATUS_PENDING_RECEIVE]: 'success',
    [STATUS_FINISHED]: 'dark',
    [STATUS_REFUNDED]: 'soft'
  }
  return map[String(status || '')] || 'brand'
}

function getStatusHint(item: OrderItem) {
  if (item.orderStatus === STATUS_PENDING_PAY && item.payExpireTime) {
    return `支付截止 ${formatDateTime(item.payExpireTime)}`
  }
  if (item.orderStatus === STATUS_PENDING_RECEIVE && item.receiveExpireTime) {
    return `最晚收货 ${formatDateTime(item.receiveExpireTime)}`
  }
  if (item.orderStatus === STATUS_REFUNDED && item.refundTime) {
    return `退款时间 ${formatDateTime(item.refundTime)}`
  }
  return ''
}

function getPaymentLabel(payType?: string) {
  const map: Record<string, string> = {
    balance: '余额支付',
    wechat: '微信支付',
    alipay: '支付宝支付'
  }
  if (!payType) {
    return '待支付'
  }
  return map[String(payType)] || payType
}

function getActions(item: OrderItem): OrderAction[] {
  const status = String(item.orderStatus || '')
  if (status === STATUS_PENDING_PAY) {
    return [
      { key: 'detail', label: '查看详情', type: 'ghost' },
      { key: 'cancel', label: '取消订单', type: 'warn' },
      { key: 'pay', label: '继续支付', type: 'dark' }
    ]
  }
  if (status === STATUS_PENDING_DELIVERY) {
    return [
      { key: 'detail', label: '订单详情', type: 'ghost' },
      { key: 'contact', label: '联系商家', type: 'dark' }
    ]
  }
  if (status === STATUS_PENDING_RECEIVE) {
    return [
      { key: 'voucher', label: '查看凭证', type: 'ghost' },
      { key: 'receive', label: '确认收货', type: 'dark' }
    ]
  }
  if (status === STATUS_FINISHED) {
    return [
      { key: 'detail', label: '查看详情', type: 'ghost' },
      { key: 'copy', label: '复制单号', type: 'dark' }
    ]
  }
  if (status === STATUS_REFUNDED) {
    return [
      { key: 'detail', label: '退款详情', type: 'ghost' },
      { key: 'copy', label: '复制单号', type: 'dark' }
    ]
  }
  return [
    { key: 'detail', label: '查看详情', type: 'ghost' },
    { key: 'copy', label: '复制单号', type: 'dark' }
  ]
}

async function loadOrders(refresh = false) {
  if (loading.value || (!refresh && finished.value)) return
  loading.value = true
  try {
    const targetPage = refresh ? 1 : pageNum.value
    const res = await getMallOrderList({
      pageNum: targetPage,
      pageSize,
      orderStatus: tabStatusList[currentTab.value] || undefined
    })
    const rows = Array.isArray(res.rows) ? res.rows : []
    orderList.value = refresh ? rows : [...orderList.value, ...rows]
    finished.value = rows.length < pageSize
    pageNum.value = targetPage + 1
  } catch (error) {
    console.error('加载订单失败', error)
    uni.showToast({ title: '订单加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function onTabChange(event: Record<string, any>) {
  const index = event?.index ?? 0
  if (currentTab.value === index) return
  currentTab.value = index
  pageNum.value = 1
  finished.value = false
  loadOrders(true)
}

function goOrderDetail(item: OrderItem) {
  uni.navigateTo({ url: `/pages_mall/pages/order/detail?id=${item.id}` })
}

function goBack() {
  uni.navigateBack()
}

async function handleAction(action: OrderAction, item: OrderItem) {
  if (action.key === 'detail' || action.key === 'voucher') {
    goOrderDetail(item)
    return
  }

  if (action.key === 'copy') {
    uni.setClipboardData({
      data: String(item.orderSn || item.id || ''),
      success: () => uni.showToast({ title: '订单号已复制', icon: 'none' })
    })
    return
  }

  if (action.key === 'contact') {
    uni.showToast({ title: '请在订单详情中查看商家信息', icon: 'none' })
    return
  }

  if (action.key === 'pay') {
    uni.showToast({ title: '支付能力正在接入中', icon: 'none' })
    return
  }

  if (action.key === 'cancel') {
    const confirmRes = await uni.showModal({
      title: '取消订单',
      content: '确认取消这笔订单吗？未支付订单取消后不可恢复。'
    })
    if (!confirmRes.confirm) return
    try {
      await cancelMallOrder(item.id)
      uni.showToast({ title: '订单已取消', icon: 'none' })
      loadOrders(true)
    } catch (error) {
      console.error('取消订单失败', error)
    }
    return
  }

  if (action.key === 'receive') {
    const confirmRes = await uni.showModal({
      title: '确认收货',
      content: '确认服务或商品已完成交付吗？确认后订单将变为已完成。'
    })
    if (!confirmRes.confirm) return
    try {
      await confirmMallOrderReceive(item.id)
      uni.showToast({ title: '已确认收货', icon: 'none' })
      loadOrders(true)
    } catch (error) {
      console.error('确认收货失败', error)
    }
  }
}

onLoad((options) => {
  const tab = Number(options?.tab ?? 0)
  if (tab >= 0 && tab < tabList.length) {
    currentTab.value = tab
  }
  loadOrders(true)
})

onShow(() => {
  if (pageNum.value > 1 || orderList.value.length) {
    loadOrders(true)
  }
})
</script>

<style lang="scss" scoped>
.order-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.09), transparent 36%),
    linear-gradient(180deg, #f8fbff 0%, #f5f7fb 36%, #eef2f8 100%);
}

.tabs-box {
  padding: 16rpx 24rpx 0;
  background: rgba(255, 255, 255, 0.88);
}

.page-scroll {
  height: calc(100vh - 180rpx);
  padding: 20rpx 24rpx 0;
  box-sizing: border-box;
}

.state-box {
  min-height: 60vh;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  color: #6b7280;
  font-size: 24rpx;
  box-shadow: 0 18rpx 36rpx rgba(148, 163, 184, 0.12);
}

.state-box--empty {
  color: #9ca3af;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.order-card {
  position: relative;
  overflow: hidden;
  padding: 24rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18rpx 36rpx rgba(148, 163, 184, 0.16);
}

.order-card__glow {
  position: absolute;
  top: -60rpx;
  right: -20rpx;
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 72%);
  pointer-events: none;
}

.order-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.order-head__meta {
  flex: 1;
  min-width: 0;
}

.order-sn {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #111827;
}

.order-time {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #6b7280;
}

.status-badge {
  flex-shrink: 0;
  padding: 12rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.status-badge--warning {
  color: #b45309;
  background: #fef3c7;
}

.status-badge--muted {
  color: #6b7280;
  background: #f3f4f6;
}

.status-badge--brand {
  color: #1d4ed8;
  background: #dbeafe;
}

.status-badge--success {
  color: #047857;
  background: #d1fae5;
}

.status-badge--dark {
  color: #111827;
  background: #e5e7eb;
}

.status-badge--soft {
  color: #7c3aed;
  background: #ede9fe;
}

.order-body {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 18rpx;
  margin-top: 20rpx;
}

.order-cover {
  width: 156rpx;
  height: 156rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
  background: #f3f4f6;
}

.order-main {
  flex: 1;
  min-width: 0;
}

.order-name {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 28rpx;
  line-height: 1.45;
  font-weight: 700;
  color: #111827;
}

.order-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.55;
  color: #6b7280;
}

.order-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 14rpx;
}

.mini-tag {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: #eff6ff;
  color: #2563eb;
  font-size: 20rpx;
  font-weight: 600;
}

.mini-tag--soft {
  background: #f3f4f6;
  color: #6b7280;
}

.order-foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12rpx;
  margin-top: 20rpx;
}

.order-price-label {
  display: block;
  font-size: 20rpx;
  color: #9ca3af;
}

.order-price {
  display: block;
  margin-top: 6rpx;
  font-size: 34rpx;
  line-height: 1;
  font-weight: 800;
  color: #ef4444;
}

.order-arrow {
  font-size: 22rpx;
  color: #6b7280;
}

.action-row {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12rpx;
  margin-top: 22rpx;
}

.action-btn {
  min-width: 152rpx;
  padding: 14rpx 24rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 23rpx;
  font-weight: 700;
}

.action-btn--ghost {
  background: #f3f4f6;
  color: #374151;
}

.action-btn--dark {
  background: #111827;
  color: #ffffff;
}

.action-btn--warn {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.footer-tip {
  padding: 14rpx 0 10rpx;
  text-align: center;
  font-size: 22rpx;
  color: #9ca3af;
}
</style>
