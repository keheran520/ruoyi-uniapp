<template>
  <view class="login-container">
    <!-- 顶部安全区域 -->
    <SafeArea position="top" backgroundColor="#ffffff" />
    
    <!-- 顶部头部 (仿B端移动端设计) -->
    <view class="mobile-header">
      <image class="mobile-logo" :src="globalConfig.appInfo.logo" mode="aspectFit"></image>
      <text class="mobile-title">{{ globalConfig.appInfo.title }}</text>
    </view>

    <!-- 内容区域 -->
    <view class="content-box">
      <!-- 欢迎标语 -->
      <view class="form-header">
        <text class="form-title">欢迎回来</text>
        <text class="form-subtitle">请登录您的账户</text>
      </view>

      <!-- 登录方式切换 -->
      <view class="login-type-switch">
        <view 
          class="switch-item" 
          :class="{ active: loginType === 'password' }"
          @click="switchLoginType('password')"
        >
          <text>密码登录</text>
        </view>
        <view 
          class="switch-item" 
          :class="{ active: loginType === 'email' }"
          @click="switchLoginType('email')"
        >
          <text>邮箱登录</text>
        </view>
        <view 
          class="switch-item" 
          :class="{ active: loginType === 'phoneverify' }"
          @click="switchLoginType('phoneverify')"
        >
          <text>号码登录</text>
        </view>
      </view>

      <!-- 表单区域 -->
      <view class="form-section animate-fade-in">
        <!-- 租户选择 -->
        <view class="input-item" v-if="tenantEnabled">
          <u-icon name="grid-fill" size="22" color="#909399"></u-icon>
          <view class="select-box">
            <uni-data-select
              v-model="loginForm.tenantId"
              :localdata="range"
              :clear="false"
              placeholder="请选择租户"
            ></uni-data-select>
          </view>
        </view>

        <!-- 密码登录表单 -->
        <template v-if="loginType === 'password'">
          <!-- 账号 -->
          <view class="input-item">
            <u-icon name="account" size="22" color="#909399"></u-icon>
            <input 
              class="input" 
              type="text" 
              v-model="loginForm.username" 
              placeholder="请输入账号" 
              maxlength="30"
            />
          </view>

          <!-- 密码 -->
          <view class="input-item">
            <u-icon name="lock" size="22" color="#909399"></u-icon>
            <input 
              class="input" 
              :type="showPassword ? 'text' : 'password'"
              v-model="loginForm.password" 
              placeholder="请输入密码" 
              maxlength="20"
            />
            <view class="eye-icon" @click="showPassword = !showPassword">
              <u-icon :name="showPassword ? 'eye-fill' : 'eye-off'" size="22" color="#909399"></u-icon>
            </view>
          </view>

          <!-- 验证码 -->
          <view class="input-item" v-if="captchaEnabled">
            <u-icon name="checkmark-circle" size="22" color="#909399"></u-icon>
            <input 
              class="input" 
              type="number" 
              v-model="loginForm.code" 
              placeholder="请输入验证码" 
              maxlength="4"
            />
            <view class="captcha-box" @click="getCode">
              <image :src="codeUrl" mode="scaleToFill" class="captcha-img"></image>
            </view>
          </view>
        </template>

        <!-- 邮箱登录表单 -->
        <template v-if="loginType === 'email'">
          <!-- 邮箱 -->
          <view class="input-item">
            <u-icon name="email" size="22" color="#909399"></u-icon>
            <input 
              class="input" 
              type="text" 
              v-model="loginForm.email" 
              placeholder="请输入邮箱" 
            />
          </view>

          <!-- 邮箱验证码 -->
          <view class="input-item">
            <u-icon name="checkmark-circle" size="22" color="#909399"></u-icon>
            <input 
              class="input" 
              type="text" 
              v-model="loginForm.emailCode" 
              placeholder="请输入邮箱验证码" 
              maxlength="6"
            />
            <view class="code-text" @click="sendEmailCode" :class="{ disabled: emailCountdown > 0 }">
              {{ emailCountdown > 0 ? `${emailCountdown}s后重发` : '获取验证码' }}
            </view>
          </view>
        </template>

        <!-- 号码验证登录表单 -->
        <template v-if="loginType === 'phoneverify'">
          <!-- 手机号 -->
          <view class="input-item">
            <u-icon name="phone" size="22" color="#909399"></u-icon>
            <input 
              class="input" 
              type="number" 
              v-model="loginForm.phonenumber" 
              placeholder="请输入手机号" 
              maxlength="11"
            />
          </view>

          <!-- 号码验证码 -->
          <view class="input-item">
            <u-icon name="checkmark-circle" size="22" color="#909399"></u-icon>
            <input 
              class="input" 
              type="text" 
              v-model="loginForm.verifyCode" 
              placeholder="请输入验证码" 
              maxlength="6"
            />
            <view class="code-text" @click="sendPhoneCode" :class="{ disabled: phoneCountdown > 0 }">
              {{ phoneCountdown > 0 ? `${phoneCountdown}s后重发` : '获取验证码' }}
            </view>
          </view>
        </template>

        <!-- 登录按钮 -->
        <button class="submit-btn" @click="handleLogin">登 录</button>
        
        <!-- 其他登录方式 -->
        <view class="other-login">
          <view class="divider">
            <text class="divider-text">其他登录方式</text>
          </view>
          <view class="social-buttons">
            <view class="social-btn" @click="handleSocialLogin('wechat')">
              <u-icon name="weixin-fill" size="40" color="#07C160"></u-icon>
            </view>
            <view class="social-btn" @click="handleSocialLogin('qq')">
              <u-icon name="qq-fill" size="40" color="#12B7F5"></u-icon>
            </view>
            <view class="social-btn" @click="handleSocialLogin('weibo')">
              <u-icon name="weibo" size="40" color="#E6162D"></u-icon>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部协议 -->
    <view class="copyright">
      <text class="text-grey">登录即代表同意</text>
      <text class="highlight" @click="handleUserAgrement">《用户协议》</text>
      <text class="text-grey">和</text>
      <text class="highlight" @click="handlePrivacy">《隐私协议》</text>
    </view>
    
    <!-- 底部安全区域 -->
    <SafeArea position="bottom" backgroundColor="#ffffff" />
    
    <!-- TAC验证码组件 -->
    <TacCaptcha
      :visible="showTacCaptcha"
      :type="tacCaptchaType"
      :contact="tacCaptchaContact"
      @validSuccess="handleTacCaptchaSuccess"
      @validFail="handleTacCaptchaFail"
      @btnCloseFun="handleTacCaptchaClose"
    />
  </view>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import modal from '@/plugins/modal'
