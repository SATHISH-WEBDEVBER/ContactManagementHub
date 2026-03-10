# 🚀 Nexus CMS — Contact Management System

A full-stack Contact Management System with authentication, user-scoped contacts, and a secure admin panel.

---

## 🧱 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Password | **bcryptjs** with salt rounds (12) |
| Security | Helmet, express-rate-limit, CORS |

### 🔐 Security: Password Hashing
- Uses **bcryptjs** — a battle-tested bcrypt implementation for Node.js
- **Salt rounds: 12** (configured via `BCRYPT_SALT_ROUNDS` env variable)
- bcryptjs automatically generates a **unique random salt per user** and embeds it in the hash
- Passwords are **never stored or returned in plain text**
- The `password` field is `select: false` in Mongoose — never returned in API responses

---

## 📁 Project Structure

```
ContactManagementSystem/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Business logic (auth, contacts, admin)
│   ├── middleware/       # JWT auth, admin guards
│   ├── models/          # Mongoose schemas (User, Contact)
│   ├── routes/          # API route definitions
│   ├── scripts/         # Admin seeder
│   └── server.js        # Express app entry
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Contact/ # ContactCard, ContactForm
│       │   ├── Layout/  # Sidebar
│       │   └── UI/      # ProtectedRoute
│       ├── context/     # AuthContext (global auth state)
│       ├── pages/       # Login, Signup, Dashboard, Contacts, Admin
│       └── services/    # Axios API layer
└── README.md
```

---

## ⚙️ Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm install
npm run seed:admin    # Creates first admin account
npm run dev           # Start dev server (port 5000)
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev           # Start Vite dev server (port 5173)
```

---

## 🔑 Environment Variables (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/contact_management
JWT_SECRET=change_this_to_a_long_random_string_min_32_chars
JWT_EXPIRES_IN=7d
ADMIN_SECRET_KEY=another_secret_key_for_admin_access
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=YourSecurePassword123
BCRYPT_SALT_ROUNDS=12
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 🔒 Security Architecture

### User Auth (3-layer)
1. **Rate limiting** — 10 auth attempts per 15 minutes
2. **JWT token** — 7-day expiry, verified on every request
3. **bcrypt password** — 12 salt rounds, one-way hash

### Admin Auth (5-layer)
1. **Obscured route** — `/api/sys-panel` (not `/api/admin`)
2. **Rate limiting** — 30 requests per 15 min
3. **Valid JWT token** — must be logged in
4. **Admin role** — `role === 'admin'` in database
5. **X-Admin-Secret header** — must match `ADMIN_SECRET_KEY` env var

### Account Protection
- **5 failed logins → 30-minute account lock**
- Passwords have `select: false` — never exposed in queries
- Admin routes return generic 404 for unauthorized access (no information leakage)
- Admin secret stored in `sessionStorage` only (cleared on tab close)

---

## 🌐 API Endpoints

### Auth — `/api/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Sign in |
| GET | `/profile` | Get own profile |
| PUT | `/profile` | Update profile |
| PUT | `/change-password` | Change password |

### Contacts — `/api/contacts` (requires JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Get all contacts (paginated, searchable) |
| POST | `/` | Create contact |
| GET | `/:id` | Get single contact |
| PUT | `/:id` | Update contact |
| DELETE | `/:id` | Delete contact |
| PATCH | `/:id/favorite` | Toggle favorite |
| GET | `/stats` | Get contact statistics |

### Admin — `/api/sys-panel` (JWT + admin role + secret header)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats` | System statistics |
| GET | `/users` | All users |
| GET | `/users/:id` | User details |
| PATCH | `/users/:id/toggle-status` | Activate/deactivate user |
| DELETE | `/users/:id` | Delete user + contacts |

---

## 🎨 UI Design

- **Theme**: Deep navy/midnight blue with electric cyan accents
- **Font**: Syne (display) + DM Sans (body) + JetBrains Mono
- **Animations**: Framer Motion page transitions, hover states, staggered lists
- **Glass morphism**: Semi-transparent panels with backdrop blur
- **Responsive**: Mobile-first with slide-in drawer sidebar

---

## 👤 Default Admin

After running `npm run seed:admin`:
- Email: `admin@cms.com` (or `ADMIN_EMAIL` from .env)
- Password: `Admin@123456` (or `ADMIN_PASSWORD` from .env)
- **⚠️ Change immediately after first login!**
- Access admin panel at: `/admin`
"# ContactManagementHub" 
