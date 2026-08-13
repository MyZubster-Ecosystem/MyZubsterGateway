// ============================================
// CHAT DI PYTHO - CON RISPOSTE INTELLIGENTI
// ============================================

const { getPythoResponse } = require('./pytho-responses.js');

app.post('/api/pytho/chat', (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({
            success: false,
            error: 'Pytho ha bisogno di un messaggio per risponderti!'
        });
    }
    
    const response = getPythoResponse(message);
    
    temporalMemory.push({
        event: `🗣️ Chat: "${message}" → "${response.substring(0, 50)}..."`,
        timestamp: new Date().toISOString()
    });
    
    res.json({
        success: true,
        message: message,
        response: response,
        pytho_says: response,
        timestamp: new Date().toISOString()
    });
});
