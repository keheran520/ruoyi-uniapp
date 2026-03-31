import request from '@/utils/request'

export function authBinding(source: string, tenantId: string) {
  return request({
    url: `/auth/binding/${source}`,
    method: 'GET',
    params: {
      tenantId,
      domain: typeof window !== 'undefined' ? window.location?.host || '' : ''
    }
  })
}

export function authUnlock(authId: string | number) {
  return request({
    url: `/auth/unlock/${authId}`,
    method: 'DELETE'
  })
}

export function getAuthList() {
  return request({
    url: '/system/social/list',
    method: 'GET'
  })
}
