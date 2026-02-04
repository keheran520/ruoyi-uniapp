<template>
  <view class="security-page">
    <!-- 安全设置列表 -->
    <CustomCellGroup>
      <CustomCell 
        v-for="item in securityItems" 
        :key="item.type"
        :title="item.title"
        :icon="item.icon"
        :value="item.value"
        :isLink="true"
        @click="() => handleAction(item.type)"
      >
        <template #value>
          <view class="status-wrapper">
            <text :class="['status-text', item.status ? 'success' : 'warning']">
              {{ item.statusText }}
            </text>
          </view>
        </template>
      </CustomCell>
    </CustomCellGroup>

    <!-- 第三方账号 -->
    <view class="section-title">第三方账号</view>
    <CustomCellGroup>
      <CustomCell 
        v-for="item in socialItems" 
        :key="item.source"
        :title="item.title"
        :icon="item.icon"
        :isLink="true"
        @click="() => handleSocialAction(item)"
      >
        <template #value>
          <view class="status-wrapper">
            <text :class="['status-text', item.bound ? 'success' : 'warning']">
              {{ item.bound ? '已绑定' : '未绑定' }}
            </text>
          </view>
        </template>
      </CustomCell>
    </CustomCellGroup>

    <!-- 登录设备 -->
    <view class="section-title">登录管理</view>
    <CustomCellGroup>
      <CustomCell 
        title="登录设备"
        icon="phone"
        :isLink="true"
        @click="handleToDevices"
      />
      <CustomCell 
        title="记住登录信息"
        icon=""
      >
        <template #value>
          <switch 
            :checked="rememberLogin"
            @change="handleRememberChange"
          />
        </template>
      </CustomCell>
    </CustomCellGroup>

    <!-- 修改密码弹窗 -->
    <uni-popup ref="passwordPopup" type="bottom" background-color="#fff">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">修改密码</text>
          <text class="popup-close" @tap="closePasswordPopup">取消</text>
        </view>
        <view class="popup-body">
          <view class="form-item">
            <text class="form-label">旧密码</text>
            <input 
              class="form-input" 
              type="password"
              v-model="passwordForm.oldPassword"
              placeholder="请输入旧密码"
            />
          </view>
          <view class="form-item">
            <text class="form-label">新密码</text>
            <input 
              class="form-input" 
              type="password"
              v-model="passwordForm.newPassword"
              placeholder="请输入新密码"
            />
          </view>
          <view class="form-item">
            <text class="form-label">确认密码</text>
            <input 
              class="form-input" 
              type="password"
              v-model="passwordForm.confirmPassword"
              placeholder="请再次输入新密码"
            />
          </view>
        </view>
        <view class="popup-footer">
          <button class="submit-btn" @tap="submitPassword">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 绑定手机号弹窗 -->
    <uni-popup ref="phonePopup" type="bottom" background-color="#fff">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">{{ phoneForm.isUnbind ? '解绑手机号' : '绑定手机号' }}</text>
          <text class="popup-close" @tap="closePhonePopup">取消</text>
        </view>
        <view class="popup-body">
          <view v-if="phoneForm.isUnbind" class="alert-box">
            <text class="alert-text">解绑后将无法使用手机号登录</text>
          </view>
          <view v-if="!phoneForm.isUnbind" class="form-item">
            <text class="form-label">手机号</text>
            <input 
              class="form-input" 
              type="number"
              maxlength="11"
              v-model="phoneForm.phonenumber"
              placeholder="请输入手机号"
            />
          </view>
          <view v-else class="form-item">
            <text class="form-label">手机号</text>
            <input 
              class="form-input" 
              :value="userInfo.phonenumber"
              disabled
            />
          </view>
          <view class="form-item">
            <text class="form-label">验证码</text>
            <view class="code-input-wrapper">
              <input 
                class="form-input flex-1" 
                type="number"
                maxlength="6"
                v-model="phoneForm.code"
                placeholder="请输入验证码"
              />
              <button 
                class="code-btn"
                :disabled="phoneCooldown > 0"
                @tap="sendPhoneCode"
              >
                {{ phoneCooldown > 0 ? `${phoneCooldown}秒` : '获取验证码' }}
              </button>
            </view>
          </view>
        </view>
        <view class="popup-footer">
          <button 
            class="submit-btn"
            :class="{ 'danger': phoneForm.isUnbind }"
            @tap="submitPhone"
          >
            {{ phoneForm.isUnbind ? '确定解绑' : '确定' }}
          </button>
        </view>
      </view>
    </uni-popup>

    <!-- 绑定邮箱弹窗 -->
    <uni-popup ref="emailPopup" type="bottom" background-color="#fff">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">{{ emailForm.isUnbind ? '解绑邮箱' : '绑定邮箱' }}</text>
          <text class="popup-close" @tap="closeEmailPopup">取消</text>
        </view>
        <view class="popup-body">
          <view v-if="emailForm.isUnbind" class="alert-box">
            <text class="alert-text">解绑后将无法接收重要通知</text>
          </view>
          <view v-if="!emailForm.isUnbind" class="form-item">
            <text class="form-label">邮箱</text>
            <input 
              class="form-input" 
              type="text"
              v-model="emailForm.email"
              placeholder="请输入邮箱地址"
            />
          </view>
          <view v-else class="form-item">
            <text class="form-label">邮箱</text>
            <input 
              class="form-input" 
              :value="userInfo.email"
              disabled
            />
          </view>
          <view class="form-item">
            <text class="form-label">验证码</text>
            <view class="code-input-wrapper">
              <input 
                class="form-input flex-1" 
                type="number"
                maxlength="6"
                v-model="emailForm.code"
                placeholder="请输入验证码"
              />
              <button 
                class="code-btn"
                :disabled="emailCooldown > 0"
                @tap="sendEmailCode"
              >
                {{ emailCooldown > 0 ? `${emailCooldown}秒` : '发送验证码' }}
              </button>
            </view>
          </view>
        </view>
        <view class="popup-footer">
          <button 
            class="submit-btn"
            :class="{ 'danger': emailForm.isUnbind }"
            @tap="submitEmail"
          >
            {{ emailForm.isUnbind ? '确定解绑' : '确定' }}
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import store from '@/store'
import CustomCell from '@/components/CustomCell/CustomCell.vue'
import CustomCellGroup from '@/components/CustomCellGroup/CustomCellGroup.vue'
import { 
  bindPhone, 
  unbindPhone, 
  bindEmail, 
  unbindEmail,
  sendPhoneVerifyCode,
  sendEmailCode as sendEmailVerifyCode,
  updatePassword
} from '@/api/mobile/security'
import { getAuthList, authBinding, authUnlock } from '@/api/mobile/social'
import { showBehaviorCaptchaModal } from '@/utils/behaviorCaptcha'

