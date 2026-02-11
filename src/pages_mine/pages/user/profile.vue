<template>
  <view class="user-profile-page">
    <!-- 页面加载中遮罩 -->
    <view v-if="pageLoading" class="page-loading-mask">
      <view class="loading-content">
        <view class="loading-spinner-large"></view>
        <text class="loading-text">加载中...</text>
      </view>
    </view>
    
    <!-- 使用 u-navbar 官方导航栏 -->
    <u-navbar 
      :background="navbarBg"
      :border-bottom="false"
      :fixed="true"
      :safe-area-inset-top="true"
      :placeholder="true"
    >
      <template #left>
        <view class="navbar-btn" @click="goBack">
          <u-icon name="arrow-left" :color="isScrolled ? '#333' : '#fff'" size="24"></u-icon>
        </view>
      </template>
      
      <template #center>
        <!-- 滚动后显示用户名 -->
        <view v-if="showNavbarTitle" class="navbar-title-text">
          <text>{{ userInfo.nickName || '用户主页' }}</text>
        </view>
      </template>
      
      <template #right>
        <view class="navbar-btn" @click="handleMore">
          <u-icon name="more-dot-fill" :color="isScrolled ? '#333' : '#fff'" size="24"></u-icon>
        </view>
      </template>
    </u-navbar>
    
    <!-- 可滚动内容 -->
    <scroll-view 
      class="scroll-content" 
      scroll-y 
      @scroll="onScroll"
      @scrolltolower="loadMoreImages"
      :style="{height: scrollHeight + 'px'}"
    >
      <!-- 头部区域 -->
      <view class="header-section">
        <image class="bg-image" :src="userInfo.avatar || '/static/images/profile.jpg'" mode="aspectFill"></image>
        <view class="bg-mask"></view>
        
        <!-- 用户信息 -->
        <view class="user-info">
          <view class="avatar-wrapper">
            <image 
              class="avatar-img" 
              :src="userInfo.avatar || '/static/images/profile.jpg'" 
              mode="aspectFill"
            ></image>
          </view>
          
          <view class="nickname">{{ userInfo.nickName || (pageLoading ? '加载中...' : '游客') }}</view>
          <view class="user-id">
            <text>用户ID: {{ userInfo.userId || (pageLoading ? '...' : '未知') }}</text>
          </view>
          <view class="bio" v-if="userInfo.remark || pageLoading">
            <text>{{ userInfo.remark || (pageLoading ? '加载中...' : '') }}</text>
          </view>
          <view class="user-extra" v-if="userInfo.region || userInfo.occupation || pageLoading">
            <text v-if="userInfo.region">📍 {{ userInfo.region }}</text>
            <text v-if="userInfo.occupation" style="margin-left: 16rpx;">💼 {{ userInfo.occupation }}</text>
            <text v-if="pageLoading && !userInfo.region && !userInfo.occupation">加载中...</text>
          </view>
        </view>
        
        <!-- 统计数据 -->
        <view class="stats">
          <view class="stat-item" @click="handleToFollowing">
            <text class="num">{{ statistics.followingCount || 0 }}</text>
            <text class="label">关注</text>
          </view>
          <view class="stat-item" @click="handleToFollowers">
            <text class="num">{{ statistics.followerCount || 0 }}</text>
            <text class="label">粉丝</text>
          </view>
          <view class="stat-item">
            <text class="num">{{ imageTotal || 0 }}</text>
            <text class="label">作品</text>
          </view>
          <view class="stat-item">
            <text class="num">{{ statistics.likeCount || 0 }}</text>
            <text class="label">获赞</text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-btns">
          <view 
            class="follow-btn" 
            :class="{'following': isFollowing, 'loading': followLoading}"
            @click="handleFollow"
          >
            <view v-if="followLoading" class="loading-spinner-btn"></view>
            <text v-else>{{ isFollowing ? '已关注' : '关注' }}</text>
          </view>
          <view 
            class="message-btn" 
            :class="{'expanded': isFollowing}"
            @click="handleMessage"
          >
            <u-icon v-if="!isFollowing" name="chat" color="#fff" size="20"></u-icon>
            <text v-if="isFollowing">私信</text>
          </view>
        </view>
      </view>
      
      <!-- Tab标签（吸顶） -->
      <view class="tabs-wrapper" :class="{'fixed': isTabFixed}">
        <view class="tabs">
          <view 
            class="tab-item" 
            v-for="(tab, index) in tabs" 
            :key="index"
            :class="{'active': currentTab === index}"
            @click="handleTabChange(index)"
          >
            <text>{{ tab }}</text>
            <view class="line" v-if="currentTab === index"></view>
          </view>
        </view>
      </view>
      
      <!-- 内容区域 -->
      <view class="content-area">
        <!-- Tab 0: 作品 -->
        <view v-if="currentTab === 0" class="tab-content">
          <!-- 加载中状态 -->
          <view v-if="imageLoading && imageList.length === 0" class="loading-state">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载中...</text>
          </view>
          <view v-else-if="imageList.length === 0 && !imageLoading" class="empty-state">
            <text class="empty-icon">📷</text>
            <text class="empty-text">还没有发布作品</text>
          </view>
          <view v-else class="waterfall-container">
            <view class="waterfall-column">
              <view 
                v-for="item in leftImages" 
                :key="item.imageId"
                class="waterfall-item"
                @click="handleImageClick(item)"
              >
                <image 
                  class="item-image" 
                  :src="item.url" 
                  mode="widthFix"
                  :lazy-load="true"
                ></image>
                <view class="item-info">
                  <text class="item-title">{{ item.imageName }}</text>
                  <view class="item-meta">
                    <view class="like-info">
                      <u-icon name="heart" size="14" color="#999"></u-icon>
                      <text>{{ item.likeCount || 0 }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view class="waterfall-column">
              <view 
                v-for="item in rightImages" 
                :key="item.imageId"
                class="waterfall-item"
                @click="handleImageClick(item)"
              >
                <image 
                  class="item-image" 
                  :src="item.url" 
                  mode="widthFix"
                  :lazy-load="true"
                ></image>
                <view class="item-info">
                  <text class="item-title">{{ item.imageName }}</text>
                  <view class="item-meta">
                    <view class="like-info">
                      <u-icon name="heart" size="14" color="#999"></u-icon>
                      <text>{{ item.likeCount || 0 }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view class="load-tip" v-if="imageList.length > 0">
            <text v-if="imageLoading">加载中...</text>
            <text v-else-if="imageList.length >= imageTotal">没有更多了</text>
          </view>
        </view>
        
        <!-- Tab 1: 喜欢 -->
        <view v-if="currentTab === 1" class="tab-content">
          <view class="empty-state">
            <text class="empty-icon">❤️</text>
            <text class="empty-text">喜欢列表功能开发中</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getUserInfo } from '@/api/mobile/user'
import { followUser, unfollowUser, checkFollowStatus, getStatistics } from '@/api/mobile/follow'
import { getUserImages } from '@/api/picturebed/open'

// 状态
const statusBarHeight = ref(0)
const scrollHeight = ref(0)
const userId = ref('')
const userInfo = ref<any>({})
const statistics = ref<any>({})
const isFollowing = ref(false)

// 滚动相关
const scrollTop = ref(0)
const isScrolled = ref(false)
const isTabFixed = ref(false)

// Loading状态
const pageLoading = ref(true)
const followLoading = ref(false)
const imageLoading = ref(false)

// Tab
const currentTab = ref(0)
const tabs = ['作品', '喜欢']

// 图片列表
const imageList = ref<any[]>([])
const imagePageNum = ref(1)
const imagePageSize = ref(20)
const imageTotal = ref(0)

// 瀑布流分列
const leftImages = computed(() => {
  return imageList.value.filter((_, index) => index % 2 === 0)
})

const rightImages = computed(() => {
  return imageList.value.filter((_, index) => index % 2 === 1)
})

// 导航栏背景色 - 根据滚动位置动态变化
const navbarBg = computed(() => {
  if (scrollTop.value < 50) {
    return 'transparent'
  }
  return '#fff'
})

// 标题显示条件
const showNavbarTitle = computed(() => {
  return scrollTop.value >= 50
})

onMounted(() => {
  // 确保初始状态正确
  isScrolled.value = false
  scrollTop.value = 0
  isTabFixed.value = false
  
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  scrollHeight.value = systemInfo.windowHeight
})

onLoad((options: any) => {
  if (options.userId) {
    userId.value = String(options.userId)
  }
})

onShow(() => {
  // 确保初始状态正确
  isScrolled.value = false
  scrollTop.value = 0
  
  if (userId.value) {
    loadUserProfile()
    loadFollowStatus()
    loadStatistics()
    loadImages(true)
  }
})

// 滚动监听
const onScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop
  isScrolled.value = scrollTop.value >= 50
  
  // Tab吸顶判断
  const headerHeight = 600 * (uni.getSystemInfoSync().windowWidth / 750)
  isTabFixed.value = scrollTop.value > headerHeight - 100
}

