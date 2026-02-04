<template>
  <view class="edit-profile-page">
    <!-- 头像区域 -->
    <view class="avatar-section">
      <AvatarUpload 
        v-model="user.avatar" 
        :enableCrop="false"
        @success="handleAvatarSuccess"
        @error="handleAvatarError"
      />
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
            @tap="() => handleEditField('nickName', '昵称', user.nickName)"
        />

        <!-- 用户ID -->
        <CustomCell
            title="用户ID"
            :value="String(user.userId || 'xxxxxxxx')"
            :isLink="false"
        />

        <!-- 简介 -->
        <CustomCell
            title="简介"
            :value="user.signature || '介绍一下自己'"
            :isLink="true"
            @tap="() => handleEditField('signature', '简介', user.signature)"
        />
      </CustomCellGroup>

      <!-- 个人信息组 -->
      <CustomCellGroup>
        <!-- 性别 -->
        <picker mode="selector" :range="sexList" range-key="text" @change="handleSexChange">
          <CustomCell
              title="性别"
              :value="getSexText(user.sex)"
              :isLink="true"
          />
        </picker>
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
            :value="user.region || '未填写'"
            :isLink="true"
            @tap="() => showRegionPicker = true"
        />

        <!-- 职业 -->
        <CustomCell
            title="职业"
            :value="user.occupation || '未填写'"
            :isLink="true"
            @tap="handleSelectOccupation"
        />

        <!-- 学校 -->
        <CustomCell
            title="学校"
            :value="user.school || '未填写'"
            :isLink="true"
            @tap="handleSelectSchool"
        />
      </CustomCellGroup>

      <!-- 认证信息组 -->
      <CustomCellGroup>
        <!-- 官方认证 -->
        <CustomCell
            title="官方认证"
            :value="user.originalVerified ? '已完成官方认证' : '暂未完成官方认证'"
            :isLink="true"
            @tap="handleOfficialVerify"
        />
      </CustomCellGroup>
    </view>
    <!-- 编辑弹窗 -->
    <u-popup :show="showEditPopup" mode="bottom" :border-radius="20" @close="showEditPopup = false">
      <view class="edit-popup">
        <view class="popup-header">
          <text class="popup-title">{{ editTitle }}</text>
          <view class="popup-close" @tap="showEditPopup = false">
            <u-icon name="close" size="20" color="#999"></u-icon>
          </view>
        </view>
        <view class="popup-content">
          <textarea
              v-if="editField === 'signature'"
              class="edit-textarea"
              v-model="editValue"
              :placeholder="getPlaceholder(editField)"
              :maxlength="getMaxLength(editField)"
              auto-height
              show-count
          ></textarea>
          <input
              v-else
              class="edit-input"
              v-model="editValue"
              :placeholder="getPlaceholder(editField)"
              :maxlength="getMaxLength(editField)"
          />
        </view>
        <view class="popup-footer">
          <button class="save-btn" @tap="handleSaveEdit">保存</button>
        </view>
      </view>
    </u-popup>
    <!-- 地区选择弹窗 -->
    <u-popup :show="showRegionPicker" mode="bottom" :border-radius="20" @close="showRegionPicker = false">
      <view class="region-popup">
        <view class="popup-header">
          <text class="popup-cancel" @tap="showRegionPicker = false">取消</text>
          <text class="popup-title">选择地区</text>
          <text class="popup-confirm" @tap="handleRegionConfirm">确定</text>
        </view>
        <view class="region-picker-wrapper">
          <picker-view
              class="region-picker"
              :value="pickerValue"
              @change="handlePickerChange"
              :indicator-style="indicatorStyle"
          >
            <!-- 省 -->
            <picker-view-column>
              <view class="picker-item" v-for="(item, index) in provinceList" :key="index">
                {{ item.name }}
              </view>
            </picker-view-column>
            <!-- 市 -->
            <picker-view-column>
              <view class="picker-item" v-for="(item, index) in cityList" :key="index">
                {{ item.name }}
              </view>
            </picker-view-column>
            <!-- 区 -->
            <picker-view-column>
              <view class="picker-item" v-for="(item, index) in districtList" :key="index">
                {{ item.name }}
              </view>
            </picker-view-column>
          </picker-view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import {onLoad} from '@dcloudio/uni-app'