import { getCodeImg, getTenantList, getWebsiteConfig, getCaptchaConfig, getRegisterConfig, sendEmailVerifyCode, sendPhoneVerifyCode } from '@/api/login.js'
import config from '@/config.js'
import store from '@/store'
import { showBehaviorCaptchaModal } from '@/utils/behaviorCaptcha'
import SafeArea from '@/components/SafeArea/SafeArea.vue'
import TacCaptcha from '@/components/tac-captcha/tac-captcha.vue'

// 登录方式
const loginType = ref('password'); // 'password', 'email', 'phoneverify'
const showPassword = ref(false);
const emailCountdown = ref(0);
const phoneCountdown = ref(0);

const codeUrl = ref("");
const captchaEnabled = ref(true);
const tenantEnabled = ref(true);
const globalConfig = ref(config);
const loginForm = ref({
  tenantId: '000000',
  username: "admin",
  password: "admin123",
  code: "",
  uuid: '',
  email: '',
  emailCode: '',
  phonenumber: '',
  verifyCode: '',
  grantType: 'password'
});

// 租户列表
const tenantList = ref([]);
const range = ref([]);

// 注册开关
const registerEnabled = ref(false);

// 网站配置
const websiteConfig = ref({
  name: '',
  logo: '',
  copyright: '',
  icp: ''
});

// TAC验证码组件状态
const showTacCaptcha = ref(false);
const tacCaptchaType = ref('sms'); // 'sms' 或 'email'
const tacCaptchaContact = ref(''); // 手机号或邮箱
let tacCaptchaResolve = null;
let tacCaptchaReject = null;

