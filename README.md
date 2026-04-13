# 海外广告智能落地页系统

基于AI的智能落地页生成和管理系统，采用Schema-First设计，支持快速生成高转化率的专业营销页面。

## 技术栈

- **前端**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **后端**: Python + FastAPI + Pydantic + SQLAlchemy
- **数据库**: MySQL + Redis
- **部署**: Docker + Docker Compose

## 功能特性

### 核心功能
- 🤖 AI智能生成落地页内容
- 📱 响应式设计，完美适配移动端
- 🎨 可视化页面编辑器
- 📊 实时数据统计分析
- 🚀 一键部署到CDN

### 组件系统
- **Hero组件**: 页面头部展示
- **Features组件**: 产品卖点展示
- **Testimonials组件**: 客户评价展示
- **Form组件**: 线索收集表单
- **CTA组件**: 行动号召区域

### API接口
- **认证接口**: 用户登录注册
- **页面管理**: 创建、编辑、删除页面
- **物料管理**: 图片、视频等媒体文件管理
- **线索管理**: 用户提交信息收集
- **统计分析**: 页面访问数据统计

## 快速开始

### 环境要求
- Docker 20.10+
- Docker Compose 1.29+

### 一键启动
```bash
# 克隆项目
git clone <repository-url>
cd lander-ai

# 启动服务
./start.sh
```

### 手动启动
```bash
# 启动数据库和Redis
docker-compose up -d db redis

# 等待数据库启动
sleep 10

# 运行数据库迁移
docker-compose exec backend alembic upgrade head

# 启动后端服务
docker-compose up -d backend

# 启动前端服务
docker-compose up -d frontend
```

## 访问地址

- **前端页面**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **管理后台**: http://localhost:8000/admin

## 项目结构

```
lander-ai/
├── backend/                    # 后端服务
│   ├── app/
│   │   ├── api/               # API路由
│   │   ├── core/              # 核心配置
│   │   ├── db/                # 数据库连接
│   │   ├── models/            # 数据模型
│   │   ├── schemas/           # Pydantic模型
│   │   └── utils/             # 工具函数
│   ├── alembic/               # 数据库迁移
│   ├── tests/                 # 测试文件
│   └── main.py               # 主应用文件
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # React组件
│   │   │   ├── hero/          # Hero组件
│   │   │   ├── features/      # Features组件
│   │   │   ├── testimonials/  # Testimonials组件
│   │   │   ├── forms/         # Form组件
│   │   │   └── cta/           # CTA组件
│   │   ├── types/             # TypeScript类型定义
│   │   ├── utils/             # 工具函数
│   │   └── styles/            # 样式文件
│   └── public/                # 静态资源
└── docker-compose.yml         # Docker配置
```

## 开发指南

### 后端开发
```bash
# 进入后端目录
cd backend

# 安装依赖
pip install -r requirements.txt

# 运行开发服务器
uvicorn main:app --reload
```

### 前端开发
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

## 部署指南

### 生产环境部署
1. 修改环境变量配置
2. 构建Docker镜像
3. 配置反向代理（Nginx）
4. 配置SSL证书
5. 设置域名解析

### 环境变量配置
- 后端: 复制 `.env.example` 为 `.env` 并配置相关参数
- 前端: 复制 `.env.example` 为 `.env.local` 并配置相关参数

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT License

## 支持

如有问题，请在GitHub Issues中提交。