// 加载用户信息
const loadUserProfile = async () => {
  // 设置超时定时器（10秒后自动关闭loading）
  const timeoutId = setTimeout(() => {
    if (pageLoading.value) {
      pageLoading.value = false
      uni.showToast({
        title: '加载超时，请检查网络',
        icon: 'none',
        duration: 2000
      })
    }
  }, 10000)
  
  try {
    pageLoading.value = true
    const res = await getUserInfo(userId.value)
    if (res.code === 200) {
      // 直接使用返回的用户信息
      userInfo.value = {
        userId: res.data.userId,
        nickName: res.data.nickName || '游客',
        avatar: res.data.avatar || '/static/images/profile.jpg',
        remark: res.data.signature || '',
        region: res.data.region || '',
        occupation: res.data.occupation || '',
        school: res.data.school || ''
      }
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
    clearTimeout(timeoutId) // 清除超时定时器
    pageLoading.value = false
  }
}

// 加载关注状态
const loadFollowStatus = async () => {
  try {
    const res = await checkFollowStatus(userId.value)
    if (res.code === 200) {
      isFollowing.value = res.data || false
    }
  } catch (error) {
    console.error('加载关注状态失败:', error)
  }
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await getStatistics(userId.value)
    if (res.code === 200) {
      statistics.value = res.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载图片列表
const loadImages = async (refresh = false) => {
  if (imageLoading.value) return
  
  try {
    imageLoading.value = true
    
    // 如果是刷新，重置分页
    if (refresh) {
      imagePageNum.value = 1
    }
    
    const res = await getUserImages({
      userId: userId.value,
      pageNum: imagePageNum.value,
      pageSize: imagePageSize.value
    })
    
    if (res.code === 200) {
      const newImages = res.rows.map((item: any) => ({
        imageId: item.imageId,
        imageName: item.imageName || '未命名',
        url: item.url || '/static/images/default-image.jpg',
        likeCount: item.likeCount || 0
      }))
      
      if (refresh) {
        imageList.value = newImages
      } else {
        imageList.value = [...imageList.value, ...newImages]
      }
      
      imageTotal.value = res.total || 0
      imagePageNum.value++
    }
  } catch (error) {
    console.error('加载图片失败:', error)
  } finally {
    imageLoading.value = false
  }
}

// 加载更多图片
const loadMoreImages = () => {
  if (imageList.value.length < imageTotal.value && !imageLoading.value) {
    loadImages(false)
  }
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 关注/取消关注
const handleFollow = async () => {
  if (followLoading.value) return
  
  try {
    followLoading.value = true
    
    if (isFollowing.value) {
      await unfollowUser(userId.value)
      isFollowing.value = false
      statistics.value.followerCount = Math.max(0, (statistics.value.followerCount || 0) - 1)
      uni.showToast({
        title: '已取消关注',
        icon: 'none'
      })
    } else {
      await followUser(userId.value)
      isFollowing.value = true
      statistics.value.followerCount = (statistics.value.followerCount || 0) + 1
      uni.showToast({
        title: '关注成功',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('操作失败:', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  } finally {
    followLoading.value = false
  }
}

// 私信
const handleMessage = () => {
  uni.showToast({
    title: '私信功能开发中',
    icon: 'none'
  })
}

// 更多操作
const handleMore = () => {
  uni.showActionSheet({
    itemList: ['举报', '拉黑'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.showToast({
          title: '举报功能开发中',
          icon: 'none'
        })
      } else if (res.tapIndex === 1) {
        uni.showToast({
          title: '拉黑功能开发中',
          icon: 'none'
        })
      }
    }
  })
}

// 切换Tab
const handleTabChange = (index: number) => {
  currentTab.value = index
  if (index === 1) {
    uni.showToast({
      title: '喜欢列表开发中',
      icon: 'none'
    })
  }
}

// 跳转到关注列表
const handleToFollowing = () => {
  uni.navigateTo({
    url: `/pages_mine/pages/follow/index?userId=${userId.value}&tab=following`
  })
}

// 跳转到粉丝列表
const handleToFollowers = () => {
  uni.navigateTo({
    url: `/pages_mine/pages/follow/index?userId=${userId.value}&tab=followers`
  })
}

// 图片点击
const handleImageClick = (item: any) => {
  uni.navigateTo({
    url: `/pages/detail?imageId=${item.imageId}`
  })
}
</script>

<style lang="scss" scoped>
.user-profile-page {
  width: 100%;
  height: 100vh;
  background: #f5f5f5;
  position: relative;
}

// 页面加载遮罩
.page-loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20rpx;
    
    .loading-spinner-large {
      width: 60rpx;
      height: 60rpx;
      border: 4rpx solid #f3f3f3;
      border-top: 4rpx solid #000;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .loading-text {
      font-size: 28rpx;
      color: #666;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 导航栏按钮样式
.navbar-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

// 导航栏标题样式
.navbar-title-text {
  text {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
}

// 滚动内容
.scroll-content {
  width: 100%;
}

// 头部区域
.header-section {
  position: relative;
  //min-height: 600rpx;
  background: linear-gradient(180deg, #2C5F5D 0%, #1F3A3D 100%);
  padding-top: 40rpx;
  padding-left: 30rpx;
  padding-right: 30rpx;
  padding-bottom: 30rpx;
  
  .bg-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.3;
    filter: blur(60rpx);
  }
  
  .bg-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.2);
  }
  
  .user-info {
    position: relative;
    z-index: 2;
    
    .avatar-wrapper {
      width: 140rpx;
      height: 140rpx;
      margin-bottom: 20rpx;
      
      .avatar-img {
        width: 140rpx;
        height: 140rpx;
        border-radius: 50%;
        border: 4rpx solid rgba(255,255,255,0.2);
      }
    }
    
    .nickname {
      font-size: 48rpx;
      font-weight: bold;
      color: #fff;
      margin-bottom: 8rpx;
    }
    
    .user-id {
      font-size: 24rpx;
      color: rgba(255,255,255,0.7);
      margin-bottom: 16rpx;
    }
    
    .bio {
      font-size: 26rpx;
      color: rgba(255,255,255,0.9);
      margin-bottom: 12rpx;
      line-height: 1.5;
    }
    
    .user-extra {
      font-size: 24rpx;
      color: rgba(255,255,255,0.8);
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 20rpx;
    }
  }
  
  .stats {
    position: relative;
    z-index: 2;
    display: flex;
    margin-bottom: 30rpx;
    
    .stat-item {
      display: flex;
      align-items: baseline;
      margin-right: 40rpx;
      
      &:last-child {
        margin-right: 0;
      }
      
      .num {
        font-size: 32rpx;
        font-weight: bold;
        color: #fff;
        margin-right: 8rpx;
      }
      
      .label {
        font-size: 26rpx;
        color: rgba(255,255,255,0.8);
      }
    }
  }
  
  .action-btns {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 16rpx;
    
    .follow-btn {
      flex: 1;
      background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
      border-radius: 12rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      
      &.following {
        flex: 1;
        background: rgba(255,255,255,0.25);
        backdrop-filter: blur(10px);
      }
      
      &.loading {
        opacity: 0.6;
        pointer-events: none;
      }
      
      .loading-spinner-btn {
        width: 32rpx;
        height: 32rpx;
        border: 3rpx solid rgba(255, 255, 255, 0.3);
        border-top: 3rpx solid #fff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      text {
        font-size: 26rpx;
        color: #fff;
        font-weight: 500;
      }
    }
    
    .message-btn {
      width: 64rpx;
      height: 64rpx;
      background: rgba(255,255,255,0.25);
      backdrop-filter: blur(10px);
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;

      &.expanded {
        flex: 1;
        width: auto;
        flex-direction: row;
        gap: 8rpx;
        animation: expandBtn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      text {
        font-size: 20rpx;
        color: #fff;
        margin-top: 4rpx;
        transition: all 0.3s;
      }
      
      &.expanded text {
        font-size: 26rpx;
        margin-top: 0;
        font-weight: 500;
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes expandBtn {
  0% {
    width: 64rpx;
    flex: 0;
  }
  100% {
    width: auto;
    flex: 1;
  }
}

// Tab标签
.tabs-wrapper {
  background: #fff;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  &.fixed {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 998;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
    animation: slideDown 0.3s ease-out;
    top: 0;
  }
  
  .tabs {
    flex: 1;
    display: flex;
    
    .tab-item {
      position: relative;
      padding-bottom: 16rpx;
      margin-right: 48rpx;
      transition: all 0.2s;
      
      &:last-child {
        margin-right: 0;
      }
      
      text {
        font-size: 28rpx;
        color: #999;
        transition: color 0.2s, font-weight 0.2s;
      }
      
      &.active {
        text {
          color: #333;
          font-weight: bold;
        }
        
        .line {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 32rpx;
          height: 6rpx;
          background: #333;
          border-radius: 3rpx;
          animation: lineExpand 0.3s ease-out;
        }
      }
    }
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes lineExpand {
  from {
    width: 0;
  }
  to {
    width: 32rpx;
  }
}

// 内容区域
.content-area {
  background: #f7f7f7;
  min-height: 400rpx;
  padding: 20rpx 0;
  
  .tab-content {
    min-height: 400rpx;
    overflow: hidden;
  }
  
  // 空状态
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;
    
    .empty-icon {
      font-size: 100rpx;
      margin-bottom: 20rpx;
    }
    
    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
  
  // 加载中状态
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;
    
    .loading-spinner {
      width: 80rpx;
      height: 80rpx;
      border: 4rpx solid #f3f3f3;
      border-top: 4rpx solid #333;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .loading-text {
      font-size: 28rpx;
      color: #999;
      margin-top: 20rpx;
    }
  }
  
  // 瀑布流容器
  .waterfall-container {
    display: flex;
    padding: 0 16rpx;
    gap: 12rpx;
    width: 100%;
    box-sizing: border-box;
    
    .waterfall-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      
      .waterfall-item {
        background: #fff;
        border-radius: 12rpx;
        overflow: hidden;
        margin-bottom: 12rpx;
        width: 100%;
        
        .item-image {
          width: 100%;
          display: block;
        }
        
        .item-info {
          padding: 12rpx;
          
          .item-title {
            font-size: 26rpx;
            color: #333;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            line-height: 1.4;
            margin-bottom: 8rpx;
            word-break: break-all;
          }
          
          .item-meta {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            
            .like-info {
              display: flex;
              align-items: center;
              gap: 4rpx;
              font-size: 22rpx;
              color: #999;
            }
          }
        }
      }
    }
  }
  
  // 加载提示
  .load-tip {
    padding: 30rpx 0;
    text-align: center;
    
    text {
      font-size: 24rpx;
      color: #999;
    }
  }
}
</style>
