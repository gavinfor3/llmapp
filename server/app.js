const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs-extra')
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 数据存储路径
const DATA_DIR = path.join(__dirname, 'data')
const CONFIG_FILE = path.join(DATA_DIR, 'config.json')
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json')

// 确保数据目录存在
fs.ensureDirSync(DATA_DIR)

// 初始化配置文件
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeJsonSync(CONFIG_FILE, {
    apiKey: '',
    appId: 'default-app-001'
  })
}

// 初始化消息文件
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeJsonSync(MESSAGES_FILE, [])
}

// API 路由

// 获取配置
app.get('/api/config', (req, res) => {
  try {
    const config = fs.readJsonSync(CONFIG_FILE)
    // 不返回完整的API密钥，只返回前几位用于显示
    const safeConfig = {
      ...config,
      apiKey: config.apiKey ? config.apiKey.substring(0, 8) + '...' : ''
    }
    res.json(safeConfig)
  } catch (error) {
    console.error('Error reading config:', error)
    res.status(500).json({ error: 'Failed to read configuration' })
  }
})

// 保存配置
app.post('/api/config', (req, res) => {
  try {
    const { apiKey, appId } = req.body
    
    if (!apiKey || !appId) {
      return res.status(400).json({ error: 'API Key and App ID are required' })
    }
    
    const config = { apiKey, appId }
    fs.writeJsonSync(CONFIG_FILE, config)
    
    res.json({ message: 'Configuration saved successfully' })
  } catch (error) {
    console.error('Error saving config:', error)
    res.status(500).json({ error: 'Failed to save configuration' })
  }
})

// 聊天接口
app.post('/api/chat', async (req, res) => {
  try {
    const { message, config } = req.body
    
    if (!message || !config || !config.apiKey) {
      return res.status(400).json({ error: 'Message and API Key are required' })
    }
    
    // 调用通义千问API
    let apiUrl, model, headers, requestBody
    
    // 检查appId是否为模型名称或应用ID
    if (config.appId && typeof config.appId === 'string') {
      if (config.appId.startsWith('qwen')) {
        // 这是一个模型名称，使用模型接口
        model = config.appId
        apiUrl = config.apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        }
        requestBody = {
          model: model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: message }
          ]
        }
      } else {
        // 这是一个应用ID，使用应用接口
        apiUrl = `https://dashscope.aliyuncs.com/api/v1/apps/${config.appId}/completion`
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'X-DashScope-SSE': 'disable'
        }
        requestBody = {
          input: {
            prompt: message
          },
          parameters: {},
          debug: {}
        }
      }
    } else {
      // 默认使用模型接口
      model = 'qwen-plus'
      apiUrl = config.apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      }
      requestBody = {
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: message }
        ]
      }
    }
    
    const { default: fetch } = await import('node-fetch');
     
     const response = await fetch(apiUrl, {
       method: 'POST',
       headers: headers,
       body: JSON.stringify(requestBody)
     })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API调用失败:', response.status, errorText)
      return res.status(500).json({ error: `API调用失败: ${response.status} ${errorText}` })
    }
    
    const apiResponse = await response.json()
    let aiResponse = '抱歉，我无法生成回复。'
    
    // 根据不同的API接口处理响应
    if (config.appId && !config.appId.startsWith('qwen')) {
      // 应用接口响应格式
      aiResponse = apiResponse.output?.text || apiResponse.output?.choices?.[0]?.message?.content || '抱歉，我无法生成回复。'
    } else {
      // 模型接口响应格式
      aiResponse = apiResponse.choices?.[0]?.message?.content || '抱歉，我无法生成回复。'
    }
    
    // 保存对话记录
    const chatRecord = {
      timestamp: new Date().toISOString(),
      userMessage: message,
      aiResponse: aiResponse,
      config: {
        model: model,
        apiUrl: apiUrl,
        // 不保存完整的API密钥
        apiKeyHash: config.apiKey.substring(0, 8) + '...'
      }
    }
    
    // 读取现有消息并添加新记录
    let messages = []
    try {
      messages = fs.readJsonSync(MESSAGES_FILE)
    } catch (error) {
      console.log('Creating new messages file')
    }
    
    messages.push(chatRecord)
    
    // 只保留最近100条记录
    if (messages.length > 100) {
      messages = messages.slice(-100)
    }
    
    fs.writeJsonSync(MESSAGES_FILE, messages)
    
    res.json({ response: aiResponse })
    
  } catch (error) {
    console.error('Error in chat endpoint:', error)
    res.status(500).json({ error: 'Failed to process chat message' })
  }
})

// 获取聊天历史
app.get('/api/messages', (req, res) => {
  try {
    const messages = fs.readJsonSync(MESSAGES_FILE)
    res.json(messages)
  } catch (error) {
    console.error('Error reading messages:', error)
    res.status(500).json({ error: 'Failed to read messages' })
  }
})

// 清空聊天历史
app.delete('/api/messages', (req, res) => {
  try {
    fs.writeJsonSync(MESSAGES_FILE, [])
    res.json({ message: 'Messages cleared successfully' })
  } catch (error) {
    console.error('Error clearing messages:', error)
    res.status(500).json({ error: 'Failed to clear messages' })
  }
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📁 Data directory: ${DATA_DIR}`)
  console.log(`⚙️  Config file: ${CONFIG_FILE}`)
  console.log(`💬 Messages file: ${MESSAGES_FILE}`)
})