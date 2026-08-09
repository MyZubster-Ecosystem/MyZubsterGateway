const express = require('express');
const router = express.Router();

// Mock Data
let users = [{ id: 1, name: 'Alice', points: 120, badges: ['Eco-Warrior'] }];
let reports = [{ id: 1, user: 1, type: 'pollution', location: 'Park' }];
let projects = [{ id: 1, title: 'Clean up the beach', participants: [1] }];
let courses = [{ id: 1, title: 'Recycling 101', duration: '1h' }];
let quizzes = [{ id: 1, courseId: 1, questions: 10 }];
let videos = [{ id: 1, url: 'https://video.myzubster.tld/eco' }];
let forumPosts = [{ id: 1, user: 1, topic: 'Composting' }];
let groups = [{ id: 1, name: 'Local Cleaners', members: [1] }];
let chats = [{ id: 1, user: 1, message: 'Hello eco friends!', timestamp: new Date().toISOString() }];

// --- Community ---
router.get('/profiles', (req, res) => res.json(users));
router.post('/profiles', (req, res) => {
    const newUser = { id: users.length + 1, ...req.body, points: 0, badges: [] };
    users.push(newUser);
    res.json(newUser);
});

router.get('/reports', (req, res) => res.json(reports));
router.post('/reports', (req, res) => {
    const newReport = { id: reports.length + 1, ...req.body };
    reports.push(newReport);
    res.json(newReport);
});

router.get('/projects', (req, res) => res.json(projects));

// --- Education ---
router.get('/courses', (req, res) => res.json(courses));
router.get('/quizzes', (req, res) => res.json(quizzes));
router.get('/videos', (req, res) => res.json(videos));

// --- Gamification ---
router.get('/leaderboard', (req, res) => {
    const sorted = [...users].sort((a, b) => b.points - a.points);
    res.json(sorted);
});
router.post('/points/add', (req, res) => {
    const { userId, points } = req.body;
    const user = users.find(u => u.id === userId);
    if (user) {
        user.points += points;
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});
router.post('/badges/add', (req, res) => {
    const { userId, badge } = req.body;
    const user = users.find(u => u.id === userId);
    if (user) {
        user.badges.push(badge);
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// --- Social ---
router.get('/forum', (req, res) => res.json(forumPosts));
router.get('/groups', (req, res) => res.json(groups));
router.get('/chat', (req, res) => res.json(chats));
router.post('/chat', (req, res) => {
    const newChat = { id: chats.length + 1, timestamp: new Date().toISOString(), ...req.body };
    chats.push(newChat);
    res.json(newChat);
});

module.exports = router;