import {uploadAvatar, updateNickName, updateSex, updateBirthday, updateSignature, updateRegion, updateOccupation, updateSchool} from '@/api/mobile/user'
import CustomCell from '@/components/CustomCell/CustomCell.vue'
import CustomCellGroup from '@/components/CustomCellGroup/CustomCellGroup.vue'
import AvatarUpload from '@/components/AvatarUpload/AvatarUpload.vue'
import store from '@/store'
import config from '@/config.js'

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
const sexList = ref([
  { text: '男', value: '0' },
  { text: '女', value: '1' },
  { text: '未知', value: '2' }
])

// 地区选择
const showRegionPicker = ref(false)
const provinceList = ref([]) // 省列表
const cityList = ref([]) // 市列表
const districtList = ref([]) // 区列表
const pickerValue = ref([0, 0, 0]) // picker-view的选中索引
const selectedProvince = ref(null) // 当前选中的省
const selectedCity = ref(null) // 当前选中的市
const selectedDistrict = ref(null) // 当前选中的区
const indicatorStyle = 'height: 50px;'

onMounted(() => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  scrollHeight.value = systemInfo.windowHeight - statusBarHeight.value - 44
  safeAreaBottom.value = systemInfo.safeAreaInsets?.bottom || 0
})

onLoad(() => {
  console.log('=== 编辑资料页面加载 ===')
  loadUserData()
})

// 加载用户数据（从store读取）
const loadUserData = () => {
  try {
    console.log('开始加载用户数据...')
    console.log('store.state.user:', store.state.user)
    
    // 从store获取用户资料
    const userProfile = store.state.user.userProfile
    console.log('userProfile:', userProfile)
    
    if (userProfile && userProfile.userId) {
      console.log('从store读取到用户资料，userId:', userProfile.userId)
      
      // 处理生日格式（Date对象转字符串）
      let birthdayStr = ''
      if (userProfile.birthday) {
        if (typeof userProfile.birthday === 'string') {
          birthdayStr = userProfile.birthday.split(' ')[0] // 取日期部分
        } else if (userProfile.birthday instanceof Date) {
          birthdayStr = userProfile.birthday.toISOString().split('T')[0]
        }
      }
      
      user.value = {
        ...user.value,
        userId: userProfile.userId,
        nickName: userProfile.nickName || '',
        avatar: userProfile.avatar || '',
        sex: userProfile.sex || '',
        birthday: birthdayStr,
        signature: userProfile.signature || '',
        region: userProfile.region || '',
        occupation: userProfile.occupation || '',
        school: userProfile.school || ''
      }
      
      console.log('用户数据已加载:', user.value)
    } else {
      console.log('store中没有用户资料，从服务器获取...')
      // 如果store中没有数据，则从服务器获取
      store.dispatch('GetUserProfile').then(() => {
        const profile = store.state.user.userProfile
        console.log('从服务器获取到用户资料:', profile)
        
        if (profile) {
          // 处理生日格式
          let birthdayStr = ''
          if (profile.birthday) {
            if (typeof profile.birthday === 'string') {
              birthdayStr = profile.birthday.split(' ')[0]
            } else if (profile.birthday instanceof Date) {
              birthdayStr = profile.birthday.toISOString().split('T')[0]
            }
          }
          
          user.value = {
            ...user.value,
            userId: profile.userId,
            nickName: profile.nickName || '',
            avatar: profile.avatar || '',
            sex: profile.sex || '',
            birthday: birthdayStr,
            signature: profile.signature || '',
            region: profile.region || '',
            occupation: profile.occupation || '',
            school: profile.school || ''
          }
          
          console.log('用户数据已加载:', user.value)
        }
      }).catch(error => {
        console.error('加载用户信息失败', error)
      })
    }
  } catch (error) {
    console.error('加载用户信息失败', error)
  }
}

// 性别文本
const getSexText = (sex) => {
  if (sex === '0') return '男'
  if (sex === '1') return '女'
  if (sex === '2') return '未知'
  return '未知'
}

// 返回
const handleBack = () => {
  uni.navigateBack()
}

// 预览
const handlePreview = () => {
  uni.showToast({title: '预览功能开发中', icon: 'none'})
}

