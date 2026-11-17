# InkAI - AI-Powered Blogging Platform

A full-stack MERN blogging platform with AI content generation

## Features
- **User Authentication** (JWT-based register/login)
- **Markdown Editor** with live preview
- **AI Writing Tools** (generate outlines, full posts, improve writing, auto-SEO)
- **Blog Feed** with search, filtering by tags/categories, pagination
- **Post Management** (create, edit, publish, draft, delete)
- **Social Features** (likes, bookmarks, comments, follow authors)
- **Author Dashboard** with post stats
- **Analytics** (views, likes, top posts, category breakdown, tag cloud)
- **User Profiles** with follower system
- **SEO Optimization** (meta titles, descriptions, keywords via AI)

## Tech Stack
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Anthropic Claude API
- **Frontend**: React.js, React Router v6, Marked.js (Markdown), Recharts
- **Deployment**: Render.com

## Local Development

### Backend
```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, ANTHROPIC_API_KEY
npm install
npm run dev  # runs on port 5001
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5001
npm install
npm start
```

## AI Features
The AI features require an `ANTHROPIC_API_KEY`. Get one at https://console.anthropic.com

- **Generate Outline**: Enter any topic → get a structured blog outline with title, tags, and sections
- **Write Full Post**: Converts outline into a complete markdown blog post
- **Improve Writing**: Refines existing content for clarity and engagement
- **Auto SEO**: Generates meta title, meta description, and keywords

## Project Structure
```
blogging-platform/
├── backend/
│   ├── models/     (User, Post)
│   ├── routes/     (auth, posts, ai, analytics, users)
│   ├── middleware/ (JWT auth)
│   └── server.js
├── frontend/
│   └── src/
│       ├── context/    (AuthContext)
│       ├── components/ (Navbar)
│       └── pages/      (Home, PostDetail, Editor, Dashboard, Analytics, UserProfile, AuthPage)
└── render.yaml
```
