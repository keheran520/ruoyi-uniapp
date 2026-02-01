import { GetterTree } from "vuex"

const getters:GetterTree<any,any> = {
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions,
  info: state => state.user.info,
  websiteConfig: state => state.website.websiteConfig
}
export default getters
