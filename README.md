# 🐾 Pawcare

**Pawcare** is a full‑stack web application built for animal shelters and pet adoption agencies to manage animal profiles, rescue reports, treatment records, and adoption requests. It features user authentication, a responsive React + Vite frontend, and an Express + MongoDB backend with Drizzle ORM support.

---

## 📋 Table of Contents

1. [Features](#-features)  
2. [Tech Stack](#-tech-stack)  
3. [Project Structure](#-project-structure)  
4. [Installation](#-installation)  
5. [Environment Variables](#-environment-variables)  
6. [Available Scripts](#-available-scripts)  
7. [Usage](#-usage)  
8. [Database Migrations & Seeding](#-database-migrations--seeding)  
9. [Deployment](#-deployment)  
10. [License](#-license)  

---

## 🚀 Features

- **User Authentication**  
  - Sign up, log in, log out  
  - Session management with `express-session` + MongoDB store  

- **Animal Management (CRUD)**  
  - Create, read, update, and delete animal profiles  
  - Photo uploads & client‑side previews  

- **Rescue Reports & Treatment Records**  
  - Record rescues, assign medical treatments, view history  

- **Adoption Requests**  
  - Users can apply to adopt; shelter admins can review & approve  

- **Modern UI/UX**  
  - React + Vite frontend with TypeScript  
  - Tailwind CSS & Radix UI for styling & accessibility  

- **Robust API**  
  - Express routes, structured with Drizzle ORM schema  

- **Scripts & Automation**  
  - `update-animals` script to bulk‑import or refresh data  

- **Responsive Design**  
  - Mobile‑first layouts, accessible components  

---

## 🏗 Tech Stack

| Layer             | Technology                                                       |
| ----------------- | ---------------------------------------------------------------- |
| **Frontend**      | Vite, React, TypeScript, Tailwind CSS, Radix UI, React Hook Form |
| **Backend**       | Node.js, Express, TypeScript, Drizzle ORM, Mongoose (MongoDB)    |
| **Authentication**| Passport.js (local strategy), express-session, Memorystore       |
| **Bundling**      | Vite, esbuild                                                    |
| **Styling**       | Tailwind CSS, PostCSS                                            |
| **Deployment**    | Vercel / custom Node server                                      |

---

## 📁 Project Structure

```bash
myproj-main/
├─ client/                  # React + Vite frontend
│  ├─ src/
│  │  ├─ components/        # UI components (buttons, cards, forms)
│  │  ├─ pages/             # Route pages (animals, adoption, auth)
│  │  └─ styles/            # Tailwind & theme config
│  └─ index.html
├─ server/                  # Express + TypeScript backend
│  ├─ scripts/
│  │  └─ updateAnimals.ts   # Bulk‑import / refresh data script
│  ├─ models.ts             # Mongoose & Drizzle ORM schemas
│  ├─ routes/               # API route modules
│  ├─ auth.ts               # Passport strategies & session config
│  ├─ db.ts                 # MongoDB connection logic
│  ├─ mongoStorage.ts       # express‑session Mongo store adapter
│  └─ index.ts              # App entrypoint & Vite integration
├─ shared/                  # Shared types & schemas (client ↔ server)
│  └─ schema.ts
├─ static/                  # Static assets & prototypes
├─ package.json             # Root scripts & dependencies
├─ tailwind.config.ts       # Tailwind CSS configuration
├─ drizzle.config.ts        # Drizzle ORM configuration
└─ vercel.json              # (Optional) Vercel deployment config


---

🔧 Installation

1. Clone the repo

git clone https://github.com/yourusername/pawcare.git
cd pawcare


2. Install dependencies

npm install
# If treating client/ as separate:
cd client && npm install


3. Set up environment

cp .env.example .env
# Edit `.env` with your credentials (see Environment Variables)


4. Start development server

npm run dev

Frontend: http://localhost:5173

Backend (with HMR): http://localhost:3000





---

🛠 Environment Variables

Create a .env file at the project root:

# MongoDB
MONGODB_URI=<your-mongodb-connection-string>

# Session / Auth
SESSION_SECRET=<a-secure-random-string>

# (Optional) Drizzle / Neon
DATABASE_URL=<your-neon-db-connection-string>


---

📜 Available Scripts

Script	Command	Description

Development	npm run dev	Start backend (Express + Vite middleware) in dev mode
Build	npm run build	Build frontend (Vite) & bundle backend (esbuild)
Start (prod)	npm run start	Run production server (dist/index.js)
Type‑Check	npm run check	Run TypeScript compiler
DB Migrations	npm run db:push	Apply Drizzle ORM migrations
Seed / Refresh Data	npm run update-animals	Execute server/scripts/updateAnimals.ts to import or refresh data



---

🚦 Usage

1. Sign Up / Log In

Create an account or log in as an admin to access management features.



2. Manage Animals

Go to Animals → Create to add a new profile.

Click an animal card to view details.

Edit or delete from the detail page.



3. Rescue & Treatment

From an animal’s detail view, add rescue reports or treatment records.



4. Adoption Requests

Browse available animals and submit adoption requests.

Admins review and approve/deny from the Adoption Requests dashboard.





---

🗄 Database Migrations & Seeding

Drizzle ORM migrations

npm run db:push

Scripted data import

npm run update-animals



---

🚀 Deployment

1. Build your app

npm run build


2. Configure production environment variables

Set them on your host platform (e.g., Vercel, Heroku, AWS).



3. Start the server

npm run start



> Tip: If deploying to Vercel, vercel.json is pre‑configured for serverless functions.




---

📄 License

Distributed under the MIT License. See LICENSE for details.
