**Pawcare Welfare**

*MERN-stack application for managing pet rescue, adoption, and veterinary care.*

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [Environment Variables](#environment-variables)
7. [Database Seeding](#database-seeding)
8. [Running in Development](#running-in-development)
9. [Building for Production](#building-for-production)
10. [API Reference](#api-reference)
11. [Client Routes & Usage](#client-routes--usage)
12. [Scripts](#scripts)
13. [Contributing](#contributing)
14. [License](#license)

---

## Project Overview

Pawcare Welfare is a full-stack web application designed to:

* Allow volunteers and vets to report rescued animals.
* Track medical treatment records.
* Enable registered users to submit adoption requests.
* Provide role-based access (user, vet, admin).
* Offer a responsive React front-end with live data fetching via React Query.

---

## Tech Stack

* **Backend**: Node.js, Express, TypeScript, Mongoose (MongoDB ORM)
* **Frontend**: React (with Vite), TypeScript, React Query, Wouter (lightweight router), Tailwind CSS
* **Database**: MongoDB
* **ORM/Migrations**: Drizzle-Kit (for optional PostgreSQL migrations/schema)
* **Bundler**: Vite (client) & esbuild (server bundle)
* **Authentication**: Passport.js (local strategy) + express-session
* **Utilities**: Zod (schema validation), nanoid, dotenv

---

## Repository Structure

```
pawcare-welfare/
├── client/                # React front-end (Vite)
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                # Express back-end
│   ├── auth.ts            # Passport setup & auth routes
│   ├── db.ts              # MongoDB connection
│   ├── index.ts           # App entry (dev+prod)
│   ├── routes.ts          # All API endpoints
│   ├── models.ts          # Mongoose schemas
│   ├── mongoStorage.ts    # Data-access abstraction
│   ├── vite.ts            # Dev integration & static serve
│   └── scripts/updateAnimals.ts
├── shared/                # Shared Zod/Drizzle schemas & types
│   └── schema.ts
├── static/                # Static HTML (for specific demos)
├── drizzle.config.ts      # Drizzle-Kit config (Postgres)
├── tailwind.config.ts
├── vite.config.ts         # Vite root config (for SSR/static)
├── package.json           # Root scripts & deps
└── tsconfig.json
```

---

## Prerequisites

* **Node.js** v16 or higher
* **npm** (v8+) or **yarn**
* **MongoDB** instance (local or hosted)

---

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/pawcare-welfare.git
   cd pawcare-welfare
   ```

2. **Install root + server deps**

   ```bash
   npm install
   ```

3. **Install client deps**

   ```bash
   cd client
   npm install
   cd ..
   ```

---

## Environment Variables

Create a `.env` file in the project root:

```ini
# .env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/pawcare?retryWrites=true&w=majority
PORT=3000          # (optional; defaults to 3000)
SESSION_SECRET=⁠“aStr0ngSess!onSecret”  # for express-session
```

---

## Database Seeding

An initial set of animal records can be loaded with the provided script:

```bash
npm run update-animals
```

*(This runs `server/scripts/updateAnimals.ts` and populates the `animals` collection.)*

---

## Running in Development

In dev mode, Express will spin up a Vite middleware for your React front-end:

```bash
npm run dev
```

* **Backend & Frontend** run together on `http://localhost:3000`
* Live-reload enabled for both client and server code

---

## Building for Production

1. **Compile & bundle**

   ```bash
   npm run build
   ```

   * Builds React assets (`client/dist/`) via Vite
   * Bundles `server/index.ts` → `dist/index.js` via esbuild

2. **Start server**

   ```bash
   npm start
   ```

   Express serves static files from `client/dist/` on the configured `PORT`.

---

## API Reference

All endpoints are prefixed with `/api`.

| Method | Path                          | Auth          | Description                               |
| ------ | ----------------------------- | ------------- | ----------------------------------------- |
| POST   | `/api/auth/register`          | Public        | Create new user (role defaults to “user”) |
| POST   | `/api/auth/login`             | Public        | Authenticate and establish session        |
| POST   | `/api/auth/logout`            | Authenticated | Log out current session                   |
| GET    | `/api/user`                   | Authenticated | Get current user profile (no password)    |
| GET    | `/api/animals`                | Public        | List all animals                          |
| GET    | `/api/animals/:id`            | Public        | Get single animal by ID                   |
| POST   | `/api/animals`                | Admin/Vet     | Add a new animal record                   |
| POST   | `/api/reports`                | Authenticated | Submit a rescue report                    |
| GET    | `/api/animals/:id/reports`    | Authenticated | Get reports for specific animal           |
| POST   | `/api/adoptions`              | Authenticated | Submit adoption request                   |
| GET    | `/api/user/adoptions`         | Authenticated | List current user’s adoption requests     |
| POST   | `/api/treatments`             | Vet/Admin     | Log new treatment record                  |
| GET    | `/api/animals/:id/treatments` | Authenticated | Get treatment history for an animal       |

---

## Client Routes & Usage

* **`/`** – Home / Animal gallery
* **`/animal/:id`** – Animal detail, reports & treatments
* **`/auth/login`** – Login form
* **`/auth/register`** – User registration
* **`/adoptions`** – Submit & view adoption requests
* **Role-specific views** show extra controls for vets/admins (e.g., “Add Animal”, “Log Treatment”).

---

## Scripts

All commands are run from the project root:

* **`npm run dev`**: Development mode (Express + Vite middleware)
* **`npm run build`**: Production build (client + server)
* **`npm start`**: Start production server from `dist/`
* **`npm run check`**: Run TypeScript compiler
* **`npm run db:push`**: Push Drizzle schema to Postgres (optional)
* **`npm run update-animals`**: Seed MongoDB with sample animals
