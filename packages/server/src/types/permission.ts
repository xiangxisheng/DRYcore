/**
 * 权限接口
 */
export interface Permission {
  key: string;
  label: string;
}

/**
 * 权限组接口
 */
export interface PermissionGroup {
  key: string;
  label: string;
  permissions: Permission[];
}

/**
 * 权限项接口
 */
export interface PermissionItem {
  /** 权限键 */
  key: string;
  
  /** 权限标签 */
  label: string;
}

/**
 * 权限配置接口
 */
export interface PermissionConfig {
  /** 模块键 */
  key: string;
  
  /** 模块标签 */
  label: string;
  
  /** 权限列表 */
  permissions?: PermissionItem[];
  
  /** 子模块 */
  children?: PermissionConfig[];
}

/**
 * 用户权限接口
 */
export interface UserPermissions {
  roles: string[];
  permissions: string[];
} 