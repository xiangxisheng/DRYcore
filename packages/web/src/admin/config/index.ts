import { message } from 'antd';

// 配置加载接口
export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  order: number;
  permissions?: string[];
  component?: string;
  children?: MenuItem[];
}

export interface Permission {
  key: string;
  label: string;
}

export interface PermissionGroup {
  key: string;
  label: string;
  permissions: Permission[];
  children?: PermissionGroup[];
}

// 存储当前登录用户的权限信息
export interface UserPermissions {
  roles: string[];
  permissions: string[];
}

// 全局配置状态
let menuConfig: MenuItem[] = [];
let permissionConfig: PermissionGroup[] = [];
let userPermissions: UserPermissions = { roles: [], permissions: [] };

// 配置是否已加载
let configLoaded = false;

/**
 * 获取管理后台菜单配置
 * @returns 菜单配置
 */
export async function fetchMenuConfig(): Promise<MenuItem[]> {
  try {
    const token = localStorage.getItem('token') || '';
    
    const response = await fetch('/api/config/admin/menu', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      menuConfig = result.data;
      return menuConfig;
    }
    
    throw new Error(result.message || '获取菜单配置失败');
  } catch (error) {
    console.error('获取菜单配置失败:', error);
    message.error('加载菜单配置失败，请刷新页面重试');
    return [];
  }
}

/**
 * 获取权限配置
 * @returns 权限配置
 */
export async function fetchPermissionConfig(): Promise<PermissionGroup[]> {
  try {
    const token = localStorage.getItem('token') || '';
    
    const response = await fetch('/api/config/permissions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      permissionConfig = result.data;
      return permissionConfig;
    }
    
    throw new Error(result.message || '获取权限配置失败');
  } catch (error) {
    console.error('获取权限配置失败:', error);
    message.error('加载权限配置失败');
    return [];
  }
}

/**
 * 获取当前用户权限
 * @returns 用户权限信息
 */
export async function fetchUserPermissions(): Promise<UserPermissions> {
  try {
    const token = localStorage.getItem('token') || '';
    
    const response = await fetch('/api/config/user/permissions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      userPermissions = result.data;
      return userPermissions;
    }
    
    throw new Error(result.message || '获取用户权限失败');
  } catch (error) {
    console.error('获取用户权限失败:', error);
    message.error('加载用户权限失败');
    return { roles: [], permissions: [] };
  }
}

/**
 * 加载所有配置
 * @returns 是否加载成功
 */
export async function loadAllConfigs(): Promise<boolean> {
  try {
    await Promise.all([
      fetchMenuConfig(),
      fetchPermissionConfig(),
      fetchUserPermissions()
    ]);
    
    configLoaded = true;
    return true;
  } catch (error) {
    console.error('加载配置失败:', error);
    return false;
  }
}

/**
 * 获取当前菜单配置
 * @returns 菜单配置
 */
export function getMenuConfig(): MenuItem[] {
  return menuConfig;
}

/**
 * 获取当前权限配置 
 * @returns 权限配置
 */
export function getPermissionConfig(): PermissionGroup[] {
  return permissionConfig;
}

/**
 * 获取当前用户权限
 * @returns 用户权限信息
 */
export function getUserPermissions(): UserPermissions {
  return userPermissions;
}

/**
 * 检查用户是否有指定权限
 * @param permissionKey 权限键
 * @returns 是否有权限
 */
export function hasPermission(permissionKey: string): boolean {
  // 首先检查是否有*权限（超级管理员）
  if (userPermissions.permissions.includes('*')) {
    return true;
  }
  
  return userPermissions.permissions.includes(permissionKey);
}

/**
 * 配置是否已加载完成 
 * @returns 是否已加载
 */
export function isConfigLoaded(): boolean {
  return configLoaded;
} 