# TrustBite

**TrustBite** is a hyperlocal mess and tiffin discovery platform designed for college students living away from home.
It helps students find reliable meal services using hygiene scores, real reviews, and AI-based recommendations.

---

## Problem

College students in towns like Shirpur often struggle to find trustworthy mess or tiffin services.
Information about hygiene, pricing, and food quality is scattered and based on word-of-mouth.

Students waste time and money trying unreliable options.

---

## Solution

TrustBite provides a centralized platform where students can:

* Discover nearby mess and tiffin services
* View admin-verified hygiene scores
* Read real student reviews
* Get AI-based personalized recommendations

**Goal:**
A student should be able to find a reliable mess in under **5 minutes**.

---

## Core Features

### Student

* Register and login
* Browse nearby mess listings
* View hygiene scores and ratings
* Submit reviews
* Save favourite messes
* Get AI-based recommendations

### Mess Owner

* Register as a service provider
* Create and manage mess listings
* Update menu and pricing
* Upload photos

### Admin

* Approve or reject mess listings
* Assign hygiene scores
* Moderate reviews
* Manage users

### AI Recommendation

* Content-based recommendation system
* Uses mess attributes and student preferences
* Cosine similarity–based ranking
* Popularity-based fallback for new users

---

## Tech Stack

### Frontend

* React + Vite
* Tailwind CSS
* shadcn/ui
* React Hook Form + Zod
* Zustand (state management)
* Hosted on **Vercel**

### Backend

* Python 3.11
* FastAPI
* SQLAlchemy
* Alembic migrations
* JWT authentication
* Hosted on **Railway**

### Database

* PostgreSQL (Railway managed)

### AI Module

* Scikit-learn
* Pandas
* NumPy
* Content-based recommendation engine

### DevOps

* GitHub for version control
* GitHub Actions for CI
* Vercel and Railway for automatic deployments

---

## System Architecture

TrustBite follows a **3-tier monolithic architecture**:

1. **Frontend (React SPA)**

   * Hosted on Vercel
   * Communicates with backend via REST APIs

2. **Backend (FastAPI)**

   * Handles authentication, business logic, and APIs
   * Integrates AI recommendation module

3. **Database (PostgreSQL)**

   * Stores users, messes, reviews, menus, and favourites

---

## Core User Flow

1. Mess owner registers and creates a listing.
2. Admin reviews and assigns a hygiene score.
3. Student logs in.
4. Student browses approved messes.
5. Student reads reviews and ratings.
6. AI recommends top messes.
7. Student chooses a mess.

---

## Project Structure

### Backend

```
backend/
├── main.py
├── config.py
├── database.py
├── models/
├── schemas/
├── routers/
├── services/
├── ai/
├── migrations/
└── requirements.txt
```

### Frontend

```
frontend/
├── src/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   ├── store/
│   ├── lib/
│   └── styles/
├── index.html
├── vite.config.js
└── tailwind.config.js
```

---

## Local Development Setup

### Prerequisites

* Node.js 18+
* Python 3.11+
* PostgreSQL

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/trustbite.git
cd trustbite
```

---

### 2. Backend Setup

```bash
cd backend

python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows

pip install -r requirements.txt
```

Create a `.env` file:

```
DATABASE_URL=postgresql://user:password@localhost:5432/trustbite
JWT_SECRET_KEY=your-secret-key
```

Run migrations:

```bash
alembic upgrade head
```

Start backend:

```bash
uvicorn main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

API docs:

```
http://localhost:8000/docs
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```
VITE_API_URL=http://localhost:8000/api/v1
```

Start frontend:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## Deployment

### Frontend

* Hosted on **Vercel**
* Auto-deploy on push to `main`

### Backend

* Hosted on **Railway**
* Auto-deploy on push to `main`

### Database

* PostgreSQL via Railway

---

## Environment Variables

### Backend

```
DATABASE_URL=
JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
CORS_ORIGINS=
CLOUDINARY_URL=
```

### Frontend

```
VITE_API_URL=
```

---

## Team

| Member    | Role                |
| --------- | ------------------- |
| Dipak     | Tech Lead + Backend |
| Prachi    | Frontend Lead       |
| Bhushan   | AI Engineer         |
| Aakanksha | Admin UI + QA       |

---

## Project Goals

* Production-style architecture
* Fully deployed public system
* Real AI-based feature
* Clean UI and UX
* Resume-worthy engineering project

---

## License

This project is developed as part of an academic semester project.
License to be decided by the team.
