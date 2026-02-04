import config from '@/config'
import storage from '@/utils/storage'
import constant from '@/utils/constant'
import { login, logout, getInfo } from '@/api/login'
import { getUserProfile } from '@/api/mobile/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { UserState, UserForm } from '@/types/store'
import { Module } from 'vuex'

const baseUrl = config.baseUrl

const user: Module<UserState, UserState> = {
  state: {
    info: storage.get(constant.info),
    token: getToken(),
    name: storage.get(constant.name),
    avatar: storage.get(constant.avatar),
    roles: storage.get(constant.roles),
    permissions: storage.get(constant.permissions),
    // 新增：用户资料信息
    userProfile: storage.get(constant.userProfile) || {}
  },
  mutations: {
    SET_INFO: (state, info) => {
      state.info = info
      storage.set(constant.info, info)
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
      storage.set(constant.name, name)
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
      storage.set(constant.avatar, avatar)
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
      storage.set(constant.roles, roles)
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
      storage.set(constant.permissions, permissions)
    },
    // 新增：设置用户资料
    SET_USER_PROFILE: (state, userProfile) => {
      state.userProfile = userProfile
      storage.set(constant.userProfile, userProfile)
    },
    // 新增：更新用户资料的某个字段
    UPDATE_USER_PROFILE_FIELD: (state, { field, value }) => {
      if (state.userProfile) {
        state.userProfile[field] = value
        storage.set(constant.userProfile, state.userProfile)
      }
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      return new Promise((resolve, reject) => { 
        login(userInfo).then((res) => {
          const data = res.data;
          setToken(data.access_token)
          commit('SET_TOKEN', data.access_token)
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息（权限、角色等）
    GetInfo({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo().then((res) => {
          const data = res.data;
          const user = data.user
          const avatar = (user == null || user.avatar == "" || user.avatar == null) ? "/static/images/profile.jpg" : user.avatar
          const username = (user == null || user.userName == "" || user.userName == null) ? "" : user.userName
          if (data.roles && data.roles.length > 0) {
            commit('SET_ROLES', data.roles)
            commit('SET_PERMISSIONS', data.permissions)
          } else {
            commit('SET_ROLES', ['ROLE_DEFAULT'])
          }
          commit('SET_INFO', user)
          commit('SET_NAME', username)
          commit('SET_AVATAR', avatar)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 新增：获取用户资料（包含会员信息）
    GetUserProfile({ commit }) {
      return new Promise((resolve, reject) => {
        getUserProfile().then((res) => {
          console.log('GetUserProfile 原始响应:', res)
          const data = res.data
          
          if (data) {
            // 后端返回的是嵌套结构：{ user, roleGroup, postGroup, member }
            // 需要合并 user 和 member 的数据
            const profile = {
              // 用户基本信息
              userId: data.user?.userId,
              userName: data.user?.userName,
              nickName: data.user?.nickName,
              avatar: data.user?.avatar,
              sex: data.user?.sex,
              phonenumber: data.user?.phonenumber,
              email: data.user?.email,
              
              // 会员信息
              memberId: data.member?.memberId,
              memberNo: data.member?.memberNo,
              birthday: data.member?.birthday,
              signature: data.member?.signature,
              region: data.member?.region,
              occupation: data.member?.occupation,
              school: data.member?.school,
              levelId: data.member?.levelId,
              balance: data.member?.balance,
              points: data.member?.points,
              growthValue: data.member?.growthValue,
              totalConsumeAmount: data.member?.totalConsumeAmount,
              registerTime: data.member?.registerTime,
              
              // 角色和岗位
              roleGroup: data.roleGroup,
              postGroup: data.postGroup
            }
            
            console.log('合并后的用户资料:', profile)
            
            // 保存完整的用户资料
            commit('SET_USER_PROFILE', profile)
            
            // 同时更新基本信息
            if (profile.nickName) {
              commit('SET_NAME', profile.nickName)
            }
            if (profile.avatar) {
              commit('SET_AVATAR', profile.avatar)
            }
          }
          resolve(res)
        }).catch(error => {
          console.error('GetUserProfile 失败:', error)
          reject(error)
        })
      })
    },

    // 新增：更新用户资料字段
    UpdateUserProfileField({ commit }, { field, value }) {
      commit('UPDATE_USER_PROFILE_FIELD', { field, value })
      
      // 如果更新的是昵称或头像，同时更新对应的state
      if (field === 'nickName') {
        commit('SET_NAME', value)
      } else if (field === 'avatar') {
        commit('SET_AVATAR', value)
      }
    },

    // 退出系统
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout().then((res) => {
          commit('SET_INFO', '')
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_PERMISSIONS', [])
          commit('SET_USER_PROFILE', {})
          removeToken()
          storage.clean()
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default user
