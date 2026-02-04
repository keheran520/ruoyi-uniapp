<template>
  <view class="devices-page">
    <!-- 提示信息 -->
    <view class="tip-text">
      账号近期在以下设备登录过，若非本人操作请及时修改密码并移除该设备，以保证账号安全。
    </view>
    
    <view v-if="loading" class="loading-wrapper">
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else-if="devices.length === 0" class="empty-wrapper">
      <text class="empty-text">暂无在线设备</text>
    </view>
    
    <view v-else>
      <CustomCellGroup>
        <CustomCell 
          v-for="device in devices" 
          :key="device.tokenId"
          :title="getDeviceTitle(device)"
          :label="formatTime(device.loginTime)"
          :isLink="true"
          @click="() => handleShowDetail(device)"
        >
          <template #icon>
            <text class="device-icon">📱</text>
          </template>
          <template #value>
            <view 
              v-if="isCurrentDevice(device)"
              class="current-badge"
            >
              <text>本机设备</text>
            </view>
          </template>
        </CustomCell>
      </CustomCellGroup>
    </view>

    <!-- 设备详情弹窗 -->
    <uni-popup ref="detailPopup" type="bottom" background-color="#fff">
      <view class="detail-popup">
        <view class="popup-header">
          <text class="popup-title">设备详情</text>
          <text class="popup-close" @tap="closeDetail">关闭</text>
        </view>
        
        <view v-if="selectedDevice" class="popup-body">
          <view class="detail-section">
            <view class="detail-row">
              <text class="detail-label">设备类型</text>
              <text class="detail-value">{{ getDeviceTypeName(selectedDevice.deviceType) }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">主机</text>
              <text class="detail-value">{{ selectedDevice.ipaddr }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">登录地点</text>
              <text class="detail-value">{{ selectedDevice.loginLocation }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">操作系统</text>
              <text class="detail-value">{{ selectedDevice.os }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">浏览器</text>
              <text class="detail-value">{{ selectedDevice.browser }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">登录时间</text>
              <text class="detail-value">{{ formatTime(selectedDevice.loginTime) }}</text>
            </view>
          </view>
          
          <view v-if="!isCurrentDevice(selectedDevice)" class="popup-footer">
            <button 
              class="delete-btn"
              @tap="handleDelete"
            >
              移除该设备
            </button>
          </view>
          <view v-else class="current-device-tip">
            <text>当前设备无法移除</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOnlineDevices, delOnline } from '@/api/mobile/security'
import { getToken } from '@/utils/auth'
import CustomCell from '@/components/CustomCell/CustomCell.vue'
import CustomCellGroup from '@/components/CustomCellGroup/CustomCellGroup.vue'

const loading = ref(false)
const devices = ref([])
const currentTokenId = ref('')
const selectedDevice = ref(null)
const detailPopup = ref(null)

// 设备类型映射
const deviceTypeMap = {
  'pc': '电脑',
  'app': '手机APP',
  'xcx': '小程序',
  'other': '其他设备'
}

// 获取设备类型名称
const getDeviceTypeName = (type) => {
  return deviceTypeMap[type] || '未知设备'
}

// 获取设备标题
const getDeviceTitle = (device) => {
  const typeName = getDeviceTypeName(device.deviceType)
  const osInfo = device.os || ''
  return `${typeName}${osInfo ? ' · ' + osInfo : ''}`
}

// 判断是否为当前设备
const isCurrentDevice = (device) => {
  return device.tokenId === currentTokenId.value
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// 加载在线设备列表
const loadDevices = async () => {
  loading.value = true
  try {
    const res = await getOnlineDevices()
    devices.value = res.rows || []
    
    // 获取当前设备的tokenId
    const token = getToken()
    if (token) {
      currentTokenId.value = token
    }
  } catch (error) {
    console.error('加载设备列表失败：', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 显示设备详情
const handleShowDetail = (device) => {
  selectedDevice.value = device
  detailPopup.value.open()
}

// 关闭详情弹窗
const closeDetail = () => {
  detailPopup.value.close()
}

// 删除设备
const handleDelete = () => {
  if (!selectedDevice.value) return
  
  uni.showModal({
    title: '提示',
    content: '移除设备后，在该设备登录需要重新进行验证！',
    confirmColor: '#ff3b30',
    success: async (res) => {
      if (res.confirm) {
        try {
          await delOnline(selectedDevice.value.tokenId)
          uni.showToast({ title: '移除成功', icon: 'success' })
          closeDetail()
          loadDevices()
        } catch (error) {
          console.error('移除失败：', error)
          uni.showToast({ title: '移除失败', icon: 'none' })
        }
      }
    }
  })
}

onMounted(() => {
  loadDevices()
})
</script>

<style lang="scss" scoped>
.devices-page {
  width: 100%;
  min-height: 100vh;
  background: #f7f7f7;
}

.tip-text {
  padding: 30rpx;
  font-size: 26rpx;
  color: #999;
  line-height: 1.6;
  background: #fff;
  margin-bottom: 20rpx;
}

.loading-wrapper,
.empty-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .loading-text,
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.device-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.current-badge {
  background: #e8f5e9;
  color: #07c160;
  font-size: 22rpx;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
}

// 详情弹窗样式
.detail-popup {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .popup-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
  
  .popup-close {
    font-size: 28rpx;
    color: #999;
  }
}

.popup-body {
  padding: 40rpx;
}

.detail-section {
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .detail-label {
      font-size: 28rpx;
      color: #666;
    }
    
    .detail-value {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      max-width: 400rpx;
      text-align: right;
      word-break: break-all;
    }
  }
}

.popup-footer {
  margin-top: 40rpx;
  
  .delete-btn {
    width: 100%;
    height: 88rpx;
    background: #fff;
    border: 1rpx solid #ff3b30;
    color: #ff3b30;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &::after {
      border: none;
    }
  }
}

.current-device-tip {
  margin-top: 40rpx;
  text-align: center;
  padding: 24rpx;
  background: #f7f7f7;
  border-radius: 12rpx;
  
  text {
    font-size: 26rpx;
    color: #999;
  }
}
</style>
