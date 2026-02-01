import storage from '@/utils/storage'
import constant from '@/utils/constant'
import { WebsiteConfig, WebsiteState } from '@/types/store'
import { Module } from 'vuex'

const website: Module<WebsiteState, WebsiteState> = {
  state: {
    websiteConfig: storage.get(constant.websiteConfig) || {
      name: '',
      logo: '',
      copyright: '',
      icp: ''
    }
  },
  mutations: {
    SET_WEBSITE_CONFIG: (state, websiteConfig: WebsiteConfig) => {
      state.websiteConfig = websiteConfig
      storage.set(constant.websiteConfig, websiteConfig)
    }
  },

  actions: {
    // 设置网站配置
    SetWebsiteConfig({ commit }, websiteConfig: WebsiteConfig) {
      return new Promise((resolve) => {
        commit('SET_WEBSITE_CONFIG', websiteConfig)
        resolve(websiteConfig)
      })
    },

    // 清空网站配置
    ClearWebsiteConfig({ commit }) {
      return new Promise((resolve) => {
        const emptyConfig: WebsiteConfig = {
          name: '',
          logo: '',
          copyright: '',
          icp: ''
        }
        commit('SET_WEBSITE_CONFIG', emptyConfig)
        resolve(emptyConfig)
      })
    }
  }
}

export default website
