import request from '@/utils/request'

/**
 * 获取公开图片列表
 */
export function getPublicImages(query: any) {
  return request({
    url: '/open/picturebed/image/list',
    method: 'GET',
    params: query,
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 获取热门图片
 */
export function getHotImages(query: any) {
  return request({
    url: '/open/picturebed/image/hot',
    method: 'GET',
    params: query,
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 获取最新图片
 */
export function getLatestImages(query: any) {
  return request({
    url: '/open/picturebed/image/latest',
    method: 'GET',
    params: query,
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 获取推荐图片
 */
export function getRecommendImages(query: any) {
  return request({
    url: '/open/picturebed/image/recommend',
    method: 'GET',
    params: query,
    headers: {
      isToken: true,
      isEncrypt: false
    }
  })
}

/**
 * 搜索图片
 */
export function searchImages(keyword: string, query: any) {
  return request({
    url: '/open/picturebed/image/search',
    method: 'GET',
    params: {
      keyword,
      ...query
    },
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 获取图片详情
 */
export function getPublicImageDetail(imageId: string | number) {
  return request({
    url: `/open/picturebed/image/${imageId}`,
    method: 'GET',
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 点赞
 */
export function likeImage(imageId: string | number) {
  return request({
    url: `/open/picturebed/image/like/${imageId}`,
    method: 'POST',
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 取消点赞
 */
export function unlikeImage(imageId: string | number) {
  return request({
    url: `/open/picturebed/image/unlike/${imageId}`,
    method: 'POST',
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 增加浏览量
 */
export function increaseViewCount(imageId: string | number) {
  return request({
    url: `/open/picturebed/image/view/${imageId}`,
    method: 'POST',
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 获取分类列表
 */
export function getPublicCategories() {
  return request({
    url: '/open/picturebed/category/list',
    method: 'GET',
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 获取标签列表
 */
export function getPublicTags(categoryId?: number) {
  const url = categoryId 
    ? `/open/picturebed/tag/listByCategory/${categoryId}`
    : '/open/picturebed/tag/list'
  
  return request({
    url,
    method: 'GET',
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 获取图床统计信息
 */
export function getStatistics() {
  return request({
    url: '/open/picturebed/image/statistics',
    method: 'GET',
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 获取搜索建议
 */
export function getSearchSuggestions(keyword: string, limit: number = 10) {
  return request({
    url: '/open/picturebed/image/suggestions',
    method: 'GET',
    params: {
      keyword,
      limit
    },
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 获取热门标签
 */
export function getHotTags(limit: number = 10) {
  return request({
    url: '/open/picturebed/image/hotTags',
    method: 'GET',
    params: {
      limit
    },
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 获取猜你想搜（推荐搜索）
 */
export function getGuessTags(limit: number = 6, searchHistory?: string[]) {
  return request({
    url: '/open/picturebed/image/guessTags',
    method: 'POST',
    data: {
      limit,
      searchHistory: searchHistory || []
    },
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 获取用户图片列表
 */
export function getUserImages(query: any) {
  return request({
    url: '/open/picturebed/image/user',
    method: 'GET',
    params: query,
    headers: {
      isToken: false,
      isEncrypt: false
    }
  })
}

/**
 * 获取关注用户发布的图片
 */
export function getFollowingImages(query: any) {
  return request({
    url: '/open/picturebed/image/following',
    method: 'GET',
    params: query
  })
}
