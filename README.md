# ⚡ QuizAI — MERN Stack AI Quiz Generator

A full-stack MERN application where students register, log in, and take AI-generated 20-question MCQ tests via n8n webhook automation.

---

## 📁 Folder Structure

```
mern-quiz/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT auth middleware
│   ├── models/
│   │   ├── User.js              # Student schema (bcrypt, auto studentId)
│   │   └── Quiz.js              # Quiz schema (questions, attempts, score)
│   ├── routes/
│   │   ├── auth.js              # POST /register, POST /login, GET /me
│   │   └── quiz.js              # POST /generate, POST /:id/submit, GET /history
│   ├── .env.example             # Environment variable template
│   ├── package.json
│   └── server.js                # Express entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── api/
        │   └── index.js         # All Axios API calls
        ├── components/
        │   ├── Loader.js        # Loading spinner
        │   └── Navbar.js        # Navigation bar
        ├── context/
        │   └── AuthContext.js   # React auth state (JWT, user)
        ├── pages/
        │   ├── Register.js      # Student registration page
        │   ├── Login.js         # Login page
        │   ├── Dashboard.js     # Topic entry + quiz history
        │   ├── QuizPage.js      # 20-question MCQ interface
        │   └── ResultPage.js    # Score display + answer review
        ├── App.js               # Routes & PrivateRoute guard
        ├── index.css            # Design system + global styles
        └── index.js             # React entry point
```

---

## 🚀 Environment Setup

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- n8n instance (self-hosted or cloud) — for AI quiz generation

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your values (see below)
npm install
npm run dev      # development with nodemon
# or
npm start        # production
```

**`.env` configuration:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/quizdb
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/quiz-generator
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start        # runs on http://localhost:3000
```

**Optional `.env` for frontend:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```
> If using the `proxy` in package.json, you can omit this.

---

## 🤖 n8n Webhook Setup

### What n8n Should Do
The backend calls your n8n webhook URL with:
```json
{
  "topic": "World War II",
  "count": 20,
  "studentId": "STU0001",
  "userId": "mongo_object_id"
}
```

### Expected n8n Response
n8n must respond with:
```json
{
  "questions": [
    {
      "question": "What year did World War II end?",
      "options": {
        "A": "1943",
        "B": "1944",
        "C": "1945",
        "D": "1946"
      },
      "correctAnswer": "C",
      "explanation": "WWII ended in 1945 with Germany's surrender in May and Japan's in September."
    }
    // ... 19 more questions
  ]
}
```

### n8n Workflow Steps
1. **Webhook Trigger** — Receive POST request
2. **AI Node** (OpenAI/Anthropic) — Prompt:
   ```
   Generate exactly 20 multiple choice questions about: {{ $json.topic }}
   
   Return ONLY valid JSON in this exact format:
   {
     "questions": [
       {
         "question": "...",
         "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
         "correctAnswer": "A|B|C|D",
         "explanation": "Brief explanation of the correct answer"
       }
     ]
   }
   
   Rules:
   - All 4 options must be plausible
   - Correct answer must be one of A, B, C, or D
   - Questions must be factually accurate
   - Vary difficulty (mix easy, medium, hard)
   ```
3. **Respond to Webhook** — Return the AI output as JSON

> **Note:** If n8n is unavailable, the backend automatically falls back to mock questions so you can test the UI.

---

## 📡 API Reference

### Auth Endpoints
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new student |
| POST | `/api/auth/login` | ❌ | Login & get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |

### Quiz Endpoints
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/quiz/generate` | ✅ | Generate AI quiz from topic |
| POST | `/api/quiz/:id/submit` | ✅ | Submit answers & get score |
| GET | `/api/quiz/history` | ✅ | Get all user quiz attempts |
| GET | `/api/quiz/:id` | ✅ | Get specific quiz result |

### Request Examples

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@test.com","password":"secret123"}'
```

**Generate Quiz:**
```bash
curl -X POST http://localhost:5000/api/quiz/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"topic":"Machine Learning"}'
```

**Submit Answers:**
```bash
curl -X POST http://localhost:5000/api/quiz/QUIZ_ID/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"answers":{"0":"A","1":"C","2":"B"}}'
```

---

## 🏗️ MongoDB Schemas

### User Schema
- `name`, `email` (unique), `password` (bcrypt hashed)
- `studentId` (auto-generated: STU0001, STU0002...)
- JWT token generated on register/login (7 day expiry)

### Quiz Schema
- `user` (ref to User), `topic`, `questions[]`, `attempts[]`
- `score`, `status` (generated | in-progress | completed)
- `timeTaken` (seconds), `percentage` (virtual)
- Correct answers are stored in DB but never sent to client during active quiz

---

## 🔒 Security Features
- Passwords hashed with bcryptjs (12 rounds)
- JWT authentication (7-day expiry)
- Correct answers hidden from API response during quiz
- MongoDB Mongoose validation on all schemas
- CORS configured for specific origin

---

## 🎨 UI Features
- Dark theme with purple/cyan accent system
- Syne + DM Sans typography pairing
- Animated auth pages with visual split layout
- Live timer during quiz
- Question navigator sidebar with answered/unanswered tracking
- Animated score ring on results
- Full answer review with explanations
- Grade labels (Excellent / Great / Good / Fair / Need Practice)

---

## 📦 Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| HTTP Client | Axios |
| Backend | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| AI Integration | n8n webhook (OpenAI/Anthropic) |
| Styling | Custom CSS (no UI library) |
