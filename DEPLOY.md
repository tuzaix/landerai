# LanderAI 部署指南 (Ubuntu 22.04+)

本指南将指导你如何将 LanderAI (FastAPI + Next.js) 部署到 Ubuntu 服务器。

## 1. 系统环境准备

### 更新系统并安装基础依赖
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv git nginx mysql-server redis-server curl
```

### 安装 Node.js (使用 NVM)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
npm install -g pm2
```

## 2. 数据库安装与配置 (MySQL)

### 安装 MySQL 8.0
```bash
sudo apt update
# 在 Ubuntu 20.04/22.04 中，默认即为 MySQL 8.0
sudo apt install mysql-server -y
```

### 安全初始化
运行以下命令进行安全设置（如设置 root 密码、删除匿名用户等）：
```bash
sudo mysql_secure_installation
```

### 初始化 LanderAI 数据库
```bash
sudo mysql -u root
```
在 MySQL 终端执行：
```sql
-- 创建数据库
CREATE DATABASE landerai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权 (替换 'your_secure_password' 为你的实际密码)
-- 如果驱动程序不支持 caching_sha2_password，请显式指定使用 mysql_native_password
CREATE USER 'landerai_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_secure_password';
GRANT ALL PRIVILEGES ON landerai.* TO 'landerai_user'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

## 3. Redis 安装与配置

LanderAI 使用 Redis 进行缓存和任务队列处理。

### 安装 Redis
```bash
sudo apt install redis-server -y
```

### 配置 Redis 内存限制 (可选但推荐)
```bash
sudo nano /etc/redis/redis.conf
```
找到并修改/添加以下配置：
```conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### 启动并验证
```bash
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# 测试连接
redis-cli ping
# 应返回 PONG
```

## 4. 后端部署 (FastAPI)

### 获取代码并配置
```bash
cd /var/www
sudo git clone <your-repo-url> landerai
sudo chown -R $USER:$USER landerai
cd landerai/backend
```

### 创建虚拟环境并安装依赖
```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn  # 生产环境使用 gunicorn
```

### 配置环境变量
```bash
cp .env.example .env
nano .env
```
修改 `.env` 中的数据库连接字符串：
`DATABASE_URL=mysql+aiomysql://landerai_user:your_secure_password@localhost:3306/landerai`

### 运行数据库迁移 (如果使用了 Alembic)
```bash
alembic upgrade head
# 或者运行初始化脚本
python init_db.py
```

### 创建 Systemd 服务
```bash
sudo nano /etc/systemd/system/landerai-backend.service
```
粘贴以下内容：
```ini
[Unit]
Description=Gunicorn instance to serve LanderAI Backend
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/landerai/backend
Environment="PATH=/var/www/landerai/backend/venv/bin"
ExecStart=/var/www/landerai/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 127.0.0.1:8000

[Install]
WantedBy=multi-user.target
```
启动并启用服务：
```bash
sudo systemctl start landerai-backend
sudo systemctl enable landerai-backend
```

## 5. 前端部署 (Next.js)

### 配置前端环境
```bash
cd /var/www/landerai/frontend
cp .env.example .env.local
nano .env.local
```
确保 `API_BASE_URL` 指向你的后端域名（如 `https://api.yourdomain.com/api/v1`）。

### 构建与运行
```bash
npm install
npm run build
pm2 start npm --name "landerai-frontend" -- start -- -p 3001
pm2 save
pm2 startup
```

## 6. Nginx 配置

### 创建 Nginx 配置文件
```bash
sudo nano /etc/nginx/sites-available/landerai
```
粘贴以下配置：
```nginx
server {
    listen 80;
    server_name yourdomain.com; # 替换为你的主域名

    # 前端代理
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 素材库上传目录映射
    location /uploads {
        alias /var/www/landerai/backend/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```
启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/landerai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. SSL 配置 (HTTPS)

使用 Certbot 自动获取证书：
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

## 8. 常用维护命令

- **查看后端日志**: `sudo journalctl -u landerai-backend -f`
- **查看前端日志**: `pm2 logs landerai-frontend`
- **重启后端**: `sudo systemctl restart landerai-backend`
- **更新代码**:
  ```bash
  git pull
  cd backend && source venv/bin/activate && pip install -r requirements.txt && sudo systemctl restart landerai-backend
  cd ../frontend && npm install && npm run build && pm2 restart landerai-frontend
  ```
