<template>
  <view class="setting-page">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <!-- 非H5端顶部安全区域 -->
<!--      &lt;!&ndash; #ifndef H5 &ndash;&gt;-->
<!--      <view :style="{height: statusBarHeight + 'px'}"></view>-->
<!--      &lt;!&ndash; #endif &ndash;&gt;-->
    </view>
    
    <!-- 内容区域 -->
    <scroll-view class="scroll-content" scroll-y :style="{height: scrollHeight + 'px'}">
      <!-- 账号与安全 -->
      <CustomCellGroup>
        <CustomCell 
          title="账号与安全" 
          icon="lock-fill"
          :isLink="true"
          @click="handleToSecurity"
        />
      </CustomCellGroup>
      
      <!-- 通用设置组 -->
      <CustomCellGroup>
        <CustomCell 
          title="通用设置" 
          icon="setting-fill"
          :isLink="true"
          @click="handleToGeneral"
        />
        <CustomCell 
          title="通知设置" 
          icon="bell-fill"
          :isLink="true"
          @click="handleToNotification"
        />
        <CustomCell 
          title="多语言和翻译" 
          icon="chat-fill"
          :isLink="true"
          @click="handleToLanguage"
        />
        <CustomCell 
          title="隐私设置" 
          icon="lock-fill"
          :isLink="true"
          @click="handleToPrivacy"
        />
      </CustomCellGroup>
      
      <!-- 存储与内容组 -->
      <CustomCellGroup>
        <CustomCell 
          title="存储空间" 
          icon="trash-fill"
          :value="storageSize"
          :isLink="true"
          @click="handleCleanStorage"
        />
        <CustomCell 
          title="内容偏好调节" 
          icon="list-fill"
          :isLink="true"
          @click="handleToContentPreference"
        />
        <CustomCell 
          title="收货地址" 
          icon="map-pin-fill"
          :isLink="true"
          @click="handleToAddress"
        />
        <CustomCell 
          title="添加小组件" 
          icon="grid-fill"
          :isLink="true"
          @click="handleToWidget"
        />
        <CustomCell 
          title="未成年人模式" 
          icon="shield-fill"
          value="未开启"
          :isLink="true"
          @click="handleToTeenMode"
        />
      </CustomCellGroup>
      
      <!-- 其他组 -->
      <CustomCellGroup>
        <CustomCell 
          title="新功能体验" 
          icon="star-fill"
          :isLink="true"
          @click="handleToNewFeatures"
        />
      </CustomCellGroup>
      
      <!-- 帮助与关于组 -->
      <CustomCellGroup>
        <CustomCell 
          title="帮助与客服" 
          icon="question-circle-fill"
          :isLink="true"
          @click="handleToHelp"
        />
        <CustomCell 
          title="关于小红书" 
          icon="info-circle-fill"
          :isLink="true"
          @click="handleToAbout"
        />
      </CustomCellGroup>
      
      <!-- 退出登录按钮 -->
      <view class="logout-section">
        <view class="logout-btn switch-account" @tap="handleSwitchAccount" @click="handleSwitchAccount">
          <text>切换账号</text>
        </view>
        <view class="logout-btn logout-account" @tap="handleLogout" @click="handleLogout">
          <text>退出登录</text>
        </view>
      </view>
      
      <!-- 版权和备案号 -->
      <view class="footer-info">
        <text class="copyright" v-if="copyright">{{ copyright }}</text>
        <text class="icp" v-if="icp">{{ icp }}</text>
      </view>
    </scroll-view>
    
    <!-- 底部安全区域 -->
<!--    &lt;!&ndash; #ifndef H5 &ndash;&gt;-->
<!--    <view :style="{height: safeAreaBottom + 'px', background: '#f7f7f7'}"></view>-->
<!--    &lt;!&ndash; #endif &ndash;&gt;-->
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import store from '@/store'
import config from '@/config'
import CustomCell from '@/components/CustomCell/CustomCell.vue'
import CustomCellGroup from '@/components/CustomCellGroup/CustomCellGroup.vue'

// 状态
const statusBarHeight = ref(0)
const scrollHeight = ref(0)
const safeAreaBottom = ref(0)
const version = ref(config.appInfo?.version || 'v1.0.0')
const storageSize = ref('2.27 GB')

// 从 store 获取网站配置
const websiteConfig = computed(() => store.getters.websiteConfig || {})
const copyright = computed(() => websiteConfig.value.copyright || '')
const icp = computed(() => websiteConfig.value.icp || '')

onMounted(() => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  scrollHeight.value = systemInfo.windowHeight - statusBarHeight.value - 44
  safeAreaBottom.value = systemInfo.safeAreaInsets?.bottom || 0
  
  // 计算存储空间
  calculateStorage()
})

// 计算存储空间
const calculateStorage = () => {
  // TODO: 实际计算存储空间
  storageSize.value = '2.27 GB'
}

// 返回
const handleBack = () => {
  uni.navigateBack()
}

// 账号与安全
const handleToSecurity = () => {
  uni.showToast({ title: '账号与安全功能开发中', icon: 'none' })
}

// 通用设置
const handleToGeneral = () => {
  uni.showToast({ title: '通用设置功能开发中', icon: 'none' })
}

// 通知设置
const handleToNotification = () => {
  uni.showToast({ title: '通知设置功能开发中', icon: 'none' })
}

