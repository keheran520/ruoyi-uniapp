<template>
  <view class="detail-page">
    <!-- 自定义导航栏 -->
    <view class="navbar">
      <!-- 小程序端顶部安全区域 -->
      <!-- #ifndef H5 -->
      <view :style="{height: statusBarHeight + 'px'}"></view>
      <!-- #endif -->
      
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack">
          <u-icon name="arrow-left" size="22" color="#fff"></u-icon>
        </view>
        <view class="navbar-right">
          <u-icon name="share" size="22" color="#fff" @click="handleShare"></u-icon>
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view class="content-scroll" scroll-y>
      <!-- 图片 -->
      <view class="image-container">
        <image 
          class="main-image" 
          :src="detail.url" 
          mode="widthFix"
          @click="previewImage"
        ></image>
      </view>
      
      <!-- 内容卡片 -->
      <view class="content-card">
        <!-- 标题和描述 -->
        <view class="title-section">
          <text class="title">{{ detail.imageName || detail.originalName }}</text>
          <text class="description" v-if="detail.description">{{ detail.description }}</text>
        </view>
        
        <!-- 作者信息 -->
        <view class="author-section" @click="goToUserProfile">
          <image 
            class="author-avatar" 
            :src="detail.createByUser?.avatar || '/static/images/profile.jpg'" 
            mode="aspectFill"
          ></image>
          <view class="author-info">
            <text class="author-name">{{ detail.createByUser?.nickName || '游客' }}</text>
            <text class="author-desc">{{ detail.createTime }}</text>
          </view>
          <view class="follow-btn" v-if="!isFollowing" @click.stop="handleFollow">
            <text>关注</text>
          </view>
        </view>
        
        <!-- 互动栏 -->
        <view class="action-bar">
          <view class="action-item" @click="handleLike">
            <u-icon 
              :name="isLiked ? 'heart-fill' : 'heart'" 
              size="24" 
              :color="isLiked ? '#ff2442' : '#666'"
            ></u-icon>
            <text :class="{'liked': isLiked}">{{ detail.likeCount || 0 }}</text>
          </view>
          <view class="action-item">
            <u-icon name="chat" size="24" color="#666"></u-icon>
            <text>{{ detail.commentCount || 0 }}</text>
          </view>
          <view class="action-item">
            <u-icon name="star" size="24" color="#666"></u-icon>
            <text>{{ detail.collectCount || 0 }}</text>
          </view>
        </view>
        
        <!-- 标签 -->
        <view class="tags-section" v-if="detail.tagList && detail.tagList.length > 0">
          <view 
            class="tag-item" 
            v-for="tag in detail.tagList" 
            :key="tag.tagId"
            @click="handleTagClick(tag)"
            :style="{
              background: tag.tagColor ? tag.tagColor + '20' : '#f7f7f7',
              borderColor: tag.tagColor || '#e0e0e0'
            }"
          >
            <text :style="{color: tag.tagColor || '#666'}">{{ tag.tagName }}</text>
          </view>
        </view>
        
        <!-- 分类信息 -->
        <view class="info-section">
          <view class="section-header">
            <text>图片信息</text>
          </view>
          
          <view class="info-item" v-if="detail.categoryName">
            <text class="info-label">分类</text>
            <text class="info-value">{{ detail.categoryName }}</text>
          </view>
          
          <view class="info-item" v-if="detail.albumName">
            <text class="info-label">相册</text>
            <text class="info-value">{{ detail.albumName }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">浏览</text>
            <text class="info-value">{{ detail.viewCount || 0 }}</text>
          </view>
          
          <view class="info-item" v-if="detail.ossExt">
            <text class="info-label">尺寸</text>
            <text class="info-value">{{ detail.ossExt.width }} × {{ detail.ossExt.height }}</text>
          </view>
          
          <view class="info-item" v-if="detail.ossExt">
            <text class="info-label">大小</text>
            <text class="info-value">{{ formatFileSize(detail.ossExt.fileSize) }}</text>
          </view>
          
          <view class="info-item" v-if="detail.ossExt">
            <text class="info-label">格式</text>
            <text class="info-value">{{ getFileFormat(detail.ossExt.contentType) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 评论区域 -->
      <view class="comment-section">
        <view class="section-title">
          <text>评论 {{ detail.commentCount || 0 }}</text>
        </view>
        <view class="empty-comment">
          <u-icon name="chat" size="60" color="#ccc"></u-icon>
          <text>暂无评论</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="input-box" @click="handleComment">
        <text>说点什么...</text>
      </view>
      <view class="bottom-actions">
        <view class="bottom-action" @click="handleLike">
          <u-icon 
            :name="isLiked ? 'heart-fill' : 'heart'" 
            size="26" 
            :color="isLiked ? '#ff2442' : '#666'"
          ></u-icon>
          <text :class="{'liked': isLiked}">{{ detail.likeCount || 0 }}</text>
        </view>
        <view class="bottom-action">
          <u-icon name="star" size="26" color="#666"></u-icon>
        </view>
        <view class="bottom-action">
          <u-icon name="share" size="26" color="#666"></u-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPublicImageDetail, likeImage, unlikeImage } from '@/api/picturebed/open'

// 状态
const statusBarHeight = ref(0)
const imageId = ref('')
const detail = ref<any>({})
const isLiked = ref(false)
const isFollowing = ref(false)

onMounted(() => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
})

onLoad((options: any) => {
  if (options.imageId) {
    imageId.value = String(options.imageId) // 保持字符串类型
    loadDetail() // 获取详情接口会自动增加浏览量
  }
})

// 加载详情
const loadDetail = async () => {
  try {
    const res = await getPublicImageDetail(imageId.value)
    if (res.code === 200) {
      detail.value = res.data
    }
  } catch (error) {
    console.error('加载失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 预览图片
const previewImage = () => {
  if (detail.value.url) {
    uni.previewImage({
      urls: [detail.value.url],
      current: 0
    })
  }
}

// 点赞
const handleLike = async () => {
  try {
    if (isLiked.value) {
      await unlikeImage(imageId.value)
      isLiked.value = false
      detail.value.likeCount = Math.max(0, (detail.value.likeCount || 0) - 1)
    } else {
      await likeImage(imageId.value)
      isLiked.value = true
      detail.value.likeCount = (detail.value.likeCount || 0) + 1
    }
  } catch (error) {
    console.error('操作失败:', error)
  }
}

// 关注
const handleFollow = () => {
  uni.showToast({
    title: '关注功能开发中',
    icon: 'none'
  })
}

// 评论
const handleComment = () => {
  uni.showToast({
    title: '评论功能开发中',
    icon: 'none'
  })
}

// 分享
const handleShare = () => {
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none'
  })
}

// 标签点击
const handleTagClick = (tag: any) => {
  uni.showToast({
    title: `标签: ${tag.tagName}`,
    icon: 'none'
  })
}

// 跳转用户主页
const goToUserProfile = () => {
  uni.showToast({
    title: '用户主页开发中',
    icon: 'none'
  })
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

// 获取文件格式
const getFileFormat = (contentType: string) => {
  if (!contentType) return '未知'
  const type = contentType.split('/')[1]
  return type ? type.toUpperCase() : '未知'
}
</script>

<style lang="scss" scoped>
.detail-page {
  width: 100%;
  min-height: 100vh;
  background: #f7f7f7;
}

// 导航栏
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  
  .navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 30rpx;
    
    .navbar-left,
    .navbar-right {
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 50%;
    }
  }
}

// 内容滚动区域
.content-scroll {
  width: 100%;
  min-height: 100vh;
  padding-bottom: 120rpx;
  box-sizing: border-box;
}

// 图片容器
.image-container {
  width: 100%;
  background: #000;
  
  .main-image {
    width: 100%;
    display: block;
  }
}

// 内容卡片
.content-card {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  margin-top: -30rpx;
  padding: 40rpx 30rpx;
  position: relative;
  z-index: 1;
}

// 标题区域
.title-section {
  margin-bottom: 30rpx;
  
  .title {
    display: block;
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    line-height: 1.5;
    margin-bottom: 16rpx;
  }
  
  .description {
    display: block;
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
  }
}

// 作者区域
.author-section {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  .author-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    flex-shrink: 0;
  }
  
  .author-info {
    flex: 1;
    min-width: 0;
    
    .author-name {
      display: block;
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 8rpx;
    }
    
    .author-desc {
      display: block;
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .follow-btn {
    padding: 12rpx 32rpx;
    background: #ff2442;
    border-radius: 40rpx;
    
    text {
      font-size: 26rpx;
      color: #fff;
      font-weight: 500;
    }
  }
}

// 互动栏
.action-bar {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  .action-item {
    display: flex;
    align-items: center;
    margin-right: 60rpx;
    
    text {
      font-size: 28rpx;
      color: #666;
      margin-left: 12rpx;
      
      &.liked {
        color: #ff2442;
      }
    }
  }
}

// 标签区域
.tags-section {
  display: flex;
  flex-wrap: wrap;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  .tag-item {
    padding: 12rpx 24rpx;
    background: #f7f7f7;
    border-radius: 8rpx;
    border: 1rpx solid #e0e0e0;
    margin-right: 16rpx;
    margin-bottom: 16rpx;
    
    text {
      font-size: 26rpx;
      color: #666;
    }
  }
}

// 信息区域
.info-section {
  padding: 30rpx 0;
  
  .section-header {
    margin-bottom: 24rpx;
    
    text {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
    }
  }
  
  .info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f7f7f7;
    
    &:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-size: 28rpx;
      color: #999;
    }
    
    .info-value {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }
  }
}

// 评论区域
.comment-section {
  background: #fff;
  margin-top: 20rpx;
  padding: 40rpx 30rpx;
  
  .section-title {
    margin-bottom: 30rpx;
    
    text {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }
  
  .empty-comment {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    
    text {
      font-size: 28rpx;
      color: #999;
      margin-top: 20rpx;
    }
  }
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  z-index: 999;
  
  .input-box {
    flex: 1;
    height: 72rpx;
    background: #f7f7f7;
    border-radius: 36rpx;
    padding: 0 30rpx;
    display: flex;
    align-items: center;
    margin-right: 20rpx;
    
    text {
      font-size: 28rpx;
      color: #999;
    }
  }
  
  .bottom-actions {
    display: flex;
    align-items: center;
    
    .bottom-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-left: 30rpx;
      
      text {
        font-size: 20rpx;
        color: #666;
        margin-top: 4rpx;
        
        &.liked {
          color: #ff2442;
        }
      }
    }
  }
}
</style>