// 用户信息
const userInfo = computed(() => store.state.user.userProfile || {})

// 弹窗引用
const passwordPopup = ref(null)
const phonePopup = ref(null)
const emailPopup = ref(null)

// 记住登录信息
const rememberLogin = ref(false)

// 密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 手机号表单
const phoneForm = ref({
  phonenumber: '',
  code: '',
  isUnbind: false,
  verifyType: ''
})

// 邮箱表单
const emailForm = ref({
  email: '',
  code: '',
  isUnbind: false
})

// 验证码倒计时
const phoneCooldown = ref(0)
const emailCooldown = ref(0)
let phoneTimer = null
let emailTimer = null

// 第三方账号列表
const socialList = ref([])

// 安全设置项
const securityItems = computed(() => [
  {
    type: 'phone',
    title: '安全手机',
    icon: 'phone',
    value: userInfo.value.phonenumber,
    subtitle: userInfo.value.phonenumber && userInfo.value.phonenumber !== '-1' 
      ? '手机号，可通过登录、身份验证、密码找回、通知接收' 
      : '绑定后，可通过登录、身份验证、密码找回、通知接收',
    status: userInfo.value.phonenumber && userInfo.value.phonenumber !== '-1',
    statusText: userInfo.value.phonenumber && userInfo.value.phonenumber !== '-1' ? '已绑定' : '未绑定'
  },
  {
    type: 'email',
    title: '安全邮箱',
    icon: 'email',
    value: userInfo.value.email,
    subtitle: userInfo.value.email && userInfo.value.email !== '-1'
      ? '邮箱，可通过登录、身份验证、密码找回、通知接收'
      : '绑定后，可通过登录、身份验证、密码找回、通知接收',
    status: userInfo.value.email && userInfo.value.email !== '-1',
    statusText: userInfo.value.email && userInfo.value.email !== '-1' ? '已绑定' : '未绑定'
  },
  {
    type: 'password',
    title: '登录密码',
    icon: 'lock',
    subtitle: '为了您的账号安全，建议定期修改密码',
    status: true,
    statusText: '已设置'
  }
])

