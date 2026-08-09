const express = require('express');
const router = express.Router();
const deepseek = require('../services/deepseekService');

// Endpoint per chat con DeepSeek
router.post('/chat', async (req, res) => {
  try {
    const { prompt, useFlash = true } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }
    
    const result = useFlash 
      ? await deepseek.chatFlash(prompt)
      : await deepseek.chat(prompt);
    
    res.json({
      success: true,
      response: result.choices[0].message.content,
      usage: result.usage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analisi transazioni Monero
router.post('/analyze-transaction', async (req, res) => {
  try {
    const { transaction } = req.body;
    if (!transaction) {
      return res.status(400).json({ error: 'transaction data required' });
    }
    
    const result = await deepseek.analyzeTransaction(transaction);
    res.json({
      success: true,
      analysis: result.choices[0].message.content
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decisione EVA IONI
router.post('/eva-decision', async (req, res) => {
  try {
    const { sensorData, context } = req.body;
    const result = await deepseek.evaIoniDecision(sensorData, context);
    res.json({
      success: true,
      decision: result.choices[0].message.content
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generazione metadati galassia
router.post('/generate-galaxy', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'galaxy name required' });
    }
    
    const result = await deepseek.generateGalaxyMetadata(name);
    res.json({
      success: true,
      galaxy: result.choices[0].message.content
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
