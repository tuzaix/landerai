# 海外广告智能落地页系统 - 分步手动启动指南

## 🎯 启动前准备

### 1. 确保服务已安装
- **MySQL**: 8.0+ (127.0.0.1:3306, root/root)
- **Redis**: 6.0+ (127.0.0.1:6379)
- **Python**: 3.11+
- **Node.js**: 18+

### 2. 检查服务状态
```bash
# 检查MySQL
mysql -h127.0.0.1 -P3306 -uroot -proot -e "SELECT 1;"

# 检查Redis
redis-cli -h 127.0.0.1 -p 6379 ping
```

## 🔧 步骤1：后端服务启动

### 1.1 进入后端目录
```bash
cd backend
```

### 1.2 创建虚拟环境（首次启动）
```bash
python -m venv venv
```

### 1.3 激活虚拟环境
```bash
# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 1.4 安装依赖
```bash
pip install -r requirements.txt
```

### 1.5 运行数据库迁移
```bash
alembic upgrade head
```

### 1.6 启动后端服务
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 1.7 验证后端服务
访问：http://localhost:8000/health
应该返回：`{"status":"healthy"}`

## 🎨 步骤2：前端服务启动

### 2.1 进入前端目录（新终端）
```bash
cd frontend
```

### 2.2 安装依赖（首次启动）
```bash
npm install
```

### 2.3 检查TypeScript编译
```bash
npx tsc --noEmit
```

### 2.4 启动前端开发服务器
```bash
npm run dev
```

### 2.5 验证前端服务
访问：http://localhost:3000
应该看到系统首页

## 🌐 服务访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端页面 | http://localhost:3000 | 主页面 |
| 后端API | http://localhost:8000 | API入口 |
| API文档 | http://localhost:8000/docs | Swagger文档 |
| 健康检查 | http://localhost:8000/health | 服务状态 |

## 🔄 服务管理

### 查看服务状态
```bash
# 查看端口占用
netstat -tlnp | grep -E ':(3000|8000)'  # Linux
netstat -ano | findstr :3000           # Windows

# 查看进程
ps aux | grep -E 'uvicorn|next'        # Linux/Mac
tasklist | findstr python               # Windows
```

### 停止服务
```bash
# 在运行服务的终端按 Ctrl+C
# 或使用任务管理器结束进程
```

### 重启服务
```bash
# 停止后重新执行启动命令
uvicorn main:app --host 0.0.0.0 --port 8000 --reload  # 后端
npm run dev                                            # 前端
```

## 🛠️ 故障排除

### 后端常见问题

1. **数据库连接失败**
   ```bash
   # 检查数据库配置
   cat backend/.env
   
   # 测试连接
   mysql -h127.0.0.1 -P3306 -uroot -proot -e "SELECT 1;"
   ```

2. **端口被占用**
   ```bash
   # 查找占用进程
   lsof -i :8000  # Linux/Mac
   netstat -ano | findstr :8000  # Windows
   
   # 终止进程
   kill -9 <PID>  # Linux/Mac
   taskkill /PID <PID> /F  # Windows
   ```

3. **依赖安装失败**
   ```bash
   # 升级pip
   pip install --upgrade pip
   
   # 使用国内镜像
   pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
   ```

### 前端常见问题

1. **端口被占用**
   ```bash
   # Next.js会自动尝试下一个端口
   # 或手动指定端口
   npm run dev -- -p 3001
   ```

2. **依赖安装失败**
   ```bash
   # 清除缓存
   npm cache clean --force
   
   # 删除node_modules重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript编译错误**
   ```bash
   # 查看具体错误
   npx tsc --noEmit
   
   # 重新编译
   npm run build
   ```

## 📊 性能优化

### 后端优化
```bash
# 使用生产级服务器
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# 或使用gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### 前端优化
```bash
# 生产构建
npm run build
npm start

# 分析构建结果
npm run build --analyze
```

## 🔐 安全配置

### 修改默认密钥
编辑 `backend/.env`：
```
SECRET_KEY=your-very-secret-key-here-change-this-in-production
```

### 配置CORS
编辑 `backend/app/core/config.py`：
```python
ALLOWED_HOSTS = ["http://localhost:3000", "http://your-domain.com"]
```

## 📞 技术支持

如遇到问题：
1. 检查服务日志
2. 验证端口占用情况
3. 确认数据库连接状态
4. 检查环境变量配置
5. 查看GitHub Issues