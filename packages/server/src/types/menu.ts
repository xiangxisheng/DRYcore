/**
 * 菜单配置接口
 */
export interface MenuConfig {
  key: string;
  label: string;
  icon?: string;
  path: string;
  component?: string;
  permissions?: string[];
  order: number;
  children?: MenuConfig[];
  hideInMenu?: boolean;
}

/**
 * 菜单项接口，扩展了MenuConfig，增加了运行时所需的属性
 */
export interface MenuItem extends MenuConfig {
  children?: MenuItem[];
  parent?: MenuItem;
  level: number;
}

/**
 * 菜单状态接口
 */
export interface MenuState {
  menus: MenuItem[];
  currentMenu?: MenuItem;
  openKeys: string[];
  selectedKeys: string[];
} 