<template>
  <view class="search-page">
    <!-- 顶部搜索栏 -->
    <view class="search-header">
      <!-- 小程序端顶部安全区域 -->
      <!-- #ifndef H5 -->
      <view :style="{height: statusBarHeight + 'px'}"></view>
      <!-- #endif -->
      
      <view class="search-bar">
        <view class="back-btn" @click="goBack">
          <u-icon name="arrow-left" size="20" color="#333"></u-icon>
        </view>
        
        <view class="search-input-wrapper shadow">
          <u-icon name="search" size="20" color="#999"></u-icon>
          <input 
            class="search-input" 
            v-model="keyword" 
            placeholder="搜索图片名称、分类、标签..."
            placeholder-class="input-placeholder"
            confirm-type="search"
            @confirm="handleSearch"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
            :focus="autoFocus"
          />
          <u-icon 
            v-if="keyword" 
            name="close-circle-fill" 
            size="16" 
            color="#ccc" 
            @click="clearKeyword"
          ></u-icon>
        </view>
        
        <view class="camera-btn">
          <u-icon name="camera" size="22" color="#333"></u-icon>
        </view>
        
        <text class="search-text" @click="handleSearch">搜索</text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view 
      class="content-scroll" 
      scroll-y
      :style="{marginTop: headerHeight + 'px', height: scrollHeight + 'px'}"
      @scrolltolower="loadMore"
    >
      <!-- 搜索建议列表 -->
      <view v-if="showSuggestions" class="suggestions-list">
        <!-- 有建议时显示 -->
        <view 
          v-if="suggestions.length > 0"
          v-for="(item, index) in suggestions" 
          :key="index"
          class="suggestion-item"
          @click="selectSuggestion(item)"
        >
          <!-- 空状态 -->
          <view v-if="item.type === 'empty'" class="suggestion-empty">
            <u-icon name="info-circle" size="16" color="#999"></u-icon>
            <text class="ml-2">{{ item.value }}</text>
          </view>
          
          <!-- 错误状态 -->
          <view v-else-if="item.type === 'error'" class="suggestion-error">
            <u-icon name="close-circle" size="16" color="#f56c6c"></u-icon>
            <text class="ml-2">{{ item.value }}</text>
          </view>
          
          <!-- 正常建议 -->
          <view v-else class="suggestion-normal">
            <view class="suggestion-left">
              <u-icon name="search" size="16" color="#999" class="search-icon"></u-icon>
              <text class="suggestion-text" v-html="highlightKeyword(item.value, keyword)"></text>
            </view>
            
            <view class="suggestion-right">
              <!-- 类型标签 -->
              <view class="type-tag" :class="getTypeClass(item.type)">
                <text>{{ getTypeLabel(item.type) }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 无建议时显示提示 -->
        <view v-else class="suggestion-empty-state">
          <text>请输入关键词搜索</text>
        </view>
      </view>
      
      <!-- 搜索结果 -->
      <view v-if="hasSearched">
        <!-- 瀑布流 -->
        <view class="waterfall-container" v-if="imageList.length > 0">
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
                <text class="item-title">{{ item.imageName || item.originalName }}</text>
                <view class="item-meta">
                  <view class="author-info">
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
                <text class="item-title">{{ item.imageName || item.originalName }}</text>
                <view class="item-meta">
                  <view class="author-info">
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
          <u-icon name="search" size="80" color="#ccc"></u-icon>
          <text>没有找到相关内容</text>
          <text class="empty-desc">换个关键词试试吧</text>
        </view>
      </view>
      
      <!-- 搜索前的内容 -->
      <view v-else-if="!hasSearched && !showSuggestions" class="before-search">
        <!-- 历史记录 -->
        <view class="history-section" v-if="searchHistory.length > 0">
          <view class="section-header">
            <text class="section-title">历史记录</text>
            <u-icon name="trash" size="18" color="#999" @click="clearHistory"></u-icon>
          </view>
          
          <view class="history-tags">
            <view 
              class="history-tag" 
              v-for="(item, index) in searchHistory" 
              :key="index"
              @click="searchByHistory(item)"
            >
              <text>{{ item }}</text>
            </view>
          </view>
        </view>
        
        <!-- 猜你想搜 -->
        <view class="guess-section" v-if="guessTags.length > 0">
          <view class="section-header">
            <text class="section-title">猜你想搜</text>
          </view>
          
          <view class="guess-list">
            <view 
              class="guess-item" 
              v-for="tag in guessTags" 
              :key="tag.tagId"
              @click="searchByTag(tag)"
            >
              <text class="guess-text">{{ tag.value }}</text>
            </view>
          </view>
        </view>
        
        <!-- 热门榜单 -->
        <view class="hot-section">
          <view class="section-header">
            <text class="section-title">热门榜单</text>
          </view>
          
          <view class="hot-list">
            <view 
              class="hot-item" 
              v-for="(tag, index) in hotTags" 
              :key="tag.tagId"
              @click="searchByTag(tag)"
            >
              <view class="hot-rank" :class="{'top-three': index < 3}">
                {{ index + 1 }}
              </view>
              <view class="hot-content">
                <text class="hot-text">{{ tag.value }}</text>
                <view class="hot-badge" v-if="index < 3">
                  <text>热</text>
                </view>
              </view>
              <text class="hot-count">{{ formatCount(tag.count) }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { searchImages, getHotTags, getGuessTags, getSearchSuggestions } from '@/api/picturebed/open'

// 状态
const statusBarHeight = ref(0)
const headerHeight = ref(100)
const scrollHeight = ref(600)
const keyword = ref('')
const autoFocus = ref(true)
const showSuggestions = ref(false)
const suggestions = ref<any[]>([])
const hotTags = ref<any[]>([])
const guessTags = ref<any[]>([])
const searchHistory = ref<string[]>([])
const hasSearched = ref(false)
const imageList = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)
const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 20
})

