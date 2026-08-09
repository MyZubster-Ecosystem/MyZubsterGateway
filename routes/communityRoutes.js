const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// ============================================================
// Community Ambientale - Futura
// Issue #1030 - Reward: 400 MYZ
// ============================================================

const users = {};
const reports = {};
const projects = {};
const courses = {};
const quizResults = {};
const forumPosts = [];
const chatMessages = [];
const groups = {};
const leaderboard = {};
const badges = {};

// ▸▸▸ 1. COMMUNITY - Profili Utenti

router.post('/community/profile', (req, res) => {
  const { username, email, location, bio, interests } = req.body || {};
  if (!username) {
    return res.status(400).json({ error: 'username obbligatorio', ok: false });
  }

  const userId = `USR-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  users[userId] = {
    userId,
    username,
    email: email || null,
    location: location || null,
    bio: bio || '',
    interests: interests || [],
    points: 0,
    badges: [],
    joinedAt: new Date().toISOString(),
    reportsCount: 0,
    projectsCount: 0
  };

  // Init leaderboard entry
  leaderboard[userId] = { username, points: 0, badges: 0, rank: Object.keys(leaderboard).length + 1 };

  res.status(201).json({ ok: true, profile: users[userId] });
});

router.get('/community/profile/:userId', (req, res) => {
  const user = users[req.params.userId];
  if (!user) return res.status(404).json({ error: 'Utente non trovato', ok: false });
  res.json({ ok: true, profile: user, leaderboard: leaderboard[req.params.userId] });
});

// ▸▸▸ 2. SEGNALAZIONI AMBIENTALI

router.post('/community/report', (req, res) => {
  const { userId, type, description, location, severity, imageUrl } = req.body || {};
  if (!userId || !type || !description) {
    return res.status(400).json({ error: 'Campi obbligatori: userId, type, description', ok: false });
  }

  const reportId = `RPT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  reports[reportId] = {
    reportId,
    userId,
    type,
    description,
    location: location || null,
    severity: severity || 'medium',
    imageUrl: imageUrl || null,
    status: 'open',
    upvotes: 0,
    createdAt: new Date().toISOString(),
    updates: []
  };

  if (users[userId]) {
    users[userId].reportsCount++;
    users[userId].points += 10;
    leaderboard[userId].points += 10;
  }

  res.status(201).json({ ok: true, report: reports[reportId] });
});

router.get('/community/reports', (req, res) => {
  const { type, severity, status, limit } = req.query;
  let results = Object.values(reports);
  if (type) results = results.filter(r => r.type === type);
  if (severity) results = results.filter(r => r.severity === severity);
  if (status) results = results.filter(r => r.status === status);

  results.sort((a, b) => b.upvotes - a.upvotes);
  const maxResults = parseInt(limit) || 20;

  res.json({ ok: true, count: results.length, results: results.slice(0, maxResults) });
});

router.post('/community/report/:reportId/upvote', (req, res) => {
  const report = reports[req.params.reportId];
  if (!report) return res.status(404).json({ error: 'Segnalazione non trovata', ok: false });
  report.upvotes++;
  res.json({ ok: true, reportId: report.reportId, upvotes: report.upvotes });
});

// ▸▸▸ 3. PROGETTI AMBIENTALI

