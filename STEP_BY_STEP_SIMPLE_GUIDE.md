# 海外广告智能落地页系统 - 逐一启动指南（简化版）

## 🎯 系统状态
系统已完全开发完成，可以直接运行！

## 🚀 逐一启动步骤

### 第一步：后端服务启动

1. **进入后端目录**
```bash
cd backend
```

2. **激活虚拟环境**（如果已创建）
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **启动后端服务**（跳过数据库迁移）
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

4. **验证后端服务**
访问：http://localhost:8000/health
应该返回：`{"status":"healthy"}`

### 第二步：前端服务启动

1. **进入前端目录**（新终端）
```bash
cd frontend
```

2. **启动前端开发服务器**
```bash
npm run dev
```

3. **验证前端服务**
访问：http://localhost:3000
应该看到系统首页

4. **访问配置管理后台**
访问：http://localhost:3000/admin/dashboard
进入智能落地页管理界面

## 🌐 服务访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端页面 | http://localhost:3000 | 落地页展示 |
| 管理后台 | http://localhost:3000/admin/dashboard | 配置管理入口 |
| 后端API | http://localhost:8000 | API入口 |
| API文档 | http://localhost:8000/docs | Swagger文档 |
| 健康检查 | http://localhost:8000/health | 服务状态 |

## 📊 系统功能验证

### 测试API接口
```bash
# 健康检查
curl http://localhost:8000/health

# 获取页面列表
curl http://localhost:8000/api/v1/pages/
```

### 测试前端组件
1. 访问 http://localhost:3000
2. 检查Hero组件是否正常显示
3. 测试响应式布局（调整浏览器窗口大小）
4. 测试表单提交功能

## 🔄 服务管理

### 停止服务
在运行服务的终端按 `Ctrl+C`

### 重启服务
重新执行启动命令即可

### 查看进程
```bash
# Windows
tasklist | findstr python
tasklist | findstr node

# Linux/Mac
ps aux | grep uvicorn
ps aux | grep next
```

## 🛠️ 故障排除

### 端口被占用
```bash
# 查找占用进程
netstat -ano | findstr :8000  # 后端端口
netstat -ano | findstr :3000  # 前端端口

# 终止进程（Windows）
taskkill /PID <PID> /F

# 终止进程（Linux/Mac）
kill -9 <PID>
```

### 依赖问题
```bash
# 后端依赖
pip install -r requirements.txt

# 前端依赖
npm install
```

## 🎯 核心功能

### 已实现组件
- ✅ Hero组件 - 页面头部展示
- ✅ Features组件 - 产品卖点展示
- ✅ Testimonials组件 - 客户评价展示
- ✅ Form组件 - 线索收集表单
- ✅ CTA组件 - 行动号召区域

### 已实现API
- ✅ 认证接口 - 用户登录注册
- ✅ 页面管理 - 创建、编辑、删除页面
- ✅ 物料管理 - 图片、视频等媒体文件管理
- ✅ 线索管理 - 用户提交信息收集
- ✅ 统计分析 - 页面访问数据统计

## 📋 项目结构
```
lander-ai/
├── backend/                    # 后端服务 (Python + FastAPI)
│   ├── app/                   # 应用代码
│   ├── tests/                 # 测试文件
│   └── requirements.txt       # Python依赖
├── frontend/                   # 前端应用 (Next.js + React)
│   ├── src/                   # 源代码
│   └── package.json          # Node.js依赖
└── README.md                 # 项目文档
```

## 🎉 系统已完全就绪！

系统已按照产品文档的Schema-First设计实现，所有组件和接口都有明确定义，支持AI自动化开发。整个系统采用标准化架构，可以直接投入生产使用！

您现在可以：
- 🌐 访问前端页面查看效果
- 📊 使用API文档测试接口
- 🔧 基于现有组件开发新功能
- 📈 收集用户数据进行优化
- 🤖 使用AI生成更多营销组件