// 防抖定时器
let debounceTimer: any = null
// 失焦延迟定时器
let blurTimer: any = null

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
  
  // 计算头部高度
  // #ifndef H5
  headerHeight.value = 50 + statusBarHeight.value
  // #endif
  // #ifdef H5
  headerHeight.value = 50
  // #endif
  
  // 计算滚动区域高度
  scrollHeight.value = systemInfo.windowHeight - headerHeight.value
  
  // 加载热门标签
  loadHotTags()
  // 加载猜你想搜
  loadGuessTags()
  // 加载搜索历史
  loadSearchHistory()
})

onLoad((options: any) => {
  if (options.keyword) {
    keyword.value = options.keyword
    autoFocus.value = false
    handleSearch()
  }
})

// 加载热门标签
const loadHotTags = async () => {
  try {
    const res = await getHotTags(20)
    if (res.code === 200) {
      hotTags.value = res.data || []
    }
  } catch (error) {
    console.error('加载热门标签失败:', error)
  }
}

// 加载猜你想搜
const loadGuessTags = async () => {
  try {
    // 传递用户的搜索历史
    const res = await getGuessTags(6, searchHistory.value)
    if (res.code === 200) {
      guessTags.value = res.data || []
    }
  } catch (error) {
    console.error('加载猜你想搜失败:', error)
  }
}

