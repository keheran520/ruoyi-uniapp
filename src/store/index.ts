import user from '@/store/modules/user'
import website from '@/store/modules/website'
import getters from './getters'
import { createStore } from "vuex";
const store = createStore({
  modules: {
    user,
    website,
  },
  getters
});
export default store;