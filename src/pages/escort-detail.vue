<template>
  <view class="detail-page">
    <u-navbar :fixed="true" :placeholder="true" :safe-area-inset-top="true" bg-color="transparent" left-icon="arrow-left" left-icon-color="#1a241f" title="服务详情" title-style="color: #1a241f; font-weight: 700;" @leftClick="goBack" />
    <scroll-view class="page-scroll" scroll-y>
      <view class="detail-shell">
        <view class="cover-card">
          <text class="cover-card__eyebrow">TACTICAL SERVICE</text>
          <text class="cover-card__title">{{ title }}</text>
          <text class="cover-card__desc">适合想快速提升段位、稳定连胜，或者希望有人全程护航的用户。</text>
        </view>
        <view class="stats-grid">
          <view class="stat-box"><text class="stat-box__value">99.2%</text><text class="stat-box__label">近 30 日好评</text></view>
          <view class="stat-box"><text class="stat-box__value">12s</text><text class="stat-box__label">平均响应</text></view>
          <view class="stat-box"><text class="stat-box__value">4.9</text><text class="stat-box__label">服务评分</text></view>
        </view>
        <view class="panel">
          <view class="panel-head"><text class="panel-title">套餐选择</text></view>
          <view class="package-list">
            <view v-for="item in packages" :key="item.id" class="package-card" :class="{ 'package-card--active': selectedPackage === item.id }" @tap="selectedPackage = item.id">
              <view>
                <text class="package-card__title">{{ item.title }}</text>
                <text class="package-card__desc">{{ item.desc }}</text>
              </view>
              <view class="package-card__side">
                <text class="package-card__price">¥{{ item.price }}</text>
                <text class="package-card__unit">{{ item.unit }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="panel">
          <view class="panel-head"><text class="panel-title">服务承诺</text></view>
          <view class="promise-list">
            <view v-for="item in promises" :key="item.title" class="promise-item">
              <u-icon :name="item.icon" color="#6fd08c" size="18" />
              <view class="promise-item__body">
                <text class="promise-item__title">{{ item.title }}</text>
                <text class="promise-item__desc">{{ item.desc }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="panel">
          <view class="panel-head"><text class="panel-title">适合人群</text></view>
          <view class="audience-list">
            <text v-for="item in audienceList" :key="item" class="audience-tag">{{ item }}</text>
          </view>
        </view>
      </view>
      <SafeArea position="bottom" background-color="#eff2f0" />
    </scroll-view>
    <view class="bottom-bar">
      <view class="bottom-bar__price">
        <text class="bottom-bar__label">到手价</text>
        <text class="bottom-bar__value">¥{{ currentPackage.price }}</text>
      </view>
      <view class="bottom-bar__actions">
        <view class="ghost-btn">咨询客服</view>
        <view class="primary-btn">立即下单</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const title = ref('高分护航服务')
const selectedPackage = ref(1)
const packages = [
  { id: 1, title: '标准护航包', desc: '适合日常上分和稳定连胜，支持语音沟通。', price: '128', unit: '/局起' },
  { id: 2, title: '加急冲分包', desc: '优先排期，适合周末冲分和限时活动冲榜。', price: '188', unit: '/套' },
  { id: 3, title: '会员尊享包', desc: '享会员折扣、专属客服和复盘建议。', price: '228', unit: '/套' }
]
const promises = [
  { icon: 'shield-fill', title: '账号安全优先', desc: '全程留痕，异常可仲裁，支持服务轨迹留档。' },
  { icon: 'clock-fill', title: '响应速度快', desc: '下单后优先匹配在线大神，节假日也可接单。' },
  { icon: 'checkmark-circle-fill', title: '服务透明', desc: '可查看套餐内容、服务时长和沟通风格说明。' }
]
const audienceList = ['想快速上分', '需要固定车队', '节日活动冲榜', '希望边打边学', '会员专属折扣用户']
const currentPackage = computed(() => packages.find((item) => item.id === selectedPackage.value) || packages[0])

onLoad((options) => {
  if (options?.title) title.value = decodeURIComponent(String(options.title))
})

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.detail-page { min-height: 100vh; background: #eff2f0; }
.page-scroll { min-height: 100vh; padding-bottom: 150rpx; }
.detail-shell { padding: 16rpx 24rpx 32rpx; }
.cover-card { padding: 30rpx; border-radius: 32rpx; background: linear-gradient(135deg, #1a241f 0%, #324038 100%); }
.cover-card__eyebrow { display: block; font-size: 20rpx; letter-spacing: 4rpx; color: rgba(229, 245, 234, 0.62); }
.cover-card__title { display: block; margin-top: 16rpx; font-size: 42rpx; line-height: 1.15; font-weight: 800; color: #ffffff; }
.cover-card__desc { display: block; margin-top: 14rpx; font-size: 23rpx; line-height: 1.65; color: rgba(236, 244, 239, 0.72); }
.stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14rpx; margin-top: 20rpx; }
.stat-box { padding: 20rpx 12rpx; border-radius: 24rpx; background: #f8faf8; text-align: center; }
.stat-box__value { display: block; font-size: 32rpx; font-weight: 800; color: #1b2621; }
.stat-box__label { display: block; margin-top: 8rpx; font-size: 20rpx; color: #78847e; }
.panel { margin-top: 20rpx; padding: 24rpx; border-radius: 30rpx; background: #ffffff; box-shadow: 0 18rpx 40rpx rgba(39, 48, 42, 0.08); }
.panel-head { margin-bottom: 16rpx; }
.panel-title { font-size: 30rpx; font-weight: 800; color: #1a241f; }
.package-list, .promise-list { display: flex; flex-direction: column; gap: 14rpx; }
.package-card { padding: 20rpx; border-radius: 24rpx; background: #f5f7f6; display: flex; justify-content: space-between; gap: 16rpx; }
.package-card--active { background: linear-gradient(135deg, #e4ffb2 0%, #f2ffd5 100%); }
.package-card__title { display: block; font-size: 27rpx; font-weight: 700; color: #1a241f; }
.package-card__desc { display: block; margin-top: 8rpx; font-size: 21rpx; line-height: 1.55; color: #6e7c75; }
.package-card__side { text-align: right; flex-shrink: 0; }
.package-card__price { display: block; font-size: 34rpx; font-weight: 800; color: #ff643b; }
.package-card__unit { display: block; margin-top: 6rpx; font-size: 19rpx; color: #86918d; }
.promise-item { display: flex; gap: 14rpx; align-items: flex-start; }
.promise-item__body { flex: 1; }
.promise-item__title { display: block; font-size: 25rpx; font-weight: 700; color: #1a241f; }
.promise-item__desc { display: block; margin-top: 8rpx; font-size: 21rpx; line-height: 1.6; color: #75817b; }
.audience-list { display: flex; flex-wrap: wrap; gap: 12rpx; }
.audience-tag { padding: 12rpx 18rpx; border-radius: 999rpx; background: #f5f7f6; color: #60706a; font-size: 22rpx; }
.bottom-bar { position: fixed; left: 0; right: 0; bottom: 0; padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom)); background: rgba(255, 255, 255, 0.94); display: flex; justify-content: space-between; gap: 18rpx; box-shadow: 0 -10rpx 30rpx rgba(38, 47, 41, 0.08); }
.bottom-bar__price { display: flex; flex-direction: column; justify-content: center; }
.bottom-bar__label { font-size: 20rpx; color: #84908a; }
.bottom-bar__value { margin-top: 4rpx; font-size: 38rpx; font-weight: 800; color: #ff643b; }
.bottom-bar__actions { display: flex; gap: 12rpx; }
.ghost-btn, .primary-btn { padding: 0 26rpx; border-radius: 999rpx; display: flex; align-items: center; justify-content: center; font-size: 22rpx; }
.ghost-btn { background: #f3f5f4; color: #1c2721; }
.primary-btn { background: #ff6a4d; color: #ffffff; }
</style>
