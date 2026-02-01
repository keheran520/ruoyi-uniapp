import request from '@/utils/request'

// 获取会员信息
export function getMemberInfo() {
  return request({
    url: '/mobile/member/info',
    method: 'GET'
  })
}

// 签到
export function checkin() {
  return request({
    url: '/mobile/member/checkin',
    method: 'POST'
  })
}

// 获取签到状态
export function getCheckinStatus() {
  return request({
    url: '/mobile/member/checkin/status',
    method: 'GET'
  })
}
