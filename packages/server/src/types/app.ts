import { Hono } from 'hono';

/**
 * 应用模块接口定义
 */
export interface AppModule {
  /** 应用名称 */
  name: string;
  
  /** 应用类型 */
  type: string;
  
  /** 应用描述 */
  description: string;
  
  /** 应用域名 */
  domain: string;
  
  /** 
   * 注册应用到服务器实例
   * @param app Hono服务器实例 
   */
  register: (app: Hono) => void;
} 