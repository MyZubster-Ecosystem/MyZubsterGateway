/**
 * Robot Social Media - Generazione post per negozi (Closes #380)
 */
const express = require('express');
const router = express.Router();

const POST_TEMPLATES_IT = [
  "🔥 Scopri {product} da {shop}! {useCase}. Vieni a trovarci! #shopping #{shopTag} #offerta",
  "✨ Novità da {shop}: {product}! Qualità garantita. Da non perdere! #nuovoarrivo #{shopTag} #qualità",
  "💡 Consiglio: {product} disponibile ora da {shop}! Approfittane! #consigli #{shopTag} #risparmio",
  "🎯 Hai visto {product} da {shop}? I nostri clienti lo adorano! #top #{shopTag} #musthave",
  "📢 Promo: {product} da {shop}! Offerta limitata. Corri! #promo #{shopTag} #offerta"
];

const POST_TEMPLATES_EN = [
  "🔥 Discover {product} at {shop}! {useCase}. Come visit us! #shopping #{shopTag} #deal",
  "✨ New at {shop}: {product}! Quality guaranteed. Don't miss out! #newarrival #{shopTag} #quality",
  "💡 Tip: {product} available now at {shop}! Grab it! #tips #{shopTag} #savings",
  "🎯 Seen {product} at {shop} yet? Our customers love it! #top #{shopTag} #musthave",
  "📢 Special offer: {product} at {shop}! Limited time. Hurry! #promo #{shopTag} #offer"
];

const USE_CASES_IT = ['la casa', "l'ufficio", 'il tempo libero', 'la famiglia', 'ogni occasione'];
const USE_CASES_EN = ['home', 'office', 'leisure', 'family', 'every occasion'];

const CTAS_IT = ['📲 Chiamaci subito!', '🛒 Ordina ora!', '📍 Passa a trovarci!', '📩 Scrivici!', '🔗 Link in bio!'];
const CTAS_EN = ['📲 Call us now!', '🛒 Order now!', '📍 Visit us!', '📩 DM us!', '🔗 Link in bio!'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shopTag(name) { return name.toLowerCase().replace(/[^a-z0-9]/g,'').substring(0,15); }

router.post('/generate', (req, res) => {
  const { shopName, photos, productDescription, language } = req.body;
  if (!shopName || !productDescription) {
    return res.status(400).json({ error: 'shopName and productDescription are required' });
  }
  const lang = (language || 'it').toLowerCase();
  const templates = lang === 'en' ? POST_TEMPLATES_EN : POST_TEMPLATES_IT;
  const useCases = lang === 'en' ? USE_CASES_EN : USE_CASES_IT;
  const ctas = lang === 'en' ? CTAS_EN : CTAS_IT;
  const tag = shopTag(shopName);
  const product = productDescription.split(' ').slice(0, 5).join(' ');
  const photoCount = Array.isArray(photos) ? photos.length : 0;

  const posts = templates.map((t, i) => {
    const uc = pick(useCases);
    const cta = pick(ctas);
    const text = t.replace('{product}', product).replace('{shop}', shopName).replace('{useCase}', uc).replace('{shopTag}', tag);
    return {
      id: i+1, text, cta,
      hashtags: text.split('#').slice(1).map(h => '#' + h.trim()),
      suggestedPhotoIndex: i < photoCount ? i : i % Math.max(1, photoCount),
      platform: 'instagram', language: lang
    };
  });

  res.status(201).json({ success: true, shop: shopName, language: lang, photosProvided: photoCount, generatedAt: new Date().toISOString(), totalPosts: posts.length, posts });
});

router.get('/templates', (req, res) => {
  res.json({ languages: ['it','en'], templates: { it: POST_TEMPLATES_IT, en: POST_TEMPLATES_EN }, ctas: { it: CTAS_IT, en: CTAS_EN } });
});

module.exports = router;
