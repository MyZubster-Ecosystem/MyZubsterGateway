// ============================================
// CLAIM BOT - Gestione automatica dei claim
// ============================================

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configurazione
const REPO = 'DanielIoni-creator/I-ECO-01';
const CLAIM_LABEL = 'claimed';
const BOUNTY_LABEL = 'bounty';

// Funzione per assegnare una issue
async function assignIssue(issueNumber, username) {
    try {
        await execPromise(`gh issue assign ${issueNumber} ${username}`);
        await execPromise(`gh issue label add ${issueNumber} ${CLAIM_LABEL}`);
        await execPromise(`gh issue comment ${issueNumber} --body "✅ **Bounty assegnato a @${username}**\n\n👽 Pytho ti dà il benvenuto! Inizia a lavorare e buona fortuna! 🚀"`);
        console.log(`✅ Issue #${issueNumber} assegnata a ${username}`);
        return true;
    } catch (error) {
        console.error(`❌ Errore assegnazione issue #${issueNumber}:`, error.message);
        return false;
    }
}

// Funzione per trovare nuovi claim
async function findNewClaims() {
    try {
        const { stdout } = await execPromise(`gh issue list --state open --search "comment:/claim" --json number,title,comments --limit 10`);
        const issues = JSON.parse(stdout);
        return issues;
    } catch (error) {
        console.error('❌ Errore ricerca claim:', error.message);
        return [];
    }
}

// Funzione principale
async function processClaims() {
    console.log('🔍 Ricerca nuovi claim...');
    const issues = await findNewClaims();
    
    if (issues.length === 0) {
        console.log('✅ Nessun nuovo claim trovato');
        return;
    }
    
    for (const issue of issues) {
        // Trova l'utente che ha fatto /claim
        const claimComment = issue.comments.find(c => c.body.includes('/claim'));
        if (claimComment) {
            const username = claimComment.author.login;
            console.log(`📝 Claim trovato: #${issue.number} da @${username}`);
            await assignIssue(issue.number, username);
        }
    }
}

// Esegui
processClaims();
