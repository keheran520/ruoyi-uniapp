<template>
  <view class="follow-page">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack">
          <uni-icons type="back" size="24" color="#333"></uni-icons>
        </view>
        <view class="navbar-center">
          <view class="tab-group">
            <view 
              v-for="tab in tabs" 
              :key="tab.key"
              class="tab-item"
              :class="{ active: currentTab === tab.key }"
              @click="switchTab(tab.key)"
            >
              <text class="tab-text">{{ tab.label }}</text>
              <text v-if="tab.count !== undefined" class="tab-count">({{ tab.count }})</text>
            </view>
          </view>
        </view>
        <view class="navbar-right">
          <!-- 可以添加更多操作按钮 -->
        </view>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <uni-icons type="search" size="18" color="#999"></uni-icons>
        <input 
          class="search-input" 
          v-model="keyword"
          :placeholder="currentTab === 'following' ? '搜索已关注的人' : '搜索粉丝'"
          @confirm="handleSearch"
        />
        <uni-icons 
          v-if="keyword" 
          type="clear" 
          size="18" 
          color="#999"
          @click="clearSearch"
        ></uni-icons>
      </view>
    </view>

    <!-- 关注列表 -->
    <view v-if="currentTab === 'following'" class="content-wrapper">
      <!-- 分组筛选 -->
      <view class="filter-bar">
        <view class="filter-left">
          <text class="filter-title">我的关注 ({{ statistics.followingCount || 0 }})</text>
        </view>
        <view class="filter-right" @click="showSortMenu">
          <text class="filter-text">综合排序</text>
          <uni-icons type="down" size="14" color="#666"></uni-icons>
        </view>
      </view>

      <!-- 分组标签 -->
      <scroll-view class="group-tabs" scroll-x>
        <view 
          v-for="group in groups" 
          :key="group.id"
          class="group-tab"
          :class="{ active: currentGroup === group.id }"
          @click="selectGroup(group.id)"
        >
          {{ group.name }}
        </view>
      </scroll-view>

      <!-- 用户列表 -->
      <scroll-view 
        class="user-list"
        scroll-y
        @scrolltolower="loadMore"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view 
          v-for="user in userList" 
          :key="user.userId"
          class="user-item"
          @click="goToUserProfile(user.userId)"
        >
          <view class="user-avatar">
            <image :src="user.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
            <view v-if="user.verified" class="verified-badge">
              <uni-icons type="checkmarkempty" size="12" color="#fff"></uni-icons>
            </view>
          </view>
          
          <view class="user-info">
            <view class="user-name-row">
              <text class="user-name">{{ user.nickName }}</text>
              <text v-if="user.isMutual" class="mutual-badge">互相关注</text>
            </view>
            <text class="user-desc">{{ user.signature || '还没有个性签名~' }}</text>
            <text class="user-stats">{{ user.followerCount || 0 }} 粉丝</text>
          </view>
          
          <view class="user-action">
            <button 
              class="action-btn"
              :class="{ followed: user.isFollowing }"
              @click.stop="toggleFollow(user)"
            >
              <text class="btn-text">{{ user.isFollowing ? '已关注' : '关注' }}</text>
            </button>
            <view class="more-btn" @click.stop="showUserMenu(user)">
              <uni-icons type="more-filled" size="20" color="#999"></uni-icons>
            </view>
          </view>
        </view>

        <!-- 加载状态 -->
        <view class="load-more">
          <text v-if="loading">加载中...</text>
          <text v-else-if="noMore">没有更多了</text>
        </view>
      </scroll-view>
    </view>

    <!-- 粉丝列表 -->
    <view v-else-if="currentTab === 'followers'" class="content-wrapper">
      <view class="filter-bar">
        <view class="filter-left">
          <text class="filter-title">粉丝 ({{ statistics.followerCount || 0 }})</text>
        </view>
      </view>

      <scroll-view 
        class="user-list"
        scroll-y
        @scrolltolower="loadMore"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view 
          v-for="user in userList" 
          :key="user.userId"
          class="user-item"
          @click="goToUserProfile(user.userId)"
        >
          <view class="user-avatar">
            <image :src="user.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
          </view>
          
          <view class="user-info">
            <view class="user-name-row">
              <text class="user-name">{{ user.nickName }}</text>
              <text v-if="user.isMutual" class="mutual-badge">互相关注</text>
            </view>
            <text class="user-desc">{{ user.signature || '还没有个性签名~' }}</text>
          </view>
          
          <view class="user-action">
            <button 
              class="action-btn"
              :class="{ followed: user.isFollowing, mutual: user.isMutual }"
              @click.stop="toggleFollow(user)"
            >
              <text class="btn-text">{{ user.isMutual ? '互相关注' : (user.isFollowing ? '已关注' : '回关') }}</text>
            </button>
          </view>
        </view>

        <view class="load-more">
          <text v-if="loading">加载中...</text>
          <text v-else-if="noMore">没有更多了</text>
        </view>
      </scroll-view>
    </view>

    <!-- 推荐列表 -->
    <view v-else class="content-wrapper">
      <view class="recommend-tip">
        <uni-icons type="info" size="16" color="#999"></uni-icons>
        <text>为你推荐可能感兴趣的人</text>
      </view>
      <!-- 推荐列表内容 -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { 
  getFollowingList, 
  getFollowersList, 
  followUser, 
  unfollowUser,
  getFollowStatistics,
  type FollowUser,
  type FollowStatistics
} from '@/api/mobile/follow'