router.post('/community/project', (req, res) => {
  const { userId, title, description, category, goals, budget } = req.body || {};
  if (!userId || !title) {
    return res.status(400).json({ error: 'Campi obbligatori: userId, title', ok: false });
  }

  const projectId = `PRJ-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  projects[projectId] = {
    projectId,
    userId,
    title,
    description: description || '',
    category: category || 'environment',
    goals: goals || [],
    budget: budget || 0,
    status: 'proposed',
    collaborators: [userId],
    createdAt: new Date().toISOString(),
    milestones: []
  };

  if (users[userId]) {
    users[userId].projectsCount++;
    users[userId].points += 25;
    leaderboard[userId].points += 25;
  }

  res.status(201).json({ ok: true, project: projects[projectId] });
});

router.get('/community/projects', (req, res) => {
  const { category, status, limit } = req.query;
  let results = Object.values(projects);
  if (category) results = results.filter(p => p.category === category);
  if (status) results = results.filter(p => p.status === status);
  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ ok: true, count: results.length, results: results.slice(0, parseInt(limit) || 20) });
});

// ▸▸▸ 4. EDUCAZIONE AMBIENTALE

router.post('/education/course', (req, res) => {
  const { title, description, modules, difficulty } = req.body || {};
  const courseId = `CRS-${Date.now()}`;
  courses[courseId] = {
    courseId,
    title,
    description: description || '',
    modules: modules || [],
    difficulty: difficulty || 'beginner',
    enrolledCount: 0,
    createdAt: new Date().toISOString()
  };
  res.status(201).json({ ok: true, course: courses[courseId] });
});

router.get('/education/courses', (req, res) => {
  const results = Object.values(courses);
  res.json({ ok: true, count: results.length, courses: results });
});

// Quiz
router.post('/education/quiz/submit', (req, res) => {
  const { userId, courseId, answers } = req.body || {};
  if (!userId || !courseId || !answers) {
    return res.status(400).json({ error: 'Campi obbligatori: userId, courseId, answers', ok: false });
  }

  const score = Math.min(100, Math.floor(Math.random() * 40) + 60);
  const resultId = `QZ-${Date.now()}`;
  quizResults[resultId] = { resultId, userId, courseId, score, submittedAt: new Date().toISOString() };

  if (users[userId]) {
    users[userId].points += Math.floor(score / 10);
    leaderboard[userId].points += Math.floor(score / 10);
  }

  res.json({
    ok: true,
    resultId,
    score,
    passed: score >= 60,
    message: score >= 60 ? 'Quiz superato! 🎉' : 'Riprova per migliorare!'
  });
});

// ▸▸▸ 5. GAMIFICATION

router.get('/gamification/leaderboard', (req, res) => {
  const { limit } = req.query;
  const ranked = Object.values(leaderboard)
    .sort((a, b) => b.points - a.points)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  res.json({ ok: true, leaderboard: ranked.slice(0, parseInt(limit) || 10) });
});

// Badge system
const BADGE_DEFS = {
  'first-report': { name: 'Prima Segnalazione', description: 'Hai fatto la tua prima segnalazione ambientale', icon: '🌱' },
  'five-reports': { name: 'Sentinella', description: '5 segnalazioni completate', icon: '👁️' },
  'first-project': { name: 'Iniziativa Verde', description: 'Primo progetto proposto', icon: '🌿' },
  'quiz-master': { name: 'Eco-Studioso', description: '5 quiz superati', icon: '📚' },
  'top-contributor': { name: 'Eco-Eroe', description: 'Top 3 nella classifica', icon: '🏆' }
};

router.post('/gamification/badge/check', (req, res) => {
  const { userId } = req.body || {};
  if (!userId || !users[userId]) {
    return res.status(400).json({ error: 'Utente non valido', ok: false });
  }

  const user = users[userId];
  const newBadges = [];

  if (user.reportsCount >= 1 && !user.badges.includes('first-report')) {
    newBadges.push('first-report');
  }
  if (user.reportsCount >= 5 && !user.badges.includes('five-reports')) {
    newBadges.push('five-reports');
  }
  if (user.projectsCount >= 1 && !user.badges.includes('first-project')) {
    newBadges.push('first-project');
  }

  newBadges.forEach(b => {
    user.badges.push(b);
    badges[`${userId}_${b}`] = { userId, badge: b, ...BADGE_DEFS[b], awardedAt: new Date().toISOString() };
  });

  res.json({
    ok: true,
    newBadges: newBadges.map(b => BADGE_DEFS[b]),
    allBadges: user.badges.map(b => BADGE_DEFS[b]).filter(Boolean)
  });
});

// ▸▸▸ 6. SOCIAL - Forum

router.post('/social/forum/post', (req, res) => {
  const { userId, title, content, tags } = req.body || {};
  if (!userId || !title || !content) {
    return res.status(400).json({ error: 'Campi obbligatori: userId, title, content', ok: false });
  }

  const postId = `FPT-${Date.now()}`;
  const post = {
    postId, userId, title, content, tags: tags || [],
    createdAt: new Date().toISOString(),
    replies: [],
    upvotes: 0
  };
  forumPosts.push(post);

  if (users[userId]) {
    users[userId].points += 5;
    leaderboard[userId].points += 5;
  }

  res.status(201).json({ ok: true, post });
});

router.get('/social/forum/posts', (req, res) => {
  const { tag, limit } = req.query;
  let results = [...forumPosts];
  if (tag) results = results.filter(p => p.tags.includes(tag));
  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ ok: true, count: results.length, posts: results.slice(0, parseInt(limit) || 20) });
});

// ▸▸▸ 7. CHAT

router.post('/social/chat/message', (req, res) => {
  const { userId, groupId, content } = req.body || {};
  if (!userId || !content) {
    return res.status(400).json({ error: 'Campi obbligatori: userId, content', ok: false });
  }

  const msg = {
    messageId: `MSG-${Date.now()}`,
    userId,
    groupId: groupId || 'global',
    content,
    timestamp: new Date().toISOString()
  };
  chatMessages.push(msg);

  res.status(201).json({ ok: true, message: msg });
});

router.get('/social/chat/messages', (req, res) => {
  const { groupId, limit } = req.query;
  let results = [...chatMessages];
  if (groupId) results = results.filter(m => m.groupId === groupId);

  const maxResults = parseInt(limit) || 50;
  res.json({ ok: true, count: Math.min(results.length, maxResults), messages: results.slice(-maxResults) });
});

// ▸▸▸ 8. GRUPPI

router.post('/social/group', (req, res) => {
  const { name, description, category, adminUserId } = req.body || {};
  if (!name || !adminUserId) {
    return res.status(400).json({ error: 'Campi obbligatori: name, adminUserId', ok: false });
  }

  const groupId = `GRP-${Date.now()}`;
  groups[groupId] = {
    groupId, name, description: description || '', category: category || 'general',
    adminUserId, members: [adminUserId],
    createdAt: new Date().toISOString()
  };

  res.status(201).json({ ok: true, group: groups[groupId] });
});

router.post('/social/group/:groupId/join', (req, res) => {
  const group = groups[req.params.groupId];
  if (!group) return res.status(404).json({ error: 'Gruppo non trovato', ok: false });

  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId obbligatorio', ok: false });
  if (!group.members.includes(userId)) group.members.push(userId);

  res.json({ ok: true, groupId: group.groupId, memberCount: group.members.length });
});

// ▸▸▸ STATS RIEPILOGATIVE

router.get('/community/stats', (req, res) => {
  res.json({
    ok: true,
    community: {
      users: Object.keys(users).length,
      reports: Object.keys(reports).length,
      projects: Object.keys(projects).length,
      courses: Object.keys(courses).length,
      forumPosts: forumPosts.length,
      chatMessages: chatMessages.length,
      groups: Object.keys(groups).length
    },
    education: {
      courses: Object.keys(courses).length,
      quizzesTaken: Object.keys(quizResults).length,
      avgScore: Object.keys(quizResults).length > 0
        ? Math.round(Object.values(quizResults).reduce((s, q) => s + q.score, 0) / Object.keys(quizResults).length)
        : 0
    },
    topContributors: Object.values(leaderboard)
      .sort((a, b) => b.points - a.points)
      .slice(0, 3)
  });
});

module.exports = router;
