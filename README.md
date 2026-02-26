## Backend

This backend is a Node.js + TypeScript API built with **Express** and **Prisma**.  
It provides authentication, email verification, refresh tokens, and role-based user management for the university platform.

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
git clone https://github.com/MohamedSaid16/university-platform.git
cd university-platform/backend
npm install
```

---

### Environment Variables

Create a `.env` file in `/backend`:

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
