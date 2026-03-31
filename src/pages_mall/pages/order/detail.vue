<template>
  <view class="order-detail-page">
    <u-navbar
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      bg-color="#ffffff"
      left-icon="arrow-left"
      left-icon-color="#111827"
      title="订单详情"
      title-style="color: #111827; font-weight: 700;"
      @leftClick="goBack"
    />

    <scroll-view class="page-scroll" scroll-y>
      <view v-if="loading" class="state-box">
        <u-loading-icon color="#3b82f6" size="24" />
        <text>正在加载订单详情...</text>
      </view>

      <view v-else-if="!detail.id" class="state-box state-box--empty">
        <u-icon name="file-text" color="#9ca3af" size="28" />
        <text>未获取到订单详情</text>
      </view>

      <view v-else class="content-shell">
        <view class="hero-card">
          <view class="hero-card__top">
            <view>
              <text class="hero-card__title">{{ getStatusText(detail.orderStatus) }}</text>
              <text class="hero-card__desc">{{ getStatusDescription(detail) }}</text>
            </view>
            <view class="hero-card__badge">{{ getPaymentLabel(detail.payType) }}</view>
          </view>

          <view class="hero-card__meta">
            <view class="hero-meta-item">
              <text class="hero-meta-item__label">订单编号</text>
              <text class="hero-meta-item__value">{{ detail.orderSn || detail.id }}</text>
            </view>
            <view class="hero-meta-item">
              <text class="hero-meta-item__label">下单时间</text>
              <text class="hero-meta-item__value">{{ formatDateTime(detail.createTime) }}</text>
            </view>
          </view>
        </view>

        <view class="panel">
          <view class="panel-title">商品信息</view>
          <view class="goods-row">
            <image class="goods-cover" :src="getCover(detail)" mode="aspectFill" />
            <view class="goods-main">
              <text class="goods-name">{{ detail.goodsName || '商城订单' }}</text>
              <text class="goods-meta">服务区域：{{ detail.serviceRegions || '未填写' }}</text>
              <text class="goods-meta">服务标签：{{ detail.serviceTags || '未填写' }}</text>
              <view class="goods-price-row">
                <text class="goods-price">{{ formatMoney(detail.payAmount || detail.price) }}</text>
                <text class="goods-status">{{ getStatusText(detail.orderStatus) }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="panel">
          <view class="panel-title">金额与进度</view>
          <view class="amount-grid">
            <view class="amount-card">
              <text class="amount-card__label">订单金额</text>
              <text class="amount-card__value">{{ formatMoney(detail.price) }}</text>
            </view>
            <view class="amount-card">
              <text class="amount-card__label">实付金额</text>
              <text class="amount-card__value amount-card__value--accent">{{ formatMoney(detail.payAmount || detail.price) }}</text>
            </view>
            <view class="amount-card" v-if="Number(detail.refundAmount || 0) > 0">
              <text class="amount-card__label">退款金额</text>
              <text class="amount-card__value">{{ formatMoney(detail.refundAmount) }}</text>
            </view>
            <view class="amount-card">
              <text class="amount-card__label">当前状态</text>
              <text class="amount-card__value">{{ getStatusText(detail.orderStatus) }}</text>
            </view>
          </view>
        </view>

        <view class="panel">
          <view class="panel-title">时间节点</view>
          <view class="timeline">
            <view class="timeline-item">
              <text class="timeline-item__label">下单时间</text>
              <text class="timeline-item__value">{{ formatDateTime(detail.createTime) }}</text>
            </view>
            <view class="timeline-item">
              <text class="timeline-item__label">支付时间</text>
              <text class="timeline-item__value">{{ formatDateTime(detail.payTime) }}</text>
            </view>
            <view class="timeline-item">
              <text class="timeline-item__label">发货时间</text>
              <text class="timeline-item__value">{{ formatDateTime(detail.deliveryTime) }}</text>
            </view>
            <view class="timeline-item">
              <text class="timeline-item__label">确认收货</text>
              <text class="timeline-item__value">{{ formatDateTime(detail.finishTime) }}</text>
            </view>
            <view class="timeline-item" v-if="detail.payExpireTime">
              <text class="timeline-item__label">支付截止</text>
              <text class="timeline-item__value">{{ formatDateTime(detail.payExpireTime) }}</text>
            </view>
            <view class="timeline-item" v-if="detail.receiveExpireTime">
              <text class="timeline-item__label">最晚收货</text>
              <text class="timeline-item__value">{{ formatDateTime(detail.receiveExpireTime) }}</text>
            </view>
            <view class="timeline-item" v-if="detail.cancelTime">
              <text class="timeline-item__label">取消时间</text>
              <text class="timeline-item__value">{{ formatDateTime(detail.cancelTime) }}</text>
            </view>
            <view class="timeline-item" v-if="detail.refundTime">
              <text class="timeline-item__label">退款完成</text>
              <text class="timeline-item__value">{{ formatDateTime(detail.refundTime) }}</text>
            </view>
          </view>
        </view>

        <view class="panel" v-if="hasDeliveryVoucher(detail)">
          <view class="panel-title">交付凭证</view>
          <view class="voucher-box">
            <text v-if="detail.deliveryVoucherText" class="voucher-text">{{ detail.deliveryVoucherText }}</text>
            <view v-if="deliveryImages.length" class="voucher-gallery">
              <image
                v-for="(url, index) in deliveryImages"
                :key="`${url}-${index}`"
                class="voucher-image"
                :src="url"
                mode="aspectFill"
                @tap="previewVoucher(index)"
              />
            </view>
          </view>
        </view>

        <view class="panel">
          <view class="panel-title">备注与售后</view>
          <view class="remark-box">
            <view class="remark-item">
              <text class="remark-item__label">买家备注</text>
              <text class="remark-item__value">{{ detail.buyerRemark || '暂无' }}</text>
            </view>
            <view class="remark-item">
              <text class="remark-item__label">商家备注</text>
              <text class="remark-item__value">{{ detail.sellerRemark || '暂无' }}</text>
            </view>
            <view class="remark-item" v-if="detail.adminRemark">
              <text class="remark-item__label">系统备注</text>
              <text class="remark-item__value">{{ detail.adminRemark }}</text>
            </view>
            <view class="remark-item" v-if="detail.refundRemark || detail.refundStatus">
              <text class="remark-item__label">退款信息</text>
              <text class="remark-item__value">{{ getRefundText(detail) }}</text>
            </view>
            <view class="remark-item" v-if="detail.complaintContent || detail.complaintStatus">
              <text class="remark-item__label">投诉信息</text>
              <text class="remark-item__value">{{ getComplaintText(detail) }}</text>
            </view>
          </view>
        </view>
      </view>

      <SafeArea position="bottom" background-color="#f5f7fb" />
    </scroll-view>

    <view v-if="detail.id && detailActions.length" class="bottom-actions">
      <view
        v-for="action in detailActions"
        :key="action.key"
        class="bottom-actions__btn"
        :class="{
          'bottom-actions__btn--ghost': action.type === 'ghost',
          'bottom-actions__btn--dark': action.type === 'dark',
          'bottom-actions__btn--warn': action.type === 'warn'
        }"
        @tap="handleAction(action)"
      >
        {{ action.label }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { cancelMallOrder, confirmMallOrderReceive, getMallOrderDetail } from '@/api/mobile/mall'

type DetailAction = {
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

const detail = ref<Record<string, any>>({})
const loading = ref(false)

const deliveryImages = computed(() =>
  String(detail.value.deliveryVoucherUrls || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
)

const detailActions = computed<DetailAction[]>(() => {
  const status = String(detail.value.orderStatus || '')
  if (status === STATUS_PENDING_PAY) {
    return [
      { key: 'copy', label: '复制单号', type: 'ghost' },
      { key: 'cancel', label: '取消订单', type: 'warn' },
      { key: 'pay', label: '继续支付', type: 'dark' }
    ]
  }
  if (status === STATUS_PENDING_DELIVERY) {
    return [
      { key: 'copy', label: '复制单号', type: 'ghost' },
      { key: 'contact', label: '联系商家', type: 'dark' }
    ]
  }
  if (status === STATUS_PENDING_RECEIVE) {
    return [
      { key: 'voucher', label: '查看凭证', type: 'ghost' },
      { key: 'receive', label: '确认收货', type: 'dark' }
    ]
  }
  return [{ key: 'copy', label: '复制单号', type: 'ghost' }]
})

function formatMoney(value?: number | string) {
  return `￥${(Number(value) || 0).toFixed(2)}`
}

function formatDateTime(value?: string) {
  return value ? String(value).replace('T', ' ').slice(0, 16) : '暂无'
}

function getCover(item: Record<string, any>) {
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

function getStatusDescription(item: Record<string, any>) {
  const status = String(item.orderStatus || '')
  if (status === STATUS_PENDING_PAY) {
    return item.payExpireTime ? `请在 ${formatDateTime(item.payExpireTime)} 前完成支付。` : '订单已创建，请尽快完成支付。'
  }
  if (status === STATUS_PENDING_DELIVERY) {
    return '订单已支付，正在等待商家处理和发货。'
  }
  if (status === STATUS_PENDING_RECEIVE) {
    return item.receiveExpireTime ? `商家已完成交付，请在 ${formatDateTime(item.receiveExpireTime)} 前确认收货。` : '商家已完成交付，请及时确认收货。'
  }
  if (status === STATUS_FINISHED) {
    return '订单已完成，相关款项与消息通知已同步处理。'
  }
  if (status === STATUS_REFUNDED) {
    return '该订单退款已处理完成，请留意账户变动。'
  }
  if (status === STATUS_CANCELLED) {
    return '订单已取消，如需继续购买可重新下单。'
  }
  return '订单正在处理中，请稍后查看最新进度。'
}

function getPaymentLabel(payType?: string) {
  const map: Record<string, string> = {
    balance: '余额支付',
    wechat: '微信支付',
    alipay: '支付宝支付'
  }
  if (!payType) {
    return '未支付'
  }
  return map[String(payType)] || payType
}

function getRefundStatusText(status?: string) {
  const map: Record<string, string> = {
    '0': '未申请退款',
    '1': '退款待审核',
    '2': '退款已通过',
    '3': '退款已驳回'
  }
  return map[String(status || '')] || '退款处理中'
}

function getComplaintStatusText(status?: string) {
  const map: Record<string, string> = {
    '0': '未发起投诉',
    '1': '投诉处理中',
    '2': '投诉已处理'
  }
  return map[String(status || '')] || '投诉处理中'
}

function getRefundText(item: Record<string, any>) {
  const base = getRefundStatusText(item.refundStatus)
  const remark = item.refundRemark ? `；说明：${item.refundRemark}` : ''
  const audit = item.refundAuditRemark ? `；审核备注：${item.refundAuditRemark}` : ''
  return `${base}${remark}${audit}`
}

function getComplaintText(item: Record<string, any>) {
  const base = getComplaintStatusText(item.complaintStatus)
  const content = item.complaintContent ? `；内容：${item.complaintContent}` : ''
  const handle = item.complaintHandleRemark ? `；处理结果：${item.complaintHandleRemark}` : ''
  return `${base}${content}${handle}`
}

function hasDeliveryVoucher(item: Record<string, any>) {
  return Boolean(item.deliveryVoucherText || deliveryImages.value.length)
}

async function loadDetail(id?: string) {
  if (!id) return
  loading.value = true
  try {
    const res = await getMallOrderDetail(id)
    detail.value = res.data || {}
  } catch (error) {
    console.error('加载订单详情失败', error)
    uni.showToast({ title: '订单详情加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function previewVoucher(index: number) {
  if (!deliveryImages.value.length) return
  uni.previewImage({
    current: deliveryImages.value[index],
    urls: deliveryImages.value
  })
}

function goBack() {
  uni.navigateBack()
}

async function handleAction(action: DetailAction) {
  if (!detail.value.id) return

  if (action.key === 'copy') {
    uni.setClipboardData({
      data: String(detail.value.orderSn || detail.value.id || ''),
      success: () => uni.showToast({ title: '订单号已复制', icon: 'none' })
    })
    return
  }

  if (action.key === 'voucher') {
    if (deliveryImages.value.length) {
      previewVoucher(0)
    } else {
      uni.showToast({ title: '暂无交付凭证', icon: 'none' })
    }
    return
  }

  if (action.key === 'contact') {
    uni.showToast({ title: '请在平台消息中联系商家', icon: 'none' })
    return
  }

  if (action.key === 'pay') {
    uni.showToast({ title: '支付能力正在接入中', icon: 'none' })
    return
  }

  if (action.key === 'cancel') {
    const confirmRes = await uni.showModal({
      title: '取消订单',
      content: '确认取消这笔订单吗？'
    })
    if (!confirmRes.confirm) return
    try {
      await cancelMallOrder(detail.value.id)
      uni.showToast({ title: '订单已取消', icon: 'none' })
      loadDetail(String(detail.value.id))
    } catch (error) {
      console.error('取消订单失败', error)
    }
    return
  }

  if (action.key === 'receive') {
    const confirmRes = await uni.showModal({
      title: '确认收货',
      content: '确认当前订单已经完成交付吗？'
    })
    if (!confirmRes.confirm) return
    try {
      await confirmMallOrderReceive(detail.value.id)
      uni.showToast({ title: '确认收货成功', icon: 'none' })
      loadDetail(String(detail.value.id))
    } catch (error) {
      console.error('确认收货失败', error)
    }
  }
}

onLoad((options) => {
  loadDetail(String(options?.id || ''))
})
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 34%),
    linear-gradient(180deg, #f8fbff 0%, #f5f7fb 34%, #eef2f8 100%);
}

.page-scroll {
  min-height: calc(100vh - 88rpx);
  padding-bottom: 180rpx;
  box-sizing: border-box;
}

.state-box {
  min-height: 60vh;
  margin: 20rpx 24rpx 0;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.94);
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

.content-shell {
  padding: 20rpx 24rpx 28rpx;
}

.hero-card {
  padding: 28rpx 24rpx;
  border-radius: 32rpx;
  background:
    radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.16), transparent 32%),
    linear-gradient(135deg, #111827 0%, #1f2937 55%, #334155 100%);
  color: #ffffff;
  box-shadow: 0 22rpx 42rpx rgba(15, 23, 42, 0.18);
}

.hero-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.hero-card__title {
  display: block;
  font-size: 36rpx;
  font-weight: 800;
}

.hero-card__desc {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.78);
}

.hero-card__badge {
  flex-shrink: 0;
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.14);
  font-size: 21rpx;
  font-weight: 700;
}

.hero-card__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 24rpx;
}

.hero-meta-item {
  padding: 18rpx 18rpx 16rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.08);
}

.hero-meta-item__label {
  display: block;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.64);
}

