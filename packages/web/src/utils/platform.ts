/**
 * 平台检测工具
 * 用于在不同的运行环境中检测当前平台
 */

// 平台类型
export enum Platform {
  Web = 'web',
  Mobile = 'mobile',
  Desktop = 'desktop',
  MiniApp = 'miniapp',
  Unknown = 'unknown'
}

// 终端类型
export enum EndpointType {
  Admin = 'admin',
  Client = 'client',
  Partner = 'partner',
  Staff = 'staff',
  Api = 'api',
  Unknown = 'unknown'
}

/**
 * 检测当前平台
 * @returns 当前运行的平台类型
 */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined') {
    return Platform.Unknown;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  // 检测是否为小程序环境
  if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
    return Platform.MiniApp;
  }

  // 检测是否为Electron桌面应用
  if (userAgent.indexOf('electron') > -1) {
    return Platform.Desktop;
  }

  // 检测是否为移动设备
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return Platform.Mobile;
  }

  // 默认为Web平台
  return Platform.Web;
}

/**
 * 检测当前终端类型
 * @returns 当前终端类型
 */
export function detectEndpointType(): EndpointType {
  if (typeof window === 'undefined') {
    return EndpointType.Unknown;
  }

  const hostname = window.location.hostname;

  if (hostname.startsWith('admin.')) {
    return EndpointType.Admin;
  }

  if (hostname.startsWith('partner.')) {
    return EndpointType.Partner;
  }

  if (hostname.startsWith('staff.')) {
    return EndpointType.Staff;
  }

  if (hostname.startsWith('api.')) {
    return EndpointType.Api;
  }

  // 默认为用户前台
  return EndpointType.Client;
}

/**
 * 获取当前平台和终端信息
 */
export function getPlatformInfo() {
  return {
    platform: detectPlatform(),
    endpoint: detectEndpointType()
  };
} 