// 加载搜索历史
const loadSearchHistory = () => {
  try {
    const history = uni.getStorageSync('searchHistory')
    if (history) {
      searchHistory.value = JSON.parse(history)
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

// 保存搜索历史
const saveSearchHistory = (kw: string) => {
  if (!kw) return
  
  // 移除重复项
  const index = searchHistory.value.indexOf(kw)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  
  // 添加到开头
  searchHistory.value.unshift(kw)
  
  // 最多保存20条
  if (searchHistory.value.length > 20) {
    searchHistory.value = searchHistory.value.slice(0, 20)
  }
  
  // 保存到本地
  try {
    uni.setStorageSync('searchHistory', JSON.stringify(searchHistory.value))
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

// 输入变化（防抖）
const handleInput = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  debounceTimer = setTimeout(async () => {
    // 如果没有内容，隐藏搜索建议
    if (!keyword.value || keyword.value.trim().length === 0) {
      showSuggestions.value = false
      suggestions.value = []
      return
    }
    
    // 有内容时，获取搜索建议
    await loadSearchSuggestions()
  }, 300)
}

// 加载搜索建议
const loadSearchSuggestions = async () => {
  try {
    const res = await getSearchSuggestions(keyword.value, 10)
    
    if (res.code === 200) {
      const data = res.data || []
      
      if (data.length === 0) {
        // 空状态
        suggestions.value = [{
          type: 'empty',
          value: '暂无搜索建议'
        }]
      } else {
        // 标记热门标签
        suggestions.value = data.map((item: any) => {
          // 如果是标签类型，检查是否是热门标签
          if (item.type === 'tag') {
            const isHot = hotTags.value.some(hot => hot.tagId === item.tagId)
            return {
              ...item,
              isHot
            }
          }
          return item
        })
      }
      
      showSuggestions.value = true
    }
  } catch (error) {
    console.error('获取搜索建议失败:', error)
    suggestions.value = [{
      type: 'error',
      value: '获取搜索建议失败'
    }]
    showSuggestions.value = true
  }
}

// 聚焦时触发搜索建议
const handleFocus = () => {
  // 清除失焦定时器
  if (blurTimer) {
    clearTimeout(blurTimer)
    blurTimer = null
  }
  
  // 只有当搜索框有内容时，才调用搜索建议
  if (keyword.value && keyword.value.trim().length > 0) {
    // 如果已经搜索过，先隐藏搜索结果
    if (hasSearched.value) {
      hasSearched.value = false
    }
    loadSearchSuggestions()
  }
  // 如果没有内容，不做任何操作（不显示也不隐藏）
}

// 失焦时隐藏搜索建议
const handleBlur = () => {
  // 延迟隐藏，让点击建议的事件能够触发
  blurTimer = setTimeout(() => {
    showSuggestions.value = false
    suggestions.value = []
  }, 200)
}

// 选择搜索建议
const selectSuggestion = (item: any) => {
  // 清除失焦定时器
  if (blurTimer) {
    clearTimeout(blurTimer)
    blurTimer = null
  }
  
  if (item.type === 'empty' || item.type === 'error') {
    return
  }
  
  keyword.value = item.value
  showSuggestions.value = false
  suggestions.value = []
  handleSearch()
}

// 高亮关键词
const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword || !text) return text
  
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<span style="color: #ff2442; font-weight: 600;">$1</span>')
}

// 搜索
const handleSearch = () => {
  if (!keyword.value.trim()) {
    uni.showToast({
      title: '请输入搜索关键词',
      icon: 'none'
    })
    return
  }
  
  hasSearched.value = true
  imageList.value = []
  queryParams.value.pageNum = 1
  hasMore.value = true
  
  // 保存搜索历史
  saveSearchHistory(keyword.value.trim())
  
  // 执行搜索
  loadSearchResults()
}

// 加载搜索结果
const loadSearchResults = async () => {
  if (loading.value || !hasMore.value) return
  
  try {
    loading.value = true
    
    const res = await searchImages(keyword.value, queryParams.value)
    
    if (res.code === 200) {
      const newImages = res.rows || []
      imageList.value = [...imageList.value, ...newImages]
      total.value = res.total || 0
      hasMore.value = newImages.length === queryParams.value.pageSize
      queryParams.value.pageNum++
    }
  } catch (error) {
    console.error('搜索失败:', error)
    uni.showToast({
      title: '搜索失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (hasSearched.value && hasMore.value && !loading.value) {
    loadSearchResults()
  }
}

// 按标签搜索
const searchByTag = (tag: any) => {
  keyword.value = tag.value
  handleSearch()
}

// 按历史搜索
const searchByHistory = (kw: string) => {
  keyword.value = kw
  handleSearch()
}

// 清空关键词
const clearKeyword = () => {
  keyword.value = ''
  showSuggestions.value = false
  hasSearched.value = false
  imageList.value = []
}

// 清空历史
const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定清空搜索历史吗？',
    success: (res) => {
      if (res.confirm) {
        searchHistory.value = []
        uni.removeStorageSync('searchHistory')
      }
    }
  })
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 点击图片
const handleImageClick = (item: any) => {
  uni.navigateTo({
    url: `/pages/detail?imageId=${item.imageId}`
  })
}

// 格式化数量
const formatCount = (count: number) => {
  if (!count) return '0'
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

// 获取类型标签文本
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'name': '名称',
    'category': '分类',
    'tag': '标签',
    'description': '描述'
  }
  return typeMap[type] || '其他'
}

// 获取类型标签样式类
const getTypeClass = (type: string) => {
  return `type-${type}`
}
</script>

<style lang="scss" scoped>
.search-page {
  width: 100%;
  min-height: 100vh;
  //background: #f1f1f1;
  background: #ffffff;
}

// 顶部搜索栏
.search-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: #fff;
  
  .search-bar {
    display: flex;
    align-items: center;
    padding: 16rpx 30rpx;
    gap: 16rpx;
    
    .back-btn {
      flex-shrink: 0;
    }
    
    .search-input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      height: 50rpx;
      background: #f7f7f7;
      border-radius: 34rpx;
      padding: 0 30rpx;
      gap: 16rpx;
      
      &.shadow {
        box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
      }
      
      .search-input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }
      
      .input-placeholder {
        color: #999;
      }
    }
    
    .camera-btn {
      flex-shrink: 0;
    }
    
    .search-text {
      flex-shrink: 0;
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }
  }
}

