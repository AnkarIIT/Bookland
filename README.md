# 📚 Bookland: Digital Library Infrastructure

Bookland is a modern, high-performance digital library platform designed for scale. It provides a robust infrastructure for searching, managing, and discovering human knowledge, integrated with real-world book data.

## 🚀 Overview

Bookland bridges the gap between massive book databases and a seamless user experience. By leveraging the **Open Library API**, it allows users to explore millions of titles with a premium, responsive interface.

---

## ✨ Key Features

- **🔍 Global Book Search**: Instant search across millions of books using the Open Library API integration.
- **🔎 Multi-Source Search**: Search across 12+ providers (OpenLibrary, Gutenberg, Internet Archive, Digital Library of India, Perseus, HathiTrust, Europeana, ManyBooks, OpenStax, LibreTexts, DOAB, SciELO) from one endpoint.
- **📇 Source Directory**: A curated, searchable directory of 900+ free book, ebook, audiobook, comic, manga, paper, and academic resources organized into 37 categories.
- **📄 Papers & Ancient Scripts**: Unified search over arXiv, CrossRef, Perseus, DLI, and more.
- **👤 Accounts & Collections**: Reading history and saved-book collections with JWT auth.
- **⚡ High-Performance Caching**: Optimized with **Redis** to ensure lightning-fast repeated searches.
- **🗄️ Relational Persistence**: Built on **PostgreSQL** for reliable data management and future AI-driven insights (pgvector).
- **🎨 Premium UI/UX**: A stunning, responsive frontend built with **React 18** and **Tailwind CSS**.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Cache**: [Redis](https://redis.io/)

### Infrastructure
- **Environment**: Docker-ready with `.env` configuration.
- **API**: [Open Library API](https://openlibrary.org/developers/api) integration.

---

## 🚦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL and Redis)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AnkarIIT/BookLand.git
   cd BookLand
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   cp .env.example .env  # Update with your local DB/Redis credentials
   ```

   > **Note:** When running the backend locally (outside Docker), make sure `REDIS_URL` points to `redis://localhost:6379` and `DB_HOST` to `localhost`. The `redis://redis:6379` / `postgres` hostnames in `infra/.env.example` only resolve inside the Docker network.

3. **Frontend Setup**:
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration**:
   Ensure you have a running PostgreSQL and Redis instance. You can use the `infra/.env.example` as a template for your root environment settings.

### Running the App

1. **Start the Backend**:
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Frontend**:
   ```bash
   cd client
   npm run dev
   ```

---

## 🏗️ Project Structure

- `client/`: React frontend application.
- `server/`: Express + TypeScript API backend.
- `infra/`: Infrastructure configuration (environment templates, Docker configs).
- `docs/`: (Coming Soon) Detailed API and architecture documentation.

---

## 🚦 API Overview

| Route | Description |
|-------|-------------|
| `GET /api/search` | Unified search across books, papers, and scripts |
| `GET /api/all-sources` | Multi-source search across 12+ providers |
| `GET /api/sources` | Source Directory (searchable, cached) |
| `GET /api/papers`, `GET /api/scripts` | Paper / ancient-script sources |
| `POST /api/auth/*` | Register, login, refresh, logout, me |
| `GET/POST/DELETE /api/collections` | Saved book collections |
| `GET/PATCH /api/history` | Reading history / progress |

---

## 🗺️ Roadmap

- [x] Week 1: Core Search & Infrastructure MVP.
- [x] Week 2: User Accounts & Personal Collections (auth, collections, reading history).
- [x] Week 3: Multi-Source Search across 12+ providers + curated Source Directory.
- [ ] Week 4: AI-Powered "What-If" Engine for book analysis.
- [ ] Week 5: Google Drive Integration for personal ebook storage.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with ❤️ by [AnkarIIT](https://github.com/AnkarIIT)**
