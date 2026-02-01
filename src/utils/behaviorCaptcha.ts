/**
 * 行为验证码工具类
 * 适配 uni-app，支持 H5 使用 TAC 验证码
 */
import request from './request';

// #ifdef H5
declare global {
  interface Window {
    initTAC: (baseUrl: string, config: TACConfig, style?: TACStyle) => Promise<TACInstance>;
  }
}

/**
 * TAC配置接口
 */
export interface TACConfig {
  /** 生成验证码接口 */
  requestCaptchaDataUrl: string;
  /** 验证接口 */
  validCaptchaUrl: string;
  /** 验证码绑定的div块 */
  bindEl: string;
  /** 验证成功回调 */
  validSuccess: (res: any, c: any, tac: TACInstance) => void;
  /** 验证失败回调 */
  validFail?: (res: any, c: any, tac: TACInstance) => void;
  /** 刷新按钮回调 */
  btnRefreshFun?: (el: HTMLElement, tac: TACInstance) => void;
  /** 关闭按钮回调 */
  btnCloseFun?: (el: HTMLElement, tac: TACInstance) => void;
}

/**
 * TAC样式配置
 */
export interface TACStyle {
  /** Logo URL */
  logoUrl?: string | null;
  /** 按钮样式URL */
  btnUrl?: string;
  /** 背景样式URL */
  bgUrl?: string;
  /** 滑动边框颜色 */
  moveTrackMaskBgColor?: string;
  /** 滑动边框边框颜色 */
  moveTrackMaskBorderColor?: string;
}

/**
 * TAC实例接口
 */
export interface TACInstance {
  /** 初始化并显示验证码 */
  init: () => void;
  /** 重新加载验证码 */
  reloadCaptcha: () => void;
  /** 销毁验证码窗口 */
  destroyWindow: () => void;
}

/**
 * 加载TAC SDK脚本
 */
function loadTACScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查是否已加载
    if (window.initTAC) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = '/static/load.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('加载TAC初始化脚本失败'));
    document.head.appendChild(script);
  });
}

/**
 * 清理验证码容器
 */
export function cleanupBehaviorCaptcha() {
  const captchaBox = document.getElementById('tac-captcha-box');
  if (captchaBox) {
    captchaBox.remove();
  }
}
// #endif

/**
 * 生成行为验证码
 * @param tenantId 租户ID
 */
export function genBehaviorCaptcha(tenantId?: string) {
  return request({
    url: '/captcha/gen',
    headers: {
      isToken: false,
      'X-Tenant-Id': tenantId || '000000'
    },
    method: 'POST',
    data: {
      type: 'SLIDER' // 滑动验证码类型
    }
  });
}

/**
 * 校验行为验证码
 * @param params 验证参数
 */
export function checkBehaviorCaptcha(params: { id: string; data: string }) {
  return request({
    url: '/captcha/check',
    headers: {
      isToken: false
    },
    method: 'POST',
    data: params
  });
}

/**
 * 显示TAC行为验证码
 * H5平台：直接加载TAC SDK
 * 非H5平台：使用webview打开验证码页面
 * @param options 配置选项
 * @returns Promise<string> 验证成功返回 captchaId
 */