// 监听显示验证码事件
const handleShowBehaviorCaptcha = (options) => {
  console.log('收到显示验证码事件:', options);
  console.log('当前 showTacCaptcha 值:', showTacCaptcha.value);
  
  // 设置验证码类型和联系方式
  tacCaptchaType.value = options.type || 'sms';
  tacCaptchaContact.value = options.contact || '';
  
  console.log('设置后 tacCaptchaType:', tacCaptchaType.value);
  console.log('设置后 tacCaptchaContact:', tacCaptchaContact.value);
  
  // 保存回调函数
  tacCaptchaResolve = options.onSuccess;
  tacCaptchaReject = options.onFail;
  
  // 显示验证码组件
  showTacCaptcha.value = true;
  console.log('设置后 showTacCaptcha:', showTacCaptcha.value);
};

// TAC验证码成功回调
const handleTacCaptchaSuccess = (res) => {
  console.log('TAC验证码验证成功:', res);
  showTacCaptcha.value = false;
  
  // 获取验证码ID
  const captchaId = res?.data || res?.id || '';
  console.log('获取到的captchaId:', captchaId);
  
  if (tacCaptchaResolve) {
    tacCaptchaResolve(captchaId);
    tacCaptchaResolve = null;
    tacCaptchaReject = null;
  }
};

// TAC验证码失败回调
const handleTacCaptchaFail = (res) => {
  console.log('TAC验证码验证失败:', res);
  // 不关闭组件，允许重试
  
  if (tacCaptchaReject) {
    tacCaptchaReject();
  }
};

// TAC验证码关闭回调
const handleTacCaptchaClose = () => {
  console.log('TAC验证码关闭');
  showTacCaptcha.value = false;
  
  if (tacCaptchaReject) {
    tacCaptchaReject();
    tacCaptchaResolve = null;
    tacCaptchaReject = null;
  }
};

// 组件挂载时注册事件监听
onMounted(() => {
  uni.$on('showBehaviorCaptcha', handleShowBehaviorCaptcha);
  // 初始化配置
  initConfig();
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  uni.$off('showBehaviorCaptcha', handleShowBehaviorCaptcha);
});


// 切换登录方式
function switchLoginType(type) {
  loginType.value = type;
  // 清空相关表单字段
  if (type === 'password') {
    loginForm.value.email = '';
    loginForm.value.emailCode = '';
    loginForm.value.phonenumber = '';
    loginForm.value.verifyCode = '';
  } else if (type === 'email') {
    loginForm.value.username = '';
    loginForm.value.password = '';
    loginForm.value.code = '';
    loginForm.value.phonenumber = '';
    loginForm.value.verifyCode = '';
  } else if (type === 'phoneverify') {
    loginForm.value.username = '';
    loginForm.value.password = '';
    loginForm.value.code = '';
    loginForm.value.email = '';
    loginForm.value.emailCode = '';
  }
}

// 发送邮箱验证码
async function sendEmailCode() {
  if (emailCountdown.value > 0) return;
  
  if (!loginForm.value.email) {
    modal.msgError("请输入邮箱地址");
    return;
  }
  
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(loginForm.value.email)) {
    modal.msgError("请输入正确的邮箱地址");
    return;
  }
  
  // 统一使用 showBehaviorCaptchaModal（自动适配H5和非H5平台）
  try {
    const captchaId = await showBehaviorCaptchaModal({
      tenantId: loginForm.value.tenantId,
      type: 'email',                          // 邮箱验证码类型
      contact: loginForm.value.email          // 传递邮箱地址
    });
    
    // 验证成功，发送邮箱验证码
    modal.loading("发送中...");
    try {
      const res = await sendEmailVerifyCode(loginForm.value.email, loginForm.value.tenantId, captchaId);
      modal.closeLoading();
      
      if (res.code === 200) {
        modal.msgSuccess("验证码已发送，请查收邮件");
        startEmailCountdown();
      } else {
        modal.msgError(res.msg || "发送验证码失败");
      }
    } catch (error) {
      modal.closeLoading();
      console.error('发送验证码失败:', error);
      modal.msgError("发送验证码失败");
    }
  } catch (error) {
    console.log('用户取消验证或验证失败:', error);
    // 用户取消或验证失败，不显示错误提示，允许重新尝试
  }
}

