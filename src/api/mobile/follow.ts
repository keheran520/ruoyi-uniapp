import request from '@/utils/request'

export interface FollowUser {
  userId: number
  nickName: string
  avatar: string
  signature?: string
  verified?: boolean
  verifiedBadge?: string
  followerCount: number
  likeCount?: number
  isMutual: boolean
  isFollowing: boolean
  followTime?: string
  remark?: string
  groupId?: number
  groupName?: string
}

export interface FollowStatistics {
  followingCount: number
  followerCount: number
  friendCount: number
}

/**
 * 获取关注列表
 */
export function getFollowingList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  groupId?: string
  userId?: string
}) {
  return request({
    url: '/mobile/follow/following',
    method: 'GET',
    params
  })
}

/**
 * 获取粉丝列表
 */
export function getFollowersList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  userId?: string
}) {
  return request({
    url: '/mobile/follow/followers',
    method: 'GET',
    params
  })
}

/**
 * 关注用户
 */
export function followUser(targetUserId: number | string) {
  return request({
    url: `/mobile/follow/follow/${targetUserId}`,
    method: 'POST'
  })
}

/**
 * 取消关注
 */
export function unfollowUser(targetUserId: number | string) {
  return request({
    url: `/mobile/follow/unfollow/${targetUserId}`,
    method: 'DELETE'
  })
}

/**
 * 检查关注状态
 * @param targetUserId 目标用户ID
 * @param userId 查询用户ID（可选，不传则检查当前登录用户）
 */
export function checkFollowStatus(targetUserId: number | string, userId?: number | string) {
  return request({
    url: `/mobile/follow/check/${targetUserId}`,
    method: 'GET',
    params: userId ? { userId } : {}
  })
}

/**
 * 获取关注统计（当前用户）
 */
export function getFollowStatistics() {
  return request({
    url: '/mobile/follow/statistics',
    method: 'GET'
  })
}

/**
 * 获取指定用户的关注统计
 */
export function getStatistics(userId: number | string) {
  return request({
    url: `/mobile/follow/statistics/${userId}`,
    method: 'GET'
  })
}