// 头像上传成功
const handleAvatarSuccess = (data) => {
  console.log('头像上传成功', data)
  
  // 更新store中的用户资料
  store.dispatch('UpdateUserProfileField', { 
    field: 'avatar', 
    value: data.imgUrl 
  })
}

// 头像上传失败
const handleAvatarError = (error) => {
  console.error('头像上传失败', error)
}

// 选择背景图 - 已移除此功能

// 编辑字段
const handleEditField = (field, title, value) => {
  editField.value = field
  editTitle.value = title
  editValue.value = value || ''
  showEditPopup.value = true
}

// 获取字段的最大长度
const getMaxLength = (field) => {
  const maxLengths = {
    nickName: 30,
    signature: 100,
    region: 50,
    occupation: 30,
    school: 50
  }
  return maxLengths[field] || 100
}

// 获取字段的占位符
const getPlaceholder = (field) => {
  const placeholders = {
    nickName: '请输入昵称',
    signature: '介绍一下自己吧',
    region: '请输入所在地区',
    occupation: '请输入职业',
    school: '请输入学校名称'
  }
  return placeholders[field] || '请输入内容'
}

// 保存编辑
const handleSaveEdit = async () => {
  const field = editField.value
  const value = editValue.value.trim()
  
  // 验证输入
  if (!value && field === 'nickName') {
    uni.showToast({title: '昵称不能为空', icon: 'none'})
    return
  }
  
  // 验证长度
  const maxLength = getMaxLength(field)
  if (value.length > maxLength) {
    uni.showToast({title: `内容不能超过${maxLength}个字符`, icon: 'none'})
    return
  }
  
  user.value[field] = value
  showEditPopup.value = false
  
  try {
    // 根据不同字段调用不同的API
    if (field === 'nickName') {
      await updateNickName(value)
    } else if (field === 'signature') {
      await updateSignature(value)
    } else if (field === 'region') {
      await updateRegion(value)
    } else if (field === 'occupation') {
      await updateOccupation(value)
    } else if (field === 'school') {
      await updateSchool(value)
    }
    
    // 更新store中的用户资料
    store.dispatch('UpdateUserProfileField', { field, value })
    
    uni.showToast({title: '保存成功', icon: 'success'})
  } catch (error) {
    console.error('保存失败', error)
    uni.showToast({title: '保存失败', icon: 'none'})
  }
}

// 性别选择
const handleSexChange = async (e) => {
  const index = e.detail.value
  const selectedSex = sexList.value[index]
  const sexValue = selectedSex.value
  
  user.value.sex = sexValue
  
  try {
    await updateSex(sexValue)
    
    // 更新store中的用户资料
    store.dispatch('UpdateUserProfileField', { field: 'sex', value: sexValue })
    
    uni.showToast({title: '性别更新成功', icon: 'success'})
  } catch (error) {
    console.error('更新性别失败', error)
    uni.showToast({title: '更新性别失败', icon: 'none'})
  }
}

// 日期选择
const handleDateChange = async (e) => {
  user.value.birthday = e.detail.value
  try {
    await updateBirthday(user.value.birthday)
    
    // 更新store中的用户资料
    store.dispatch('UpdateUserProfileField', { field: 'birthday', value: user.value.birthday })
    
    uni.showToast({title: '生日更新成功', icon: 'success'})
  } catch (error) {
    console.error('更新生日失败', error)
    uni.showToast({title: '更新生日失败', icon: 'none'})
  }
}

// 地区选择
// 加载省级数据
const loadProvinceList = async () => {
  try {
    const { listArea } = await import('@/api/mobile/area')
    const res = await listArea()
    
    if (res.code === 200 && res.data && res.data.length > 0) {
      provinceList.value = res.data
      
      // 加载第一个省的市级数据
      if (provinceList.value.length > 0) {
        selectedProvince.value = provinceList.value[0]
        await loadCityList(selectedProvince.value.areaId)
      }
    }
  } catch (error) {
    console.error('加载省级数据失败', error)
  }
}

