<template>
  <view class="page">
    <view class="hero">
      <text class="level-tag">{{ member.levelName || '会员' }}</text>
      <text class="hero-title">每日签到</text>
      <text class="hero-sub">签到可获得积分与成长值，提升会员等级</text>
      <view class="stats">
        <view class="stat">
          <text class="n">{{ member.points ?? 0 }}</text>
          <text class="l">当前积分</text>
        </view>
        <view class="stat">
          <text class="n">{{ member.growthValue ?? 0 }}</text>
          <text class="l">成长值</text>
        </view>
      </view>
      <u-button
        class="checkin-btn"
        :type="signed ? 'info' : 'primary'"
        :disabled="signed"
        @click="doCheckin"
      >
        {{ signed ? '今日已签到' : '立即签到' }}
      </u-button>
    </view>

    <view class="section-title">会员等级说明</view>
    <view class="level-list">
      <view v-for="lv in levels" :key="lv.id" class="level-row">
        <view class="level-name">{{ lv.levelName }}</view>
        <view class="level-meta">
          <text v-if="lv.requiredGrowth != null">升级需 {{ lv.requiredGrowth }} 成长值</text>
          <text v-else class="muted">—</text>
        </view>
      </view>
      <view v-if="!levels.length && !loading" class="empty">暂无等级配置</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMemberInfo, getLevelList, checkin, getCheckinStatus } from '@/api/mobile/member'

const member = ref({})
const levels = ref([])
const signed = ref(false)
const loading = ref(false)

const load = async () => {
  loading.value = true
  try {
    const [infoRes, levelRes, signRes] = await Promise.all([
      getMemberInfo().catch(() => ({ data: null })),
      getLevelList().catch(() => ({ data: [] })),
      getCheckinStatus().catch(() => ({ data: false }))
    ])
    if (infoRes.data) member.value = infoRes.data
    levels.value = levelRes.data || []
    signed.value = !!signRes.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const doCheckin = async () => {
  if (signed.value) return
  try {
    await checkin()
    uni.showToast({ title: '签到成功', icon: 'success' })
    await load()
  } catch (e) {
    console.error(e)
  }
}

onShow(() => {
  load()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 48rpx;
}

.hero {
  margin: 24rpx;
  padding: 40rpx 32rpx 48rpx;
  background: linear-gradient(160deg, #2c5f5d 0%, #14302f 100%);
  border-radius: 20rpx;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.level-tag {
  font-size: 24rpx;
  padding: 6rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  margin-bottom: 16rpx;
}

.hero-title {
  font-size: 40rpx;
  font-weight: bold;
}

.hero-sub {
  margin-top: 12rpx;
  font-size: 24rpx;
  opacity: 0.85;
  text-align: center;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 80rpx;
  margin-top: 40rpx;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  .n {
    font-size: 36rpx;
    font-weight: bold;
  }
  .l {
    margin-top: 8rpx;
    font-size: 24rpx;
    opacity: 0.85;
  }
}

.section-title {
  padding: 24rpx 32rpx 12rpx;
  font-size: 28rpx;
  color: #666;
}

.level-list {
  margin: 0 24rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.level-row {
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  &:last-child {
    border-bottom: none;
  }
}

.level-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.level-meta {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.muted {
  color: #ccc;
}

.empty {
  padding: 48rpx;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}

.checkin-btn {
  margin-top: 24rpx;
  width: 80% !important;
}
</style>
