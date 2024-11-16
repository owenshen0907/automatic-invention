# 使用 Node.js 镜像来构建应用
FROM node:20.18-alpine AS build

# 设置工作目录
WORKDIR /app

# 定义构建参数
ARG REACT_APP_PIPELINE_OPTIONS
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_API_DIFY_URL
ARG REACT_APP_API_STEPFUN_URL
ARG REACT_APP_API_CHATGPT_URL
ARG REACT_APP_LOGIN_PAGE
ARG REACT_APP_DEBUG_JWT

# 设置环境变量，这些变量将在构建时被 React 应用使用
ENV REACT_APP_PIPELINE_OPTIONS=${REACT_APP_PIPELINE_OPTIONS} \
    REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL} \
    REACT_APP_API_DIFY_URL=${REACT_APP_API_DIFY_URL} \
    REACT_APP_API_STEPFUN_URL=${REACT_APP_API_STEPFUN_URL} \
    REACT_APP_API_CHATGPT_URL=${REACT_APP_API_CHATGPT_URL} \
    REACT_APP_LOGIN_PAGE=${REACT_APP_LOGIN_PAGE} \
    REACT_APP_DEBUG_JWT=${REACT_APP_DEBUG_JWT}

# 配置 npm 镜像源，并禁用 audit 和 fund
RUN npm config set registry https://registry.npmmirror.com && \
    npm set audit false && \
    npm set fund false

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 设置 pnpm 使用国内源
RUN pnpm config set registry https://registry.npmmirror.com

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制项目文件（只在依赖未更改时触发）
COPY . .

# 构建 React 应用
RUN pnpm run build

# 使用 Node.js 提供静态文件服务
FROM node:20.18-alpine

# 设置工作目录
WORKDIR /app

# 配置 npm 镜像源，并禁用 audit 和 fund
RUN npm config set registry https://registry.npmmirror.com && \
    npm set audit false && \
    npm set fund false

# 安装 serve
RUN npm install -g serve

# 从构建阶段复制构建产物到当前工作目录
COPY --from=build /app/build ./build

# 暴露端口
EXPOSE 3000

# 启动 serve 来提供静态文件
CMD ["serve", "-s", "build", "-l", "3000"]