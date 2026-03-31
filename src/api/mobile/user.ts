import request from '@/utils/request'

export function getUserProfile() {
  return request({
    url: '/mobile/user/profile',
    method: 'GET'
  })
}

export function getUserInfo(userId: string | number) {
  return request({
    url: `/mobile/user/info/${userId}`,
    method: 'GET'
  })
}

export function updateUserProfile(data: any) {
  return request({
    url: '/mobile/user/profile',
    method: 'PUT',
    data
  })
}

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

export function updateAvatar(avatar: any) {
  return request({
    url: '/mobile/user/avatar',
    method: 'PUT',
    params: { avatar }
  })
}

export function updateNickName(nickName: any) {
  return request({
    url: '/mobile/user/nickName',
    method: 'PUT',
    params: { nickName }
  })
}

export function updateSex(sex: any) {
  return request({
    url: '/mobile/user/sex',
    method: 'PUT',
    params: { sex }
  })
}

export function updateBirthday(birthday: any) {
  return request({
    url: '/mobile/user/birthday',
    method: 'PUT',
    params: { birthday }
  })
}

export function updateSignature(signature: any) {
  return request({
    url: '/mobile/user/signature',
    method: 'PUT',
    params: { signature }
  })
}

export function updateRegion(region: any) {
  return request({
    url: '/mobile/user/region',
    method: 'PUT',
    params: { region }
  })
}

export function updateOccupation(occupation: any) {
  return request({
    url: '/mobile/user/occupation',
    method: 'PUT',
    params: { occupation }
  })
}

export function updateSchool(school: any) {
  return request({
    url: '/mobile/user/school',
    method: 'PUT',
    params: { school }
  })
}
