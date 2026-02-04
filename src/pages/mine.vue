<template>
  <view class="mine-page">
    <!-- 可滚动内容 -->
    <scroll-view 
      class="scroll-content" 
      scroll-y 
      @scroll="onScroll"
    >
<!--      :style="{height: scrollHeight + 'px'}"-->

      <!-- 头部区域 -->
      <view class="header-section">
        <!-- 固定顶部导航栏（在头部区域内，透明覆盖） -->
        <view class="fixed-navbar" :class="{'scrolled': isScrolled}" :style="{background: navbarBg}">
          <!-- 非H5端顶部安全区域（小程序和App） -->
          <!-- #ifndef H5 -->
          <view :style="{height: statusBarHeight + 'px'}"></view>
          <!-- #endif -->
          
          <view class="navbar-content" :style="{height: navbarContentHeight + 'px'}">
            <!-- H5端和App端：左右分开布局 -->
            <!-- #ifndef MP -->
            <view class="navbar-left" @click="showDrawer = true">
              <u-icon name="list" :color="isScrolled ? '#333' : '#fff'" size="24"></u-icon>
            </view>
            
            <!-- 滚动后显示的头像（使用computed确保条件严格） -->
            <view class="navbar-avatar" v-if="showNavbarAvatar" @click="handleToInfo">
              <image class="avatar-img" :src="userInfo?.avatar || '/static/images/profile.jpg'" mode="aspectFill"></image>
            </view>
            
            <view class="navbar-right" @click="handleScan">
              <u-icon name="scan" :color="isScrolled ? '#333' : '#fff'" size="24"></u-icon>
            </view>
            <!-- #endif -->
            
            <!-- 小程序端：左侧胶囊样式 -->
            <!-- #ifdef MP -->
            <view class="navbar-capsule" @click="showDrawer = true">
              <view class="capsule-icon">
                <u-icon name="list" :color="isScrolled ? '#333' : '#fff'" size="20"></u-icon>
              </view>
              <view class="capsule-divider"></view>
              <view class="capsule-icon" @click.stop="handleScan">
                <u-icon name="scan" :color="isScrolled ? '#333' : '#fff'" size="20"></u-icon>
              </view>
            </view>
            
            <!-- 占位，保持居中 -->
            <view class="navbar-placeholder"></view>
            <!-- #endif -->
          </view>
        </view>
        
        <image class="bg-image" :src="userBgImage || '/static/images/profile.jpg'" mode="aspectFill"></image>
        <view class="bg-mask"></view>
        
        <!-- 用户信息 -->
        <view class="user-info">
          <view class="avatar-row">
            <AvatarUpload 
              v-model="userInfo.avatar" 
              :enableCrop="false"
              @success="handleAvatarSuccess"
              @error="handleAvatarError"
            />
            
            <!-- 签到按钮（与头像同一行） -->
            <view class="checkin-btn" @click="handleCheckin" :class="{'signed': isSigned}">
              <u-icon name="calendar" :color="isSigned ? '#D4B07B' : '#fff'" size="16"></u-icon>
              <text>{{ isSigned ? '已签到' : '签到' }}</text>
            </view>
          </view>
          
          <view class="nickname" @tap="handleToEditInfo">{{ userInfo?.nickName || userInfo?.userName || 'xxxxxxxxx' }}</view>
          <view class="user-id" @tap="handleCopyUserId">
            <text>用户ID: {{ userInfo?.userId || 'xxxxxxxxx' }}</text>
          </view>
          <view class="bio" @tap="handleToEditInfo">
            <text>{{ userInfo?.signature || '点击这里,填写简介' }}</text>
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
            @click="handleTabChange(index)"
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
        <!-- Tab 0: 图片 -->
        <view v-if="currentTab === 0" class="tab-content">
          <!-- 加载中状态 -->
          <view v-if="myImagesPage.loading && myImages.length === 0" class="loading-state">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载中...</text>
          </view>
          <view v-else-if="myImages.length === 0 && !myImagesPage.loading" class="empty-state">
            <text class="empty-icon">📷</text>
            <text class="empty-text">还没有上传图片</text>
          </view>
          <view v-else class="waterfall-container">
            <view class="waterfall-column">
              <view 
                v-for="(item, index) in leftImages" 
                :key="item.imageId"
                class="waterfall-item"
                @click="handleToImageDetail(item.imageId)"
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
                v-for="(item, index) in rightImages" 
                :key="item.imageId"
                class="waterfall-item"
                @click="handleToImageDetail(item.imageId)"
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
          <view class="load-tip" v-if="myImages.length > 0">
            <text v-if="myImagesPage.loading">加载中...</text>
            <text v-else-if="!myImagesPage.hasMore">没有更多了</text>
          </view>
        </view>
        
        <!-- Tab 1: 相册 -->
        <view v-if="currentTab === 1" class="tab-content">
          <!-- 加载中状态 -->
          <view v-if="myAlbumsPage.loading && myAlbums.length === 0" class="loading-state">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载中...</text>
          </view>
          <view v-else-if="myAlbums.length === 0 && !myAlbumsPage.loading" class="empty-state">
            <text class="empty-icon">📁</text>
            <text class="empty-text">还没有创建相册</text>
          </view>
          <view v-else class="album-grid">
            <view 
              v-for="item in myAlbums" 
              :key="item.albumId"
              class="album-card"
              @click="handleToAlbumDetail(item.albumId)"
            >
              <image class="album-cover" :src="item.coverUrl || '/static/images/default-album.jpg'" mode="aspectFill"></image>
              <view class="album-info">
                <text class="album-title">{{ item.albumName }}</text>
                <text class="album-count">{{ item.imageCount || 0 }}张</text>
              </view>
            </view>
          </view>
          <view class="load-tip" v-if="myAlbums.length > 0">
            <text v-if="myAlbumsPage.loading">加载中...</text>
            <text v-else-if="!myAlbumsPage.hasMore">没有更多了</text>
          </view>
        </view>
        
        <!-- Tab 2: 点赞过 -->
        <view v-if="currentTab === 2" class="tab-content">
          <!-- 加载中状态 -->
          <view v-if="likedImagesPage.loading && likedImages.length === 0" class="loading-state">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载中...</text>
          </view>
          <view v-else-if="likedImages.length === 0 && !likedImagesPage.loading" class="empty-state">
            <text class="empty-icon">❤️</text>
            <text class="empty-text">还没有点赞过内容</text>
          </view>
          <view v-else class="waterfall-container">
            <view class="waterfall-column">
              <view 
                v-for="(item, index) in leftLikedImages" 
                :key="item.imageId"
                class="waterfall-item"
                @click="() => handleToImageDetail(item.imageId)"
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
                      <u-icon name="heart-fill" size="14" color="#ff2442"></u-icon>
                      <text>{{ item.likeCount || 0 }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view class="waterfall-column">
              <view 
                v-for="(item, index) in rightLikedImages" 
                :key="item.imageId"
                class="waterfall-item"
                @click="() => handleToImageDetail(item.imageId)"
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
                      <u-icon name="heart-fill" size="14" color="#ff2442"></u-icon>
                      <text>{{ item.likeCount || 0 }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view class="load-tip" v-if="likedImages.length > 0">
            <text v-if="likedImagesPage.loading">加载中...</text>
            <text v-else-if="!likedImagesPage.hasMore">没有更多了</text>
          </view>
        </view>
        
        <!-- Tab 3: 收藏过 -->
        <view v-if="currentTab === 3" class="tab-content">
          <!-- 加载中状态 -->
          <view v-if="favoritedImagesPage.loading && favoritedImages.length === 0" class="loading-state">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载中...</text>
          </view>
          <view v-else-if="favoritedImages.length === 0 && !favoritedImagesPage.loading" class="empty-state">
            <text class="empty-icon">⭐</text>
            <text class="empty-text">还没有收藏过内容</text>
          </view>
          <view v-else class="waterfall-container">
            <view class="waterfall-column">
              <view 
                v-for="(item, index) in leftLikedImages" 
                :key="item.imageId"
                class="waterfall-item"
                @click="() => handleToImageDetail(item.imageId)"
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
                      <u-icon name="heart-fill" size="14" color="#ff2442"></u-icon>
                      <text>{{ item.likeCount || 0 }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view class="waterfall-column">
              <view 
                v-for="(item, index) in rightLikedImages" 
                :key="item.imageId"
                class="waterfall-item"
                @click="() => handleToImageDetail(item.imageId)"
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
                      <u-icon name="heart-fill" size="14" color="#ff2442"></u-icon>
                      <text>{{ item.likeCount || 0 }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view class="load-tip" v-if="likedImages.length > 0">
            <text v-if="likedImagesPage.loading">加载中...</text>
            <text v-else-if="!likedImagesPage.hasMore">没有更多了</text>
          </view>
        </view>
        
        <view class="footer-tip">
          <text v-if="currentTab === 0 && myImages.length === 0 && !myImagesPage.loading">上传图片开始创作吧</text>
          <text v-else-if="currentTab === 2 && likedImages.length === 0 && !likedImagesPage.loading">去发现喜欢的内容吧</text>
          <text v-else-if="currentTab === 3 && favoritedImages.length === 0 && !favoritedImagesPage.loading">去收藏喜欢的内容吧</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 抽屉菜单 -->
    <view class="drawer-mask" v-if="showDrawer" @click="showDrawer = false"></view>
    <view class="drawer" :class="{'show': showDrawer}">
      <!-- 顶部安全区域（非H5端） -->
      <!-- #ifndef H5 -->
      <view :style="{height: statusBarHeight + 'px'}"></view>
      <!-- #endif -->
      
      <scroll-view class="drawer-scroll" scroll-y :style="{height: drawerScrollHeight + 'px'}">
        <CustomCellGroup>
          <CustomCell title="添加好友" icon="account" :isLink="true" @click="handleDrawerItem('friend')" />
          <CustomCell title="创作者中心" icon="edit-pen" :isLink="true" @click="handleDrawerItem('creator')" />
        </CustomCellGroup>
        
        <CustomCellGroup>
          <CustomCell title="我的草稿" icon="file-text" :isLink="true" @click="handleDrawerItem('draft')" />
          <CustomCell title="浏览记录" icon="clock" :isLink="true" @click="handleDrawerItem('history')" />
          <CustomCell title="我的下载" icon="download" :isLink="true" @click="handleDrawerItem('download')" />
        </CustomCellGroup>
        
        <CustomCellGroup>
          <CustomCell title="订单" icon="order" :isLink="true" @click="handleDrawerItem('order')" />
          <CustomCell title="购物车" icon="shopping-cart" :isLink="true" @click="handleDrawerItem('cart')" />
          <CustomCell title="钱包" icon="wallet" :isLink="true" @click="handleDrawerItem('wallet')" />
        </CustomCellGroup>
        
        <CustomCellGroup>
          <CustomCell title="小程序" icon="grid" :isLink="true" @click="handleDrawerItem('miniapp')" />
          <CustomCell title="社区公约" icon="chat" :isLink="true" @click="handleDrawerItem('community')" />
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
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import store from '@/store'
import { getMemberInfo, getCheckinStatus } from '@/api/mobile/member'
import { getMyImages, getMyAlbums, getLikedImages, getFavoritedImages } from '@/api/mobile/interaction'
import CustomCell from '@/components/CustomCell/CustomCell.vue'
import CustomCellGroup from '@/components/CustomCellGroup/CustomCellGroup.vue'
import AvatarUpload from '@/components/AvatarUpload/AvatarUpload.vue'

// 状态
const userInfo = computed(() => store.state.user.userProfile || {})
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
const currentTab = ref(0)
const tabs = ['图片', '相册', '点赞过', '收藏过']
const navbarContentHeight = ref(44) // 导航栏内容高度
const loadingRequestId = ref(0) // 请求ID，用于防止数据混乱
const navbarTotalHeight = ref(0) // 导航栏总高度（状态栏+内容）
const menuButtonInfo = ref({}) // 胶囊按钮信息
const drawerScrollHeight = ref(0) // 抽屉滚动区域高度

// 内容数据
const myImages = ref([]) // 我的图片
const myAlbums = ref([]) // 我的相册
const likedImages = ref([]) // 点赞过的图片
const favoritedImages = ref([]) // 收藏过的图片

// 分页参数
const myImagesPage = ref({ pageNum: 1, pageSize: 20, hasMore: true, loading: false, loaded: false })
const myAlbumsPage = ref({ pageNum: 1, pageSize: 20, hasMore: true, loading: false, loaded: false })
const likedImagesPage = ref({ pageNum: 1, pageSize: 20, hasMore: true, loading: false, loaded: false })
const favoritedImagesPage = ref({ pageNum: 1, pageSize: 20, hasMore: true, loading: false, loaded: false })

// 瀑布流左右列数据
const leftImages = computed(() => myImages.value.filter((_, index) => index % 2 === 0))
const rightImages = computed(() => myImages.value.filter((_, index) => index % 2 === 1))
const leftLikedImages = computed(() => likedImages.value.filter((_, index) => index % 2 === 0))
const rightLikedImages = computed(() => likedImages.value.filter((_, index) => index % 2 === 1))
const leftFavoritedImages = computed(() => favoritedImages.value.filter((_, index) => index % 2 === 0))
const rightFavoritedImages = computed(() => favoritedImages.value.filter((_, index) => index % 2 === 1))

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

// 头像显示条件（与navbarBg保持一致）
const showNavbarAvatar = computed(() => {
  // 只有当背景色不是透明时才显示头像
  return scrollTop.value >= 50
})

// Tab吸顶时的padding-top
const tabFixedPaddingTop = computed(() => {
  return `${navbarTotalHeight.value}px`
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
  // 确保初始状态正确
  isScrolled.value = false
  scrollTop.value = 0
  isTabFixed.value = false
  
  // 调试日志（仅App端）
  // #ifdef APP-PLUS
  console.log('页面初始化:', {
    isScrolled: isScrolled.value,
    scrollTop: scrollTop.value,
    showNavbarAvatar: showNavbarAvatar.value,
    navbarBg: navbarBg.value
  })
  // #endif
  
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  
  // #ifdef MP
  // 获取胶囊按钮信息（仅小程序）
  try {
    const menuButton = uni.getMenuButtonBoundingClientRect()
    menuButtonInfo.value = menuButton
    
    // 计算导航栏内容高度（与胶囊按钮对齐）
    navbarContentHeight.value = menuButton.height + (menuButton.top - statusBarHeight.value) * 2
  } catch (e) {
    console.error('获取胶囊信息失败:', e)
    navbarContentHeight.value = 44
  }
  // #endif
  
  // #ifndef MP
  // H5和App端使用默认高度
  navbarContentHeight.value = 44
  // #endif
  
  // 计算导航栏总高度
  // #ifndef H5
  // 小程序和App端：状态栏 + 导航栏内容
  navbarTotalHeight.value = statusBarHeight.value + navbarContentHeight.value
  // #endif
  // #ifdef H5
  // H5端：仅导航栏内容
  navbarTotalHeight.value = navbarContentHeight.value
  // #endif
  
  // 计算滚动区域高度
  scrollHeight.value = systemInfo.windowHeight
  
  // 计算抽屉滚动区域高度（总高度 - 状态栏 - 底部按钮区域）
  const drawerFooterHeight = 100 // 底部按钮区域高度
  // #ifndef H5
  drawerScrollHeight.value = systemInfo.windowHeight - statusBarHeight.value - drawerFooterHeight
  // #endif
  // #ifdef H5
  drawerScrollHeight.value = systemInfo.windowHeight - drawerFooterHeight
  // #endif
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
  const wasScrolled = isScrolled.value
  // 与navbarBg保持一致：scrollTop >= 50 时认为已滚动
  isScrolled.value = scrollTop.value >= 50
  
  // 调试日志（仅App端）
  // #ifdef APP-PLUS
  if (wasScrolled !== isScrolled.value) {
    console.log('滚动状态变化:', {
      scrollTop: scrollTop.value,
      isScrolled: isScrolled.value,
      showNavbarAvatar: showNavbarAvatar.value,
      navbarBg: navbarBg.value
    })
  }
  // #endif
  
  // Tab吸顶判断 - 当滚动到头部区域底部时
  // 头部高度约为 600rpx，需要转换为px
  const headerHeight = 600 * (uni.getSystemInfoSync().windowWidth / 750)
  isTabFixed.value = scrollTop.value > headerHeight - 100
}

onShow(() => {
  // 确保初始状态正确
  isScrolled.value = false
  scrollTop.value = 0
  
  // 调试日志（仅App端）
  // #ifdef APP-PLUS
  console.log('页面显示:', {
    isScrolled: isScrolled.value,
    scrollTop: scrollTop.value,
    showNavbarAvatar: showNavbarAvatar.value,
    navbarBg: navbarBg.value
  })
  // #endif
  
  if (store.state.user.token) {
    loadData()
    // 只加载默认Tab（图片）的数据
    loadCurrentTabData()
  }
})

// 下拉刷新
onPullDownRefresh(() => {
  // 根据当前Tab刷新对应的数据
  switch (currentTab.value) {
    case 0:
      loadMyImages(true).then(() => uni.stopPullDownRefresh())
      break
    case 1:
      loadMyAlbums(true).then(() => uni.stopPullDownRefresh())
      break
    case 2:
      loadLikedImages(true).then(() => uni.stopPullDownRefresh())
      break
    case 3:
      loadFavoritedImages(true).then(() => uni.stopPullDownRefresh())
      break
    default:
      uni.stopPullDownRefresh()
  }
})

// 上拉加载更多
onReachBottom(() => {
  // 根据当前Tab加载更多数据
  switch (currentTab.value) {
    case 0:
      loadMyImages(false)
      break
    case 1:
      loadMyAlbums(false)
      break
    case 2:
      loadLikedImages(false)
      break
    case 3:
      loadFavoritedImages(false)
      break
  }
})

// 页面跳转
const handleToInfo = () => {
  if (!store.state.user.token) {
    uni.navigateTo({ url: '/pages/login' })
    return
  }
  // 跳转到编辑资料页面
  handleToEditInfo()
}

const handleToEditInfo = () => {
  uni.navigateTo({ url: '/pages_mine/pages/info/edit' })
}

// 复制用户ID
const handleCopyUserId = () => {
  const userId = userInfo.value?.userId
  if (!userId) {
    uni.showToast({ title: '用户ID不存在', icon: 'none' })
    return
  }
  
  // 复制到剪贴板
  uni.setClipboardData({
    data: String(userId),
    success: () => {
      uni.showToast({ title: '复制成功', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '复制失败', icon: 'none' })
    }
  })
}

// 头像上传成功
const handleAvatarSuccess = (data) => {
  console.log('头像上传成功', data)
  
  // 更新store中的用户资料
  store.dispatch('UpdateUserProfileField', { 
    field: 'avatar', 
    value: data.imgUrl 
  })
  
  // 刷新用户信息
  loadUserInfo()
}

// 头像上传失败
const handleAvatarError = (error) => {
  console.error('头像上传失败', error)
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

// 跳转到图片详情
const handleToImageDetail = (imageId) => {
  uni.navigateTo({ url: `/pages/detail?imageId=${imageId}` })
}

// 跳转到相册详情
const handleToAlbumDetail = (albumId) => {
  uni.showToast({ title: '相册详情功能开发中', icon: 'none' })
  // TODO: 后续实现相册详情页
  // uni.navigateTo({ url: `/pages/album-detail?id=${albumId}` })
}

// 加载我的图片
const loadMyImages = async (refresh = false) => {
  if (myImagesPage.value.loading) return
  if (!refresh && !myImagesPage.value.hasMore) return
  
  // 生成新的请求ID
  const requestId = ++loadingRequestId.value
  const targetTab = 0
  
  try {
    myImagesPage.value.loading = true
    
    // 如果是刷新，重置分页
    if (refresh) {
      myImagesPage.value.pageNum = 1
      myImagesPage.value.hasMore = true
    }
    
    const res = await getMyImages({
      pageNum: myImagesPage.value.pageNum,
      pageSize: myImagesPage.value.pageSize
    })
    
    // 验证：只有当前Tab仍然是目标Tab，且请求ID匹配时才更新数据
    if (currentTab.value !== targetTab || requestId !== loadingRequestId.value) {
      console.log('请求已过期，忽略结果')
      return
    }
    
    if (res.code === 200 && res.rows) {
      const newImages = res.rows.map(item => ({
        imageId: item.imageId,
        imageName: item.imageName || '未命名',
        url: item.url || '/static/images/default-image.jpg',
        likeCount: item.likeCount || 0,
        favoriteCount: item.favoriteCount || 0,
        commentCount: item.commentCount || 0
      }))
      
      if (refresh) {
        myImages.value = newImages
      } else {
        myImages.value = [...myImages.value, ...newImages]
      }
      
      // 判断是否还有更多数据
      myImagesPage.value.hasMore = newImages.length >= myImagesPage.value.pageSize
      myImagesPage.value.pageNum++
      myImagesPage.value.loaded = true
    }
  } catch (error) {
    console.error('加载我的图片失败：', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    // 只有请求ID匹配时才关闭loading
    if (requestId === loadingRequestId.value) {
      myImagesPage.value.loading = false
    }
  }
}

// 加载我的相册
const loadMyAlbums = async (refresh = false) => {
  if (myAlbumsPage.value.loading) return
  if (!refresh && !myAlbumsPage.value.hasMore) return
  
  // 生成新的请求ID
  const requestId = ++loadingRequestId.value
  const targetTab = 1
  
  try {
    myAlbumsPage.value.loading = true
    
    // 如果是刷新，重置分页
    if (refresh) {
      myAlbumsPage.value.pageNum = 1
      myAlbumsPage.value.hasMore = true
    }
    
    const res = await getMyAlbums({
      pageNum: myAlbumsPage.value.pageNum,
      pageSize: myAlbumsPage.value.pageSize
    })
    
    // 验证：只有当前Tab仍然是目标Tab，且请求ID匹配时才更新数据
    if (currentTab.value !== targetTab || requestId !== loadingRequestId.value) {
      console.log('请求已过期，忽略结果')
      return
    }
    
    if (res.code === 200 && res.rows) {
      const newAlbums = res.rows.map(item => ({
        albumId: item.albumId,
        albumName: item.albumName || '未命名相册',
        coverUrl: item.albumCover || '/static/images/default-album.jpg',
        imageCount: item.imageCount || 0,
        description: item.description || ''
      }))
      
      if (refresh) {
        myAlbums.value = newAlbums
      } else {
        myAlbums.value = [...myAlbums.value, ...newAlbums]
      }
      
      // 判断是否还有更多数据
      myAlbumsPage.value.hasMore = newAlbums.length >= myAlbumsPage.value.pageSize
      myAlbumsPage.value.pageNum++
      myAlbumsPage.value.loaded = true
    }
  } catch (error) {
    console.error('加载我的相册失败：', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    // 只有请求ID匹配时才关闭loading
    if (requestId === loadingRequestId.value) {
      myAlbumsPage.value.loading = false
    }
  }
}

// 加载点赞过的图片
const loadLikedImages = async (refresh = false) => {
  if (likedImagesPage.value.loading) return
  if (!refresh && !likedImagesPage.value.hasMore) return
  
  // 生成新的请求ID
  const requestId = ++loadingRequestId.value
  const targetTab = 2
  
  try {
    likedImagesPage.value.loading = true
    
    // 如果是刷新，重置分页
    if (refresh) {
      likedImagesPage.value.pageNum = 1
      likedImagesPage.value.hasMore = true
    }
    
    const res = await getLikedImages({
      pageNum: likedImagesPage.value.pageNum,
      pageSize: likedImagesPage.value.pageSize
    })
    
    // 验证：只有当前Tab仍然是目标Tab，且请求ID匹配时才更新数据
    if (currentTab.value !== targetTab || requestId !== loadingRequestId.value) {
      console.log('请求已过期，忽略结果')
      return
    }
    
    if (res.code === 200 && res.rows) {
      const newImages = res.rows.map(item => ({
        imageId: item.imageId,
        imageName: item.imageName || '未命名',
        url: item.url || '/static/images/default-image.jpg',
        likeCount: item.likeCount || 0,
        favoriteCount: item.favoriteCount || 0,
        commentCount: item.commentCount || 0
      }))
      
      if (refresh) {
        likedImages.value = newImages
      } else {
        likedImages.value = [...likedImages.value, ...newImages]
      }
      
      // 判断是否还有更多数据
      likedImagesPage.value.hasMore = newImages.length >= likedImagesPage.value.pageSize
      likedImagesPage.value.pageNum++
      likedImagesPage.value.loaded = true
    }
  } catch (error) {
    console.error('加载点赞图片失败：', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    // 只有请求ID匹配时才关闭loading
    if (requestId === loadingRequestId.value) {
      likedImagesPage.value.loading = false
    }
  }
}

// 加载收藏过的图片
const loadFavoritedImages = async (refresh = false) => {
  if (favoritedImagesPage.value.loading) return
  if (!refresh && !favoritedImagesPage.value.hasMore) return
  
  // 生成新的请求ID
  const requestId = ++loadingRequestId.value
  const targetTab = 3
  
  try {
    favoritedImagesPage.value.loading = true
    
    // 如果是刷新，重置分页
    if (refresh) {
      favoritedImagesPage.value.pageNum = 1
      favoritedImagesPage.value.hasMore = true
    }
    
    const res = await getFavoritedImages({
      pageNum: favoritedImagesPage.value.pageNum,
      pageSize: favoritedImagesPage.value.pageSize
    })
    
    // 验证：只有当前Tab仍然是目标Tab，且请求ID匹配时才更新数据
    if (currentTab.value !== targetTab || requestId !== loadingRequestId.value) {
      console.log('请求已过期，忽略结果')
      return
    }
    
    if (res.code === 200 && res.rows) {
      const newImages = res.rows.map(item => ({
        imageId: item.imageId,
        imageName: item.imageName || '未命名',
        url: item.url || '/static/images/default-image.jpg',
        likeCount: item.likeCount || 0,
        favoriteCount: item.favoriteCount || 0,
        commentCount: item.commentCount || 0
      }))
      
      if (refresh) {
        favoritedImages.value = newImages
      } else {
        favoritedImages.value = [...favoritedImages.value, ...newImages]
      }
      
      // 判断是否还有更多数据
      favoritedImagesPage.value.hasMore = newImages.length >= favoritedImagesPage.value.pageSize
      favoritedImagesPage.value.pageNum++
      favoritedImagesPage.value.loaded = true
    }
  } catch (error) {
    console.error('加载收藏图片失败：', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    // 只有请求ID匹配时才关闭loading
    if (requestId === loadingRequestId.value) {
      favoritedImagesPage.value.loading = false
    }
  }
}

const handleCheckin = () => {
  uni.navigateTo({ url: '/pages/member-checkin' })
}

const handleScan = () => {
  uni.showToast({ title: '扫一扫功能开发中', icon: 'none' })
}

// 加载当前Tab的数据
const loadCurrentTabData = () => {
  switch (currentTab.value) {
    case 0:
      if (!myImagesPage.value.loaded) {
        loadMyImages(true)
      }
      break
    case 1:
      if (!myAlbumsPage.value.loaded) {
        loadMyAlbums(true)
      }
      break
    case 2:
      if (!likedImagesPage.value.loaded) {
        loadLikedImages(true)
      }
      break
    case 3:
      if (!favoritedImagesPage.value.loaded) {
        loadFavoritedImages(true)
      }
      break
  }
}

// 监听Tab切换
const handleTabChange = (index) => {
  if (currentTab.value === index) return
  
  // 切换Tab时，增加请求ID，使之前的请求失效
  loadingRequestId.value++
  
  currentTab.value = index
  loadCurrentTabData()
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

// 固定导航栏（在头部区域内）
.fixed-navbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  transition: background 0.3s ease;
  
  &.scrolled {
    position: fixed;
  }
  
  .navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 30rpx;
    height: 88rpx;
    
    // H5端样式
    .navbar-left,
    .navbar-right {
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
    
    // 小程序端胶囊样式
    .navbar-capsule {
      display: flex;
      align-items: center;
      height: 64rpx;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      border-radius: 32rpx;
      padding: 0 8rpx;
      transition: all 0.2s;
      
      &:active {
        opacity: 0.8;
      }
      
      .capsule-icon {
        width: 48rpx;
        height: 48rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .capsule-divider {
        width: 1rpx;
        height: 32rpx;
        background: rgba(255, 255, 255, 0.3);
        margin: 0 8rpx;
      }
    }
    
    .navbar-placeholder {
      width: 60rpx;
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
  /* #ifdef H5 */
  padding-top: 120rpx;
  /* #endif */
  /* #ifdef MP */
  padding-top: 180rpx;  // 小程序端增加padding避免与胶囊重合
  /* #endif */
  /* #ifdef APP-PLUS */
  padding-top: 140rpx;  // App端
  /* #endif */
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
    
    .avatar-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rpx;
      
      // AvatarUpload组件样式
      .avatar-upload {
        width: 140rpx !important;
        height: 140rpx !important;
        
        .avatar-wrapper {
          width: 140rpx !important;
          height: 140rpx !important;
          
          .avatar-image {
            width: 140rpx !important;
            height: 140rpx !important;
            border: 4rpx solid rgba(255,255,255,0.2);
          }
          
          .camera-icon {
            background: #FFD600;
          }
        }
      }
      
      .checkin-btn {
        background: rgba(255,255,255,0.25);
        backdrop-filter: blur(10px);
        border-radius: 40rpx;
        padding: 12rpx 24rpx;
        display: flex;
        align-items: center;
        
        .u-icon {
          margin-right: 8rpx;
        }
        
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
    
    .edit-btn {
      flex: 1;
      background: rgba(255,255,255,0.25);
      backdrop-filter: blur(10px);
      border-radius: 12rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16rpx;
      
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
    left: 0;
    right: 0;
    z-index: 998;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
    animation: slideDown 0.3s ease-out; // 添加下滑动画
    /* #ifdef MP */
    top: 0;
    /* #endif */
    /* #ifndef MP */
    top: 0;
    /* #endif */
  }
  
  .tabs {
    flex: 1;
    display: flex;
    
    .tab-item {
      position: relative;
      padding-bottom: 16rpx;
      margin-right: 48rpx;
      transition: all 0.2s; // 添加Tab切换动画
      
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
  background: #f7f7f7;
  min-height: 400rpx;
  padding: 20rpx 0;
  
  .tab-content {
    min-height: 400rpx;
    overflow: hidden; // 防止内容溢出
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
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
      min-width: 0; // 防止flex子项溢出
      
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
            word-break: break-all; // 强制换行
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
  
  // 相册网格
  .album-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;
    padding: 0 20rpx;
    width: 100%;
    box-sizing: border-box;
    
    .album-card {
      background: #fff;
      border-radius: 16rpx;
      overflow: hidden;
      width: 100%;
      
      .album-cover {
        width: 100%;
        height: 300rpx;
      }
      
      .album-info {
        padding: 16rpx;
        
        .album-title {
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          overflow: hidden;
          margin-bottom: 8rpx;
          word-break: break-all; // 强制换行
        }
        
        .album-count {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
  
  .footer-tip {
    padding: 40rpx 0 60rpx;
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
    background: #f7f7f7;
    border-top: 1rpx solid #e5e5e5;
    
    .footer-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24rpx;
      background: #fff;
      border-radius: 16rpx;
      transition: all 0.15s;
      margin-right: 24rpx;
      
      &:last-child {
        margin-right: 0;
      }
      
      image, .u-icon {
        margin-bottom: 12rpx;
      }
      
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
