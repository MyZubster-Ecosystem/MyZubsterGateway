require('dotenv').config();

module.exports = {
  apiKey: process.env.DEEPSEEK_API_KEY || 'your-api-key-here',
  baseUrl: 'https://api.deepseek.com/v1',
  model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  maxTokens: 4096,
  temperature: 0.7,
  
  flash: {
    model: process.env.DEEPSEEK_FLASH_MODEL || 'deepseek-v4-flash',
    maxTokens: 8192,
    temperature: 0.5
  }
};
