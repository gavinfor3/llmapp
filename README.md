# AI Chat Application

一个基于 Vue.js + Element Plus + Express.js 的AI聊天应用，支持配置管理和国际化。

## 功能特性

### 🎯 核心功能
- **左侧配置区**：API密钥和应用ID配置管理
- **右侧聊天窗口**：实时AI对话交互
- **消息历史**：本地存储聊天记录
- **国际化支持**：中文/英文切换

### 🎨 界面设计
- 现代化UI设计，基于Element Plus组件库
- 响应式布局，适配不同屏幕尺寸
- 清晰的左右分区布局
- 优雅的消息气泡样式

### ⚙️ 技术栈
- **前端**：Vue 3 + Element Plus + Vue Router + Vuex
- **后端**：Node.js + Express.js
- **存储**：文件系统（JSON文件）
- **国际化**：Vue I18n

## 快速开始

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装依赖
```bash
# 安装所有依赖
npm run install-all
```

### 开发模式
```bash
# 同时启动前端和后端开发服务器
npm run dev
```

### 单独启动
```bash
# 仅启动后端服务器
npm run server

# 仅启动前端开发服务器
npm run client
```

### 生产构建
```bash
# 构建前端项目
npm run build
```

## 项目结构

```
ai-chat-app/
├── client/                 # Vue.js 前端项目
│   ├── public/            # 静态资源
│   ├── src/
│   │   ├── components/    # Vue组件
│   │   │   ├── ConfigPanel.vue    # 配置面板
│   │   │   └── ChatWindow.vue     # 聊天窗口
│   │   ├── locales/       # 国际化文件
│   │   │   ├── zh.json    # 中文
│   │   │   └── en.json    # 英文
│   │   ├── router/        # 路由配置
│   │   ├── store/         # 状态管理
│   │   ├── views/         # 页面组件
│   │   ├── App.vue        # 根组件
│   │   └── main.js        # 入口文件
│   ├── vue.config.js      # Vue CLI配置
│   └── package.json
├── server/                # Express.js 后端项目
│   ├── data/             # 数据存储目录（自动创建）
│   ├── app.js            # 服务器主文件
│   ├── .env              # 环境变量
│   └── package.json
├── package.json          # 根项目配置
└── README.md
```

## API 接口

### 配置管理
- `GET /api/config` - 获取配置信息
- `POST /api/config` - 保存配置信息

### 聊天功能
- `POST /api/chat` - 发送聊天消息
- `GET /api/messages` - 获取聊天历史
- `DELETE /api/messages` - 清空聊天历史

### 系统状态
- `GET /api/health` - 健康检查

## 使用说明

### 1. 配置设置
1. 在左侧配置面板输入您的API密钥
2. 设置应用ID（可选，有默认值）
3. 点击"保存配置"按钮

### 2. 开始聊天
1. 确保配置已保存
2. 在右侧聊天窗口输入消息
3. 按Enter发送，Shift+Enter换行
4. 查看AI回复

### 3. 语言切换
- 点击配置面板右上角的语言切换按钮
- 支持中文和英文界面

## 开发说明

### 前端开发
- 基于Vue 3 Composition API
- 使用Element Plus组件库
- 支持热重载开发

### 后端开发
- RESTful API设计
- 文件系统数据存储
- 支持CORS跨域

### 数据存储
- 配置信息存储在 `server/data/config.json`
- 聊天记录存储在 `server/data/messages.json`
- 自动创建数据目录和文件

## 注意事项

1. **API密钥安全**：请妥善保管您的API密钥，不要泄露给他人
2. **数据备份**：重要的聊天记录请及时备份
3. **网络连接**：确保网络连接正常以获得最佳体验
4. **浏览器兼容**：建议使用现代浏览器（Chrome、Firefox、Safari、Edge）

## 许可证

MIT License