<template>
  <view class="edit-profile-page">
    <!-- 头像区域 -->
    <view class="avatar-section">
      <view class="avatar-wrapper" @click="handleChooseAvatar">
        <image class="avatar" :src="user.avatar || '/static/images/profile.jpg'" mode="aspectFill"></image>
        <view class="camera-icon">
          <u-icon name="camera-fill" color="#fff" size="20"></u-icon>
        </view>
      </view>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <!-- 基本信息组 -->
      <CustomCellGroup>
        <!-- 昵称 -->
        <CustomCell
            title="昵称"
            :value="user.nickName || '·'"
            :isLink="true"
            @click="handleEditField('nickName', '昵称', user.nickName)"
        />

        <!-- 用户ID -->
        <CustomCell
            title="用户ID"
            :value="user.userId || '5432102799'"
            :isLink="true"
            @click="handleEditField('userId', '用户ID', user.userId)"
        />

        <!-- 简介 -->
        <CustomCell
            title="简介"
            :value="user.signature || '介绍一下自己'"
            :isLink="true"
            @click="handleEditField('signature', '简介', user.signature)"
        />
      </CustomCellGroup>

      <!-- 个人信息组 -->
      <CustomCellGroup>
        <!-- 性别 -->
        <CustomCell
            title="性别"
            :value="getSexText(user.sex)"
            :isLink="true"
            @click="handleSelectSex"
        />

        <!-- 生日 -->
        <picker mode="date" :value="user.birthday" @change="handleDateChange">
          <CustomCell
              title="生日"
              :value="user.birthday || '选择生日'"
              :isLink="true"
          />
        </picker>

        <!-- 地区 -->
        <CustomCell
            title="地区"
            :value="user.region || '选择所在的地区'"
            :isLink="true"
            @click="handleSelectRegion"
        />

        <!-- 职业 -->
        <CustomCell
            title="职业"
            :value="user.occupation || '选择职业'"
            :isLink="true"
            @click="handleSelectOccupation"
        />

        <!-- 学校 -->
        <CustomCell
            title="学校"
            :value="user.school || '选择学校'"
            :isLink="true"
            @click="handleSelectSchool"
        />
      </CustomCellGroup>

      <!-- 认证信息组 -->
      <CustomCellGroup>
        <!-- 官方认证 -->
        <CustomCell
            title="官方认证"
            :value="user.originalVerified ? '已完成官方认证' : '暂未完成官方认证'"
            :isLink="true"
            @click="handleOfficialVerify"
        />
      </CustomCellGroup>
    </view>
    <!-- 编辑弹窗 -->
    <u-popup v-model="showEditPopup" mode="bottom" :border-radius="20">
      <view class="edit-popup">
        <view class="popup-header">
          <text class="popup-title">{{ editTitle }}</text>
          <view class="popup-close" @click="showEditPopup = false">
            <u-icon name="close" size="20" color="#999"></u-icon>
          </view>
        </view>
        <view class="popup-content">
          <textarea
              v-if="editField === 'signature'"
              class="edit-textarea"
              v-model="editValue"
              :placeholder="'请输入' + editTitle"
              :maxlength="100"
              auto-height
          ></textarea>
          <input
              v-else
              class="edit-input"
              v-model="editValue"
              :placeholder="'请输入' + editTitle"
          />
        </view>
        <view class="popup-footer">
          <button class="save-btn" @click="handleSaveEdit">保存</button>
        </view>
      </view>
    </u-popup>

    <!-- 性别选择 -->
    <u-action-sheet
        v-model="showSexSheet"
        :list="sexList"
        @click="handleSexSelect"
    ></u-action-sheet>
  </view>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {onLoad} from '@dcloudio/uni-app'
import {getUserProfile, updateUserProfile} from '@/api/system/user'
import CustomCell from '@/components/CustomCell/CustomCell.vue'
import CustomCellGroup from '@/components/CustomCellGroup/CustomCellGroup.vue'

// 状态
const user = ref({
  avatar: '',
  nickName: '',
  userId: '',
  bgImage: '',
  signature: '',
  sex: '',
  birthday: '',
  region: '',
  occupation: '',
  school: '',
  originalVerified: false
})