// 状态栏高度
const statusBarHeight = ref(0)

// 目标用户ID（如果查看他人的关注列表）
const targetUserId = ref<string>('')

// 当前标签
const currentTab = ref('following')

// 标签列表
const tabs = computed(() => [
  { key: 'following', label: '关注', count: statistics.value.followingCount },
  { key: 'followers', label: '粉丝', count: statistics.value.followerCount },
  { key: 'recommend', label: '推荐' }
])

// 搜索关键词
const keyword = ref('')

// 当前分组
const currentGroup = ref('all')

// 分组列表
const groups = ref([
  { id: 'all', name: '全部' },
  { id: 'mutual', name: '互关' }
])

// 用户列表
const userList = ref<FollowUser[]>([])

// 统计信息
const statistics = ref<FollowStatistics>({
  followingCount: 0,
  followerCount: 0,
  friendCount: 0
})

// 分页参数
const pageNum = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const refreshing = ref(false)
const noMore = ref(false)

// 页面加载时获取参数
onLoad((options: any) => {
  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  
  // 获取目标用户ID（如果有）
  if (options.userId) {
    targetUserId.value = String(options.userId)
  }
  
  // 根据参数设置初始Tab
  if (options.tab === 'followers') {
    currentTab.value = 'followers'
  } else if (options.tab === 'recommend') {
    currentTab.value = 'recommend'
  } else {
    currentTab.value = 'following'
  }
  
  // 加载统计信息
  loadStatistics()
  
  // 加载列表
  loadList()
})

