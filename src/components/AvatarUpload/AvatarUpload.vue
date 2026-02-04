<template>
  <view class="avatar-upload">
    <!-- 头像显示 -->
    <view class="avatar-wrapper" @tap="handlePreview">
      <image class="avatar-image" :src="modelValue || defaultAvatar" mode="aspectFill"></image>
      <view v-if="showCamera" class="camera-icon">
        <u-icon name="camera-fill" color="#fff" size="20"></u-icon>
      </view>
    </view>

    <!-- 图片裁剪弹窗 -->
    <u-popup :show="showCropper" mode="center" :border-radius="20" @close="handleCloseCropper">
      <view class="cropper-popup">
        <view class="cropper-header">
          <text class="cropper-title">裁剪头像</text>
          <view class="cropper-close" @tap="handleCloseCropper">
            <u-icon name="close" size="20" color="#999"></u-icon>
          </view>
        </view>
        <view class="cropper-content">
          <image 
            class="cropper-image" 
            :src="tempImagePath" 
            mode="aspectFit"
            @load="handleImageLoad"
          ></image>
          <!-- 裁剪框 -->
          <view 
            class="crop-box" 
            :style="cropBoxStyle"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <view class="crop-border"></view>
          </view>
        </view>
        <view class="cropper-footer">
          <button class="cancel-btn" @tap="handleCloseCropper">取消</button>
          <button class="confirm-btn" @tap="handleConfirmCrop">确定</button>
        </view>
      </view>
    </u-popup>
    
    <!-- 隐藏的canvas用于裁剪 -->
    <canvas 
      canvas-id="cropCanvas" 
      :style="{width: cropSize + 'px', height: cropSize + 'px', position: 'fixed', left: '-9999px', top: '-9999px'}"
    ></canvas>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import config from '@/config.js'
import { getToken } from '@/utils/auth'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  defaultAvatar: {
    type: String,
    default: '/static/images/profile.jpg'
  },
  showCamera: {
    type: Boolean,
    default: true
  },
  cropSize: {
    type: Number,
    default: 300
  },
  enableCrop: {
    type: Boolean,
    default: false  // 默认关闭裁剪功能
  }
})

const emit = defineEmits(['update:modelValue', 'success', 'error'])

// 打印props用于调试
console.log('AvatarUpload props:', props.modelValue, props.defaultAvatar)

// 状态
const showCropper = ref(false)
const tempImagePath = ref('')
const imageInfo = ref(null)
const cropBox = ref({
  x: 0,
  y: 0,
  width: 300,
  height: 300
})
const touchStart = ref({ x: 0, y: 0 })

// 裁剪框样式
const cropBoxStyle = computed(() => {
  return {
    left: cropBox.value.x + 'px',
    top: cropBox.value.y + 'px',
    width: cropBox.value.width + 'px',
    height: cropBox.value.height + 'px'
  }
})

// 预览头像
const handlePreview = () => {
  const images = [props.modelValue || props.defaultAvatar]
  
  // 先显示操作菜单
  uni.showActionSheet({
    itemList: ['查看大图', '上传新头像'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 查看大图
        uni.previewImage({
          urls: images,
          current: 0
        })
      } else if (res.tapIndex === 1) {
        // 上传新头像
        handleChooseImage()
      }
    }
  })
}

// 选择图片
const handleChooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      
      // 如果启用裁剪功能
      if (props.enableCrop) {
        // 获取图片信息
        uni.getImageInfo({
          src: tempFilePath,
          success: (info) => {
            imageInfo.value = info
            tempImagePath.value = tempFilePath
            
            // 计算初始裁剪框位置（居中）
            const size = Math.min(info.width, info.height, props.cropSize)
            cropBox.value = {
              x: (info.width - size) / 2,
              y: (info.height - size) / 2,
              width: size,
              height: size
            }
            
            showCropper.value = true
          }
        })
      } else {
        // 直接上传，不裁剪
        uploadImage(tempFilePath)
      }
    },
    fail: (error) => {
      console.error('选择图片失败', error)
      uni.showToast({ title: '选择图片失败', icon: 'none' })
    }
  })
}

// 图片加载完成
const handleImageLoad = (e) => {
  console.log('图片加载完成', e)
}

// 触摸开始
const handleTouchStart = (e) => {
  touchStart.value = {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  }
}