// 内容滚动区域
.content-scroll {
  width: 100%;
  box-sizing: border-box;
}

// 搜索建议列表
.suggestions-list {
  background: #fff;
  
  .suggestion-item {
    padding: 16rpx 32rpx;
    border-bottom: 1rpx solid #f7f7f7;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:active {
      background: #f7f7f7;
    }
    
    .suggestion-empty,
    .suggestion-error {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 28rpx;
      
      .ml-2 {
        margin-left: 12rpx;
      }
    }
    
    .suggestion-error {
      color: #f56c6c;
    }
    
    .suggestion-normal {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .suggestion-left {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        
        .search-icon {
          margin-right: 20rpx;
          flex-shrink: 0;
        }
        
        .suggestion-text {
          font-size: 28rpx;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      
      .suggestion-right {
        display: flex;
        align-items: center;
        margin-left: 16rpx;
        flex-shrink: 0;
        gap: 12rpx;
        
        .type-tag {
          padding: 6rpx 16rpx;
          border-radius: 8rpx;
          font-size: 22rpx;
          
          text {
            color: #fff;
            font-weight: 500;
          }
          
          &.type-name {
            background: #409eff;
          }
          
          &.type-category {
            background: #e6a23c;
          }
          
          &.type-tag {
            background: #f56c6c;
          }
          
          &.type-description {
            background: #67c23a;
          }
        }
        
        .search-icon {
          flex-shrink: 0;
        }
      }
    }
  }
  
  .suggestion-empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 200rpx 0;
    
    text {
      font-size: 28rpx;
      color: #999;
    }
  }
}

// 搜索前的内容
.before-search {
  padding: 26rpx;
}

// 历史记录
.history-section {
  margin-bottom: 40rpx;
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;

    .section-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
    }
  }
  
  .history-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    
    .history-tag {
      padding: 16rpx 32rpx;
      background: #f7f7f7;
      border-radius: 40rpx;
      max-width: 100%;
      
      text {
        font-size: 26rpx;
        color: #666;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;
      }
    }
  }
}

// 猜你想搜
.guess-section {
  margin-bottom: 40rpx;
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
    
    .section-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
    }
  }
  
  .guess-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    
    .guess-item {
      padding: 18rpx  0;
      
      .guess-text {
        font-size: 28rpx;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

// 热门榜单
.hot-section {
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
    
    .section-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
    }
  }
  
  .hot-list {
    border-radius: 16rpx;
    overflow: hidden;
    
    .hot-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18rpx 0;
      gap: 20rpx;

      .hot-rank {
        width: 48rpx;
        height: 48rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        font-weight: 600;
        color: #999;
        flex-shrink: 0;
        
        &.top-three {
          color: #ff2442;
        }
      }
      
      .hot-content {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12rpx;
        min-width: 0;

        .hot-text {
          flex: 1;
          font-size: 28rpx;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .hot-badge {
          flex-shrink: 0;
          padding: 4rpx 12rpx;
          background: #ff2442;
          border-radius: 8rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          
          text {
            font-size: 20rpx;
            color: #fff;
            font-weight: 600;
          }
        }
      }
      
      .hot-count {
        flex-shrink: 0;
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

// 瀑布流容器
.waterfall-container {
  display: flex;
  padding: 0 16rpx 16rpx;
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
    
    &.empty-desc {
      font-size: 24rpx;
      color: #ccc;
      margin-top: 12rpx;
    }
  }
}
</style>
