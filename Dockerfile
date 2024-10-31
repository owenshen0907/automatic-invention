# 使用 node 镜像来构建应用
FROM node:20.18-alpine AS build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 设置 pnpm 使用国内源
RUN pnpm config set registry https://registry.npmmirror.com

# 安装依赖
RUN pnpm install

# 复制项目文件
COPY . .

# 构建 React 应用
RUN pnpm run build

# 使用 Nginx 提供静态文件服务
FROM nginx:alpine

# 移除默认的 Nginx 索引文件
RUN rm -rf /usr/share/nginx/html/*

# 从构建阶段复制构建产物到 Nginx 目录
COPY --from=build /app/build /usr/share/nginx/html

# 暴露端口
EXPOSE 3000

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]