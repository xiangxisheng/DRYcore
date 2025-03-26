/**
 * 菜单配置项接口
 */
export interface MenuConfig {
  /** 菜单项键 */
  key: string;
  
  /** 菜单项标签 */
  label: string;
  
  /** 菜单项图标 */
  icon: string;
  
  /** 菜单项路径 */
  path: string;
  
  /** 菜单项顺序 */
  order: number;
  
  /** 菜单项权限 */
  permissions?: string[];
  
  /** 组件路径 */
  component?: string;
  
  /** 子菜单项 */
  children?: MenuConfig[];
  
  /** 是否在菜单中隐藏 */
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