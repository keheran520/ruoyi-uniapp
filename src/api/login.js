import request from '@/utils/request'
import config from '@/config'
// import { LoginData, LoginResult, VerifyCodeResult, TenantInfo } from '@/api/types';
const clientId = config.clientID;
// 登录方法

export function login(data) {
  const params = {
    ...data,
    clientId: data.clientId || clientId,
    grantType: data.grantType || 'password'
  };
  return request({
    url: '/auth/login',
    headers: {
      isToken: false,
      isEncrypt: true
    },
    method: 'POST',
    data: params
  });
}
// export function login(username, password, code, uuid) {
//   const data = {
//     username,
//     password,
//     code,
//     uuid
//   }
//   return request({
//     url: '/login',
//     headers: {
//       isToken: false
//     },
//     method: 'POST',
//     data: data
//   })
// }

// 注册方法
export function register(data) {
  return request({
    url: '/register',
    headers: {
      isToken: false
    },
    method: 'POST',
    data: data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/system/user/getInfo',
    method: 'GET'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'POST'
  })
}

// 获取网站配置信息
export function getWebsiteConfig(tenantId) {
  return request({
    url: '/',
    headers: {
      'X-Tenant-Id': tenantId || '000000'
    },
    params: tenantId ? { tenantId } : undefined,
    method: 'get'
  });
}

/**
 * 获取验证码
 * @param tenantId 租户ID
 */
export function getCodeImg(tenantId){
  return request({
    url: '/auth/code',
    headers: {
      isToken: false,
      'X-Tenant-Id': tenantId || '000000'
    },
    params: tenantId ? { tenantId } : undefined,
    method: 'get',
    timeout: 20000
  });
}

/**
 * 获取邮箱验证码
 * @param email 邮箱地址
 * @param tenantId 租户ID
 * @param captchaId 行为验证码ID
 */
export function sendEmailVerifyCode(email, tenantId, captchaId){
  return request({
    url: '/resource/email/code',
    headers: {
      isToken: false,
      'X-Tenant-Id': tenantId || '000000'
    },
    method: 'get',
    params: {
      email,
      businessType: 'login',
      captchaId,
      ...(tenantId ? { tenantId } : {})
    },
    timeout: 20000
  });
}

/**
 * 获取号码认证验证码
 * @param phonenumber 手机号
 * @param businessType 业务类型
 * @param tenantId 租户ID
 * @param captchaId 行为验证码ID
 */
export function sendPhoneVerifyCode(phonenumber, businessType, tenantId , captchaId ) {
  return request({
    url: '/resource/phoneverify/code',
    headers: {
      isToken: false,
      'X-Tenant-Id': tenantId || '000000'
    },
    method: 'get',
    params: {
      phonenumber,
      businessType: businessType || 'login',
      captchaId,
      ...(tenantId ? { tenantId } : {})
    },
    timeout: 20000
  });
}

// 获取租户列表
export function getTenantList(){
  return request({
    url: '/auth/tenant/list',
    headers: {
      isToken: false
    },
    method: 'GET'
  });
}

/**
 * 获取验证码配置
 * @param tenantId 租户ID
 */
export function getCaptchaConfig(tenantId){
  return request({
    url: '/captchaConfig',
    headers: {
      isToken: false,
      'X-Tenant-Id': tenantId || '000000'
    },
    params: tenantId ? { tenantId } : undefined,
    method: 'get'
  });
}

/**
 * 获取注册开关配置
 * @param tenantId 租户ID
 */
export function getRegisterConfig(tenantId) {
  return request({
    url: '/registerConfig',
    headers: {
      isToken: false,
      'X-Tenant-Id': tenantId || '000000'
    },
    params: tenantId ? { tenantId } : undefined,
    method: 'get'
  });
}