// 第三方账号项
const socialItems = computed(() => {
  const sources = [
    { source: 'gitee', title: '绑定 Gitee', icon: '' },
    { source: 'github', title: '绑定 GitHub', icon: '' },
    { source: 'wechat_open', title: '绑定微信', icon: '' }
  ]
  
  return sources.map(item => {
    const auth = socialList.value.find(a => a.source?.toLowerCase() === item.source)
    return {
      ...item,
      bound: !!auth,
      userName: auth?.userName,
      authId: auth?.authId
    }
  })
})

// 处理操作
const handleAction = (type) => {
  if (type === 'password') {
    passwordPopup.value.open()
  } else if (type === 'phone') {
    if (userInfo.value.phonenumber && userInfo.value.phonenumber !== '-1') {
      phoneForm.value.isUnbind = true
    } else {
      phoneForm.value.isUnbind = false
    }
    phonePopup.value.open()
  } else if (type === 'email') {
    if (userInfo.value.email && userInfo.value.email !== '-1') {
      emailForm.value.isUnbind = true
    } else {
      emailForm.value.isUnbind = false
    }
    emailPopup.value.open()
  }
}

// 处理第三方账号操作
const handleSocialAction = (item) => {
  if (item.bound) {
    // 解绑
    uni.showModal({
      title: '提示',
      content: `确定要解绑 ${item.title.replace('绑定 ', '')} 账号吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await authUnlock(item.authId)
            uni.showToast({ title: '解绑成功', icon: 'success' })
            loadAuthList()
          } catch (error) {
            console.error('解绑失败：', error)
          }
        }
      }
    })
  } else {
    // 绑定
    bindSocialAccount(item.source)
  }
}

// 绑定第三方账号
const bindSocialAccount = async (source) => {
  try {
    const tenantId = uni.getStorageSync('tenantId') || '000000'
    const res = await authBinding(source, tenantId)
    if (res.data) {
      // 在小程序中无法直接打开外部链接，提示用户
      uni.showModal({
        title: '提示',
        content: '请在浏览器中完成授权绑定',
        showCancel: false
      })
    }
  } catch (error) {
    console.error('获取授权链接失败：', error)
    uni.showToast({ title: '获取授权链接失败', icon: 'none' })
  }
}

// 跳转到登录设备页面
const handleToDevices = () => {
  uni.navigateTo({ url: '/pages_mine/pages/security/devices' })
}

// 记住登录信息开关
const handleRememberChange = (e) => {
  rememberLogin.value = e.detail.value
  uni.setStorageSync('rememberLogin', rememberLogin.value)
  uni.showToast({ 
    title: rememberLogin.value ? '已开启' : '已关闭', 
    icon: 'none' 
  })
}

// 发送手机验证码
const sendPhoneCode = async () => {
  const phone = phoneForm.value.isUnbind ? userInfo.value.phonenumber : phoneForm.value.phonenumber
  
  if (!phone) {
    uni.showToast({ title: '请先输入手机号', icon: 'none' })
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  try {
    await showBehaviorCaptchaModal({
      onSuccess: async (captchaId) => {
        try {
          const businessType = phoneForm.value.isUnbind ? 'unbind' : 'bind'
          await sendPhoneVerifyCode(phone, businessType, captchaId)
          phoneForm.value.verifyType = 'phoneverify'
          uni.showToast({ title: '验证码已发送', icon: 'success' })
          
          phoneCooldown.value = 60
          phoneTimer = setInterval(() => {
            phoneCooldown.value--
            if (phoneCooldown.value <= 0) {
              clearInterval(phoneTimer)
            }
          }, 1000)
        } catch (error) {
          console.error('发送验证码失败：', error)
        }
      },
      onFail: () => {
        uni.showToast({ title: '行为验证失败', icon: 'none' })
      }
    })
  } catch (error) {
    console.error('行为验证码初始化失败:', error)
    uni.showToast({ title: '验证码加载失败', icon: 'none' })
  }
}

// 发送邮箱验证码
const sendEmailCode = async () => {
  const email = emailForm.value.isUnbind ? userInfo.value.email : emailForm.value.email
  
  if (!email) {
    uni.showToast({ title: '请先输入邮箱地址', icon: 'none' })
    return
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    uni.showToast({ title: '请输入正确的邮箱地址', icon: 'none' })
    return
  }

  try {
    await showBehaviorCaptchaModal({
      onSuccess: async (captchaId) => {
        try {
          const businessType = emailForm.value.isUnbind ? 'unbind' : 'bind'
          await sendEmailVerifyCode(email, businessType, captchaId)
          uni.showToast({ title: '验证码已发送至邮箱', icon: 'success' })
          
          emailCooldown.value = 60
          emailTimer = setInterval(() => {
            emailCooldown.value--
            if (emailCooldown.value <= 0) {
              clearInterval(emailTimer)
            }
          }, 1000)
        } catch (error) {
          console.error('发送验证码失败：', error)
        }
      },
      onFail: () => {
        uni.showToast({ title: '行为验证失败', icon: 'none' })
      }
    })
  } catch (error) {
    console.error('行为验证码初始化失败:', error)
    uni.showToast({ title: '验证码加载失败', icon: 'none' })
  }
}

// 提交修改密码
const submitPassword = async () => {
  if (!passwordForm.value.oldPassword) {
    uni.showToast({ title: '请输入旧密码', icon: 'none' })
    return
  }
  if (!passwordForm.value.newPassword) {
    uni.showToast({ title: '请输入新密码', icon: 'none' })
    return
  }
  if (passwordForm.value.newPassword.length < 6) {
    uni.showToast({ title: '新密码长度不能少于6位', icon: 'none' })
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
    return
  }
  if (passwordForm.value.oldPassword === passwordForm.value.newPassword) {
    uni.showToast({ title: '新密码不能与旧密码相同', icon: 'none' })
    return
  }
  
  try {
    await updatePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    uni.showToast({ title: '修改成功，请重新登录', icon: 'success' })
    closePasswordPopup()
    
    // 延迟跳转到登录页
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/login' })
    }, 1500)
  } catch (error) {
    console.error('修改密码失败：', error)
  }
}

// 提交手机号操作
const submitPhone = async () => {
  if (!phoneForm.value.code) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  
  try {
    if (phoneForm.value.isUnbind) {
      await unbindPhone({ 
        code: phoneForm.value.code,
        verifyType: phoneForm.value.verifyType
      })
      uni.showToast({ title: '解绑成功', icon: 'success' })
    } else {
      if (!phoneForm.value.phonenumber) {
        uni.showToast({ title: '请输入手机号', icon: 'none' })
        return
      }
      await bindPhone({
        phonenumber: phoneForm.value.phonenumber,
        code: phoneForm.value.code,
        verifyType: phoneForm.value.verifyType
      })
      uni.showToast({ title: '绑定成功', icon: 'success' })
    }
    
    closePhonePopup()
    // 刷新用户信息
    await store.dispatch('GetUserProfile')
  } catch (error) {
    console.error('操作失败：', error)
  }
}

// 提交邮箱操作
const submitEmail = async () => {
  if (!emailForm.value.code) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  
  try {
    if (emailForm.value.isUnbind) {
      await unbindEmail({ code: emailForm.value.code })
      uni.showToast({ title: '解绑成功', icon: 'success' })
    } else {
      if (!emailForm.value.email) {
        uni.showToast({ title: '请输入邮箱地址', icon: 'none' })
        return
      }
      await bindEmail({
        email: emailForm.value.email,
        code: emailForm.value.code
      })
      uni.showToast({ title: '绑定成功', icon: 'success' })
    }
    
    closeEmailPopup()
    // 刷新用户信息
    await store.dispatch('GetUserProfile')
  } catch (error) {
    console.error('操作失败：', error)
  }
}

// 关闭弹窗
const closePasswordPopup = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  passwordPopup.value.close()
}

const closePhonePopup = () => {
  phoneForm.value = {
    phonenumber: '',
    code: '',
    isUnbind: false,
    verifyType: ''
  }
  if (phoneTimer) {
    clearInterval(phoneTimer)
    phoneCooldown.value = 0
  }
  phonePopup.value.close()
}

const closeEmailPopup = () => {
  emailForm.value = {
    email: '',
    code: '',
    isUnbind: false
  }
  if (emailTimer) {
    clearInterval(emailTimer)
    emailCooldown.value = 0
  }
  emailPopup.value.close()
}

// 加载第三方账号列表
const loadAuthList = async () => {
  try {
    const res = await getAuthList()
    socialList.value = res.data || []
  } catch (error) {
    console.error('加载第三方账号列表失败：', error)
  }
}

onMounted(() => {
  // 加载记住登录信息设置
  rememberLogin.value = uni.getStorageSync('rememberLogin') || false
  // 加载第三方账号列表
  loadAuthList()
})
</script>

<style lang="scss" scoped>
.security-page {
  width: 100%;
  min-height: 100vh;
  background: #f7f7f7;
  padding-top: 25rpx;
}

.section-title {
  padding: 30rpx 30rpx 20rpx;
  font-size: 28rpx;
  color: #999;
}

.status-wrapper {
  display: flex;
  align-items: center;
  
  .status-text {
    font-size: 26rpx;
    
    &.success {
      color: #07c160;
    }
    
    &.warning {
      color: #ff9500;
    }
  }
}

// 弹窗样式
.popup-content {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .popup-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
  
  .popup-close {
    font-size: 28rpx;
    color: #999;
  }
}

.popup-body {
  padding: 40rpx;
}

.alert-box {
  background: #fff3e0;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
  
  .alert-text {
    font-size: 26rpx;
    color: #ff9500;
  }
}

.form-item {
  margin-bottom: 30rpx;
  
  .form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .form-input {
    width: 100%;
    height: 88rpx;
    background: #f7f7f7;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #333;
    
    &:disabled {
      color: #999;
    }
  }
  
  .code-input-wrapper {
    display: flex;
    gap: 20rpx;
    
    .flex-1 {
      flex: 1;
    }
    
    .code-btn {
      width: 180rpx;
      height: 88rpx;
      background: #000000;
      color: #fff;
      border-radius: 12rpx;
      font-size: 26rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      
      &:disabled {
        background: #ccc;
      }
      
      &::after {
        border: none;
      }
    }
  }
}

.popup-footer {
  padding: 0 40rpx 40rpx;
  
  .submit-btn {
    width: 100%;
    height: 88rpx;
    background: #000000;
    color: #fff;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    
    &.danger {
      background: #000000;
    }
    
    &::after {
      border: none;
    }
  }
}
</style>
