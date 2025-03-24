# 飞儿云应用文档

飞儿云应用的详细文档请参阅：[packages/server/src/apps/feieryun/docs/design.md](../../packages/server/src/apps/feieryun/docs/design.md)

## 应用概述

飞儿云是DRYcore框架的示例应用，主要实现云资源管理相关功能。包括：云服务器管理、域名管理、对象存储、数据库服务等功能。

应用支持多种终端：
- 管理后台 (admin)：用于系统管理员管理所有资源
- 用户前台 (client)：用于普通用户管理自己的资源
- 合作伙伴端 (partner)：用于代理商和分销商管理资源
- 员工端 (staff)：用于内部员工处理工单和客户问题
- API端 (api)：提供给第三方系统调用的接口

## 快速链接

- [应用设计文档](../../packages/server/src/apps/feieryun/docs/design.md)
- [应用源码目录](../../packages/server/src/apps/feieryun/) 