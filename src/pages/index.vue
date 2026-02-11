uni-tabbar-bottom<template>
  <view class="home-page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <!-- 小程序端顶部安全区域 -->
      <!-- #ifndef H5 -->
      <view :style="{height: statusBarHeight + 'px'}"></view>
      <!-- #endif -->
      
      <view class="navbar-content">
        <!-- 左侧：关注/发现切换 -->
        <view class="navbar-tabs">
          <view 
            class="tab-item" 
            :class="{'active': currentTab === 0}"
            @click="switchTab(0)"
          >
            <text>关注</text>
          </view>
          <view 
            class="tab-item" 
            :class="{'active': currentTab === 1}"
            @click="switchTab(1)"
          >
            <text>发现</text>
          </view>
        </view>
        
        <!-- 右侧：搜索图标 -->
        <view class="navbar-right" @click="handleSearch">
          <u-icon name="search" size="22" color="#333"></u-icon>
        </view>
      </view>
    </view>
    
    <!-- 分类tabs -->
    <view class="category-tabs" v-if="categories.length > 0">
      <scroll-view class="category-scroll" scroll-x scroll-with-animation>
        <view class="category-list">
          <view 
            class="category-item" 
            :class="{'active': currentCategory === ''}"
            @click="switchCategory('')"
          >
            <text>全部</text>
          </view>
          <view 
            class="category-item" 
            :class="{'active': currentCategory === item.categoryId}"
            v-for="item in categories" 
            :key="item.categoryId"
            @click="switchCategory(item.categoryId)"
          >
            <text>{{ item.categoryName }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view 
      class="content-scroll" 
      scroll-y 
      @scrolltolower="loadMore"
    >
      <!-- 瀑布流 -->
      <view class="waterfall-container" :style="{marginTop: waterfallMarginTop + 'px'}">
        <view class="waterfall-column">
          <view 
            v-for="(item, index) in leftImages" 
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
              <text class="item-title">{{ item.imageName || item.originalName }}</text>
              <view class="item-meta">
                <view class="author-info">
                  <view class="following-badge" v-if="item.isFollowing">
                    <text>已关注</text>
                  </view>
                  <image 
                    class="author-avatar" 
                    :src="item.createByUser?.avatar || '/static/images/profile.jpg'" 
                    mode="aspectFill"
                  ></image>
                  <text class="author-name">{{ item.createByUser?.nickName || '游客' }}</text>
                </view>
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
            @click="handleImageClick(item)"
          >
            <image 
              class="item-image" 
              :src="item.url" 
              mode="widthFix"
              :lazy-load="true"
            ></image>
            <view class="item-info">
              <text class="item-title">{{ item.imageName || item.originalName }}</text>
              <view class="item-meta">
                <view class="author-info">
                  <view class="following-badge" v-if="item.isFollowing">
                    <text>已关注</text>
                  </view>
                  <image 
                    class="author-avatar" 
                    :src="item.createByUser?.avatar || '/static/images/profile.jpg'" 
                    mode="aspectFill"
                  ></image>
                  <text class="author-name">{{ item.createByUser?.nickName || '游客' }}</text>
                </view>
                <view class="like-info">
                  <u-icon name="heart" size="14" color="#999"></u-icon>
                  <text>{{ item.likeCount || 0 }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载提示 -->
      <view class="load-tip" v-if="imageList.length > 0">
        <text v-if="loading">加载中...</text>
        <text v-else-if="!hasMore">没有更多了</text>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-tip" v-if="!loading && imageList.length === 0">
        <u-icon name="photo" size="80" color="#ccc"></u-icon>
        <text>暂无内容</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getPublicImages, getRecommendImages, getPublicCategories, getFollowingImages } from '@/api/picturebed/open'

// 状态
const statusBarHeight = ref(0)
const navbarContentHeight = ref(0) // 导航栏总高度（状态栏+内容）
const categoryTabsHeight = ref(120) // 分类tabs高度（rpx）
const currentTab = ref(1) // 0:关注 1:发现
const currentCategory = ref('') // 当前选中的分类ID，空字符串表示全部
const categories = ref<any[]>([]) // 分类列表
const imageList = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)
const queryParams = ref({
  pageNum: 1,
  pageSize: 20,
  categoryId: undefined as string | undefined
})

// 计算瀑布流容器的marginTop
const waterfallMarginTop = computed(() => {
  const navHeight = navbarContentHeight.value
  const tabsHeight = categories.value.length > 0 ? categoryTabsHeight.value / 2 : 0 // rpx转px
  return navHeight + tabsHeight
})

// 瀑布流分列
const leftImages = computed(() => {
  return imageList.value.filter((_, index) => index % 2 === 0)
})

const rightImages = computed(() => {
  return imageList.value.filter((_, index) => index % 2 === 1)
})

onMounted(() => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  
  // 计算导航栏总高度
  // #ifndef H5
  navbarContentHeight.value = 50 + statusBarHeight.value
  // #endif
  // #ifdef H5
  navbarContentHeight.value = 50
  // #endif
  
  // 加载分类列表
  loadCategories()
  // 加载真实数据
  loadData()
})

onShow(() => {
  // 页面显示时刷新数据
  if (imageList.value.length === 0) {
    loadData()
  }
})

