# Student Management System

## Tech Stack

- React + Vite + Bootstrap
- Express + TypeScript + Prisma
- PostgreSQL

---

# Clone Project

```bash
git clone <your-repository-url>

cd project-root
```

---

# Backend Setup

```bash
cd backend

npm install
```

Create `.env` file:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME"
PORT=3000
```

Run prisma migration:

```bash
npx prisma generate

npx prisma migrate dev
```

Run seeder:

```bash
npm run seed
```

Build backend:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

Backend runs on:

```bash
http://localhost:3000
```

---

# Frontend Setup

Open new terminal:

```bash
cd frontend

npm install
```

Create `.env` file:

```env
VITE_BASE_URL=http://localhost:3000
```

Start frontend:

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```
