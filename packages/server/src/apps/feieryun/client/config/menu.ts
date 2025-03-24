import { generateMenuConfig } from '@/apps/feieryun/shared/config/base-menu';

/**
 * 飞儿云用户前台菜单配置
 */
export const clientMenuConfig = generateMenuConfig('client', (items) => {
  // 这里可以添加客户端特有的菜单项或修改现有项
  
  return items;
}); 