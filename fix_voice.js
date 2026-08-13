// Fix per il riconoscimento vocale di Pytho
const voiceFix = `
// ROTTA: Riconoscimento vocale - VERSIONE CORRETTA
app.post('/api/pytho/voice', (req, res) => {
    const { command } = req.body;
    
    if (!command) {
        return res.status(400).json({
            success: false,
            error: 'Nessun comando vocale ricevuto'
        });
    }
    
    // Analizza il comando - estrai anno e destinazione
    const yearMatch = command.match(/\\b(\\d{4})\\b/);
    const destinationMatch = command.match(/destinazione\\s+([a-zA-Z\\s]+)/i) || 
                           command.match(/a\\s+([a-zA-Z\\s]+)\\s+nel/i) ||
                           command.match(/al\\s+([a-zA-Z\\s]+)/i);
    
    let response = {
        success: true,
        command: command,
        pytho_says: '👽 Comando ricevuto!',
        action: null
    };
    
    if (yearMatch) {
        const year = yearMatch[1];
        let destination = 'Orto Botanico di Roma';
        
        if (destinationMatch) {
            destination = destinationMatch[1].trim();
        }
        
        response.pytho_says = \`🛸 Viaggio al \${destination} nel \${year} in corso...\`;
        response.action = 'timetravel';
        response.year = year;
        response.destination = destination;
        response.voice_command = true;
        
        // Aggiungi alla memoria temporale
        temporalMemory.push({
            event: \`🗣️ Comando vocale: viaggio al \${destination} (\${year})\`,
            timestamp: new Date().toISOString()
        });
        
        // Aggiungi anche al viaggio temporale
        const travelResult = {
            timestamp: new Date().toISOString(),
            destination: destination,
            year: parseInt(year),
            status: '🛸 Viaggio vocale completato!',
            pytho_message: '👽 La voce di Pytho ti guida...',
            flux: '1.21 GW ⚡'
        };
        
        // Salva nella memoria temporale
        temporalMemory.push({
            event: \`🛸 Viaggio vocale al \${destination} (\${year})\`,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            ...response,
            travel_result: travelResult
        });
    } else {
        response.pytho_says = '👽 Non ho capito l\'anno. Prova: "Pytho, viaggia al 2124"';
        res.json(response);
    }
});
`;

cat fix_voice.js
