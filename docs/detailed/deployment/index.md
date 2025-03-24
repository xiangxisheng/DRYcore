# 部署指南

## 概述

本文档提供了DRYcore项目的详细部署指南，涵盖了从开发环境到生产环境的各种部署选项和最佳实践。DRYcore支持多种部署策略，包括传统服务器、容器化部署和云服务等。

## 目录

- [部署准备](./preparation.md) - 部署前的准备工作和检查清单
- [环境配置](./environment.md) - 不同环境的配置管理
- [传统服务器部署](./traditional.md) - 在传统服务器上部署
- [Docker部署](./docker.md) - 使用Docker容器化部署
- [Kubernetes部署](./kubernetes.md) - 在Kubernetes集群中部署
- [云服务部署](./cloud.md) - 在主流云服务提供商中部署
- [持续集成与部署](./ci-cd.md) - CI/CD流程配置
- [监控与日志](./monitoring.md) - 应用监控和日志管理
- [备份与恢复](./backup.md) - 数据备份和恢复策略
- [性能优化](./performance.md) - 部署性能优化技巧
- [安全最佳实践](./security.md) - 部署安全加固措施

## 部署架构

DRYcore的典型部署架构包括以下组件：

```
                                ┌───────────────┐
                                │   CDN/缓存    │
                                └───────┬───────┘
                                        │
                                        ▼
┌───────────────┐            ┌───────────────┐            ┌───────────────┐
│  负载均衡器   │────────────▶   Web服务器   │────────────▶  API服务器    │
└───────────────┘            └───────────────┘            └───────┬───────┘
                                                                  │
                                                                  ▼
                                                         ┌───────────────┐
                                                         │   数据库      │
                                                         └───────────────┘
```

## 快速部署指南

### 前提条件

- Node.js v16.0.0+
- PNPM v8.0.0+
- PostgreSQL/MySQL 数据库
- (可选) Redis 缓存服务器
- (可选) Docker 和 Docker Compose

### Docker快速部署

最简单的方式是使用Docker Compose进行部署。首先，确保你的系统已安装Docker和Docker Compose。

1. 克隆仓库并进入项目目录：

```bash
git clone https://github.com/yourusername/drycore.git
cd drycore
```

2. 创建并配置环境变量文件：

```bash
cp .env.example .env
```

编辑`.env`文件，配置必要的环境变量：

```
# 应用配置
NODE_ENV=production
PORT=4000

# 数据库配置
DATABASE_URL=postgresql://postgres:postgres@db:5432/drycore
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=drycore

# JWT配置
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

# 其他配置...
```

3. 使用Docker Compose构建和启动服务：

```bash
docker-compose -f docker-compose.prod.yml up -d
```

4. 初始化数据库（仅首次运行时需要）：

```bash
docker-compose -f docker-compose.prod.yml exec api pnpm prisma migrate deploy
```

服务将在以下地址启动：
- Web界面: http://localhost:3000
- API服务: http://localhost:4000

### 传统服务器部署

如果你想在没有Docker的传统服务器上部署，可以按照以下步骤操作：

1. 在服务器上安装Node.js和PNPM：

```bash
# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PNPM
npm install -g pnpm@8
```

2. 克隆仓库并安装依赖：

```bash
git clone https://github.com/yourusername/drycore.git
cd drycore
pnpm install
```

3. 配置环境变量：

```bash
cp .env.example .env
```

编辑`.env`文件，配置必要的环境变量。

4. 构建应用：

```bash
pnpm build
```

5. 初始化数据库：

```bash
cd packages/server
pnpm prisma migrate deploy
```

6. 启动应用：

```bash
# 使用PM2启动并监控应用
npm install -g pm2
pm2 start ecosystem.config.js
```

## Docker部署详解

DRYcore提供了完整的Docker支持，使用多阶段构建减小镜像大小并优化构建过程。

### Dockerfile

