<template>
  <view class="mine-page">
    <!-- 固定顶部导航栏 -->
    <view class="fixed-navbar" :class="{'scrolled': isScrolled}" :style="{background: navbarBg}">
      <!-- 非H5端顶部安全区域 -->
      <!-- #ifndef H5 -->
      <view :style="{height: statusBarHeight + 'px'}"></view>
      <!-- #endif -->
      
      <view class="navbar-content">
        <view class="navbar-left" @click="showDrawer = true">
          <u-icon name="list" :color="isScrolled ? '#333' : '#fff'" size="24"></u-icon>
        </view>
        
        <!-- 滚动后显示的头像 -->
        <transition name="fade">
          <view class="navbar-avatar" v-if="isScrolled" @click="handleToInfo">
            <image class="avatar-img" :src="userInfo?.avatar || '/static/images/profile.jpg'" mode="aspectFill"></image>
          </view>
        </transition>
        
        <view class="navbar-right" @click="handleScan">
          <u-icon name="scan" :color="isScrolled ? '#333' : '#fff'" size="24"></u-icon>
        </view>
      </view>
    </view>
    
    <!-- 可滚动内容 -->
    <scroll-view 
      class="scroll-content" 
      scroll-y 
      @scroll="onScroll"
      :style="{height: scrollHeight + 'px'}"
    >
      <!-- 头部区域 -->
      <view class="header-section">
        <image class="bg-image" :src="userBgImage || '/static/images/profile.jpg'" mode="aspectFill"></image>
        <view class="bg-mask"></view>
        
        <!-- 用户信息 -->
        <view class="user-info">
          <view class="avatar-row">
            <view class="avatar-box" @click="handleToInfo">
              <image class="avatar" :src="userInfo?.avatar || '/static/images/profile.jpg'" mode="aspectFill"></image>
              <view class="edit-icon">
                <u-icon name="plus" color="#333" size="14"></u-icon>
              </view>
            </view>
            
            <!-- 签到按钮（与头像同一行） -->
            <view class="checkin-btn" @click="handleCheckin" :class="{'signed': isSigned}">
              <u-icon name="calendar" :color="isSigned ? '#D4B07B' : '#fff'" size="16"></u-icon>
              <text>{{ isSigned ? '已签到' : '签到' }}</text>
            </view>
          </view>
          
          <view class="nickname">{{ userInfo?.nickname || userInfo?.userName || 'xxxxxxxxx' }}</view>
          <view class="user-id">
            <text>用户ID: {{ userInfo?.userId || 'xxxxxxxxx' }}</text>
          </view>
          <view class="bio" @click="handleEditSignature">
            <text>{{ userSignature || '点击这里,填写简介' }}</text>
          </view>
        </view>
        
        <!-- 统计数据 -->
        <view class="stats">
          <view class="stat-item" @click="handleToMyWorks">
            <text class="num">{{ creationData.worksCount || 14 }}</text>
            <text class="label">关注</text>
          </view>
          <view class="stat-item" @click="handleToFans">
            <text class="num">{{ creationData.fansCount || 8 }}</text>
            <text class="label">粉丝</text>
          </view>
          <view class="stat-item" @click="handleToLikes">
            <text class="num">{{ creationData.likesCount || 36 }}</text>
            <text class="label">获赞与收藏</text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-btns">
          <view class="edit-btn" @click="handleToEditInfo">
            <text>编辑资料</text>
          </view>
          <view class="setting-btn" @click="handleToSetting">
            <u-icon name="setting" color="#fff" size="20"></u-icon>
          </view>
        </view>
      </view>
      
      <!-- Tab标签（吸顶） -->
      <view class="tabs-wrapper" :class="{'fixed': isTabFixed}" :style="isTabFixed ? {paddingTop: tabFixedPaddingTop} : {}">
        <view class="tabs">
          <view 
            class="tab-item" 
            v-for="(tab, index) in tabs" 
            :key="index"
            :class="{'active': currentTab === index}"
            @click="currentTab = index"
          >
            <text>{{ tab }}</text>
            <view class="line" v-if="currentTab === index"></view>
          </view>
        </view>
        <view class="search-icon" @click="handleSearch">
          <u-icon name="search" size="20" color="#999"></u-icon>
        </view>
      </view>
      
      <!-- 内容区域 -->
      <view class="content-area">
        <view class="waterfall" v-for="item in 10">
          <view class="column">
            <view class="card" @click="handleToBalance">
              <image class="cover" src="/static/images/profile.jpg" mode="aspectFill"></image>
              <view class="info">
                <text class="title">我的余额: ¥{{ balanceValue }}</text>
              </view>
            </view>
          </view>
          <view class="column">
            <view class="card" @click="handleToPoints">
              <image class="cover" src="/static/images/profile.jpg" mode="aspectFill"></image>
              <view class="info">
                <text class="title">我的积分: {{ memberInfo.points || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="footer-tip">
          <text>没有更多了</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 抽屉菜单 -->
    <view class="drawer-mask" v-if="showDrawer" @click="showDrawer = false"></view>
    <view class="drawer" :class="{'show': showDrawer}">
      <scroll-view class="drawer-scroll" scroll-y>
        <CustomCellGroup>
          <CustomCell title="添加好友" icon="account-fill" :isLink="true" @click="handleDrawerItem('friend')" />
          <CustomCell title="创作者中心" icon="edit-pen-fill" :isLink="true" @click="handleDrawerItem('creator')" />
        </CustomCellGroup>
        
        <CustomCellGroup>
          <CustomCell title="我的草稿" icon="file-text-fill" :isLink="true" @click="handleDrawerItem('draft')" />
          <CustomCell title="浏览记录" icon="clock-fill" :isLink="true" @click="handleDrawerItem('history')" />
          <CustomCell title="我的下载" icon="download" :isLink="true" @click="handleDrawerItem('download')" />
        </CustomCellGroup>
        
        <CustomCellGroup>
          <CustomCell title="订单" icon="order" :isLink="true" @click="handleDrawerItem('order')" />
          <CustomCell title="购物车" icon="shopping-cart-fill" :isLink="true" @click="handleDrawerItem('cart')" />
          <CustomCell title="钱包" icon="wallet-fill" :isLink="true" @click="handleDrawerItem('wallet')" />
        </CustomCellGroup>
        
        <CustomCellGroup>
          <CustomCell title="小程序" icon="grid-fill" :isLink="true" @click="handleDrawerItem('miniapp')" />
          <CustomCell title="社区公约" icon="chat-fill" :isLink="true" @click="handleDrawerItem('community')" />
        </CustomCellGroup>
      </scroll-view>
      
      <view class="drawer-footer">
        <view class="footer-btn" @click="handleHelp">
          <u-icon name="question-circle" color="#666" size="20"></u-icon>
          <text>帮助</text>
        </view>
        <view class="footer-btn" @click="handleToSetting">
          <u-icon name="setting" color="#666" size="20"></u-icon>
          <text>设置</text>
        </view>
      </view>
    </view>
    
    <!-- 底部安全区域 -->
    <!-- #ifndef H5 -->
    <view :style="{height: safeAreaBottom + 'px', background: '#fff'}"></view>
    <!-- #endif -->
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import store from '@/store'
import { getMemberInfo, getCheckinStatus } from '@/api/mobile/member'
import CustomCell from '@/components/CustomCell/CustomCell.vue'
import CustomCellGroup from '@/components/CustomCellGroup/CustomCellGroup.vue'

// 状态
const userInfo = computed(() => store.getters.info || {})
const memberInfo = ref({})
const isSigned = ref(false)
const showDrawer = ref(false)
const userBgImage = ref('')
const userSignature = ref('')
const creationData = ref({ worksCount: 0, likesCount: 0, fansCount: 0 })
const orderCount = ref(0)

// 滚动相关
const scrollTop = ref(0)
const isScrolled = ref(false)
const isTabFixed = ref(false)
const statusBarHeight = ref(0)
const scrollHeight = ref(0)
const safeAreaBottom = ref(0)
const currentTab = ref(0)
const tabs = ['笔记', '收藏', '赞过']
const navbarHeight = ref(88) // 导航栏内容高度

// 导航栏背景色 - 根据滚动位置动态变化
const navbarBg = computed(() => {
  if (scrollTop.value < 50) {
    return 'transparent'
  }
  // 渐变显示背景色（与头部背景色一致）
  const opacity = Math.min((scrollTop.value - 50) / 150, 1)
  // return `rgba(44, 95, 93, ${opacity})` // #2C5F5D
  return `#fff`
})

// Tab吸顶时的padding-top
const tabFixedPaddingTop = computed(() => {
  return `${statusBarHeight.value + navbarHeight.value + 20}rpx`
})

// Tab的transform动画
const tabTransform = computed(() => {
  if (!isTabFixed.value) return 'translateY(0)'
  // 平滑过渡动画
  return 'translateY(0)'
})

// 余额
const balanceValue = computed(() => {
  const balance = memberInfo.value.balance || 0
  return (balance / 100).toFixed(2)
})

onMounted(() => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  scrollHeight.value = systemInfo.windowHeight
  safeAreaBottom.value = systemInfo.safeAreaInsets?.bottom || 0
})

onShow(() => {
  if (store.state.user.token) {
    loadData()
  }
})

const loadData = async () => {
  try {
    const res = await getMemberInfo()
    if (res.data) {
      memberInfo.value = res.data
      creationData.value = {
        worksCount: res.data.worksCount || 0,
        likesCount: res.data.likesCount || 0,
        fansCount: res.data.fansCount || 0
      }
      userSignature.value = res.data.signature || ''
      userBgImage.value = res.data.bgImage || ''
    }
    
    const signRes = await getCheckinStatus()
    isSigned.value = signRes.data
  } catch (e) {
    console.error('加载失败', e)
  }
}

// 滚动监听
const onScroll = (e) => {
  scrollTop.value = e.detail.scrollTop
  isScrolled.value = scrollTop.value > 50
  
  // Tab吸顶判断 - 当滚动到头部区域底部时
  // 头部高度约为 600rpx，需要转换为px
  const headerHeight = 600 * (uni.getSystemInfoSync().windowWidth / 750)
  isTabFixed.value = scrollTop.value > headerHeight - 100
}

// 页面跳转
const handleToInfo = () => {
  if (!store.state.user.token) {
    uni.navigateTo({ url: '/pages/login' })
    return
  }
  uni.navigateTo({ url: '/pages_mine/pages/info/index' })
}

const handleToEditInfo = () => {
  uni.navigateTo({ url: '/pages_mine/pages/info/edit' })
}

const handleToSetting = () => {
  showDrawer.value = false
  uni.navigateTo({ url: '/pages_mine/pages/setting/index' })
}

const handleToBalance = () => {
  uni.navigateTo({ url: '/pages/member-balance' })
}

const handleToPoints = () => {
  uni.navigateTo({ url: '/pages/member-balance?tab=1' })
}

const handleToMyWorks = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const handleToFans = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const handleToLikes = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const handleCheckin = () => {
  uni.navigateTo({ url: '/pages/member-checkin' })
}

const handleScan = () => {
  uni.showToast({ title: '扫一扫功能开发中', icon: 'none' })
}

const handleEditSignature = () => {
  uni.showToast({ title: '编辑签名功能开发中', icon: 'none' })
}

const handleSearch = () => {
  uni.showToast({ title: '搜索功能开发中', icon: 'none' })
}

const handleHelp = () => {
  showDrawer.value = false
  uni.showToast({ title: '帮助功能开发中', icon: 'none' })
}

// 抽屉菜单项点击
const handleDrawerItem = (type) => {
  showDrawer.value = false
  
  const actions = {
    friend: () => uni.showToast({ title: '添加好友功能开发中', icon: 'none' }),
    creator: () => uni.showToast({ title: '创作者中心功能开发中', icon: 'none' }),
    draft: () => uni.showToast({ title: '草稿功能开发中', icon: 'none' }),
    history: () => uni.showToast({ title: '浏览记录功能开发中', icon: 'none' }),
    download: () => uni.showToast({ title: '下载功能开发中', icon: 'none' }),
    order: () => uni.showToast({ title: '订单功能开发中', icon: 'none' }),
    cart: () => uni.showToast({ title: '购物车功能开发中', icon: 'none' }),
    wallet: () => handleToBalance(),
    miniapp: () => uni.showToast({ title: '小程序功能开发中', icon: 'none' }),
    community: () => uni.showToast({ title: '社区公约功能开发中', icon: 'none' })
  }
  
  actions[type]?.()
}
</script>

<style lang="scss" scoped>
.mine-page {
  width: 100%;
  height: 100vh;
  background: #f5f5f5;
  position: relative;
}

// 固定导航栏
.fixed-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  transition: background 0.3s ease; // 添加背景色过渡动画
  
  .navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 30rpx;
    height: 88rpx;
    
    .navbar-left,
    .navbar-right {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.3); // 半透明黑色背景
      backdrop-filter: blur(10px);
      transition: all 0.2s;
      
      &:active {
        transform: scale(0.95);
        opacity: 0.8;
      }
    }
    
    .navbar-avatar {
      flex: 1;
      display: flex;
      justify-content: center;
      
      .avatar-img {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        border: 2rpx solid #fff;
      }
    }
  }
}