// 加载市级数据
const loadCityList = async (provinceId) => {
  try {
    const { getChildren } = await import('@/api/mobile/area')
    const res = await getChildren(provinceId)
    
    if (res.code === 200 && res.data && res.data.length > 0) {
      cityList.value = res.data
      
      // 加载第一个市的区级数据
      if (cityList.value.length > 0) {
        selectedCity.value = cityList.value[0]
        await loadDistrictList(selectedCity.value.areaId)
      }
    } else {
      cityList.value = []
      districtList.value = []
    }
  } catch (error) {
    console.error('加载市级数据失败', error)
    cityList.value = []
    districtList.value = []
  }
}

// 加载区级数据
const loadDistrictList = async (cityId) => {
  try {
    const { getChildren } = await import('@/api/mobile/area')
    const res = await getChildren(cityId)
    
    if (res.code === 200 && res.data && res.data.length > 0) {
      districtList.value = res.data
      
      // 设置第一个区为选中
      if (districtList.value.length > 0) {
        selectedDistrict.value = districtList.value[0]
      }
    } else {
      districtList.value = []
    }
  } catch (error) {
    console.error('加载区级数据失败', error)
    districtList.value = []
  }
}

// picker-view 值变化
const handlePickerChange = async (e) => {
  const [provinceIndex, cityIndex, districtIndex] = e.detail.value
  const oldValue = [...pickerValue.value]
  pickerValue.value = [provinceIndex, cityIndex, districtIndex]
  
  // 省份变化
  if (provinceIndex !== oldValue[0]) {
    // 边界检查
    if (provinceIndex >= 0 && provinceIndex < provinceList.value.length) {
      selectedProvince.value = provinceList.value[provinceIndex]
      await loadCityList(selectedProvince.value.areaId)
      // 重置picker的市和区索引
      pickerValue.value = [provinceIndex, 0, 0]
    }
  }
  // 市变化
  else if (cityIndex !== oldValue[1]) {
    // 边界检查
    if (cityIndex >= 0 && cityIndex < cityList.value.length) {
      selectedCity.value = cityList.value[cityIndex]
      await loadDistrictList(selectedCity.value.areaId)
      // 重置picker的区索引
      pickerValue.value = [provinceIndex, cityIndex, 0]
    }
  }
  // 区变化
  else if (districtIndex !== oldValue[2]) {
    // 边界检查
    if (districtIndex >= 0 && districtIndex < districtList.value.length) {
      selectedDistrict.value = districtList.value[districtIndex]
    }
  }
}

// 确认选择地区
const handleRegionConfirm = async () => {
  if (!selectedProvince.value || !selectedCity.value || !selectedDistrict.value) {
    uni.showToast({title: '请选择完整的地区', icon: 'none'})
    return
  }
  
  const regionText = `${selectedProvince.value.name} ${selectedCity.value.name} ${selectedDistrict.value.name}`
  
  user.value.region = regionText
  showRegionPicker.value = false
  
  try {
    await updateRegion(regionText)
    
    // 更新store中的用户资料
    store.dispatch('UpdateUserProfileField', { field: 'region', value: regionText })
    
    uni.showToast({title: '地区更新成功', icon: 'success'})
  } catch (error) {
    console.error('更新地区失败', error)
    uni.showToast({title: '更新地区失败', icon: 'none'})
  }
}

// 监听地区选择器显示
watch(showRegionPicker, (newVal) => {
  if (newVal && provinceList.value.length === 0) {
    loadProvinceList()
  }
})

// 选择职业
const handleSelectOccupation = () => {
  handleEditField('occupation', '职业', user.value.occupation)
}

// 选择学校
const handleSelectSchool = () => {
  handleEditField('school', '学校', user.value.school)
}

// 官方认证
const handleOfficialVerify = () => {
  uni.showToast({title: '官方认证功能开发中', icon: 'none'})
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
      box-sizing: border-box;
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
      box-sizing: border-box;
    }
  }

  .popup-footer {
    padding: 20rpx 40rpx 40rpx;

    .save-btn {
      width: 100%;
      background: #000000;
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

// 地区选择弹窗
.region-popup {
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 40rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .popup-cancel,
    .popup-confirm {
      font-size: 28rpx;
      color: #666;
    }

    .popup-confirm {
      color: #000000;
    }

    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .region-picker-wrapper {
    height: 500rpx;
    overflow: hidden;

    .region-picker {
      width: 100%;
      height: 100%;

      .picker-item {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 50px;
        font-size: 28rpx;
        color: #333;
      }
    }
  }
}
</style>
