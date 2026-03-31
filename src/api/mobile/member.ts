import request from '@/utils/request'

export function getMemberInfo() {
  return request({
    url: '/mobile/member/info',
    method: 'GET'
  })
}

export function getMemberDetail() {
  return request({
    url: '/mobile/member/detail',
    method: 'GET'
  })
}

export function updateMember(data: Record<string, unknown>) {
  return request({
    url: '/mobile/member/update',
    method: 'PUT',
    data
  })
}

export function registerMember(data: Record<string, unknown>) {
  return request({
    url: '/mobile/member/register',
    method: 'POST',
    data
  })
}

export function getBalance() {
  return request({
    url: '/mobile/member/balance',
    method: 'GET'
  })
}

export function getPoints() {
  return request({
    url: '/mobile/member/points',
    method: 'GET'
  })
}

export function getBalanceLog(params: { pageNum?: number; pageSize?: number }) {
  return request({
    url: '/mobile/member/balance/log',
    method: 'GET',
    params
  })
}

export function getPointsLog(params: { pageNum?: number; pageSize?: number }) {
  return request({
    url: '/mobile/member/points/log',
    method: 'GET',
    params
  })
}

export function getGrowthLog(params: { pageNum?: number; pageSize?: number }) {
  return request({
    url: '/mobile/member/growth/log',
    method: 'GET',
    params
  })
}

export function getLevelList() {
  return request({
    url: '/mobile/member/level/list',
    method: 'GET'
  })
}

export function checkin() {
  return request({
    url: '/mobile/member/checkin',
    method: 'POST'
  })
}

export function getCheckinStatus() {
  return request({
    url: '/mobile/member/checkin/status',
    method: 'GET'
  })
}

export function getCheckinSummary() {
  return request({
    url: '/mobile/member/checkin/summary',
    method: 'GET'
  })
}
