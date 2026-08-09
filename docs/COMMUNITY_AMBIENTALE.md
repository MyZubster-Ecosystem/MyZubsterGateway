# Futura Community Ambientale API

This document describes the mock endpoints implemented for the "Community Ambientale" (Issue #1030).

## Endpoints

### 1. Community
- `GET /api/futura/community/profiles` - List user profiles
- `POST /api/futura/community/profiles` - Create a new user profile
- `GET /api/futura/community/reports` - List environmental reports
- `POST /api/futura/community/reports` - Create a new report
- `GET /api/futura/community/projects` - List environmental projects

### 2. Education
- `GET /api/futura/community/courses` - List educational courses
- `GET /api/futura/community/quizzes` - List quizzes
- `GET /api/futura/community/videos` - List educational videos

### 3. Gamification
- `GET /api/futura/community/leaderboard` - Get points leaderboard
- `POST /api/futura/community/points/add` - Add points to a user

### 4. Social
- `GET /api/futura/community/forum` - List forum posts
- `GET /api/futura/community/groups` - List community groups
