# 🧱 MicroShell – Full Microfrontend Application Prompt (for Cursor)

🎯 **Goal**  
Generate a complete, enterprise-ready, modular application using a microfrontend architecture. The app must support independent deployment of features, scalable team development, and clean separation of concerns.

---

## ⚙️ Tech Stack

- **Shell (container)**: Angular 17 + Nx Monorepo
- **Microfrontend 1**: `dashboard` (Angular, route `/dashboard`, calls backend metrics API)
- **Microfrontend 2**: `utenti` (Angular, route `/utenti`, CRUD with reactive forms and validations)
- **Microfrontend 3**: `report` (Angular, route `/report`, charts + PDF export)
- **Backend**: FastAPI (Python) + PostgreSQL
- **API Gateway (optional)**: Kong or FastAPI Router
- **CI/CD**: GitHub Actions for build, test, and deployment
- **Docker**: Docker + docker-compose with separate dev and prod configs
- **Communication between microfrontends**: Module Federation + shared services or custom event dispatcher

---

## 🔐 Security & Features

- JWT-based authentication (login, register, token renewal)
- Role-based authorization (`admin`, `user`)
- Responsive layout using Angular Material
- Environment-based config (`.env`, `environments`)
- i18n translation support
- Sidebar/topbar in shell, used across microfrontends
- Each microfrontend must be:
  - independently buildable and deployable
  - testable in isolation

---

## 📦 Expected Output

- Full Nx monorepo with:
  - `apps/shell` (container app)
  - `apps/dashboard`, `apps/utenti`, `apps/report`
  - `libs/shared` (UI components, services, models)
  - `backend/` folder with FastAPI app
- CI/CD config in `.github/workflows/`
- `docker-compose.yml` with:
  - backend (FastAPI)
  - db (PostgreSQL)
  - frontend shell + remotes
- Working `/health` endpoint for backend
- JWT-protected routes for microfrontends
- Database schema with `users`, `roles`, `metrics`, `logs`
- Scripts to run tests, dev mode, build, docker
- README.md with:
  - Setup instructions
  - Build & run steps
  - Test usage
  - Microfrontend structure explanation

---

## 🧠 Dev Notes

- Use clean architecture for both frontend and backend
- Ensure typed code (TypeScript, Pydantic models)
- Optimize for AI-assisted development (clear module names, comments, boundaries)
- Add inline comments where architectural decisions are made
- If needed, mock APIs or data with realistic values

---

✅ **Final note**: This project is meant to serve as a scalable and real-world foundation for teams adopting microfrontend architecture. Prioritize modularity, maintainability, and clarity.
