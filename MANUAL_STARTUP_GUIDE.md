# 海外广告智能落地页系统 - 手动启动指南

## 📋 系统要求

### 必需软件
- **Python**: 3.11+
- **Node.js**: 18+
- **MySQL**: 8.0+ (127.0.0.1:3306, 用户: root, 密码: root)
- **Redis**: 6.0+ (127.0.0.1:6379)

### 可选软件
- **Git**: 用于版本控制
- **VSCode**: 推荐编辑器
- **MySQL Workbench**: 数据库管理工具

## 🚀 快速启动步骤

### 1. 数据库准备
```bash
# Linux/Mac
./scripts/init_database.sh

# Windows
scripts\init_database.bat
```

### 2. 启动后端服务
```bash
# Linux/Mac
cd backend
./start_backend.sh

# Windows
cd backend
start_backend.bat
```

### 3. 启动前端服务
```bash
# Linux/Mac
cd frontend
./start_frontend.sh

# Windows
cd frontend
start_frontend.bat
```

## 📖 详细启动步骤

### 第一步：数据库初始化

1. **确保MySQL服务正在运行**
   ```bash
   # 检查MySQL状态
   sudo systemctl status mysql  # Linux
   # 或
   net start mysql              # Windows
   ```

2. **确保Redis服务正在运行**
   ```bash
   # 检查Redis状态
   redis-cli ping
   # 应该返回: PONG
   ```

3. **运行数据库初始化脚本**
   ```bash
   # 进入项目目录
   cd d:\develop\LanderAI
   
   # 运行初始化脚本
   ./scripts/init_database.sh  # Linux/Mac
   # 或
   scripts\init_database.bat   # Windows
   ```

### 第二步：后端服务启动

1. **进入后端目录**
   ```bash
   cd backend
   ```

2. **创建虚拟环境**（如果尚未创建）
   ```bash
   python -m venv venv
   ```

3. **激活虚拟环境**
   ```bash
   # Linux/Mac
   source venv/bin/activate
   
   # Windows
   venv\Scripts\activate
   ```

4. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

5. **运行数据库迁移**
   ```bash
   alembic upgrade head
   ```

6. **启动后端服务**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### 第三步：前端服务启动

1. **进入前端目录**
   ```bash
   cd frontend
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **检查TypeScript编译**
   ```bash
   npx tsc --noEmit
   ```

4. **启动前端开发服务器**
   ```bash
   npm run dev
   ```

## 🌐 访问地址

- **前端页面**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

## 🔧 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用情况
   netstat -ano | findstr :8000  # Windows
   lsof -i :8000                 # Linux/Mac
   
   # 终止占用进程
   taskkill /PID <PID> /F       # Windows
   kill -9 <PID>                # Linux/Mac
   ```

2. **数据库连接失败**
   - 检查MySQL服务是否启动
   - 确认用户名密码正确
   - 检查防火墙设置
   - 验证数据库是否存在

3. **Redis连接失败**
   - 检查Redis服务是否启动
   - 确认端口是否正确
   - 检查防火墙设置

4. **依赖安装失败**
   - 检查网络连接
   - 尝试使用国内镜像源
   - 升级pip版本

### 环境变量配置

确保以下环境变量正确设置：

**后端 (.env)**
```
DATABASE_URL=mysql+aiomysql://root:root@127.0.0.1:3306/landerai
REDIS_URL=redis://127.0.0.1:6379/0
SECRET_KEY=your-secret-key-change-this-in-production
```

**前端 (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 服务状态检查

### 后端服务检查
```bash
curl http://localhost:8000/health
# 应该返回: {"status":"healthy"}
```

### 前端服务检查
```bash
curl http://localhost:3000
# 应该返回HTML页面内容
```

### 数据库连接检查
```bash
mysql -h127.0.0.1 -P3306 -uroot -proot -e "SELECT 1;"
# 应该返回: 1
```

### Redis连接检查
```bash
redis-cli -h 127.0.0.1 -p 6379 ping
# 应该返回: PONG
```

## 🔄 重启服务

### 优雅重启
```bash
# 停止服务（Ctrl+C）
# 重新启动
uvicorn main:app --host 0.0.0.0 --port 8000 --reload  # 后端
npm run dev                                              # 前端
```

### 强制重启
```bash
# 查找并终止进程
pkill -f uvicorn  # Linux/Mac
taskkill /F /IM python.exe  # Windows

# 重新启动
./start_backend.sh  # 后端
./start_frontend.sh # 前端
```

## 📞 技术支持

如遇到问题，请检查：
1. 服务日志输出
2. 端口占用情况
3. 数据库连接状态
4. 环境变量配置
5. 依赖版本兼容性