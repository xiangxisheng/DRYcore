/**
 * 模块配置接口
 */
export interface ModuleConfig {
  /** 模块键 */
  key?: string;
  
  /** 管理后台键 */
  adminKey?: string;
  
  /** API键 */
  apiKey?: string;
  
  /** 模块标签 */
  label: string;
  
  /** 子模块 */
  children?: Record<string, ModuleConfig>;
}

/**
 * 带管理后台特有键的模块配置
 */
export interface AdminModuleConfig extends ModuleConfig {
  adminKey?: string;
  apiKey?: string;
} 