// 发送号码验证码
async function sendPhoneCode() {
  if (phoneCountdown.value > 0) return;
  
  if (!loginForm.value.phonenumber) {
    modal.msgError("请输入手机号");
    return;
  }
  
  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(loginForm.value.phonenumber)) {
    modal.msgError("请输入正确的手机号");
    return;
  }
  
  // 统一使用 showBehaviorCaptchaModal（自动适配H5和非H5平台）
  try {
    const captchaId = await showBehaviorCaptchaModal({
      tenantId: loginForm.value.tenantId,
      type: 'phoneverify',                    // 号码验证类型
      contact: loginForm.value.phonenumber    // 传递手机号
    });
    
    // 验证成功，发送号码验证码
    modal.loading("发送中...");
    try {
      const res = await sendPhoneVerifyCode(loginForm.value.phonenumber, 'login', loginForm.value.tenantId, captchaId);
      modal.closeLoading();
      
      if (res.code === 200 && res.data?.success) {
        modal.msgSuccess("验证码已发送，请注意查收短信");
        startPhoneCountdown();
      } else {
        modal.msgError(res.data?.message || res.msg || "发送验证码失败");
      }
    } catch (error) {
      modal.closeLoading();
      console.error('发送验证码失败:', error);
      modal.msgError("发送验证码失败");
    }
  } catch (error) {
    console.log('用户取消验证或验证失败:', error);
    // 用户取消或验证失败，不显示错误提示，允许重新尝试
  }
}

