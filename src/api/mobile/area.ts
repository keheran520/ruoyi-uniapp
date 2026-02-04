import request from '@/utils/request'

/**
 * 查询地址列表（懒加载）
 * @param params 查询参数
 */
export function listArea(params?: any) {
  return request({
    url: '/mobile/area/list',
    method: 'get',
    params
  })
}

/**
 * 根据父级ID查询子级列表
 * @param parentId 父级ID
 */
export function getChildren(parentId: number) {
  return request({
    url: `/mobile/area/children/${parentId}`,
    method: 'get'
  })
}

/**
 * 获取地址详细信息
 * @param areaId 地址ID
 */
export function getArea(areaId: number) {
  return request({
    url: `/mobile/area/${areaId}`,
    method: 'get'
  })
}

/**
 * 根据名称搜索地址
 * @param name 地址名称
 */
export function searchArea(name: string) {
  return request({
    url: '/mobile/area/search',
    method: 'get',
    params: { name }
  })
}
