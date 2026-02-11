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
    
    <!-- 页面加载中 -->
    <view v-if="pageLoading" class="page-loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view v-else class="content-scroll" scroll-y>
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
        <!-- 标题和描�?-->
        <view class="title-section">
          <text class="title">{{ detail.imageName || detail.originalName }}</text>
          <text class="description" v-if="detail.description">{{ detail.description }}</text>
        </view>
        
        <!-- 作者信�?-->
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
          <view 
            v-if="!isOwnImage"
            class="follow-btn" 
            :class="{'following': isFollowing, 'loading': followLoading}" 
            @click.stop="handleFollow"
          >
            <view v-if="followLoading" class="loading-spinner-btn"></view>
            <text v-else>{{ isFollowing ? '已关注' : '关注' }}</text>
          </view>
        </view>
        
        <!-- 互动栏 -->
        <view class="action-bar">
          <view class="action-item" @click="handleLike" :class="{'loading': likeLoading}">
            <view v-if="likeLoading" class="loading-spinner-small"></view>
            <u-icon 
              v-else
              :name="isLiked ? 'heart-fill' : 'heart'" 
              size="24" 
              :color="isLiked ? '#ff2442' : '#666'"
            ></u-icon>
            <text :class="{'liked': isLiked}">{{ detail.likeCount || 0 }}</text>
          </view>
          <view class="action-item" @click="handleComment">
            <u-icon name="chat" size="24" color="#666"></u-icon>
            <text>{{ detail.commentCount || 0 }}</text>
          </view>
          <view class="action-item" @click="handleFavorite" :class="{'loading': favoriteLoading}">
            <view v-if="favoriteLoading" class="loading-spinner-small"></view>
            <u-icon 
              v-else
              :name="isFavorited ? 'star-fill' : 'star'" 
              size="24" 
              :color="isFavorited ? '#ffa500' : '#666'"
            ></u-icon>
            <text :class="{'favorited': isFavorited}">{{ detail.collectCount || 0 }}</text>
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
          <text>评论 {{ commentTotal }}</text>
        </view>
        
        <!-- 评论列表 -->
        <view v-if="commentList.length > 0" class="comment-list">
          <view 
            v-for="comment in commentList" 
            :key="comment.commentId"
            class="comment-item"
          >
            <image 
              class="comment-avatar" 
              :src="comment.userAvatar || '/static/images/profile.jpg'" 
              mode="aspectFill"
              @click="goToUserProfile"
            ></image>
            
            <view class="comment-content">
              <view class="comment-header">
                <view class="comment-user-info">
                  <text class="comment-user">{{ comment.userName || '游客' }}</text>
                  <text v-if="comment.location" class="comment-location">· {{ comment.location }}</text>
                </view>
                <view class="comment-like" @click.stop="handleLikeComment(comment)">
                  <u-icon 
                    :name="comment.isLiked ? 'heart-fill' : 'heart'" 
                    size="18" 
                    :color="comment.isLiked ? '#ff2442' : '#999'"
                  ></u-icon>
                  <text :class="{'liked': comment.isLiked}">{{ comment.likeCount || '' }}</text>
                </view>
              </view>
              
              <text class="comment-text">{{ comment.content }}</text>
              
              <view class="comment-footer">
                <text class="comment-time">{{ formatTime(comment.createTime) }}</text>
                <view class="comment-actions">
                  <text class="comment-action" @click.stop="handleReplyComment(comment)">回复</text>
                  <text 
                    v-if="comment.isOwner" 
                    class="comment-action delete-action" 
                    @click.stop="handleDeleteComment(comment)"
                  >删除</text>
                </view>
              </view>
              
              <!-- 回复列表 -->
              <view v-if="comment.children && comment.children.length > 0" class="reply-list">
                <view 
                  v-for="reply in comment.children" 
                  :key="reply.commentId"
                  class="reply-item"
                >
                  <view class="reply-content" @click.stop="handleReplyComment(reply)">
                    <text class="reply-user">{{ reply.userName }}</text>
                    <text v-if="reply.replyToUserName" class="reply-to">回复 {{ reply.replyToUserName }}</text>
                    <text class="reply-text">：{{ reply.content }}</text>
                  </view>
                  
                  <!-- 回复的点赞按钮 -->
                  <view class="reply-like" @click.stop="handleLikeComment(reply)">
                    <u-icon 
                      :name="reply.isLiked ? 'heart-fill' : 'heart'" 
                      size="14" 
                      :color="reply.isLiked ? '#ff2442' : '#999'"
                    ></u-icon>
                    <text v-if="reply.likeCount > 0" :class="{'liked': reply.isLiked}">{{ reply.likeCount }}</text>
                  </view>
                </view>
                
                <!-- 展开/收起按钮 -->
                <view class="reply-actions">
                  <!-- 展开更多回复 -->
                  <view 
                    v-if="!replyExpandStatus.get(comment.commentId)?.expanded && comment.replyCount > 3" 
                    class="reply-action-btn"
                    @click.stop="toggleReplies(comment)"
                  >
                    <text>展开{{ comment.replyCount - 3 }}条回复</text>
                    <u-icon name="arrow-down" size="12" color="#666"></u-icon>
                  </view>
                  
                  <!-- 加载更多 -->
                  <view 
                    v-if="replyExpandStatus.get(comment.commentId)?.expanded && replyExpandStatus.get(comment.commentId)?.hasMore" 
                    class="reply-action-btn"
                    @click.stop="loadMoreReplies(comment, true)"
                  >
                    <text v-if="!replyExpandStatus.get(comment.commentId)?.loading">加载更多回复</text>
                    <text v-else>加载中...</text>
                  </view>
                  
                  <!-- 收起回复 -->
                  <view 
                    v-if="replyExpandStatus.get(comment.commentId)?.expanded" 
                    class="reply-action-btn"
                    @click.stop="toggleReplies(comment)"
                  >
                    <text>收起回复</text>
                    <u-icon name="arrow-up" size="12" color="#666"></u-icon>
                  </view>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 加载更多 -->
          <view 
            v-if="commentList.length < commentTotal" 
            class="load-more"
            @click="loadComments(true)"
          >
            <text>{{ commentLoading ? '加载更多' : '查看更多评论' }}</text>
          </view>
        </view>
        
        <!-- 空状-->
        <view v-else class="empty-comment">
          <u-icon name="chat" size="60" color="#ccc"></u-icon>
          <text>暂无评论，快来抢沙发吧~</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作-->
    <view class="bottom-bar">
      <view class="input-box" @click="handleComment">
        <text>{{ replyToComment ? `回复 ${replyToComment.userName}` : '说点什么呢?' }}</text>
      </view>
      <view class="bottom-actions">
        <view class="bottom-action" @click="handleShare">
          <u-icon name="share" size="26" color="#666"></u-icon>
        </view>
      </view>
    </view>
    
    <!-- 评论输入弹窗 -->
    <view v-if="showCommentInput" class="comment-modal" @click="handleCancelComment">
      <view class="comment-input-box" @click.stop>
        <view class="comment-input-header">
          <text>{{ replyToComment ? `回复 ${replyToComment.userName}` : '发表评论' }}</text>
          <u-icon name="close" size="20" color="#666" @click="handleCancelComment"></u-icon>
        </view>
        <textarea 
          v-model="commentContent"
          class="comment-textarea"
          placeholder="说点什么呢"
          :focus="showCommentInput"
          :maxlength="500"
        ></textarea>
        <view class="comment-input-footer">
          <text class="comment-count">{{ commentContent.length }}/500</text>
          <view class="comment-submit" @click="handleSubmitComment" :class="{'loading': commentSubmitLoading}">
            <view v-if="commentSubmitLoading" class="loading-spinner-white"></view>
            <text v-else>发布</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPublicImageDetail } from '@/api/picturebed/open'