// 加载统计信息
const loadStatistics = async () => {
  try {
    const res = await getFollowStatistics()
    if (res.code === 200) {
      statistics.value = res.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 加载列表
const loadList = async () => {
  if (loading.value || noMore.value) return
  
  loading.value = true
  
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      groupId: currentGroup.value !== 'all' ? currentGroup.value : undefined,
      userId: targetUserId.value || undefined
    }
    
    let res
    if (currentTab.value === 'following') {
      res = await getFollowingList(params)
    } else if (currentTab.value === 'followers') {
      res = await getFollowersList(params)
    }
    
    if (res && res.code === 200) {
      const newList = res.rows || []
      
      if (pageNum.value === 1) {
        userList.value = newList
      } else {
        userList.value = [...userList.value, ...newList]
      }
      
      noMore.value = newList.length < pageSize.value
    }
  } catch (error) {
    console.error('加载列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 切换标签
const switchTab = (tab: string) => {
  if (currentTab.value === tab) return
  
  currentTab.value = tab
  pageNum.value = 1
  noMore.value = false
  userList.value = []
  loadList()
}

// 搜索
const handleSearch = () => {
  pageNum.value = 1
  noMore.value = false
  userList.value = []
  loadList()
}

// 清空搜索
const clearSearch = () => {
  keyword.value = ''
  handleSearch()
}

// 选择分组
const selectGroup = (groupId: string) => {
  if (currentGroup.value === groupId) return
  
  currentGroup.value = groupId
  pageNum.value = 1
  noMore.value = false
  userList.value = []
  loadList()
}

// 加载更多
const loadMore = () => {
  if (!loading.value && !noMore.value) {
    pageNum.value++
    loadList()
  }
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  pageNum.value = 1
  noMore.value = false
  userList.value = []
  loadStatistics()
  loadList()
}

// 切换关注状态
const toggleFollow = async (user: FollowUser) => {
  try {
    if (user.isFollowing) {
      await unfollowUser(user.userId)
      user.isFollowing = false
      user.isMutual = false
      uni.showToast({
        title: '已取消关注',
        icon: 'success'
      })
    } else {
      await followUser(user.userId)
      user.isFollowing = true
      uni.showToast({
        title: '关注成功',
        icon: 'success'
      })
    }
    
    // 刷新统计
    loadStatistics()
  } catch (error) {
    console.error('操作失败:', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

// 显示排序菜单
const showSortMenu = () => {
  uni.showActionSheet({
    itemList: ['综合排序', '最近关注', '最早关注'],
    success: (res) => {
      console.log('选择了:', res.tapIndex)
    }
  })
}

// 显示用户菜单
const showUserMenu = (user: FollowUser) => {
  uni.showActionSheet({
    itemList: ['设置备注', '移至分组', '取消关注'],
    success: (res) => {
      if (res.tapIndex === 2) {
        toggleFollow(user)
      }
    }
  })
}

// 跳转到用户主页
const goToUserProfile = (userId: number) => {
  uni.navigateTo({
    url: `/pages_mine/pages/user/profile?userId=${userId}`
  })
}

// 返回
const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.follow-page {
  width: 100%;
  height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

.custom-navbar {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  
  .navbar-content {
    height: 44px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    
    .navbar-left {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .navbar-center {
      flex: 1;
      display: flex;
      justify-content: center;
      
      .tab-group {
        display: flex;
        gap: 24px;
        
        .tab-item {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 0;
          position: relative;
          
          .tab-text {
            font-size: 15px;
            color: #666;
            font-weight: 500;
          }
          
          .tab-count {
            font-size: 13px;
            color: #999;
          }
          
          &.active {
            .tab-text {
              color: #000;
              font-weight: 600;
            }
            
            &::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 20px;
              height: 3px;
              background-color: #000;
              border-radius: 2px;
            }
          }
        }
      }
    }
    
    .navbar-right {
      width: 44px;
    }
  }
}

.search-bar {
  padding: 12px 16px;
  background-color: #fff;
  
  .search-input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: #f5f5f5;
    border-radius: 20px;
    
    .search-input {
      flex: 1;
      font-size: 14px;
      color: #333;
    }
  }
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  
  .filter-title {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }
  
  .filter-right {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .filter-text {
      font-size: 13px;
      color: #666;
    }
  }
}

.group-tabs {
  white-space: nowrap;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  
  .group-tab {
    display: inline-block;
    padding: 6px 16px;
    margin-right: 12px;
    font-size: 13px;
    color: #666;
    background-color: #f5f5f5;
    border-radius: 16px;
    
    &.active {
      color: #fff;
      background-color: #000;
    }
  }
}

.user-list {
  flex: 1;
  background-color: #fff;
  
  .user-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f5f5f5;
    
    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 12px;
      position: relative;
      
      image {
        width: 100%;
        height: 100%;
      }
      
      .verified-badge {
        position: absolute;
        right: -2px;
        bottom: -2px;
        width: 16px;
        height: 16px;
        background-color: #000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #fff;
      }
    }
    
    .user-info {
      flex: 1;
      min-width: 0;
      
      .user-name-row {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        
        .user-name {
          font-size: 15px;
          color: #333;
          font-weight: 500;
        }
        
        .mutual-badge {
          font-size: 11px;
          color: #666;
          padding: 2px 6px;
          background-color: #f0f0f0;
          border-radius: 4px;
        }
      }
      
      .user-desc {
        font-size: 13px;
        color: #999;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;
        margin-bottom: 4px;
      }
      
      .user-stats {
        font-size: 12px;
        color: #999;
      }
    }
    
    .user-action {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .action-btn {
        min-width: 72px;
        height: 32px;
        padding: 0 16px;
        font-size: 14px;
        color: #fff;
        background-color: #000;
        border: none;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        
        &::after {
          border: none;
        }
        
        .btn-text {
          font-weight: 500;
        }
        
        &.followed {
          color: #333;
          background-color: #f5f5f5;
          border: 1px solid #e5e5e5;
          
          .btn-text {
            font-weight: 400;
          }
        }
        
        &.mutual {
          color: #333;
          background-color: #f5f5f5;
          border: 1px solid #e5e5e5;
          
          .btn-text {
            font-weight: 400;
          }
        }
      }
      
      .more-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

.load-more {
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: #999;
}

.recommend-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  font-size: 13px;
  color: #999;
}
</style>
