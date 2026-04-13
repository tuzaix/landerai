# 海外广告智能落地页系统 - 启动脚本使用说明

## 🚀 一键启动（推荐）

### Linux/Mac 系统
```bash
# 给脚本添加执行权限
chmod +x start_manual.sh

# 一键启动
./start_manual.sh
```

### Windows 系统
```cmd
# 直接运行
start_manual.bat
```

## 🔧 分步启动（调试模式）

### 第一步：数据库初始化
```bash
# Linux/Mac
./scripts/init_database.sh

# Windows
scripts\init_database.bat
```

### 第二步：后端服务
```bash
# Linux/Mac
cd backend
./start_backend.sh

# Windows
cd backend
start_backend.bat
```

### 第三步：前端服务
```bash
# Linux/Mac
cd frontend
./start_frontend.sh

# Windows
cd frontend
start_frontend.bat
```

## 📋 启动前检查清单

### ✅ 系统要求
- [ ] Python 3.11+ 已安装
- [ ] Node.js 18+ 已安装
- [ ] MySQL 8.0+ 已安装并运行
- [ ] Redis 6.0+ 已安装并运行

### ✅ 数据库配置
- [ ] MySQL 服务正在运行 (127.0.0.1:3306)
- [ ] Redis 服务正在运行 (127.0.0.1:6379)
- [ ] 数据库用户: root/root
- [ ] 数据库名称: landerai

### ✅ 端口检查
- [ ] 端口 8000 (后端) 未被占用
- [ ] 端口 3000 (前端) 未被占用

## 🔍 启动过程监控

### 查看实时日志
```bash
# 后端日志
tail -f backend/backend.log

# 前端日志
tail -f frontend/frontend.log
```

### 检查服务状态
```bash
# 检查端口
netstat -tlnp | grep -E ':(3000|8000)'

# 检查进程
ps aux | grep -E 'uvicorn|next'

# 检查健康状态
curl http://localhost:8000/health
```

## 🛑 停止服务

### 优雅停止
```bash
# 查找进程ID并停止
ps aux | grep uvicorn
ps aux | grep next

# 停止指定PID
kill <PID>
```

### 强制停止
```bash
# 停止所有相关进程
pkill -f uvicorn
pkill -f next

# Windows
taskkill /F /IM python.exe
taskkill /F /IM node.exe
```

## 🔄 重启服务

### 快速重启
```bash
# 停止
killall uvicorn
killall next

# 重新启动
./start_manual.sh
```

### 热重载（开发模式）
后端服务已配置 `--reload` 参数，代码修改后会自动重启。

## 📊 性能监控

### 资源使用监控
```bash
# 查看CPU和内存使用
top -p $(pgrep -f uvicorn)
top -p $(pgrep -f next)

# 查看网络连接
netstat -an | grep -E ':(3000|8000)'
```

### 数据库监控
```bash
# MySQL连接数
mysql -uroot -proot -e "SHOW PROCESSLIST;"

# Redis连接数
redis-cli client list
```

## 🛠️ 故障排除

### 启动失败处理

1. **查看错误日志**
   ```bash
   cat backend/backend.log
   cat frontend/frontend.log
   ```

2. **检查依赖版本**
   ```bash
   python --version
   node --version
   mysql --version
   redis-cli --version
   ```

3. **重置环境**
   ```bash
   # 清除虚拟环境
   rm -rf backend/venv
   rm -rf frontend/node_modules
   
   # 重新启动
   ./start_manual.sh
   ```

### 常见错误解决

| 错误 | 解决方案 |
|------|----------|
| 端口被占用 | 修改端口或终止占用进程 |
| 数据库连接失败 | 检查MySQL服务和配置 |
| Redis连接失败 | 检查Redis服务和配置 |
| 依赖安装失败 | 使用国内镜像源 |
| TypeScript编译错误 | 检查类型定义和导入 |

## 📞 技术支持

如遇到问题：
1. 查看日志文件
2. 检查服务状态
3. 验证配置信息
4. 重启服务尝试
5. 查看详细文档