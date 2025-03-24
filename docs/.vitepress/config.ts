import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'DRYcore',
  description: '基于"Don\'t Repeat Yourself"原则的全栈开发框架',
  
  // 启用全文搜索功能
  themeConfig: {
    search: {
      provider: 'local'
    },
    
    // 导航菜单
    nav: [
      { text: '首页', link: '/' },
      { text: '设计概述', link: '/design/overview' },
      { text: '详细文档', link: '/detailed/' },
      { text: '应用文档', link: '/apps/' },
      { text: 'API文档', link: '/api/' },
      { text: '贡献指南', link: '/CONTRIBUTING' },
    ],
    
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/xiangxisheng/DrizzleAPI' }
    ],
    
    // 侧边栏配置
    sidebar: {
      '/design/': [
        {
          text: '设计文档',
          items: [
            { text: '框架设计概述', link: '/design/overview' },
          ],
        },
      ],
      '/detailed/': [
        {
          text: '核心技术',
          items: [
            { text: 'API驱动开发详解', link: '/detailed/api_driven' },
          ],
        },
        {
          text: '快速开始',
          items: [
            { text: '项目初始化', link: '/detailed/setup/init' },
            { text: '数据模型定义', link: '/detailed/setup/schema' },
            { text: 'API 配置', link: '/detailed/setup/api' },
            { text: '代码生成', link: '/detailed/setup/generate' },
          ],
        },
        {
          text: '数据模型',
          collapsed: true,
          items: [
            { text: 'Schema 语法', link: '/detailed/data/schema-syntax' },
            { text: '字段类型', link: '/detailed/data/field-types' },
            { text: '关系定义', link: '/detailed/data/relations' },
            { text: '索引和约束', link: '/detailed/data/constraints' },
          ],
        },
        {
          text: 'API 配置',
          collapsed: true,
          items: [
            { text: '路由配置', link: '/detailed/api/routes' },
            { text: '字段映射', link: '/detailed/api/fields' },
            { text: '验证规则', link: '/detailed/api/validation' },
            { text: '权限控制', link: '/detailed/api/auth' },
          ],
        },
        {
          text: '代码生成',
          collapsed: true,
          items: [
            { text: 'ORM 代码', link: '/detailed/generators/orm' },
            { text: 'API 路由', link: '/detailed/generators/routes' },
            { text: '类型定义', link: '/detailed/generators/types' },
            { text: '自定义生成', link: '/detailed/generators/custom' },
          ],
        },
      ],
      '/apps/': [
        {
          text: '应用文档',
          items: [
            { text: '应用文档索引', link: '/apps/' },
            { text: '飞儿云应用', link: '/apps/feieryun' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API文档',
          items: [
            { text: 'API概述', link: '/api/' },
            {
              text: '系统接口',
              collapsed: true,
              items: [
                { text: '配置接口', link: '/api/system/config' },
                { text: '用户接口', link: '/api/system/user' },
                { text: '权限接口', link: '/api/system/permission' },
              ]
            },
            {
              text: '飞儿云接口',
              collapsed: true,
              items: [
                { text: '云服务器', link: '/api/feieryun/server' },
                { text: '域名管理', link: '/api/feieryun/domain' },
                { text: '对象存储', link: '/api/feieryun/storage' },
                { text: '数据库', link: '/api/feieryun/database' },
              ]
            }
          ],
        },
      ],
    },
    
    // 页脚设置
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024-present DRYcore',
    },
    
    // 文档更新时间
    lastUpdated: true,
    
    // 编辑链接
    editLink: {
      pattern: 'https://github.com/xiangxisheng/DrizzleAPI/edit/main/docs/:path',
      text: '在GitHub上编辑此页'
    },
    
    // 文档大纲设置
    outline: {
      level: [2, 3],
      label: '页面导航'
    }
  },
  
  // Markdown配置
  markdown: {
    lineNumbers: true,
    // 启用代码高亮主题
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },
  
  // 站点头部元信息
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ]
}); 