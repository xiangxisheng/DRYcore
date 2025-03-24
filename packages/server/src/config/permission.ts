import { PermissionConfig } from '../types/permission';

/**
 * 系统权限配置
 * 用于定义系统权限结构和权限控制
 */
export const permissionConfig: PermissionConfig[] = [
  {
    key: 'system',
    label: '系统管理',
    children: [
      {
        key: 'user',
        label: '用户管理',
        permissions: [
          { key: 'user:view', label: '查看用户' },
          { key: 'user:create', label: '创建用户' },
          { key: 'user:update', label: '更新用户' },
          { key: 'user:delete', label: '删除用户' }
        ]
      },
      {
        key: 'role',
        label: '角色管理',
        permissions: [
          { key: 'role:view', label: '查看角色' },
          { key: 'role:create', label: '创建角色' },
          { key: 'role:update', label: '更新角色' },
          { key: 'role:delete', label: '删除角色' }
        ]
      },
      {
        key: 'permission',
        label: '权限管理',
        permissions: [
          { key: 'permission:view', label: '查看权限' },
          { key: 'permission:create', label: '创建权限' },
          { key: 'permission:update', label: '更新权限' },
          { key: 'permission:delete', label: '删除权限' }
        ]
      },
      {
        key: 'config',
        label: '系统配置',
        permissions: [
          { key: 'config:view', label: '查看配置' },
          { key: 'config:update', label: '更新配置' }
        ]
      }
    ]
  },
  {
    key: 'server',
    label: '云服务器',
    permissions: [
      { key: 'server:view', label: '查看服务器' },
      { key: 'server:create', label: '创建服务器' },
      { key: 'server:update', label: '更新服务器' },
      { key: 'server:delete', label: '删除服务器' },
      { key: 'server:reboot', label: '重启服务器' },
      { key: 'server:shutdown', label: '关闭服务器' },
      { key: 'server:start', label: '启动服务器' }
    ]
  },
  {
    key: 'domain',
    label: '域名管理',
    permissions: [
      { key: 'domain:view', label: '查看域名' },
      { key: 'domain:create', label: '创建域名' },
      { key: 'domain:update', label: '更新域名' },
      { key: 'domain:delete', label: '删除域名' },
      { key: 'domain:dns', label: '管理DNS' },
      { key: 'domain:ssl', label: '管理SSL证书' }
    ]
  },
  {
    key: 'storage',
    label: '云空间',
    permissions: [
      { key: 'storage:view', label: '查看存储' },
      { key: 'storage:create', label: '创建存储' },
      { key: 'storage:update', label: '更新存储' },
      { key: 'storage:delete', label: '删除存储' },
      { key: 'storage:upload', label: '上传文件' },
      { key: 'storage:download', label: '下载文件' }
    ]
  },
  {
    key: 'database',
    label: '云数据库',
    permissions: [
      { key: 'database:view', label: '查看数据库' },
      { key: 'database:create', label: '创建数据库' },
      { key: 'database:update', label: '更新数据库' },
      { key: 'database:delete', label: '删除数据库' },
      { key: 'database:backup', label: '备份数据库' },
      { key: 'database:restore', label: '恢复数据库' }
    ]
  },
  {
    key: 'website',
    label: '云Web站点',
    permissions: [
      { key: 'website:view', label: '查看站点' },
      { key: 'website:create', label: '创建站点' },
      { key: 'website:update', label: '更新站点' },
      { key: 'website:delete', label: '删除站点' },
      { key: 'website:deploy', label: '部署站点' }
    ]
  }
]; 