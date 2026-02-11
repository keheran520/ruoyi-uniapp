import request from '@/utils/request'

/**
 * 获取当前登录用户资料
 */
export function getUserProfile() {
  return request({
    url: '/mobile/user/profile',
    method: 'GET'
  })
}

/**
 * 获取指定用户信息（用于查看他人主页）
 * @param userId 用户ID
 */
export function getUserInfo(userId: string | number) {
  return request({
    url: `/mobile/user/info/${userId}`,
    method: 'GET'
  })
}

/**
 * 更新用户资料
 * @param data 用户资料数据
 */
export function updateUserProfile(data: any) {
  return request({
    url: '/mobile/user/profile',
    method: 'PUT',
    data: data
  })
}

/**
 * 上传头像
 * @param file 头像文件
 */
export function uploadAvatar(file: any) {
  const formData = new FormData()
  formData.append('avatarfile', file)
  return request({
    url: '/mobile/user/avatar/upload',
    method: 'POST',
    data: formData,
    header: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 更新头像
 * @param avatar 头像ossId
 */
export function updateAvatar(avatar: any) {
  return request({
    url: '/mobile/user/avatar',
    method: 'PUT',
    params: { avatar }
  })
}

/**
 * 更新昵称
 * @param nickName 昵称
 */
export function updateNickName(nickName: any) {
  return request({
    url: '/mobile/user/nickName',
    method: 'PUT',
    params: { nickName }
  })
}

/**
 * 更新性别
 * @param sex 性别
 */
export function updateSex(sex: any) {
  return request({
    url: '/mobile/user/sex',
    method: 'PUT',
    params: { sex }
  })
}

/**
 * 更新生日
 * @param birthday 生日
 */
export function updateBirthday(birthday: any) {
  return request({
    url: '/mobile/user/birthday',
    method: 'PUT',
    params: { birthday }
  })
}

/**
 * 更新简介
 * @param signature 简介
 */
export function updateSignature(signature: any) {
  return request({
    url: '/mobile/user/signature',
    method: 'PUT',
    params: { signature }
  })
}

/**
 * 更新地区
 * @param region 地区
 */
export function updateRegion(region: any) {
  return request({
    url: '/mobile/user/region',
    method: 'PUT',
    params: { region }
  })
}

/**
 * 更新职业
 * @param occupation 职业
 */
export function updateOccupation(occupation: any) {
  return request({
    url: '/mobile/user/occupation',
    method: 'PUT',
    params: { occupation }
  })
}

/**
 * 更新学校
 * @param school 学校
 */
export function updateSchool(school: any) {
  return request({
    url: '/mobile/user/school',
    method: 'PUT',
    params: { school }
  })
}
