// ============================================
// CHAT DI PYTHO - CON RICERCHE ONLINE
// ============================================

const { getContextualResponse } = require('./pytho-search.js');

app.post('/api/pytho/chat', async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({
            success: false,
            error: 'Pytho ha bisogno di un messaggio per risponderti!'
        });
    }
    
    let response = '';
    
    try {
        // Prima prova una ricerca online (se richiesta)
        const searchResult = await getContextualResponse(message);
        if (searchResult) {
            response = searchResult;
        } else {
            // Altrimenti usa le risposte predefinite
            response = getPythoResponse(message);
        }
    } catch (error) {
        console.error('Errore nella chat:', error);
        response = getPythoResponse(message);
    }
    
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