// 多语言和翻译
const handleToLanguage = () => {
  uni.showToast({ title: '多语言功能开发中', icon: 'none' })
}

// 隐私设置
const handleToPrivacy = () => {
  uni.showToast({ title: '隐私设置功能开发中', icon: 'none' })
}

// 清理存储空间
const handleCleanStorage = () => {
  uni.showModal({
    title: '清理存储空间',
    content: '确定要清理缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '清理中...' })
        setTimeout(() => {
          uni.hideLoading()
          uni.showToast({ title: '清理成功', icon: 'success' })
          storageSize.value = '0.12 GB'
        }, 1500)
      }
    }
  })
}

// 内容偏好调节
const handleToContentPreference = () => {
  uni.showToast({ title: '内容偏好功能开发中', icon: 'none' })
}

// 收货地址
const handleToAddress = () => {
  uni.showToast({ title: '收货地址功能开发中', icon: 'none' })
}

// 添加小组件
const handleToWidget = () => {
  uni.showToast({ title: '小组件功能开发中', icon: 'none' })
}

// 未成年人模式
const handleToTeenMode = () => {
  uni.showToast({ title: '未成年人模式功能开发中', icon: 'none' })
}

// 新功能体验
const handleToNewFeatures = () => {
  uni.showToast({ title: '新功能体验开发中', icon: 'none' })
}

// 帮助与客服
const handleToHelp = () => {
  uni.navigateTo({ url: '/pages_mine/pages/help/index' })
}

// 关于
const handleToAbout = () => {
  uni.navigateTo({ url: '/pages_mine/pages/about/index' })
}

// 切换账号
const handleSwitchAccount = () => {
  console.log('点击切换账号按钮')
  uni.showModal({
    title: '切换账号',
    content: '确定要切换账号吗？',
    confirmColor: '#ff2442',
    success: (res) => {
      if (res.confirm) {
        confirmSwitchAccount()
      }
    }
  })
}

// 退出登录
const handleLogout = () => {
  console.log('点击退出登录按钮')
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    confirmColor: '#ff2442',
    success: (res) => {
      if (res.confirm) {
        confirmLogout()
      }
    }
  })
}

// 确认退出
const confirmLogout = () => {
  console.log('开始退出登录')
  try {
    // 清空网站配置
    if (store.dispatch) {
      console.log('调用 ClearWebsiteConfig')
      store.dispatch('ClearWebsiteConfig').catch(err => {
        console.error('ClearWebsiteConfig 失败:', err)
      })
    }
    // 退出登录
    console.log('调用 LogOut')
    store.dispatch('LogOut').then(() => {
      console.log('LogOut 成功，跳转登录页')
      uni.reLaunch({ url: '/pages/login' })
    }).catch(err => {
      console.error('LogOut 失败:', err)
      // 即使失败也跳转到登录页
      uni.reLaunch({ url: '/pages/login' })
    })
  } catch (error) {
    console.error('退出登录异常:', error)
    // 发生异常也跳转到登录页
    uni.reLaunch({ url: '/pages/login' })
  }
}

// 确认切换账号
const confirmSwitchAccount = () => {
  console.log('开始切换账号')
  try {
    // 清空网站配置
    if (store.dispatch) {
      console.log('调用 ClearWebsiteConfig')
      store.dispatch('ClearWebsiteConfig').catch(err => {
        console.error('ClearWebsiteConfig 失败:', err)
      })
    }
    // 退出登录
    console.log('调用 LogOut')
    store.dispatch('LogOut').then(() => {
      console.log('LogOut 成功，跳转登录页')
      uni.reLaunch({ url: '/pages/login' })
    }).catch(err => {
      console.error('LogOut 失败:', err)
      // 即使失败也跳转到登录页
      uni.reLaunch({ url: '/pages/login' })
    })
  } catch (error) {
    console.error('切换账号异常:', error)
    // 发生异常也跳转到登录页
    uni.reLaunch({ url: '/pages/login' })
  }
}
</script>

<style lang="scss" scoped>
.setting-page {
  width: 100%;
  min-height: 100vh;
  background: #f7f7f7;
}

// 自定义导航栏
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  
  .navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 30rpx;
    
    .navbar-left {
      width: 80rpx;
      display: flex;
      align-items: center;
    }
    
    .navbar-title {
      flex: 1;
      text-align: center;
      
      text {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
    }
    
    .navbar-right {
      width: 80rpx;
    }
  }
}

// 滚动内容
.scroll-content {
  width: 100%;
  padding-top: 88rpx;
}

// 退出登录区域
.logout-section {
  padding: 40rpx 20rpx 20rpx;
  
  .logout-btn {
    background: #fff;
    border-radius: 16rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20rpx;
    cursor: pointer;
    
    text {
      font-size: 30rpx;
      font-weight: 500;
      pointer-events: none;
    }
    
    &.switch-account {
      text {
        color: #333;
      }
    }
    
    &.logout-account {
      text {
        color: #ff2442;
      }
    }
    
    &:active {
      background: #f7f7f7;
    }
  }
}

// 底部信息
.footer-info {
  padding: 20rpx 0 60rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  
  .copyright, .icp {
    font-size: 24rpx;
    color: #999;
    line-height: 1.6;
  }
}
</style>
