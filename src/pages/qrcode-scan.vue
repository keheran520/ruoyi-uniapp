<template>
  <view class="page">
    <view class="card">
      <u-icon name="scan" size="56" color="#2c5f5d" />
      <text class="title">扫码登录电脑端</text>
      <text class="desc">将摄像头对准 PC 管理后台「扫码登录」页面的二维码</text>
      <u-button type="primary" :loading="scanning" text="开始扫码" custom-style="margin-top: 32rpx; width: 100%;" @click="handleScan" />
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { getToken } from '@/utils/auth'
import store from '@/store'
import { scanQrCode, confirmQrCodeLogin, cancelQrCodeLogin } from '@/api/mobile/qrcodeLogin'

const scanning = ref(false)
let pendingToken = ''

const parseScanResult = (raw) => {
  try {
    const qrData = JSON.parse(raw)
    if (qrData.token) return qrData.token
  } catch {
    const m = raw.match(/token["\s:=]+([^"}\s]+)/)
    if (m) return m[1]
    if (raw.length > 20 && raw.length < 80) return raw
  }
  return ''
}

const handleScan = () => {
  const token = getToken() || store.state.user.token
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/login' }), 800)
    return
  }

  scanning.value = true
  uni.scanCode({
    onlyFromCamera: false,
    scanType: ['qrCode', 'barCode'],
    success: async (res) => {
      scanning.value = false
      const qrToken = parseScanResult(res.result || '')
      if (!qrToken) {
        uni.showToast({ title: '无效的登录二维码', icon: 'none' })
        return
      }
      pendingToken = qrToken
      try {
        uni.showLoading({ title: '验证中...' })
        const scanRes = await scanQrCode(qrToken)
        uni.hideLoading()
        if (scanRes.code !== 200) {
          uni.showToast({ title: scanRes.msg || '扫描失败', icon: 'none' })
          return
        }
        uni.showModal({
          title: '确认登录',
          content: '是否允许此电脑登录管理后台？',
          success: async (m) => {
            if (m.confirm) {
              try {
                uni.showLoading({ title: '确认中...' })
                const c = await confirmQrCodeLogin(pendingToken)
                uni.hideLoading()
                if (c.code === 200) {
                  uni.showToast({ title: '电脑端已登录', icon: 'success' })
                  pendingToken = ''
                } else {
                  uni.showToast({ title: c.msg || '确认失败', icon: 'none' })
                }
              } catch (e) {
                uni.hideLoading()
                uni.showToast({ title: '确认失败', icon: 'none' })
              }
            } else {
              try {
                await cancelQrCodeLogin(pendingToken)
              } catch {
                /* ignore */
              }
              pendingToken = ''
            }
          }
        })
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '网络错误', icon: 'none' })
      }
    },
    fail: (err) => {
      scanning.value = false
      if (err.errMsg && String(err.errMsg).includes('cancel')) return
      uni.showToast({ title: '扫码失败', icon: 'none' })
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40rpx;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 48rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.title {
  margin-top: 24rpx;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #999;
  text-align: center;
  line-height: 1.5;
}
</style>
