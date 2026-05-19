# Movie Recommender

A MovieLens-inspired movie recommendation web app. Users can browse movies, rate them, and receive personalised recommendations based on their taste.

**Live app:** https://movie-recommender-tau-nine.vercel.app/

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router |
| Backend | Java 21, Spring Boot 3, Spring Data JPA |
| Database | PostgreSQL |
| Movie data | TMDB API + MovieLens CSV seed |
| Hosting | Vercel (frontend) · Render (backend + DB) |

---

## Architecture

```
Browser (Vercel)
      │  REST / JSON
      ▼
Spring Boot API (Render)
      │                  │
      ▼                  ▼
PostgreSQL (Render)   TMDB API
```

---

## Features

- Browse and search movies (paginated)
- Register / login with JWT authentication
- Rate movies (1–5 stars)
- "Recommended for you" — content-based recommendations from your 4–5 ★ ratings
- "My Ratings" page

---

## Local setup

### Prerequisites

- Java 21+
- Node 18+
- Docker (for the database) or a local PostgreSQL instance

### 1. Clone

```bash
git clone https://github.com/underground3k/movie-recommender.git
cd movie-recommender
```

### 2. Start the database

```bash
docker compose up -d
```

### 3. Backend

Create a `.env` file (or export variables) with the values listed in **Environment variables** below, then:

```bash
cd backend
./mvnw spring-boot:run
```

The API runs at `http://localhost:8080`.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Environment variables

All variables are **required** — the application will not start if any are missing.

### Backend

| Variable | Description | Example |
|---|---|---|
| `JWT_SECRET` | Secret key for signing JWTs — must be ≥ 32 characters | `changeme-use-a-long-random-string` |
| `TMDB_API_KEY` | API key from [themoviedb.org](https://www.themoviedb.org/settings/api) | `abc123...` |
| `SPRING_DATASOURCE_URL` | JDBC URL for PostgreSQL | `jdbc:postgresql://localhost:5432/movielib` |
| `SPRING_DATASOURCE_USERNAME` | DB username | `movielib_user` |
| `SPRING_DATASOURCE_PASSWORD` | DB password | `movielib_pass` |

> **Render deployment:** set these in *Service → Environment* — never commit real values to the repo.

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL (no trailing slash) |

---

## Team

| Name | Role |
|---|---|
| Ignas | Scrum Master / Docs |
| Herkus | Backend |
| Deividas | Frontend |
| Zygimantas | Frontend / DevOps |
