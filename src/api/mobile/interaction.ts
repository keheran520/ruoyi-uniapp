import request from '@/utils/request'

/**
 * 获取我的图片列表
 */
export function getMyImages(params: any) {
  return request({
    url: '/mobile/interaction/myImages',
    method: 'GET',
    params
  })
}

/**
 * 获取我的相册列表
 */
export function getMyAlbums(params: any) {
  return request({
    url: '/mobile/interaction/myAlbums',
    method: 'GET',
    params
  })
}

/**
 * 获取点赞过的图片列表
 */
export function getLikedImages(params: any) {
  return request({
    url: '/mobile/interaction/likedImages',
    method: 'GET',
    params
  })
}

/**
 * 获取收藏过的图片列表
 */
export function getFavoritedImages(params: any) {
  return request({
    url: '/mobile/interaction/favoritedImages',
    method: 'GET',
    params
  })
}

/**
 * 点赞图片
 */
export function likeImage(imageId: string | number) {
  return request({
    url: `/mobile/interaction/like/image/${imageId}`,
    method: 'POST'
  })
}

/**
 * 取消点赞图片
 */
export function unlikeImage(imageId: string | number) {
  return request({
    url: `/mobile/interaction/like/image/${imageId}`,
    method: 'DELETE'
  })
}

/**
 * 收藏图片
 */
export function favoriteImage(imageId: string | number, folderId?: number) {
  return request({
    url: `/mobile/interaction/favorite/image/${imageId}`,
    method: 'POST',
    params: folderId ? { folderId } : undefined
  })
}

/**
 * 取消收藏图片
 */
export function unfavoriteImage(imageId: string | number) {
  return request({
    url: `/mobile/interaction/favorite/image/${imageId}`,
    method: 'DELETE'
  })
}

/**
 * 点赞相册
 */
export function likeAlbum(albumId: string | number) {
  return request({
    url: `/mobile/interaction/like/album/${albumId}`,
    method: 'POST'
  })
}

/**
 * 取消点赞相册
 */
export function unlikeAlbum(albumId: string | number) {
  return request({
    url: `/mobile/interaction/like/album/${albumId}`,
    method: 'DELETE'
  })
}

/**
 * 收藏相册
 */
export function favoriteAlbum(albumId: string | number) {
  return request({
    url: `/mobile/interaction/favorite/album/${albumId}`,
    method: 'POST'
  })
}

/**
 * 取消收藏相册
 */
export function unfavoriteAlbum(albumId: string | number) {
  return request({
    url: `/mobile/interaction/favorite/album/${albumId}`,
    method: 'DELETE'
  })
}

/**
 * 获取图片互动状态（点赞、收藏）
 */
export function getImageInteractionStatus(imageId: string | number) {
  return request({
    url: `/mobile/interaction/image/${imageId}/status`,
    method: 'GET'
  })
}

/**
 * 发表评论
 */
export function addComment(imageId: string | number, content: string, parentId?: number | null) {
  return request({
    url: `/mobile/interaction/comment/image/${imageId}`,
    method: 'POST',
    params: { content, parentId }
  })
}

/**
 * 删除评论
 */
export function deleteComment(commentId: number) {
  return request({
    url: `/mobile/interaction/comment/${commentId}`,
    method: 'DELETE'
  })
}

/**
 * 获取图片评论列表（使用新的移动端接口）
 */
export function getImageComments(imageId: string | number, params: any) {
  return request({
    url: `/mobile/comment/image/${imageId}`,
    method: 'GET',
    params,
  })
}

/**
 * 获取图片详情（包含前10条评论）
 */
export function getImageDetailWithComments(imageId: string | number) {
  return request({
    url: `/mobile/comment/image/${imageId}/detail`,
    method: 'GET',
  })
}

/**
 * 获取评论的回复列表
 */
export function getCommentReplies(commentId: number, params: any) {
  return request({
    url: `/mobile/comment/${commentId}/replies`,
    method: 'GET',
    params,
  })
}

/**
 * 点赞评论
 */
export function likeComment(commentId: number) {
  return request({
    url: `/mobile/interaction/like/comment/${commentId}`,
    method: 'POST'
  })
}

/**
 * 取消点赞评论
 */
export function unlikeComment(commentId: number) {
  return request({
    url: `/mobile/interaction/like/comment/${commentId}`,
    method: 'DELETE'
  })
}