const statusBarHeight = ref(0)
const scrollHeight = ref(0)
const safeAreaBottom = ref(0)

// 编辑弹窗
const showEditPopup = ref(false)
const editField = ref('')
const editTitle = ref('')
const editValue = ref('')

// 性别选择
const showSexSheet = ref(false)
const sexList = ref([
  {text: '男'},
  {text: '女'}
])

// 日期选择
const handleDateChange = (e) => {
  user.value.birthday = e.detail.value
  saveUserData()
}

onMounted(() => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  scrollHeight.value = systemInfo.windowHeight - statusBarHeight.value - 44
  safeAreaBottom.value = systemInfo.safeAreaInsets?.bottom || 0
})

onLoad(() => {
  loadUserData()
})

// 加载用户数据
const loadUserData = async () => {
  try {
    const res = await getUserProfile()
    if (res.data) {
      user.value = {
        ...user.value,
        ...res.data.user
      }
    }
  } catch (e) {
    console.error('加载用户信息失败', e)
  }
}

// 性别文本
const getSexText = (sex) => {
  if (sex === '0') return '男'
  if (sex === '1') return '女'
  return '男'
}

// 返回
const handleBack = () => {
  uni.navigateBack()
}

// 预览
const handlePreview = () => {
  uni.showToast({title: '预览功能开发中', icon: 'none'})
}

// 选择头像
const handleChooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      user.value.avatar = res.tempFilePaths[0]
      saveUserData()
    }
  })
}

// 选择背景图 - 已移除此功能

// 编辑字段
const handleEditField = (field, title, value) => {
  editField.value = field
  editTitle.value = title
  editValue.value = value || ''
  showEditPopup.value = true
}

// 保存编辑
const handleSaveEdit = () => {
  user.value[editField.value] = editValue.value
  showEditPopup.value = false
  saveUserData()
}

// 选择性别
const handleSelectSex = () => {
  showSexSheet.value = true
}

const handleSexSelect = (index) => {
  user.value.sex = String(index)
  saveUserData()
}

// 选择生日 - 已通过picker组件直接绑定，无需此方法

// 选择地区
const handleSelectRegion = () => {
  uni.showToast({title: '地区选择功能开发中', icon: 'none'})
}

// 选择职业
const handleSelectOccupation = () => {
  uni.showToast({title: '职业选择功能开发中', icon: 'none'})
}

// 选择学校
const handleSelectSchool = () => {
  uni.showToast({title: '学校选择功能开发中', icon: 'none'})
}

// 官方认证
const handleOfficialVerify = () => {
  uni.showToast({title: '官方认证功能开发中', icon: 'none'})
}

// 保存用户数据
const saveUserData = async () => {
  try {
    await updateUserProfile(user.value)
    uni.showToast({title: '保存成功', icon: 'success'})
  } catch (e) {
    console.error('保存失败', e)
    uni.showToast({title: '保存失败', icon: 'none'})
  }
}
</script>

<style lang="scss" scoped>
.edit-profile-page {
  width: 100%;
  min-height: 100vh;
  background: #f7f7f7;
}

// 头像区域
.avatar-section {
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20rpx;

  .avatar-wrapper {
    position: relative;
    width: 160rpx;
    height: 160rpx;

    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
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

// 表单区域
.form-section {
  padding-bottom: 40rpx;
}

// 编辑弹窗
.edit-popup {
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 40rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .popup-close {
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .popup-content {
    padding: 40rpx;

    .edit-input {
      width: 100%;
      height: 80rpx;
      padding: 0 24rpx;
      background: #f7f7f7;
      border-radius: 12rpx;
      font-size: 28rpx;
      color: #333;
    }

    .edit-textarea {
      width: 100%;
      min-height: 200rpx;
      padding: 24rpx;
      background: #f7f7f7;
      border-radius: 12rpx;
      font-size: 28rpx;
      color: #333;
      line-height: 1.6;
    }
  }

  .popup-footer {
    padding: 20rpx 40rpx 40rpx;

    .save-btn {
      width: 100%;
      height: 88rpx;
      background: #ff2442;
      border-radius: 44rpx;
      font-size: 30rpx;
      color: #fff;
      font-weight: 600;
      border: none;

      &::after {
        border: none;
      }
    }
  }
}
</style>
