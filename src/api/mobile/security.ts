import request from '@/utils/request'

/**
 * 绑定安全手机
 */
export function bindPhone(data) {
  return request({
    url: '/system/user/security/bindPhone',
    method: 'post',
    data: data
  })
}

/**
 * 解绑安全手机
 */
export function unbindPhone(data) {
  return request({
    url: '/system/user/security/unbindPhone',
    method: 'post',
    data: data
  })
}

/**
 * 绑定安全邮箱
 */
export function bindEmail(data) {
  return request({
    url: '/system/user/security/bindEmail',
    method: 'post',
    data: data
  })
}

/**
 * 解绑安全邮箱
 */
export function unbindEmail(data) {
  return request({
    url: '/system/user/security/unbindEmail',
    method: 'post',
    data: data
  })
}

/**
 * 发送号码认证验证码（推荐使用）
 */
export function sendPhoneVerifyCode(phonenumber, businessType = 'bind', captchaId) {
  return request({
    url: '/resource/phoneverify/code',
    method: 'get',
    params: { phonenumber, businessType, captchaId }
  })
}

/**
 * 发送手机短信验证码（备用）
 */
export function sendPhoneSmsCode(phonenumber) {
  return request({
    url: '/resource/sms/code',
    method: 'get',
    params: { phonenumber }
  })
}

/**
 * 发送邮箱验证码
 * @param email 邮箱地址
 * @param businessType 业务类型（可选，默认为 login）
 * @param captchaId 行为验证码ID（可选）
 */
export function sendEmailCode(email, businessType = 'login', captchaId) {
  return request({
    url: '/resource/email/code',
    method: 'get',
    params: { email, businessType, captchaId }
  })
}

/**
 * 获取在线设备列表
 */
export function getOnlineDevices() {
  return request({
    url: '/monitor/online',
    method: 'get'
  })
}

/**
 * 删除在线设备
 */
export function delOnline(tokenId) {
  return request({
    url: `/monitor/online/myself/${tokenId}`,
    method: 'delete'
  })
}

/**
 * 修改密码
 */
export function updatePassword(data) {
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    headers: {
      isEncrypt: true,
      repeatSubmit: false
    },
    data: data
  })
}