// 邮箱倒计时
function startEmailCountdown() {
  emailCountdown.value = 60;
  const timer = setInterval(() => {
    emailCountdown.value--;
    if (emailCountdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
}

// 号码倒计时
function startPhoneCountdown() {
  phoneCountdown.value = 60;
  const timer = setInterval(() => {
    phoneCountdown.value--;
    if (phoneCountdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
}

// 获取图形验证码
function getCode() {
  getCodeImg().then(res => {
    const { data } = res;
    captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = data.img;
      loginForm.value.uuid = data.uuid
    }
  })
};

// 获取租户列表
function getTenant() {
  getTenantList().then(res => {
    const data = res.data;
    tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
    if (tenantEnabled.value) {
      tenantList.value = data.voList;
      if (tenantList.value != null && tenantList.value.length !== 0) {
        loginForm.value.tenantId = tenantList.value[0].tenantId;
        range.value = tenantList.value.map(row => ({
          value: row.tenantId,
          text: row.companyName
        }));
      }
    }
  })
};

// 获取网站配置
async function fetchWebsiteConfig(tenantId) {
  try {
    const res = await getWebsiteConfig(tenantId);
    if (res.data) {
      websiteConfig.value = {
        name: res.data.name || globalConfig.value.appInfo.title,
        logo: res.data.logo || globalConfig.value.appInfo.logo,
        copyright: res.data.copyright || '',
        icp: res.data.icp || ''
      };
      // 保存到 store 的 website 模块
      store.dispatch('SetWebsiteConfig', websiteConfig.value);
      // 更新 globalConfig
      if (res.data.name) {
        globalConfig.value.appInfo.title = res.data.name;
      }
      if (res.data.logo) {
        globalConfig.value.appInfo.logo = res.data.logo;
      }
    }
  } catch (error) {
    console.error('获取网站配置失败:', error);
  }
}

// 获取验证码配置
async function fetchCaptchaConfig(tenantId) {
  try {
    const res = await getCaptchaConfig(tenantId);
    if (res.code === 200 && res.data) {
      captchaEnabled.value = res.data.captchaEnabled === undefined ? true : res.data.captchaEnabled;
    }
  } catch (error) {
    console.error('获取验证码配置失败:', error);
    captchaEnabled.value = true; // 默认开启
  }
}

// 获取注册开关配置
async function fetchRegisterConfig(tenantId) {
  try {
    const res = await getRegisterConfig(tenantId);
    if (res.code === 200 && res.data) {
      registerEnabled.value = res.data.registerEnabled === undefined ? false : res.data.registerEnabled;
    }
  } catch (error) {
    console.error('获取注册开关配置失败:', error);
    registerEnabled.value = false; // 默认关闭
  }
}

async function handleLogin() {
  if (loginType.value === 'password') {
    // 密码登录验证
    if (loginForm.value.username === "") {
      modal.msgError("请输入您的账号")
      return;
    }
    if (loginForm.value.password === "") {
      modal.msgError("请输入您的密码")
      return;
    }
    if (loginForm.value.code === "" && captchaEnabled.value) {
      modal.msgError("请输入验证码")
      return;
    }
    loginForm.value.grantType = 'password';
    modal.loading("登录中，请耐心等待...")
    await doLogin();
  } else if (loginType.value === 'email') {
    // 邮箱登录验证
    if (!loginForm.value.email) {
      modal.msgError("请输入邮箱地址");
      return;
    }
    if (!loginForm.value.emailCode) {
      modal.msgError("请输入邮箱验证码");
      return;
    }
    loginForm.value.grantType = 'email';
    modal.loading("登录中，请耐心等待...")
    await doLogin();
  } else if (loginType.value === 'phoneverify') {
    // 号码登录验证
    if (!loginForm.value.phonenumber) {
      modal.msgError("请输入手机号");
      return;
    }
    if (!loginForm.value.verifyCode) {
      modal.msgError("请输入验证码");
      return;
    }
    loginForm.value.grantType = 'phoneverify';
    modal.loading("登录中，请耐心等待...")
    await doLogin();
  }
};

// 统一登录处理
async function doLogin() {
  store.dispatch('Login', loginForm.value).then(() => {
    modal.closeLoading()
    loginSuccess()
  }).catch(() => {
    modal.closeLoading()
    // 如果是密码登录且需要验证码，重新获取验证码
    if (loginType.value === 'password' && captchaEnabled.value) {
      getCode()
    }
  })
}

function loginSuccess(result) {
  store.dispatch('GetInfo').then(res => {
    // 登录成功后获取用户资料
    return store.dispatch('GetUserProfile')
  }).then(() => {
    uni.switchTab({
      url: '/pages/esports-home'
    });
  }).catch(error => {
    console.error('获取用户信息失败:', error)
    // 即使获取用户资料失败，也允许进入首页
    uni.switchTab({
      url: '/pages/esports-home'
    });
  })
}

// 隐私协议
function handlePrivacy() {
  let site = globalConfig.value.appInfo.agreements[0];
  uni.navigateTo({
    url: `/pages/common/webview/index?title=${site.title}&url=${site.url}`
  });
};

// 用户协议
function handleUserAgrement() {
  let site = globalConfig.value.appInfo.agreements[1]
  uni.navigateTo({
    url: `/pages/common/webview/index?title=${site.title}&url=${site.url}`
  });
};

// 社交登录
function handleSocialLogin(type) {
  modal.msgError(`${type}登录功能待实现`);
  // 这里需要调用后端社交登录的 API
  // 例如: authBinding(type, loginForm.value.tenantId).then(...)
}

// 加载租户相关配置
async function loadTenantConfig(tenantId) {
  const tid = tenantId || loginForm.value.tenantId;
  try {
    // 并行加载所有配置
    await Promise.all([
      fetchWebsiteConfig(tid),
      fetchCaptchaConfig(tid),
      fetchRegisterConfig(tid)
    ]);
    // 如果需要验证码，重新获取
    if (captchaEnabled.value) {
      getCode();
    }
  } catch (error) {
    console.error('加载租户配置失败:', error);
  }
}

// 初始化加载配置
async function initConfig() {
  try {
    // 先获取租户列表
    await getTenant();
    // 再加载当前租户的配置
    await loadTenantConfig();
  } catch (error) {
    console.error('初始化配置失败:', error);
  }
}

// 监听租户ID变化，重新加载配置
function handleTenantChange(tenantId) {
  loadTenantConfig(tenantId);
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

// 移动端头部 - 仿B端设计
.mobile-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 30rpx 40rpx;
  background: #ffffff;
  
  .mobile-logo {
    width: 80rpx;
    height: 80rpx;
    margin-right: 20rpx;
    border-radius: 16rpx;
    flex-shrink: 0;
  }
  
  .mobile-title {
    font-size: 40rpx;
    font-weight: 700;
    color: #1a1a1a;
    flex-shrink: 0;
  }
}

// 内容区域
.content-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40rpx 60rpx 120rpx;
  overflow-y: auto;
}

.form-header {
  margin-bottom: 50rpx;
  text-align: left;
  padding-top: 20rpx;
  
  .form-title {
    display: block;
    font-size: 52rpx;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 16rpx;
    letter-spacing: -1rpx;
  }
  
  .form-subtitle {
    display: block;
    font-size: 28rpx;
    color: #8c8c8c;
  }
}

// 登录方式切换
.login-type-switch {
  display: flex;
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 6rpx;
  margin-bottom: 50rpx;
  
  .switch-item {
    flex: 1;
    height: 68rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8rpx;
    font-size: 26rpx;
    color: #666;
    font-weight: 500;
    transition: all 0.3s;
    
    &.active {
      background: #ffffff;
      color: #1a1a1a;
      font-weight: 600;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    }
  }
}

.form-section {
  width: 100%;
  
  .input-item {
    display: flex;
    align-items: center;
    background: #f5f7fa;
    min-height: 96rpx;
    border-radius: 12rpx;
    padding: 0 30rpx;
    margin-bottom: 28rpx;
    transition: all 0.3s;
    border: 2rpx solid transparent;
    
    &:focus-within {
      background: #ffffff;
      border-color: #667eea;
      box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
    }
    
    .input {
      flex: 1;
      height: 96rpx;
      margin-left: 20rpx;
      font-size: 28rpx;
      color: #333;
    }
    
    .eye-icon {
      margin-left: 10rpx;
      padding: 10rpx;
    }
    
    .code-text {
      font-size: 26rpx;
      color: #667eea;
      padding-left: 20rpx;
      margin-left: 20rpx;
      border-left: 1rpx solid #e0e0e0;
      white-space: nowrap;
      
      &.disabled {
        color: #999;
      }
    }
    
    .select-box {
      flex: 1;
      margin-left: 20rpx;
      ::v-deep .uni-select {
        border: none !important;
        padding: 0;
      }
      ::v-deep .uni-select__input-text {
        font-size: 28rpx;
        color: #333;
      }
    }
    
    .captcha-box {
      width: 200rpx;
      height: 64rpx;
      margin-left: 20rpx;
      border-radius: 8rpx;
      overflow: hidden;
      
      .captcha-img {
        width: 100%;
        height: 100%;
      }
    }
  }
  
  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #667eea;
    border-radius: 12rpx;
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    margin-top: 50rpx;
    border: none;
    
    &:active {
      transform: scale(0.99);
      background: #5a6fd1;
    }
    
    &::after {
      border: none;
    }
  }
}

.copyright {
  padding: 20rpx 0;
  text-align: center;
  font-size: 24rpx;
  border-top: 1rpx solid #f0f0f0;
  background: #fff;
  
  .text-grey {
    color: #999;
  }
  
  .highlight {
    color: #667eea;
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

// 其他登录方式
.other-login {
  margin-top: 50rpx;
  
  .divider {
    position: relative;
    text-align: center;
    margin-bottom: 40rpx;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1rpx;
      background: #e8e8e8;
    }
    
    .divider-text {
      position: relative;
      display: inline-block;
      padding: 0 24rpx;
      background: #fff;
      color: #999;
      font-size: 24rpx;
      z-index: 1;
    }
  }
  
  .social-buttons {
    display: flex;
    justify-content: center;
    gap: 40rpx;
    
    .social-btn {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #f5f7fa;
      transition: all 0.3s;
      
      &:active {
        transform: scale(0.95);
        background: #ebeef5;
      }
    }
  }
}
</style>
