## Backend

This backend is a Node.js + TypeScript API built with **Express** and **Prisma**.  
It provides authentication, email verification, refresh tokens, and role-based user management for the JWT verification platform.

### Tech Stack
- **Node.js** + **TypeScript**
- **Express**
- **PostgreSQL**
- **Prisma ORM**
- **JWT Authentication**
- **bcrypt** for password hashing

---

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** v15+
- **npm** or **yarn**

---

### Installation

```bash
git clone https://github.com/MohamedSaid16/JWT_verification.git
cd university-platform && cd backend
npm install
```

---

### Additional Dependencies (Manual Install)

```bash
# Prisma ORM
npm install @prisma/client@6 prisma@6 --save-dev

# Express and middleware
npm install express cors cookie-parser

# Authentication
npm install bcryptjs jsonwebtoken

# Validation
npm install express-validator

# Environment variables
npm install dotenv

# Rate limiting
npm install express-rate-limit

# Email
npm install nodemailer

# Time utility (ms)
npm install ms

# TypeScript
npm install -D typescript ts-node nodemon

# TypeScript types
npm install -D @types/node
npm install -D @types/express
npm install -D @types/cors
npm install -D @types/cookie-parser
npm install -D @types/bcryptjs
npm install -D @types/jsonwebtoken
npm install -D @types/ms
npm install -D @types/nodemailer
npm install -D @types/express-rate-limit

# Additional tools
npm install -D cross-env
```

---

### Environment Variables

Create a `.env` file in the project root:

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/university-db?schema=public
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
APP_BASE_URL=http://localhost:5000
BCRYPT_ROUNDS=10
```

---

### Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

---

### Run the Server (Dev)

```bash
npm run dev
```

Server will start at:
```
http://localhost:5000
```

---

### Main Features
- User registration & login
- Email verification
- Refresh token authentication
- Account lock on repeated failed login attempts
- Role-based access (Student, Teacher, Admin, etc.)

---

### Scripts
- `npm run dev` → Start dev server with nodemon
- `npm run build` → Compile TypeScript
- `npm run start` → Run compiled server