```dockerfile
# 构建阶段
FROM node:16-alpine AS builder

# 安装PNPM
RUN npm install -g pnpm@8

# 设置工作目录
WORKDIR /app

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 复制所有packages的package.json
COPY packages/server/package.json ./packages/server/
COPY packages/web/package.json ./packages/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制所有源代码
COPY . .

# 构建所有包
RUN pnpm build

# 运行阶段 - API服务器
FROM node:16-alpine AS api

WORKDIR /app

# 安装生产环境依赖
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/server/package.json ./packages/server/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# 复制构建产物
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# 复制Prisma相关文件
COPY --from=builder /app/packages/server/prisma ./packages/server/prisma

# 安装生产环境依赖
RUN npm install -g pnpm@8 && \
    pnpm install --prod --frozen-lockfile

# 暴露端口
EXPOSE 4000

# 启动命令
CMD ["node", "packages/server/dist/index.js"]

# 运行阶段 - Web服务器
FROM nginx:alpine AS web

# 复制Nginx配置
COPY docker/nginx/default.conf /etc/nginx/conf.d/

# 复制前端构建产物
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  # API服务
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: api
    restart: always
    ports:
      - "4000:4000"
    depends_on:
      - db
      - redis
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - PORT=4000
    networks:
      - drycore-network

  # Web前端
  web:
    build:
      context: .
      dockerfile: Dockerfile
      target: web
    restart: always
    ports:
      - "3000:80"
    networks:
      - drycore-network

  # 数据库
  db:
    image: postgres:14-alpine
    restart: always
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - drycore-network

  # Redis缓存
  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - drycore-network

networks:
  drycore-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
```

## 云服务部署

### AWS部署

DRYcore可以部署在AWS上，使用以下服务：

- **Amazon ECS/Fargate**: 容器化部署
- **Amazon RDS**: 托管数据库服务
- **Amazon ElastiCache**: Redis缓存服务
- **Amazon S3**: 静态资产存储
- **Amazon CloudFront**: CDN服务
- **Amazon Route 53**: DNS管理
- **AWS Certificate Manager**: SSL证书管理