import { 
  likeImage, 
  unlikeImage, 
  favoriteImage, 
  unfavoriteImage,
  getImageInteractionStatus,
  getImageComments,
  getCommentReplies,
  addComment,
  deleteComment,
  likeComment,
  unlikeComment
} from '@/api/mobile/interaction'
import { followUser, unfollowUser, checkFollowStatus } from '@/api/mobile/follow'
import store from '@/store'

// 状态
const statusBarHeight = ref(0)
const imageId = ref('')
const detail = ref<any>({})
const isLiked = ref(false)
const isFavorited = ref(false)
const isFollowing = ref(false)

// 当前登录用户ID
const currentUserId = computed(() => store.state.user.userProfile?.userId)

// 是否是自己的图片
const isOwnImage = computed(() => {
  return currentUserId.value && detail.value.createBy && 
         String(currentUserId.value) === String(detail.value.createBy)
})

// Loading状态
const pageLoading = ref(true) // 页面加载状态
const likeLoading = ref(false) // 点赞加载状态
const favoriteLoading = ref(false) // 收藏加载状态
const commentSubmitLoading = ref(false) // 评论提交加载状态
const followLoading = ref(false) // 关注加载状态

// 评论相关
const commentList = ref<any[]>([])
const commentTotal = ref(0)
const commentPageNum = ref(1)
const commentPageSize = ref(10)
const commentLoading = ref(false)
const showCommentInput = ref(false)
const commentContent = ref('')
const replyToComment = ref<any>(null)