// 触摸移动
const handleTouchMove = (e) => {
  const deltaX = e.touches[0].clientX - touchStart.value.x
  const deltaY = e.touches[0].clientY - touchStart.value.y
  
  // 更新裁剪框位置
  cropBox.value.x += deltaX
  cropBox.value.y += deltaY
  
  // 限制裁剪框不超出图片边界
  if (imageInfo.value) {
    cropBox.value.x = Math.max(0, Math.min(cropBox.value.x, imageInfo.value.width - cropBox.value.width))
    cropBox.value.y = Math.max(0, Math.min(cropBox.value.y, imageInfo.value.height - cropBox.value.height))
  }
  
  touchStart.value = {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  }
}

// 触摸结束
const handleTouchEnd = () => {
  // 触摸结束
}

// 关闭裁剪器
const handleCloseCropper = () => {
  showCropper.value = false
  tempImagePath.value = ''
  imageInfo.value = null
}

// 确认裁剪
const handleConfirmCrop = () => {
  uni.showLoading({ title: '处理中...', mask: true })
  
  // 创建canvas进行裁剪
  const ctx = uni.createCanvasContext('cropCanvas')
  
  // 绘制裁剪后的图片
  ctx.drawImage(
    tempImagePath.value,
    cropBox.value.x,
    cropBox.value.y,
    cropBox.value.width,
    cropBox.value.height,
    0,
    0,
    props.cropSize,
    props.cropSize
  )
  
  ctx.draw(false, () => {
    // 导出图片
    uni.canvasToTempFilePath({
      canvasId: 'cropCanvas',
      destWidth: props.cropSize,
      destHeight: props.cropSize,
      success: (res) => {
        // 上传裁剪后的图片
        uploadImage(res.tempFilePath)
      },
      fail: (error) => {
        uni.hideLoading()
        console.error('裁剪失败', error)
        uni.showToast({ title: '裁剪失败', icon: 'none' })
      }
    })
  })
}

// 上传图片
const uploadImage = (filePath) => {
  const token = getToken()
  
  if (!token) {
    uni.hideLoading()
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  
  uni.showLoading({ title: '上传中...', mask: true })
  
  uni.uploadFile({
    url: config.baseUrl + '/mobile/user/avatar/upload',
    filePath: filePath,
    name: 'avatarfile',
    header: {
      'Authorization': 'Bearer ' + token,
      'clientid': config.clientID  // 添加clientId
    },
    success: (uploadRes) => {
      uni.hideLoading()
      
      try {
        const data = JSON.parse(uploadRes.data)
        
        if (data.code === 200) {
          // 更新头像
          emit('update:modelValue', data.data.imgUrl)
          emit('success', data.data)
          
          // 关闭裁剪器
          handleCloseCropper()
          
          uni.showToast({ title: '上传成功', icon: 'success' })
        } else {
          emit('error', data.msg || '上传失败')
          uni.showToast({ title: data.msg || '上传失败', icon: 'none' })
        }
      } catch (parseError) {
        console.error('解析返回数据失败', parseError, uploadRes.data)
        emit('error', '上传失败')
        uni.showToast({ title: '上传失败', icon: 'none' })
      }
    },
    fail: (error) => {
      uni.hideLoading()
      console.error('上传失败', error)
      emit('error', error)
      uni.showToast({ title: '上传失败', icon: 'none' })
    }
  })
}
</script>

<style lang="scss" scoped>
.avatar-upload {
  width: 160rpx;
  height: 160rpx;
  
  .avatar-wrapper {
    position: relative;
    display: inline-block;
    width: 160rpx;
    height: 160rpx;
    
    .avatar-image {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .camera-icon {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 48rpx;
      height: 48rpx;
      background: #333;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 4rpx solid #fff;
    }
  }
}

.cropper-popup {
  width: 700rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  
  .cropper-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 40rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .cropper-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
    
    .cropper-close {
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .cropper-content {
    position: relative;
    width: 700rpx;
    height: 700rpx;
    background: #000;
    overflow: hidden;
    
    .cropper-image {
      width: 100%;
      height: 100%;
    }
    
    .crop-box {
      position: absolute;
      border: 2rpx solid #fff;
      box-shadow: 0 0 0 9999rpx rgba(0, 0, 0, 0.5);
      
      .crop-border {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 2rpx dashed #fff;
      }
    }
  }
  
  .cropper-footer {
    display: flex;
    padding: 30rpx 40rpx;
    gap: 20rpx;
    
    button {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      border: none;
      
      &::after {
        border: none;
      }
    }
    
    .cancel-btn {
      background: #f5f5f5;
      color: #666;
    }
    
    .confirm-btn {
      background: #ff2442;
      color: #fff;
    }
  }
}
</style>
