/**
 * 安全区域工具类
 * 用于获取设备的安全区域信息（刘海屏、底部横条等）
 */

let systemInfo = null;

/**
 * 获取系统信息（缓存）
 */
function getSystemInfo() {
  if (!systemInfo) {
    systemInfo = uni.getSystemInfoSync();
  }
  return systemInfo;
}

/**
 * 获取顶部安全区域高度（状态栏高度）
 * @returns {number} 高度（px）
 */
export function getTopSafeArea() {
  const info = getSystemInfo();
  return info.statusBarHeight || 0;
}

/**
 * 获取底部安全区域高度
 * @returns {number} 高度（px）
 */
export function getBottomSafeArea() {
  const info = getSystemInfo();
  
  // 优先使用 safeAreaInsets
  if (info.safeAreaInsets) {
    return info.safeAreaInsets.bottom || 0;
  }
  
  // 兼容旧版本API
  if (info.safeArea) {
    const screenHeight = info.screenHeight;
    const safeAreaBottom = info.safeArea.bottom;
    return screenHeight - safeAreaBottom;
  }
  
  return 0;
}

/**
 * 获取所有安全区域信息
 * @returns {object} { top, bottom, left, right }
 */
export function getSafeAreaInsets() {
  const info = getSystemInfo();
  
  if (info.safeAreaInsets) {
    return {
      top: info.safeAreaInsets.top || 0,
      bottom: info.safeAreaInsets.bottom || 0,
      left: info.safeAreaInsets.left || 0,
      right: info.safeAreaInsets.right || 0
    };
  }
  
  // 兼容旧版本
  return {
    top: info.statusBarHeight || 0,
    bottom: getBottomSafeArea(),
    left: 0,
    right: 0
  };
}

/**
 * 判断是否有刘海屏
 * @returns {boolean}
 */
export function hasNotch() {
  const info = getSystemInfo();
  const topSafeArea = getTopSafeArea();
  
  // iOS刘海屏状态栏高度通常大于20
  if (info.platform === 'ios' && topSafeArea > 20) {
    return true;
  }
  
  // Android刘海屏
  if (info.platform === 'android' && topSafeArea > 24) {
    return true;
  }
  
  return false;
}

/**
 * 判断是否有底部横条（如iPhone X系列）
 * @returns {boolean}
 */
export function hasBottomBar() {
  return getBottomSafeArea() > 0;
}

/**
 * 获取导航栏高度（状态栏 + 标题栏）
 * @param {number} titleBarHeight 标题栏高度，默认44px
 * @returns {number} 高度（px）
 */
export function getNavBarHeight(titleBarHeight = 44) {
  return getTopSafeArea() + titleBarHeight;
}

/**
 * 将px转换为rpx
 * @param {number} px 像素值
 * @returns {number} rpx值
 */
export function pxToRpx(px) {
  const info = getSystemInfo();
  const screenWidth = info.screenWidth;
  return (px / screenWidth) * 750;
}

/**
 * 将rpx转换为px
 * @param {number} rpx rpx值
 * @returns {number} 像素值
 */
export function rpxToPx(rpx) {
  const info = getSystemInfo();
  const screenWidth = info.screenWidth;
  return (rpx / 750) * screenWidth;
}

/**
 * 获取安全区域样式对象
 * @param {string} position 位置：'top' | 'bottom' | 'both'
 * @param {string} unit 单位：'px' | 'rpx'
 * @returns {object} 样式对象
 */
export function getSafeAreaStyle(position = 'both', unit = 'px') {
  const style = {};
  const insets = getSafeAreaInsets();
  
  if (position === 'top' || position === 'both') {
    const value = unit === 'rpx' ? pxToRpx(insets.top) : insets.top;
    style.paddingTop = `${value}${unit}`;
  }
  
  if (position === 'bottom' || position === 'both') {
    const value = unit === 'rpx' ? pxToRpx(insets.bottom) : insets.bottom;
    style.paddingBottom = `${value}${unit}`;
  }
  
  return style;
}

export default {
  getTopSafeArea,
  getBottomSafeArea,
  getSafeAreaInsets,
  hasNotch,
  hasBottomBar,
  getNavBarHeight,
  pxToRpx,
  rpxToPx,
  getSafeAreaStyle
};
