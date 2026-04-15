# LanderAI 部署指南 (Ubuntu 22.04+)

本指南将指导你如何将 LanderAI (FastAPI + Next.js) 部署到 Ubuntu 服务器。

## 1. 系统环境准备

### 更新系统并安装基础依赖
```bash
sudo apt update && sudo apt upgrade -y
# 安装基础服务及 MySQL 编译依赖 (Alembic 迁移需要)
sudo apt install -y python3-pip python3-venv git nginx mysql-server redis-server curl libmysqlclient-dev python3-dev
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

### 服务管理与自启动
```bash
# 启动 MySQL 服务
sudo systemctl start mysql

# 设置开机自启动
sudo systemctl enable mysql

# 查看服务状态
sudo systemctl status mysql

# 重启服务 (修改配置文件后需执行)
sudo systemctl restart mysql
```

### 优化配置 (可选)
编辑 MySQL 配置文件以优化性能和支持 utf8mb4：
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```
在 `[mysqld]` 模块下添加或修改：
```conf
[mysqld]
# 字符集配置
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 连接优化
max_connections = 500
innodb_buffer_pool_size = 512M # 根据服务器内存调整，通常设为总内存的 50%-70%

# 允许远程访问 (如果需要从外部连接，请修改为 0.0.0.0 并配置防火墙)
bind-address = 127.0.0.1
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

### 修改指定账号密码
如果需要修改已有用户的密码，可以使用以下命令：
```sql
-- 切换到 mysql 数据库
USE mysql;

-- 修改密码 (替换 'landerai_user' 和 'new_secure_password')
ALTER USER 'landerai_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_secure_password';

ALTER USER 'landerai'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Landerai_2026';
ALTER USER 'landerai'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'Landerai_2026';
ALTER USER 'landerai'@'%' IDENTIFIED WITH mysql_native_password BY 'Landerai_2026';

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Root_2026';
ALTER USER 'root'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'Root_2026';
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'Root_2026';

-- 刷新权限
FLUSH PRIVILEGES;
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
pip install gunicorn mysqlclient  # 生产服务器和 Alembic 迁移需要
```

### 配置环境变量
```bash
cp .env.example .env
nano .env
```
修改 `.env` 中的数据库连接字符串：
`DATABASE_URL=mysql+aiomysql://landerai_user:your_secure_password@localhost:3306/landerai`

### 初始化数据库数据
在完成数据库创建和依赖安装后，执行以下步骤初始化数据：

#### 1. 创建表结构
```bash
# 进入后端目录并激活虚拟环境
cd /var/www/landerai/backend
source venv/bin/activate

# 执行初始化脚本创建所有数据表
python init_db.py
```
*注意：如果 `init_db.py` 在创建数据库步骤报错（通常是因为 root 密码不匹配），可以忽略，只要你在之前的步骤中已经手动创建了 `landerai` 数据库，该脚本会自动继续执行建表操作。*

#### 2. 导入演示数据 (可选)
如果你需要一些示例页面和初始账号来测试系统，可以运行：
```bash
python seed_data.py
```
*这会创建一个默认团队和两个初始账号：*
- *普通管理员: `admin@landerai.com` / `admin123`*
- *超级管理员: `super@landerai.com` / `admin123`*

#### 3. 创建自定义超级管理员
建议运行以下脚本创建你自己的超级管理员账号：
```bash
python create_super_admin.py --email your@email.com --password your_password
```

### 运行数据库迁移 (如果使用了 Alembic)
```bash
alembic upgrade head
# 或者运行初始化脚本
python init_db.py
```

### 创建超级管理员
使用提供的脚本创建第一个超级管理员账号：
```bash
python create_super_admin.py --email your@email.com --password your_password
```
*如果不带参数，默认创建 `super@landerai.com`，密码为 `Landerai_2026`。*

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
        client_max_body_size 50M; # 允许上传最大 50MB 的文件，解决 413 Request Entity Too Large 错误
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

### 获取免费证书 (Let's Encrypt)
使用 Certbot 自动获取证书是最简单的方式。Certbot 会自动验证你的域名所有权，并自动修改 Nginx 配置文件。

1. **安装 Certbot**:
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **获取并部署证书**:
   运行以下命令，Certbot 会引导你完成证书申请，并询问是否自动将 HTTP 流量重定向到 HTTPS（推荐选择 2: Redirect）。
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **验证自动续期**:
   Let's Encrypt 证书有效期为 90 天，Certbot 默认会配置一个 cron 任务或 systemd 计时器来自动续期。你可以通过以下命令测试续期流程：
   ```bash
   sudo certbot renew --dry-run
   ```

### 手动配置证书 (已有证书文件)
如果你已经从其他渠道获取了证书（如阿里云、腾讯云申请的 .crt 和 .key 文件），请按照以下步骤配置：

1. **上传证书到服务器**:
   通常建议放在 `/etc/nginx/ssl/` 目录下。

2. **修改 Nginx 配置**:
   ```nginx
   server {
       listen 443 ssl;
       server_name yourdomain.com;

       ssl_certificate /etc/nginx/ssl/yourdomain.com.crt;
       ssl_certificate_key /etc/nginx/ssl/yourdomain.com.key;

       # 推荐的安全配置
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
       ssl_prefer_server_ciphers on;

       # ... 其他 location 配置与 HTTP 相同 ...
   }

   # HTTP 重定向到 HTTPS
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$host$request_uri;
   }
   ```

### 证书续签 (Renewal)

#### 1. Let's Encrypt (Certbot) 续签
如果使用 Certbot，证书通常会自动续签。如果证书已经过期，可以尝试以下步骤：

- **手动强制续签**:
  ```bash
  sudo certbot renew
  ```
  如果证书已过期，此命令会尝试为所有即将到期或已到期的域名更新证书。

- **检查自动续期服务**:
  确保 Certbot 的计时器正在运行：
  ```bash
  sudo systemctl status certbot.timer
  ```

- **常见问题排查**:
  - **80 端口占用**: Certbot 在验证时需要访问 `.well-known` 目录。确保 Nginx 正在运行且没有防火墙阻止 80 端口。
  - **手动强制重新获取**: 如果 `renew` 失败，可以重新运行获取命令：
    ```bash
    sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
    ```

#### 2. 手动证书续签
如果你是手动配置的证书（如从阿里云下载）：
1. 在证书提供商处重新申请或续费证书。
2. 下载新的证书文件（`.crt` 和 `.key`）。
3. 将新文件上传到服务器并覆盖旧文件（建议先备份旧文件）。
4. 检查 Nginx 配置并重启：
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
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
