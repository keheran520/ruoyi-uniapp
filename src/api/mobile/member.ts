import request from '@/utils/request'

/** 获取会员信息（含等级名称等） */
export function getMemberInfo() {
  return request({
    url: '/mobile/member/info',
    method: 'GET'
  })
}

/** 会员详情 */
export function getMemberDetail() {
  return request({
    url: '/mobile/member/detail',
    method: 'GET'
  })
}

/** 更新会员资料 */
export function updateMember(data: Record<string, unknown>) {
  return request({
    url: '/mobile/member/update',
    method: 'PUT',
    data
  })
}

/** 首次注册会员 */
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

/** 余额变动记录 */
export function getBalanceLog(params: { pageNum?: number; pageSize?: number }) {
  return request({
    url: '/mobile/member/balance/log',
    method: 'GET',
    params
  })
}

/** 积分变动记录 */
export function getPointsLog(params: { pageNum?: number; pageSize?: number }) {
  return request({
    url: '/mobile/member/points/log',
    method: 'GET',
    params
  })
}

/** 成长值变动记录 */
export function getGrowthLog(params: { pageNum?: number; pageSize?: number }) {
  return request({
    url: '/mobile/member/growth/log',
    method: 'GET',
    params
  })
}

/** 启用的会员等级列表 */
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
