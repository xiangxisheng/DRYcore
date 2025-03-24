/**
 * 模块配置类型定义
 */
export interface ModuleConfig {
  key: string;
  label: string;
  children?: Record<string, ModuleConfig>;
}

/**
 * 带管理后台特有键的模块配置
 */
export interface AdminModuleConfig extends ModuleConfig {
  adminKey?: string;
  apiKey?: string;
} 