# 🛡️ SOC AI Assistant Platform

Internal Security Operations Center AI Assistant for automated threat analysis and incident reporting.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB (Atlas) |
| AI | LLaMA 2 via HuggingFace Inference API |
| Security | JWT + bcrypt + SHA-256 |
| Deployment | GitHub + Vercel |

## Features

- ✅ User registration with identity document upload
- ✅ Admin approval workflow
- ✅ Role-Based Access Control (Admin / SOC Manager / SOC Analyst)
- ✅ AI-powered security log analysis
- ✅ MITRE ATT&CK technique identification
- ✅ Structured incident report generation
- ✅ Audit logging for all sensitive actions
- ✅ Account lockout after failed login attempts
- ✅ File integrity with SHA-256 hashing

---

## Deployment (GitHub + Vercel)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: SOC AI Assistant"
git remote add origin https://github.com/YOUR_USERNAME/soc-ai-assistant.git
git push -u origin main
```

### Step 2: Set Up MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist `0.0.0.0/0` for Vercel access
3. Copy the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/soc_ai_assistant`)

### Step 3: Deploy Backend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import the repo, set **Root Directory** to `backend`
3. **Framework Preset**: Other
4. Add **Environment Variables**:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://...` (your Atlas connection string) |
| `JWT_SECRET` | A strong random string (32+ chars) |
| `JWT_EXPIRES_IN` | `8h` |
| `HUGGINGFACE_API_TOKEN` | Your HuggingFace token (optional) |
| `HUGGINGFACE_MODEL` | `meta-llama/Llama-2-13b-chat-hf` |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` |

5. Deploy — note the backend URL (e.g. `https://soc-backend.vercel.app`)

### Step 4: Deploy Frontend on Vercel

1. **New Project** → Import same repo
2. Set **Root Directory** to `frontend`
3. **Framework Preset**: Vite
4. Add **Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://soc-backend.vercel.app/api` |

5. Deploy!

### Step 5: Create Admin User

After your first registration, run this in MongoDB Atlas → Data Explorer → `users` collection:

```json
{ "$set": { "role": "admin", "status": "approved" } }
```

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### Backend
```bash
cd backend
npm install
npm run dev
# → http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Project Structure

```
├── backend/
│   ├── server.js              # Express entry point
│   ├── vercel.json            # Vercel serverless config
│   ├── config/                # DB + env config
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API route handlers
│   ├── services/              # Business logic layer
│   ├── middleware/             # Auth, RBAC, audit, upload
│   ├── ai_engine/             # HuggingFace AI integration
│   └── utils/                 # SHA-256, validators
├── frontend/
│   ├── vercel.json            # Vercel SPA routing
│   ├── src/
│   │   ├── pages/             # Login, Register, Dashboard, Admin, Analysis, Reports
│   │   ├── components/        # ProtectedRoute, Sidebar
│   │   ├── context/           # AuthContext (JWT state)
│   │   └── services/          # Axios API client
├── docker-compose.yml          # Optional Docker setup
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register + upload ID doc |
| POST | `/api/auth/login` | No | Login, get JWT |
| GET | `/api/auth/me` | Yes | Current user profile |
| GET | `/api/admin/pending-users` | Admin | List pending registrations |
| POST | `/api/admin/approve/:id` | Admin | Approve user |
| POST | `/api/admin/reject/:id` | Admin | Reject user |
| POST | `/api/admin/assign-role/:id` | Admin | Change user role |
| POST | `/api/admin/disable/:id` | Admin | Disable account |
| GET | `/api/admin/audit-logs` | Admin | View audit trail |
| POST | `/api/analysis/upload-log` | SOC+ | Submit log for AI analysis |
| GET | `/api/analysis/history` | SOC+ | Analysis history |
| POST | `/api/reports/generate/:id` | SOC+ | Generate incident report |
| GET | `/api/reports` | SOC+ | List reports |
| GET | `/api/reports/:id` | SOC+ | View report detail |

---

## Security

- 🔒 JWT tokens with configurable expiry
- 🔑 Passwords hashed with bcrypt (12 rounds)
- 📁 File integrity verified with SHA-256
- 🚫 Account lockout after 5 failed logins (30 min)
- 🛡️ Helmet security headers
- ⏱️ Rate limiting on all endpoints
- 👤 Role-based access control
- 📋 Full audit trail

---

## License

Internal use only. Not for public distribution.
