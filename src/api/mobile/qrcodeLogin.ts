import request from '@/utils/request'

/** 扫描二维码（无需登录） */
export function scanQrCode(qrCodeToken: string) {
  return request({
    url: '/qrCodeLogin/scan',
    method: 'POST',
    headers: { isToken: false },
    data: { qrCodeToken }
  })
}

/** 确认登录 PC（需已登录 App） */
export function confirmQrCodeLogin(qrCodeToken: string) {
  return request({
    url: '/qrCodeLogin/confirm',
    method: 'POST',
    data: { qrCodeToken }
  })
}

/** 取消 */
export function cancelQrCodeLogin(qrCodeToken: string) {
  return request({
    url: '/qrCodeLogin/cancel',
    method: 'POST',
    headers: { isToken: false },
    data: { qrCodeToken }
  })
}