// 回复展开状态管理
const replyExpandStatus = ref<Map<number, any>>(new Map())
// Map结构: commentId -> { expanded: boolean, pageNum: number, loading: false, hasMore: true }

onMounted(() => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
})

onLoad((options: any) => {
  if (options.imageId) {
    imageId.value = String(options.imageId) // 保持字符串类型
    loadDetail() // 获取图片详情
    loadInteractionStatus() // 加载互动状态
    loadComments() // 加载评论列表
  }
})

// 加载详情
const loadDetail = async () => {
  try {
    pageLoading.value = true
    const res = await getPublicImageDetail(imageId.value)
    if (res.code === 200) {
      detail.value = res.data
      // 加载关注状态
      await loadFollowStatus()
    }
  } catch (error) {
    console.error('加载失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    pageLoading.value = false
  }
}

// 加载互动状�?
const loadInteractionStatus = async () => {
  try {
    const res = await getImageInteractionStatus(imageId.value)
    if (res.code === 200) {
      isLiked.value = res.data.isLiked || false
      isFavorited.value = res.data.isFavorited || false
    }
  } catch (error) {
    console.error('加载互动状态失效', error)
  }
}

// 加载关注状态
const loadFollowStatus = async () => {
  if (!detail.value.createBy) return
  
  try {
    const res = await checkFollowStatus(detail.value.createBy)
    if (res.code === 200) {
      isFollowing.value = res.data || false
    }
  } catch (error) {
    console.error('加载关注状态失败', error)
  }
}

// 加载评论列表（使用移动端评论接口）
const loadComments = async (loadMore = false) => {
  if (commentLoading.value) return
  
  try {
    commentLoading.value = true
    const res = await getImageComments(imageId.value, {
      pageNum: loadMore ? commentPageNum.value + 1 : 1,
      pageSize: commentPageSize.value
    })
    
    if (res.code === 200) {
      if (loadMore) {
        commentList.value = [...commentList.value, ...res.rows]
        commentPageNum.value++
      } else {
        commentList.value = res.rows || []
        commentPageNum.value = 1
      }
      commentTotal.value = res.total || 0
    }
  } catch (error) {
    console.error('加载评论失败:', error)
  } finally {
    commentLoading.value = false
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
  if (likeLoading.value) return // 防止重复点击
  
  try {
    likeLoading.value = true
    if (isLiked.value) {
      await unlikeImage(imageId.value)
      isLiked.value = false
      detail.value.likeCount = Math.max(0, (detail.value.likeCount || 0) - 1)
      uni.showToast({
        title: '已取消点赞',
        icon: 'none'
      })
    } else {
      await likeImage(imageId.value)
      isLiked.value = true
      detail.value.likeCount = (detail.value.likeCount || 0) + 1
      uni.showToast({
        title: '点赞成功',
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
    likeLoading.value = false
  }
}

// 收藏
const handleFavorite = async () => {
  if (favoriteLoading.value) return // 防止重复点击
  
  try {
    favoriteLoading.value = true
    if (isFavorited.value) {
      await unfavoriteImage(imageId.value)
      isFavorited.value = false
      detail.value.collectCount = Math.max(0, (detail.value.collectCount || 0) - 1)
      uni.showToast({
        title: '已取消收藏',
        icon: 'none'
      })
    } else {
      await favoriteImage(imageId.value)
      isFavorited.value = true
      detail.value.collectCount = (detail.value.collectCount || 0) + 1
      uni.showToast({
        title: '收藏成功',
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
    favoriteLoading.value = false
  }
}

// 关注
const handleFollow = async () => {
  if (!detail.value.createBy) {
    uni.showToast({
      title: '用户信息不存在',
      icon: 'none'
    })
    return
  }
  
  // 检查是否是自己的图片
  if (isOwnImage.value) {
    uni.showToast({
      title: '不能关注自己',
      icon: 'none'
    })
    return
  }
  
  if (followLoading.value) return
  
  try {
    followLoading.value = true
    
    if (isFollowing.value) {
      const res = await unfollowUser(detail.value.createBy)
      if (res.code === 200) {
        isFollowing.value = false
        uni.showToast({
          title: '已取消关注',
          icon: 'none'
        })
      } else {
        // 显示后端返回的错误信息
        uni.showToast({
          title: res.msg || '操作失败',
          icon: 'none'
        })
      }
    } else {
      const res = await followUser(detail.value.createBy)
      if (res.code === 200) {
        isFollowing.value = true
        uni.showToast({
          title: '关注成功',
          icon: 'success'
        })
      } else {
        // 显示后端返回的错误信息
        uni.showToast({
          title: res.msg || '操作失败',
          icon: 'none'
        })
      }
    }
  } catch (error: any) {
    console.error('操作失败:', error)
    // 显示后端返回的错误信息
    const errorMsg = error?.data?.msg || error?.msg || '操作失败，请重试'
    uni.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 2000
    })
  } finally {
    followLoading.value = false
  }
}

// 打开评论输入�?
const handleComment = () => {
  showCommentInput.value = true
  replyToComment.value = null
}

// 回复评论
const handleReplyComment = (comment: any) => {
  showCommentInput.value = true
  replyToComment.value = comment
  
  // 滚动到评论位置（可选）
  // uni.pageScrollTo({
  //   selector: `#comment-${comment.commentId}`,
  //   duration: 300
  // })
}

// 提交评论
const handleSubmitComment = async () => {
  if (!commentContent.value.trim()) {
    uni.showToast({
      title: '请输入评论内容',
      icon: 'none'
    })
    return
  }
  
  if (commentSubmitLoading.value) return // 防止重复提交
  
  try {
    commentSubmitLoading.value = true
    const parentId = replyToComment.value ? replyToComment.value.commentId : null
    
    await addComment(
      imageId.value, 
      commentContent.value.trim(),
      parentId
    )
    
    uni.showToast({
      title: '评论成功',
      icon: 'success'
    })
    
    // 重置状态
    const isReply = !!replyToComment.value
    const parentCommentId = replyToComment.value?.parentId === 0 
      ? replyToComment.value?.commentId 
      : replyToComment.value?.parentId
    
    commentContent.value = ''
    showCommentInput.value = false
    replyToComment.value = null
    
    // 如果是回复评论，刷新该评论的回复列表
    if (isReply && parentCommentId) {
      const parentComment = commentList.value.find(c => c.commentId === parentCommentId)
      if (parentComment) {
        // 增加回复数
        parentComment.replyCount = (parentComment.replyCount || 0) + 1
        
        // 如果已展开，重新加载回复列表
        const status = replyExpandStatus.value.get(parentCommentId)
        if (status?.expanded) {
          await loadMoreReplies(parentComment, false)
        }
      }
    } else {
      // 刷新评论列表
      loadComments()
    }
    
    // 更新评论数
    detail.value.commentCount = (detail.value.commentCount || 0) + 1
  } catch (error) {
    console.error('评论失败:', error)
    uni.showToast({
      title: '评论失败',
      icon: 'none'
    })
  } finally {
    commentSubmitLoading.value = false
  }
}

// 取消评论
const handleCancelComment = () => {
  showCommentInput.value = false
  commentContent.value = ''
  replyToComment.value = null
}

// 删除评论
const handleDeleteComment = async (comment: any) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这条评论吗?',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteComment(comment.commentId)
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          // 刷新评论列表
          loadComments()
          
          // 更新评论�?
          detail.value.commentCount = Math.max(0, (detail.value.commentCount || 0) - 1)
        } catch (error) {
          console.error('删除失败:', error)
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 点赞评论
const handleLikeComment = async (comment: any) => {
  try {
    if (comment.isLiked) {
      await unlikeComment(comment.commentId)
      comment.isLiked = false
      comment.likeCount = Math.max(0, (comment.likeCount || 0) - 1)
    } else {
      await likeComment(comment.commentId)
      comment.isLiked = true
      comment.likeCount = (comment.likeCount || 0) + 1
    }
  } catch (error) {
    console.error('操作失败:', error)
  }
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
  if (!detail.value.createBy) {
    uni.showToast({
      title: '用户信息不存在',
      icon: 'none'
    })
    return
  }
  
  uni.navigateTo({
    url: `/pages_mine/pages/user/profile?userId=${detail.value.createBy}`
  })
}

// 格式化文件大�?
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

// 初始化回复展开状态
const initReplyStatus = (commentId: number) => {
  if (!replyExpandStatus.value.has(commentId)) {
    replyExpandStatus.value.set(commentId, {
      expanded: false,
      pageNum: 1,
      loading: false,
      hasMore: true
    })
  }
  return replyExpandStatus.value.get(commentId)
}

// 切换回复展开/收起
const toggleReplies = async (comment: any) => {
  const status = initReplyStatus(comment.commentId)
  
  if (status.expanded) {
    // 收起回复
    status.expanded = false
    comment.children = comment.children?.slice(0, 3) || []
  } else {
    // 展开回复
    await loadMoreReplies(comment, false)
  }
}

// 加载更多回复（支持分页）
const loadMoreReplies = async (comment: any, isLoadMore: boolean = false) => {
  const status = initReplyStatus(comment.commentId)
  
  if (status.loading) return
  
  try {
    status.loading = true
    
    const pageNum = isLoadMore ? status.pageNum + 1 : 1
    const res = await getCommentReplies(comment.commentId, {
      pageNum: pageNum,
      pageSize: 10
    })
    
    if (res.code === 200) {
      const newReplies = res.rows || []
      
      if (isLoadMore) {
        // 追加回复
        comment.children = [...(comment.children || []), ...newReplies]
      } else {
        // 首次展开，替换回复列表
        comment.children = newReplies
        status.expanded = true
      }
      
      status.pageNum = pageNum
      status.hasMore = newReplies.length >= 10
      
      if (!isLoadMore) {
        uni.showToast({
          title: '展开成功',
          icon: 'success',
          duration: 1000
        })
      }
    }
  } catch (error) {
    console.error('加载回复失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    status.loading = false
  }
}

// 格式化时�?
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时'
  } else if (diff < 7 * day) {
    return Math.floor(diff / day) + '天前'
  } else {
    return date.toLocaleDateString()
  }
}
</script>

<style lang="scss" scoped>
.detail-page {
  width: 100%;
  min-height: 100vh;
  background: #f7f7f7;
}

// 页面加载中
.page-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding-top: 200rpx;
  
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

// 作者区�?
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
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 120rpx;
    transition: all 0.3s;
    
    &.following {
      background: #f0f0f0;
      
      text {
        color: #666;
      }
    }
    
    &.loading {
      opacity: 0.6;
      pointer-events: none;
    }
    
    .loading-spinner-btn {
      width: 28rpx;
      height: 28rpx;
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
    opacity: 1;
    transition: opacity 0.3s;
    
    &.loading {
      opacity: 0.6;
      pointer-events: none;
    }
    
    .loading-spinner-small {
      width: 40rpx;
      height: 40rpx;
      border: 3rpx solid #f3f3f3;
      border-top: 3rpx solid #666;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    text {
      font-size: 28rpx;
      color: #666;
      margin-left: 12rpx;
      
      &.liked {
        color: #ff2442;
      }
      
      &.favorited {
        color: #ffa500;
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
    background: #000000;
    border-radius: 14rpx;
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

// 底部操作�?
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

// 评论列表
.comment-list {
  .comment-item {
    display: flex;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f7f7f7;
    
    &:last-child {
      border-bottom: none;
    }
    
    .comment-avatar {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      flex-shrink: 0;
    }
    
    .comment-content {
      flex: 1;
      min-width: 0;
      
      .comment-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12rpx;
        
        .comment-user-info {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
        }
        
        .comment-user {
          font-size: 28rpx;
          color: #333;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .comment-location {
          font-size: 24rpx;
          color: #999;
          margin-left: 8rpx;
          flex-shrink: 0;
        }
        
        .comment-like {
          display: flex;
          align-items: center;
          padding: 8rpx 16rpx;
          border-radius: 20rpx;
          background: #f7f7f7;
          flex-shrink: 0;
          
          text {
            font-size: 24rpx;
            color: #999;
            margin-left: 6rpx;
            
            &.liked {
              color: #ff2442;
            }
          }
        }
      }
      
      .comment-text {
        display: block;
        font-size: 30rpx;
        color: #333;
        line-height: 1.6;
        margin-bottom: 16rpx;
        word-break: break-all;
      }
      
      .comment-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .comment-time {
          font-size: 24rpx;
          color: #999;
        }
        
        .comment-actions {
          display: flex;
          align-items: center;
          
          .comment-action {
            font-size: 26rpx;
            color: #666;
            margin-left: 30rpx;
            padding: 6rpx 12rpx;
            
            &.delete-action {
              color: #ff2442;
            }
          }
        }
      }
      
      .reply-list {
        margin-top: 20rpx;
        padding: 20rpx;
        background: #f7f7f7;
        border-radius: 12rpx;
        
        .reply-item {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16rpx;
          line-height: 1.6;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .reply-content {
            flex: 1;
            min-width: 0;
          }
          
          .reply-user {
            font-size: 26rpx;
            color: #666;
            font-weight: 600;
          }
          
          .reply-to {
            font-size: 26rpx;
            color: #999;
            margin: 0 4rpx;
          }
          
          .reply-text {
            font-size: 26rpx;
            color: #333;
          }
          
          .reply-like {
            display: flex;
            align-items: center;
            padding: 4rpx 8rpx;
            margin-left: 16rpx;
            flex-shrink: 0;
            
            text {
              font-size: 22rpx;
              color: #999;
              margin-left: 4rpx;
              
              &.liked {
                color: #ff2442;
              }
            }
          }
        }
        
        .reply-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20rpx;
          padding-top: 16rpx;
          margin-top: 16rpx;
          border-top: 1rpx solid #e0e0e0;
          
          .reply-action-btn {
            display: flex;
            align-items: center;
            padding: 8rpx 16rpx;
            background: #fff;
            border-radius: 20rpx;
            
            text {
              font-size: 24rpx;
              color: #666;
              margin-right: 6rpx;
            }
            
            &:active {
              opacity: 0.7;
            }
          }
        }
      }
    }
  }
  
  .load-more {
    padding: 40rpx 0;
    text-align: center;
    
    text {
      font-size: 28rpx;
      color: #666;
    }
  }
}

// 评论输入弹窗
.comment-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .comment-input-box {
    width: 100%;
    background: #fff;
    border-radius: 32rpx 32rpx 0 0;
    padding: 40rpx 30rpx;
    padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
    animation: slideUp 0.3s ease;
    
    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }
    
    .comment-input-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30rpx;
      
      text {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
    }
    
    .comment-textarea {
      width: 100%;
      min-height: 240rpx;
      max-height: 400rpx;
      padding: 24rpx;
      background: #f7f7f7;
      border-radius: 16rpx;
      font-size: 30rpx;
      color: #333;
      line-height: 1.6;
      box-sizing: border-box;
    }
    
    .comment-input-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 30rpx;
      
      .comment-count {
        font-size: 26rpx;
        color: #999;
      }
      
      .comment-submit {
        padding: 18rpx 56rpx;
        background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);
        border-radius: 48rpx;
        box-shadow: 0 4rpx 12rpx rgba(255, 36, 66, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 160rpx;
        transition: opacity 0.3s;
        
        &.loading {
          opacity: 0.6;
          pointer-events: none;
        }
        
        .loading-spinner-white {
          width: 32rpx;
          height: 32rpx;
          border: 3rpx solid rgba(255, 255, 255, 0.3);
          border-top: 3rpx solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        text {
          font-size: 30rpx;
          color: #fff;
          font-weight: 600;
        }
        
        &:active {
          opacity: 0.8;
        }
      }
    }
  }
}

// 收藏状态
.favorited {
  color: #ffa500;
}
</style>