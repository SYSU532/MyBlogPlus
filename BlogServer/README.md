# 服务端部署

## 服务端环境

Linux + Nginx + MySQL + nodejs

提醒：由于 Know-It 当前运行期间对密码使用明文传输，出于安全请保证服务端具有有效的 SSL 证书与域名(免费 SSL 证书推荐使用 Let's Encrypt)，客户端在不修改代码的情况下将默认使用 https 对指定域名进行连接。

## 直接运行

将项目所有文件放入运行目录下，键入`npm install` 安装 node 依赖文件，完成后直接通过使用`node app.js`即可运行。

若运行时出现无文件使用权限的情况，通过下面的命令更改权限：

更改文件用户归属：（以下例子将改变文件归属为 www 用户组中的 www 用户，若运行的用户不同可根据情况更改）

```shell
chown www:www * -R
```

 更改用户权限：

```shell
chmod a+r * -R
```

执行后可使用`ls -l` 来查看文件权限情况

## 使用 pm2 来简化部署

通过 npm 安装 pm2：

```shell
npm -g i pm2
```

安装完成后在项目目录下执行下面的命令即可完成应用后台运行的部署：

```shell
pm2 start app.js
```

若需查看应用输出可通过下方命令：

```shell
pm2 log app
```

## 使用 Nginx 反向代理分流

在 Nginx 配置文件中对应 server 配置添加以下三段配置内容：

```nginx
location / {
            proxy_redirect off;
            proxy_pass http://127.0.0.1:18080;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $http_host;
        }
```

以上将会将应用中除聊天室部分以外的请求转发至18080端口即应用的端口

```nginx
location /wss/ {
            proxy_redirect off;
            proxy_pass http://127.0.0.1:18088;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $http_host;
        }
```

以上部分将会把应用中聊天室部分的请求（websocket）转发至18088即应用的 websocket 服务的端口

```nginx
location ~ .*\.(gif|jpg|jpeg|png|bmp|swf|tiff|mp4|wmv|mkv|avi)$
        {
            expires      1h;
        }
```

以上部分将会使 Nginx 直接处理对于部分后缀的文件的请求，缓存1小时。

## MySQL 配置

应用将连接至 localhost 下的 MySQL 服务，使用用户名 knowit, 密码 sysu532，若需使用其他账户名或密码，可从 model/model.js 文件修改。

对于 MySQL 服务的初始化可使用对应的账户登入MySQL 后执行项目下的 knowit.sql 文件即可完成数据库的配置。



