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
 * 权限配置接口
 */
export interface PermissionConfig {
  key: string;
  label: string;
  children?: PermissionConfig[];
  permissions?: Permission[];
}

/**
 * 用户权限接口
 */
export interface UserPermissions {
  roles: string[];
  permissions: string[];
} 