// 切换Tab
const switchTab = (index: number) => {
  if (currentTab.value === index) return
  
  currentTab.value = index
  // 重置数据
  imageList.value = []
  queryParams.value.pageNum = 1
  hasMore.value = true
  loadData()
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const res = await getPublicCategories()
    if (res.code === 200) {
      categories.value = res.data || []
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 切换分类
const switchCategory = (categoryId: string) => {
  if (currentCategory.value === categoryId) return
  
  currentCategory.value = categoryId
  // 重置数据
  imageList.value = []
  queryParams.value.pageNum = 1
  hasMore.value = true
  loadData()
}

// 加载数据
const loadData = async () => {
  if (loading.value || !hasMore.value) return
  
  try {
    loading.value = true
    
    // 构建查询参数，过滤掉空值
    const params: any = {
      pageNum: queryParams.value.pageNum,
      pageSize: queryParams.value.pageSize
    }
    
    // 只有选择了具体分类时才传递categoryId
    if (currentCategory.value) {
      params.categoryId = currentCategory.value
    }
    
    // 根据Tab选择不同的接口
    const api = currentTab.value === 0 ? getFollowingImages : getRecommendImages
    const res = await api(params)
    
    if (res.code === 200) {
      const newImages = res.rows || []
      imageList.value = [...imageList.value, ...newImages]
      // 正确的判断：已加载数量 < 总数量
      hasMore.value = imageList.value.length < res.total
      queryParams.value.pageNum++
    }
  } catch (error) {
    console.error('加载失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  loadData()
}

// 搜索
const handleSearch = () => {
  uni.navigateTo({
    url: '/pages/search'
  })
}

// 点击图片
const handleImageClick = (item: any) => {
  uni.navigateTo({
    url: `/pages/detail?imageId=${item.imageId}`
  })
}
</script>

<style lang="scss" scoped>
.home-page {
  width: 100%;
  height: 100vh;
  background: #f7f7f7;
}

// 导航栏
.navbar {
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
    
    .navbar-tabs {
      display: flex;
      align-items: center;
      
      .tab-item {
        padding: 0 20rpx;
        margin-right: 20rpx;
        position: relative;
        
        text {
          font-size: 32rpx;
          color: #666;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        &.active {
          text {
            color: #333;
            font-weight: 600;
            font-size: 34rpx;
          }
          
          &::after {
            content: '';
            position: absolute;
            bottom: -10rpx;
            left: 50%;
            transform: translateX(-50%);
            width: 40rpx;
            height: 6rpx;
            background: #333;
            border-radius: 3rpx;
          }
        }
      }
    }
    
    .navbar-right {
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// 分类tabs
.category-tabs {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 998;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  
  // 小程序和App端需要顶部安全区域
  /* #ifndef H5 */
  top: calc(var(--status-bar-height) + 88rpx);
  /* #endif */
  
  // H5端只需要导航栏高度
  /* #ifdef H5 */
  top: 88rpx;
  /* #endif */
  
  .category-scroll {
    width: 100%;
    white-space: nowrap;
    
    .category-list {
      display: inline-flex;
      padding: 20rpx 30rpx;
      
      .category-item {
        padding: 12rpx 32rpx;
        margin-right: 20rpx;
        background: #f7f7f7;
        border-radius: 40rpx;
        flex-shrink: 0;
        transition: all 0.3s;
        
        text {
          font-size: 28rpx;
          color: #666;
          white-space: nowrap;
        }
        
        &.active {
          background: #000;
          
          text {
            color: #fff;
            font-weight: 600;
          }
        }
      }
    }
  }
}

// 内容滚动区域
.content-scroll {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
}

// 瀑布流容器
.waterfall-container {
  display: flex;
  padding: 16rpx;
  box-sizing: border-box;
  
  .waterfall-column {
    width: 50%;
    box-sizing: border-box;
    
    &:first-child {
      padding-right: 8rpx;
    }
    
    &:last-child {
      padding-left: 8rpx;
    }
    
    .waterfall-item {
      background: #fff;
      border-radius: 16rpx;
      overflow: hidden;
      margin-bottom: 16rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
      
      .item-image {
        width: 100%;
        display: block;
      }
      
      .item-info {
        padding: 20rpx;
        
        .item-title {
          display: block;
          font-size: 28rpx;
          color: #333;
          line-height: 1.5;
          margin-bottom: 16rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          font-weight: 500;
        }
        
        .item-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          
          .author-info {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;
            
            .following-badge {
              display: flex;
              align-items: center;
              padding: 8rpx 8rpx;
              background: #FFEEE1;
              border-radius: 8rpx;
              margin-right: 12rpx;
              flex-shrink: 0;
              
              text {
                font-size: 20rpx;
                color: #FF664A;
                line-height: 1;
              }
            }
            
            .author-avatar {
              width: 44rpx;
              height: 44rpx;
              border-radius: 50%;
              margin-right: 12rpx;
              flex-shrink: 0;
            }
            
            .author-name {
              font-size: 24rpx;
              color: #999;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
          
          .like-info {
            display: flex;
            align-items: center;
            margin-left: 16rpx;
            flex-shrink: 0;
            
            text {
              font-size: 24rpx;
              color: #999;
              margin-left: 6rpx;
            }
          }
        }
      }
    }
  }
}

// 加载提示
.load-tip {
  text-align: center;
  padding: 40rpx 0;
  
  text {
    font-size: 24rpx;
    color: #999;
  }
}

// 空状态
.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  
  text {
    font-size: 28rpx;
    color: #999;
    margin-top: 20rpx;
  }
}
</style>
