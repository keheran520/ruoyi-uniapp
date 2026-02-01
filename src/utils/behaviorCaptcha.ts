/**
 * 行为验证码工具类
 * 适配 uni-app，支持 H5 使用 TAC 验证码，非H5使用 tac-captcha 组件
 */
import config from '@/config'

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
 * 显示TAC行为验证码
 * H5平台：直接加载TAC SDK
 * 非H5平台：使用 tac-captcha 组件（通过事件通信）
 * @param options 配置选项
 * @returns Promise<string> 验证成功返回 captchaId
 */
export function showBehaviorCaptchaModal(options: {
  tenantId?: string;
  type?: string;        // 验证码业务类型：sms, email, phoneverify 等
  contact?: string;     // 联系方式（手机号或邮箱）
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
  // 非H5平台使用 tac-captcha 组件（通过事件通信）
  return new Promise((resolve, reject) => {
    console.log('📱 非H5平台：触发显示验证码事件', {
      tenantId: options.tenantId,
      type: options.type,
      contact: options.contact
    });
    
    // 使用 uni.$emit 触发显示验证码组件
    uni.$emit('showBehaviorCaptcha', {
      tenantId: options.tenantId || '000000',
      type: options.type || 'sms',           // 传递业务类型
      contact: options.contact || '',         // 传递联系方式
      onSuccess: (captchaId: string) => {
        console.log('✅ 验证成功，captchaId:', captchaId);
        options.onSuccess?.(captchaId);
        resolve(captchaId);
      },
      onFail: () => {
        console.log('❌ 验证失败');
        options.onFail?.();
        reject(new Error('验证失败'));
      },
      onClose: () => {
        console.log('🚪 用户关闭验证码');
        options.onClose?.();
        reject(new Error('用户关闭验证码'));
      }
    });
  });
  // #endif
}
