import { createStore } from 'vuex'
import user from '@/store/modules/user'
import website from '@/store/modules/website'
import getters from './getters'

const store = createStore<any>({
  modules: {
    user,
    website
  },
  getters
})

export default store
