import { Hono } from 'hono';

/**
 * 应用模块接口
 * 每个应用都需要实现这个接口
 */
export interface AppModule {
  /**
   * 应用名称
   */
  name: string;
  
  /**
   * 应用类型：admin、client、partner、staff、api等
   */
  type: string;
  
  /**
   * 应用描述
   */
  description: string;
  
  /**
   * 应用主域名
   */
  domain: string;
  
  /**
   * 注册应用
   * 当应用被加载时，此方法会被调用
   * @param app Hono应用实例
   */
  register: (app: Hono) => void;
} 