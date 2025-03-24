import { generateMenuConfig } from '@/apps/feieryun/shared/config/base-menu';

/**
 * 飞儿云管理后台菜单配置
 */
export const adminMenuConfig = generateMenuConfig('admin', (items) => {
  // 这里可以添加管理员特有的菜单项或修改现有项
  
  return items;
}); 