详细的AWS部署指南请参考[AWS部署](./cloud.md#aws)章节。

### Google Cloud Platform部署

DRYcore也可以部署在GCP上，使用以下服务：

- **Google Kubernetes Engine(GKE)**: Kubernetes集群
- **Cloud SQL**: 托管数据库服务
- **Memorystore**: Redis缓存服务
- **Cloud Storage**: 静态资产存储
- **Cloud CDN**: CDN服务
- **Cloud DNS**: DNS管理

详细的GCP部署指南请参考[GCP部署](./cloud.md#gcp)章节。

### Microsoft Azure部署

DRYcore可以部署在Azure上，使用以下服务：

- **Azure Kubernetes Service(AKS)**: Kubernetes集群
- **Azure Database for PostgreSQL**: 托管数据库服务
- **Azure Cache for Redis**: Redis缓存服务
- **Azure Blob Storage**: 静态资产存储
- **Azure CDN**: CDN服务
- **Azure DNS**: DNS管理

详细的Azure部署指南请参考[Azure部署](./cloud.md#azure)章节。

## 持续集成与部署(CI/CD)

DRYcore支持多种CI/CD工具和平台，以下是使用GitHub Actions的示例配置：

```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: drycore_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install PNPM
        run: npm install -g pnpm@8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Lint
        run: pnpm lint
      
      - name: Build
        run: pnpm build
      
      - name: Test
        run: pnpm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/drycore_test
          JWT_SECRET: test_jwt_secret
  
  deploy:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install PNPM
        run: npm install -g pnpm@8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: drycore
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Update ECS service
        run: |
          aws ecs update-service --cluster drycore-cluster --service drycore-service --force-new-deployment
```

## 部署环境变量

以下是DRYcore在生产环境中所需的关键环境变量：

| 环境变量 | 说明 | 示例 |
|---------|------|------|
| NODE_ENV | 运行环境 | production |
| PORT | API服务端口 | 4000 |
| DATABASE_URL | 数据库连接字符串 | postgresql://user:pass@host:5432/dbname |
| JWT_SECRET | JWT加密密钥 | 复杂随机字符串 |
| JWT_EXPIRES_IN | JWT过期时间 | 7d |
| REDIS_URL | Redis连接字符串 | redis://user:pass@host:6379 |
| CORS_ORIGIN | 允许的CORS来源 | https://example.com |
| LOG_LEVEL | 日志级别 | info |
| UPLOAD_DIR | 文件上传目录 | /app/uploads |
| S3_BUCKET | S3存储桶名称 | my-app-uploads |
| S3_REGION | S3区域 | us-east-1 |
| CDN_URL | CDN基础URL | https://cdn.example.com |

## 服务器要求

根据预期负载，DRYcore的最低服务器要求如下：

**小型部署** (支持约100个并发用户)：
- CPU: 2核
- 内存: 4GB RAM
- 存储: 20GB SSD
- 数据库: 共享实例或1核/2GB RAM专用实例

**中型部署** (支持约500个并发用户)：
- CPU: 4核
- 内存: 8GB RAM
- 存储: 50GB SSD
- 数据库: 2核/4GB RAM专用实例

**大型部署** (支持1000+并发用户)：
- CPU: 8核+
- 内存: 16GB+ RAM
- 存储: 100GB+ SSD
- 数据库: 4核/8GB+ RAM专用实例，考虑读写分离

## 性能优化

以下是部署DRYcore时的性能优化建议：

1. **启用压缩**：使用gzip或brotli压缩API响应
2. **CDN缓存**：将静态资源部署到CDN
3. **数据库优化**：为常用查询创建适当的索引
4. **连接池**：配置适当的数据库连接池大小
5. **缓存**：使用Redis缓存频繁访问的数据
6. **负载均衡**：在多个实例间分散流量
7. **资源优化**：压缩和优化前端资源（JS、CSS、图片）

## 监控与日志

DRYcore支持多种监控和日志解决方案：

### 应用监控

- **Prometheus** + **Grafana**：收集和可视化应用指标
- **New Relic**：全栈应用性能监控
- **Datadog**：基础设施和应用监控

### 日志管理

- **ELK Stack**：Elasticsearch, Logstash, Kibana
- **Graylog**：集中式日志管理
- **AWS CloudWatch Logs**：AWS环境中的日志管理

## 安全最佳实践

部署DRYcore时应遵循以下安全最佳实践：

1. **使用HTTPS**：所有通信都应该加密
2. **安全的环境变量**：敏感信息通过环境变量传递，而不是硬编码
3. **最小权限原则**：使用最小所需权限的服务账号
4. **网络隔离**：使用网络安全组和防火墙限制访问
5. **定期更新**：保持所有依赖和系统包的最新安全补丁
6. **安全标头**：配置适当的HTTP安全标头
7. **CORS策略**：实施严格的跨域资源共享策略
8. **存储加密**：加密存储敏感数据
9. **审计日志**：维护详细的操作和安全审计日志
10. **漏洞扫描**：定期执行安全扫描和渗透测试

## 常见问题解答

### Q: 如何进行数据库迁移?

A: 在生产环境中，使用Prisma的`migrate deploy`命令安全地应用迁移：

```bash
# 使用Docker
docker-compose exec api pnpm prisma migrate deploy

# 传统部署
cd packages/server
pnpm prisma migrate deploy
```

### Q: 如何监控应用状态?

A: DRYcore提供了健康检查端点`/api/health`，可以用于监控应用状态和准备情况。你可以使用监控工具定期检查此端点。

### Q: 如何设置自动备份?

A: 根据使用的数据库和云提供商，有不同的备份策略。对于PostgreSQL，可以使用以下cron作业进行定期备份：

```bash
# 每天凌晨2点备份数据库到S3
0 2 * * * pg_dump -U postgres drycore | gzip | aws s3 cp - s3://my-backups/drycore/$(date +\%Y-\%m-\%d).sql.gz
```

## 相关资源

- [Docker 文档](https://docs.docker.com/)
- [Kubernetes 文档](https://kubernetes.io/docs/home/)
- [PM2 文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx 文档](https://nginx.org/en/docs/)
- [GitHub Actions 文档](https://docs.github.com/en/actions) 