.hero-meta-item__value {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.45;
  font-weight: 700;
  word-break: break-all;
}

.panel {
  margin-top: 18rpx;
  padding: 24rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18rpx 36rpx rgba(148, 163, 184, 0.14);
}

.panel-title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  font-weight: 800;
  color: #111827;
}

.goods-row {
  display: flex;
  gap: 18rpx;
}

.goods-cover {
  width: 156rpx;
  height: 156rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
  background: #f3f4f6;
}

.goods-main {
  flex: 1;
  min-width: 0;
}

.goods-name {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 28rpx;
  line-height: 1.5;
  font-weight: 700;
  color: #111827;
}

.goods-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.55;
  color: #6b7280;
}

.goods-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-top: 18rpx;
}

.goods-price {
  font-size: 34rpx;
  font-weight: 800;
  color: #ef4444;
}

.goods-status {
  font-size: 22rpx;
  color: #2563eb;
  font-weight: 700;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.amount-card {
  padding: 20rpx;
  border-radius: 24rpx;
  background: #f8fafc;
}

.amount-card__label {
  display: block;
  font-size: 21rpx;
  color: #6b7280;
}

.amount-card__value {
  display: block;
  margin-top: 10rpx;
  font-size: 28rpx;
  font-weight: 800;
  color: #111827;
}

.amount-card__value--accent {
  color: #ef4444;
}

.timeline {
  display: grid;
  gap: 12rpx;
}

.timeline-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  background: #f8fafc;
}

