import request from '@/utils/request'

/**
 * 获取用户资料
 */
export function getUserProfile() {
  return request({
    url: '/mobile/user/profile',
    method: 'get'
  })
}

/**
 * 更新用户资料
 * @param data 用户资料数据
 */
export function updateUserProfile(data) {
  return request({
    url: '/mobile/user/profile',
    method: 'put',
    data: data
  })
}

/**
 * 上传头像
 * @param file 头像文件
 */
export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('avatarfile', file)
  return request({
    url: '/mobile/user/avatar/upload',
    method: 'post',
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
export function updateAvatar(avatar) {
  return request({
    url: '/mobile/user/avatar',
    method: 'put',
    params: { avatar }
  })
}

/**
 * 更新昵称
 * @param nickName 昵称
 */
export function updateNickName(nickName) {
  return request({
    url: '/mobile/user/nickName',
    method: 'put',
    params: { nickName }
  })
}

/**
 * 更新性别
 * @param sex 性别
 */
export function updateSex(sex) {
  return request({
    url: '/mobile/user/sex',
    method: 'put',
    params: { sex }
  })
}

/**
 * 更新生日
 * @param birthday 生日
 */
export function updateBirthday(birthday) {
  return request({
    url: '/mobile/user/birthday',
    method: 'put',
    params: { birthday }
  })
}

/**
 * 更新简介
 * @param signature 简介
 */
export function updateSignature(signature) {
  return request({
    url: '/mobile/user/signature',
    method: 'put',
    params: { signature }
  })
}

/**
 * 更新地区
 * @param region 地区
 */
export function updateRegion(region) {
  return request({
    url: '/mobile/user/region',
    method: 'put',
    params: { region }
  })
}

/**
 * 更新职业
 * @param occupation 职业
 */
export function updateOccupation(occupation) {
  return request({
    url: '/mobile/user/occupation',
    method: 'put',
    params: { occupation }
  })
}

/**
 * 更新学校
 * @param school 学校
 */
export function updateSchool(school) {
  return request({
    url: '/mobile/user/school',
    method: 'put',
    params: { school }
  })
}
