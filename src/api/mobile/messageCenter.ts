import request from '@/utils/request'

export function getMobileMessageSummary() {
  return request({
    url: '/mobile/message/summary',
    method: 'GET'
  })
}

export function getMobileMessageList(params: Record<string, unknown>) {
  return request({
    url: '/mobile/message/list',
    method: 'GET',
    params
  })
}

export function markMobileMessageRead(logId: number | string) {
  return request({
    url: `/mobile/message/read/${logId}`,
    method: 'PUT'
  })
}

export function markMobileMessageReadAll(params?: Record<string, unknown>) {
  return request({
    url: '/mobile/message/readAll',
    method: 'PUT',
    params
  })
}
