import request from '@/utils/request'

export function getMallHome() {
  return request({
    url: '/mobile/mall/home',
    method: 'GET'
  })
}

export function getMallCategoryList() {
  return request({
    url: '/mobile/mall/category/list',
    method: 'GET'
  })
}

export function getMallGoodsList(params: Record<string, unknown>) {
  return request({
    url: '/mobile/mall/goods/list',
    method: 'GET',
    params
  })
}

export function getMallNoticeList(params: Record<string, unknown>) {
  return request({
    url: '/mobile/mall/notice/list',
    method: 'GET',
    params
  })
}

export function getMallGoodsDetail(goodsId: string | number) {
  return request({
    url: `/mobile/mall/goods/${goodsId}`,
    method: 'GET'
  })
}

export function getMallOrderList(params: Record<string, unknown>) {
  return request({
    url: '/mobile/mall/order/list',
    method: 'GET',
    params
  })
}

export function getMallOrderDetail(orderId: string | number) {
  return request({
    url: `/mobile/mall/order/${orderId}`,
    method: 'GET'
  })
}

export function cancelMallOrder(orderId: string | number) {
  return request({
    url: `/mobile/mall/order/${orderId}/cancel`,
    method: 'POST'
  })
}

export function confirmMallOrderReceive(orderId: string | number) {
  return request({
    url: `/mobile/mall/order/${orderId}/receive`,
    method: 'POST'
  })
}
