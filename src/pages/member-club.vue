<template>
  <view class="club-page">
    <u-navbar :fixed="true" :placeholder="true" :safe-area-inset-top="true" bg-color="transparent" left-icon="arrow-left" left-icon-color="#1a241f" title="会员俱乐部" title-style="color: #1a241f; font-weight: 700;" @leftClick="goBack" />
    <scroll-view class="page-scroll" scroll-y>
      <view class="club-shell">
        <view class="club-hero">
          <text class="club-hero__eyebrow">MEMBER CLUB</text>
          <text class="club-hero__title">电竞会员体系</text>
          <text class="club-hero__desc">把折扣、优先匹配、专属客服、复盘和成长值体系整合成真正可运营的会员系统。</text>
        </view>
        <view class="tier-list">
          <view v-for="tier in tiers" :key="tier.id" class="tier-card" :class="{ 'tier-card--active': activeTier === tier.id }" @tap="activeTier = tier.id">
            <view class="tier-card__head">
              <text class="tier-card__name">{{ tier.name }}</text>
              <text class="tier-card__price">¥{{ tier.price }}/月</text>
            </view>
            <text class="tier-card__desc">{{ tier.desc }}</text>
            <view class="tier-card__chips">
              <text v-for="item in tier.core" :key="item" class="tier-card__chip">{{ item }}</text>
            </view>
          </view>
        </view>
        <view class="panel">
          <view class="panel-head"><text class="panel-title">当前等级权益</text></view>
          <view class="benefit-list">
            <view v-for="item in currentTier.benefits" :key="item.title" class="benefit-item">
              <view class="benefit-item__icon">
                <u-icon :name="item.icon" color="#b2ff74" size="18" />
              </view>
              <view class="benefit-item__body">
                <text class="benefit-item__title">{{ item.title }}</text>
                <text class="benefit-item__desc">{{ item.desc }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="panel panel--light">
          <view class="panel-head"><text class="panel-title">成长玩法</text></view>
          <view class="growth-list">
            <view class="growth-item">
              <text class="growth-item__title">签到成长</text>
              <text class="growth-item__desc">每日签到领取积分与成长值，推动会员升级。</text>
            </view>
            <view class="growth-item">
              <text class="growth-item__title">消费成长</text>
              <text class="growth-item__desc">下单护航、复盘和陪练服务，叠加成长值更直接。</text>
            </view>
            <view class="growth-item">
              <text class="growth-item__title">活跃成长</text>
              <text class="growth-item__desc">参与社区互动、分享战绩或评价订单也能获取奖励。</text>
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

const activeTier = ref(2)
const tiers = [
  { id: 1, name: '青铜会员', price: '19', desc: '适合轻度用户，先享受折扣和签到成长。', core: ['基础折扣', '签到加成'], benefits: [{ icon: 'coupon-fill', title: '会员折扣', desc: '下单享基础折扣，部分活动可提前参与。' }, { icon: 'calendar-fill', title: '签到加成', desc: '每日签到额外获得成长值。' }] },
  { id: 2, name: '白银会员', price: '49', desc: '适合高频上分用户，强调优先匹配和客服响应。', core: ['优先排队', '专属客服', '护航折扣'], benefits: [{ icon: 'clock-fill', title: '优先匹配', desc: '高峰期优先分配在线大神与车队。' }, { icon: 'server-fill', title: '专属客服', desc: '订单异常和改期需求可快速跟进。' }, { icon: 'gift-fill', title: '护航折扣', desc: '部分高频业务享专属价和会员礼包。' }] },
  { id: 3, name: '黑金会员', price: '99', desc: '适合核心用户，强调专属感、复盘服务和定制方案。', core: ['复盘服务', '定制车队', '更高返积分'], benefits: [{ icon: 'bookmark-fill', title: '战术复盘', desc: '下单后可领取简版战术建议或复盘记录。' }, { icon: 'account-fill', title: '定制匹配', desc: '可根据打法和沟通风格匹配更适合的选手。' }, { icon: 'integral-fill', title: '返积分更高', desc: '消费返还积分和成长值比例更高。' }] }
]
const currentTier = computed(() => tiers.find((item) => item.id === activeTier.value) || tiers[0])

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.club-page { min-height: 100vh; background: #eff2f0; }
.page-scroll { min-height: 100vh; }
.club-shell { padding: 16rpx 24rpx 32rpx; }
.club-hero { padding: 30rpx; border-radius: 32rpx; background: linear-gradient(135deg, #1b2621 0%, #37463f 100%); }
.club-hero__eyebrow { display: block; font-size: 20rpx; letter-spacing: 4rpx; color: rgba(232, 245, 236, 0.62); }
.club-hero__title { display: block; margin-top: 14rpx; font-size: 42rpx; font-weight: 800; color: #ffffff; }
.club-hero__desc { display: block; margin-top: 14rpx; font-size: 23rpx; line-height: 1.65; color: rgba(236, 244, 239, 0.72); }
.tier-list { display: flex; flex-direction: column; gap: 16rpx; margin-top: 20rpx; }
.tier-card { padding: 22rpx; border-radius: 28rpx; background: #ffffff; box-shadow: 0 18rpx 40rpx rgba(39, 48, 42, 0.08); }
.tier-card--active { background: linear-gradient(135deg, #e7ffba 0%, #f4ffd8 100%); }
.tier-card__head { display: flex; justify-content: space-between; gap: 16rpx; }
.tier-card__name { font-size: 30rpx; font-weight: 800; color: #1a241f; }
.tier-card__price { font-size: 26rpx; color: #ff653c; font-weight: 700; }
.tier-card__desc { display: block; margin-top: 10rpx; font-size: 22rpx; line-height: 1.6; color: #6c7a74; }
.tier-card__chips { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 14rpx; }
.tier-card__chip { padding: 8rpx 14rpx; border-radius: 999rpx; background: rgba(24, 34, 28, 0.06); color: #5d6a64; font-size: 20rpx; }
.panel { margin-top: 20rpx; padding: 24rpx; border-radius: 30rpx; background: linear-gradient(135deg, #1b2621 0%, #314039 100%); }
.panel--light { background: #ffffff; box-shadow: 0 18rpx 40rpx rgba(39, 48, 42, 0.08); }
.panel--light .panel-title { color: #1a241f; }
.panel-head { margin-bottom: 16rpx; }
.panel-title { font-size: 30rpx; font-weight: 800; color: #ffffff; }
.benefit-list, .growth-list { display: flex; flex-direction: column; gap: 14rpx; }
.benefit-item { display: flex; gap: 14rpx; align-items: flex-start; padding: 18rpx; border-radius: 22rpx; background: rgba(255, 255, 255, 0.08); }
.benefit-item__icon { width: 56rpx; height: 56rpx; border-radius: 18rpx; background: rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.benefit-item__body { flex: 1; }
.benefit-item__title { display: block; font-size: 25rpx; font-weight: 700; color: #ffffff; }
.benefit-item__desc { display: block; margin-top: 8rpx; font-size: 21rpx; line-height: 1.6; color: rgba(235, 244, 239, 0.7); }
.growth-item { padding: 18rpx 20rpx; border-radius: 22rpx; background: #f5f7f6; }
.growth-item__title { display: block; font-size: 25rpx; font-weight: 700; color: #1a241f; }
.growth-item__desc { display: block; margin-top: 8rpx; font-size: 21rpx; line-height: 1.6; color: #6f7c76; }
</style>