export function showBehaviorCaptchaModal(options: {
  tenantId?: string;
  onSuccess?: (captchaId: string) => void;
  onFail?: () => void;
  onClose?: () => void;
}): Promise<string> {
  // #ifdef H5
  return new Promise(async (resolve, reject) => {
    try {
      // 加载TAC SDK
      await loadTACScript();

      // 创建验证码容器
      let captchaBox = document.getElementById('tac-captcha-box');
      if (!captchaBox) {
        captchaBox = document.createElement('div');
        captchaBox.id = 'tac-captcha-box';
        document.body.appendChild(captchaBox);
      }
      
      // 设置父容器的遮罩样式
      captchaBox.style.position = 'fixed';
      captchaBox.style.top = '0';
      captchaBox.style.left = '0';
      captchaBox.style.right = '0';
      captchaBox.style.bottom = '0';
      captchaBox.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      captchaBox.style.zIndex = '9998';
      captchaBox.style.display = 'flex';
      captchaBox.style.alignItems = 'center';
      captchaBox.style.justifyContent = 'center';

      // TAC配置
      const config: TACConfig = {
        // 生成接口（使用代理前缀）
        requestCaptchaDataUrl: '/dev-api/captcha/gen',
        // 验证接口（使用代理前缀）
        validCaptchaUrl: '/dev-api/captcha/check',
        // 验证码绑定的div块
        bindEl: '#tac-captcha-box',
        // 验证成功回调
        validSuccess: (res, c, tac) => {
          console.log('验证成功，后端返回的数据为', res);
          console.log('验证成功，c 参数为', c);
          // 销毁验证码服务
          tac.destroyWindow();
          // 清理验证码容器
          cleanupBehaviorCaptcha();
          // 调用成功回调，传递验证码ID
          const captchaId = res?.data || c?.id || c?.currentCaptchaData?.id || '';
          console.log('获取到的captchaId:', captchaId);
          
          if (!captchaId) {
            console.error('❌ 验证码ID为空！');
            console.error('res 对象:', res);
            console.error('c 对象:', c);
          }
          
          options.onSuccess?.(captchaId);
          resolve(captchaId);
        },
        // 验证失败回调
        validFail: (res, c, tac) => {
          console.log('验证码验证失败', res);
          // 验证失败后重新拉取验证码
          tac.reloadCaptcha();
          options.onFail?.();
        },
        // 刷新按钮回调
        btnRefreshFun: (el, tac) => {
          console.log('刷新按钮触发');
          tac.reloadCaptcha();
        },
        // 关闭按钮回调
        btnCloseFun: (el, tac) => {
          console.log('关闭按钮触发');
          tac.destroyWindow();
          // 清理验证码容器
          cleanupBehaviorCaptcha();
          options.onClose?.();
          reject(new Error('用户关闭验证码'));
        }
      };

      // 样式配置
      const style: TACStyle = {
        logoUrl: null // 去除logo
      };

      // 初始化TAC
      const tac = await window.initTAC('/static/tac', config, style);
      
      // 显示验证码
      tac.init();
    } catch (error) {
      console.error('初始化TAC失败', error);
      reject(error);
    }
  });
  // #endif
  
  // #ifndef H5
  // 非H5平台使用webview
  return new Promise((resolve, reject) => {
    // 清空上次结果
    const app = getApp();
    if (app.globalData) {
      app.globalData.captchaResult = null;
    }
    
    // 打开webview页面
    uni.navigateTo({
      url: `/pages/common/captcha/index?apiBase=${encodeURIComponent(options.apiBase || '/dev-api')}&tenantId=${options.tenantId || '000000'}`,
      success: () => {
        console.log('打开验证码页面成功');
        
        // 设置定时器检查结果
        const checkInterval = setInterval(() => {
          const result = app.globalData?.captchaResult;
          
          if (result) {
            clearInterval(checkInterval);
            
            if (result.success) {
              console.log('验证成功，captchaId:', result.captchaId);
              options.onSuccess?.(result.captchaId);
              resolve(result.captchaId);
            } else {
              console.log('验证失败或取消');
              options.onFail?.();
              reject(new Error(result.error || '验证失败'));
            }
            
            // 清空结果
            app.globalData.captchaResult = null;
          }
        }, 100);
        
        // 30秒超时
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!app.globalData?.captchaResult) {
            reject(new Error('验证超时'));
          }
        }, 30000);
      },
      fail: (err) => {
        console.error('打开验证码页面失败', err);
        reject(new Error('打开验证码页面失败'));
      }
    });
  });
  // #endif
}
