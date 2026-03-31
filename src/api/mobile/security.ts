import request from '@/utils/request'

export function bindPhone(data: Record<string, any>) {
  return request({
    url: '/system/user/security/bindPhone',
    method: 'POST',
    data
  })
}

export function unbindPhone(data: Record<string, any>) {
  return request({
    url: '/system/user/security/unbindPhone',
    method: 'POST',
    data
  })
}

export function bindEmail(data: Record<string, any>) {
  return request({
    url: '/system/user/security/bindEmail',
    method: 'POST',
    data
  })
}

export function unbindEmail(data: Record<string, any>) {
  return request({
    url: '/system/user/security/unbindEmail',
    method: 'POST',
    data
  })
}

export function sendPhoneVerifyCode(phonenumber: string, businessType = 'bind', captchaId?: string) {
  return request({
    url: '/resource/phoneverify/code',
    method: 'GET',
    params: { phonenumber, businessType, captchaId }
  })
}

export function sendPhoneSmsCode(phonenumber: string) {
  return request({
    url: '/resource/sms/code',
    method: 'GET',
    params: { phonenumber }
  })
}

export function sendEmailCode(email: string, businessType = 'login', captchaId?: string) {
  return request({
    url: '/resource/email/code',
    method: 'GET',
    params: { email, businessType, captchaId }
  })
}

export function getOnlineDevices() {
  return request({
    url: '/monitor/online',
    method: 'GET'
  })
}

export function delOnline(tokenId: string | number) {
  return request({
    url: `/monitor/online/myself/${tokenId}`,
    method: 'DELETE'
  })
}

export function updatePassword(data: Record<string, any>) {
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'PUT',
    headers: {
      isEncrypt: true,
      repeatSubmit: false
    },
    data
  })
}