.timeline-item__label {
  font-size: 22rpx;
  color: #6b7280;
}

.timeline-item__value {
  flex: 1;
  text-align: right;
  font-size: 23rpx;
  line-height: 1.5;
  color: #111827;
  font-weight: 600;
}

.voucher-box {
  display: grid;
  gap: 14rpx;
}

.voucher-text {
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  background: #f8fafc;
  font-size: 23rpx;
  line-height: 1.7;
  color: #374151;
}

.voucher-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.voucher-image {
  width: 198rpx;
  height: 198rpx;
  border-radius: 22rpx;
  background: #f3f4f6;
}

.remark-box {
  display: grid;
  gap: 12rpx;
}

.remark-item {
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  background: #f8fafc;
}

.remark-item__label {
  display: block;
  font-size: 21rpx;
  color: #6b7280;
}

.remark-item__value {
  display: block;
  margin-top: 8rpx;
  font-size: 23rpx;
  line-height: 1.7;
  color: #374151;
}

.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  gap: 12rpx;
  padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -12rpx 32rpx rgba(148, 163, 184, 0.12);
  backdrop-filter: blur(16rpx);
}

.bottom-actions__btn {
  flex: 1;
  padding: 18rpx 16rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
}

.bottom-actions__btn--ghost {
  background: #f3f4f6;
  color: #374151;
}

.bottom-actions__btn--dark {
  background: #111827;
  color: #ffffff;
}

.bottom-actions__btn--warn {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}
</style>