// 滚动内容
.scroll-content {
  width: 100%;
}

// 头部区域
.header-section {
  position: relative;
  min-height: 600rpx;
  background: linear-gradient(180deg, #2C5F5D 0%, #1F3A3D 100%);
  padding: 140rpx 30rpx 30rpx;
  
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
    
    .avatar-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rpx;
      
      .avatar-box {
        position: relative;
        width: 140rpx;
        height: 140rpx;
        
        .avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 4rpx solid rgba(255,255,255,0.2);
        }
        
        .edit-icon {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 36rpx;
          height: 36rpx;
          background: #FFD600;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
      
      .checkin-btn {
        background: rgba(255,255,255,0.25);
        backdrop-filter: blur(10px);
        border-radius: 40rpx;
        padding: 12rpx 24rpx;
        display: flex;
        align-items: center;
        gap: 8rpx;
        
        text {
          font-size: 24rpx;
          color: #fff;
        }
        
        &.signed {
          background: rgba(212, 176, 123, 0.3);
          
          text {
            color: #D4B07B;
          }
        }
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
      margin-bottom: 20rpx;
    }
  }
  
  .stats {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 40rpx;
    margin-bottom: 30rpx;
    
    .stat-item {
      display: flex;
      align-items: baseline;
      gap: 8rpx;
      
      .num {
        font-size: 32rpx;
        font-weight: bold;
        color: #fff;
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
    
    .edit-btn {
      flex: 1;
      background: rgba(255,255,255,0.25);
      backdrop-filter: blur(10px);
      border-radius: 12rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      text {
        font-size: 26rpx;
        color: #fff;
      }
    }
    
    .setting-btn {
      width: 64rpx;
      height: 64rpx;
      background: rgba(255,255,255,0.25);
      backdrop-filter: blur(10px);
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// Tab标签
.tabs-wrapper {
  background: #fff;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); // 添加平滑过渡动画
  
  &.fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 998;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
    animation: slideDown 0.3s ease-out; // 添加下滑动画
  }
  
  .tabs {
    flex: 1;
    display: flex;
    gap: 48rpx;
    
    .tab-item {
      position: relative;
      padding-bottom: 16rpx;
      transition: all 0.2s; // 添加Tab切换动画
      
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
          animation: lineExpand 0.3s ease-out; // 添加下划线展开动画
        }
      }
    }
  }
  
  .search-icon {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// Tab吸顶下滑动画
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

// Tab下划线展开动画
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
  background: #fff;
  min-height: 400rpx;
  padding: 20rpx;
  
  .waterfall {
    display: flex;
    gap: 12rpx;
    
    .column {
      flex: 1;
      
      .card {
        background: #fff;
        border-radius: 16rpx;
        overflow: hidden;
        margin-bottom: 12rpx;
        box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
        
        .cover {
          width: 100%;
          height: 300rpx;
        }
        
        .info {
          padding: 16rpx;
          
          .title {
            font-size: 26rpx;
            color: #333;
          }
        }
      }
    }
  }
  
  .footer-tip {
    padding: 60rpx 0;
    text-align: center;
    
    text {
      font-size: 24rpx;
      color: #ccc;
    }
  }
}

// 抽屉
.drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
}

.drawer {
  position: fixed;
  top: 0;
  left: -680rpx;
  bottom: 0;
  width: 680rpx;
  background: #f7f7f7;
  z-index: 1001;
  transition: left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  
  &.show {
    left: 0;
  }
  
  .drawer-scroll {
    flex: 1;
    padding: 60rpx 0 20rpx;
    background: #f7f7f7;
  }
  
  .drawer-footer {
    display: flex;
    padding: 20rpx 40rpx 40rpx;
    gap: 24rpx;
    background: #f7f7f7;
    border-top: 1rpx solid #e5e5e5;
    
    .footer-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12rpx;
      padding: 24rpx;
      background: #fff;
      border-radius: 16rpx;
      transition: all 0.15s;
      
      &:active {
        background: #f7f7f7;
        transform: scale(0.98);
      }
      
      text {
        font-size: 26rpx;
        color: #666;
      }
    }
  }
}

// 动画
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
