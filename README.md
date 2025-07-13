# MicroShell 🚀

[![CI/CD Pipeline](https://github.com/microshell/microshell/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/microshell/microshell/actions/workflows/ci-cd.yml)
[![Quality Checks](https://github.com/microshell/microshell/actions/workflows/quality-checks.yml/badge.svg)](https://github.com/microshell/microshell/actions/workflows/quality-checks.yml)
[![Release](https://github.com/microshell/microshell/actions/workflows/release.yml/badge.svg)](https://github.com/microshell/microshell/actions/workflows/release.yml)

A comprehensive **microfrontend application** built with **Angular 20**, **FastAPI**, and **PostgreSQL** using **Nx workspace** architecture and **Module Federation**.

## 🏗️ Architecture Overview

### Microfrontend Architecture
- **Shell (Host)**: Main container application running on port 4200
- **Dashboard**: Analytics and metrics microfrontend on port 4201
- **Utenti (Users)**: User management microfrontend on port 4202
- **Report**: Reporting and BI microfrontend on port 4203

### Backend
- **FastAPI**: Modern Python web framework with automatic API documentation
- **PostgreSQL**: Production-ready relational database
- **JWT Authentication**: Secure token-based authentication
- **SQLAlchemy**: Python SQL toolkit and ORM

### Infrastructure
- **Nx Workspace**: Monorepo management with advanced tooling
- **Module Federation**: Webpack 5 module federation for microfrontends
- **Docker**: Containerized development and deployment
- **nginx**: Reverse proxy and load balancer
- **Redis**: Caching layer
- **Prometheus + Grafana**: Monitoring and observability

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/microshell/microshell.git
cd microshell

# Run the automated setup script
./scripts/dev-setup.sh
```

### Option 2: Manual Setup
```bash
# Install frontend dependencies
npm ci

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python init_db.py
cd ..

# Start all services
npm run start
```

### Option 3: Docker Setup
```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🌐 Available Services

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:8000 | FastAPI backend with auto-docs at `/docs` |
| Shell App | http://localhost:4200 | Main container application |
| Dashboard | http://localhost:4201 | Analytics microfrontend |
| Utenti | http://localhost:4202 | User management microfrontend |
| Report | http://localhost:4203 | Reporting microfrontend |
| Grafana | http://localhost:3000 | Monitoring dashboard (admin/admin123) |
| Prometheus | http://localhost:9090 | Metrics collection |

## 🔧 Development

### NPM Scripts
```bash
# Development
npm run start                 # Start all services
npm run start:shell          # Start only shell app
npm run start:dashboard      # Start only dashboard
npm run start:utenti         # Start only utenti
npm run start:report         # Start only report
npm run start:backend        # Start only backend

# Building
npm run build:all            # Build all applications
npm run build:shell          # Build shell app
npm run build:dashboard      # Build dashboard
npm run build:utenti         # Build utenti
npm run build:report         # Build report

# Testing & Quality
npm run test                 # Run all tests
npm run lint                 # Run linting
npm run format               # Format code
npm run affected:test        # Run tests for affected projects
npm run affected:build       # Build affected projects

# Docker
npm run docker:build         # Build Docker images
npm run docker:up            # Start with Docker Compose
npm run docker:down          # Stop Docker services
npm run docker:logs          # View Docker logs
```

### Nx Commands
```bash
# Generate new microfrontend
npx nx g @nx/angular:app new-app

# Generate new library
npx nx g @nx/angular:lib new-lib

# View dependency graph
npx nx dep-graph

# Run affected commands
npx nx affected:apps
npx nx affected:libs
```

## 🔄 CI/CD Pipeline

### Workflow Overview

#### 1. **Main CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
- **Triggers**: Push to `main`, `develop`, feature branches, and PRs
- **Features**:
  - Smart change detection (only builds affected components)
  - Parallel testing for frontend and backend
  - Docker image building and publishing
  - End-to-end testing
  - Automated deployment to staging/production

#### 2. **Quality Checks** (`.github/workflows/quality-checks.yml`)
- **Triggers**: Nightly runs, pushes to `main`, PRs
- **Features**:
  - Dependency vulnerability scanning
  - Code quality analysis with SonarCloud
  - Performance testing with Lighthouse
  - Security scanning with Snyk and CodeQL
  - Bundle size analysis
  - Accessibility testing

#### 3. **Release Pipeline** (`.github/workflows/release.yml`)
- **Triggers**: Version tags (`v*.*.*`) or manual dispatch
- **Features**:
  - Automated changelog generation
  - Docker image publishing with semantic versioning
  - GitHub release creation with artifacts
  - Production deployment (for stable releases)

### Branch Strategy
```
main          ←── Production releases
├── develop   ←── Integration branch
├── feature/* ←── Feature branches
└── hotfix/*  ←── Emergency fixes
```

### Deployment Environments
- **Development**: Local development with hot reloading
- **Staging**: `develop` branch → staging environment
- **Production**: `main` branch → production environment

## 🛡️ Security & Quality

### Code Quality
- **ESLint**: TypeScript/JavaScript linting
- **Prettier**: Code formatting
- **SonarCloud**: Code quality and security analysis
- **Jest**: Unit testing for frontend
- **Pytest**: Backend testing with coverage

### Security
- **Snyk**: Dependency vulnerability scanning
- **CodeQL**: Security code analysis
- **OWASP ZAP**: Security penetration testing
- **JWT**: Secure authentication tokens
- **CORS**: Proper cross-origin configuration

### Performance
- **Lighthouse CI**: Performance, accessibility, SEO testing
- **Bundle Analysis**: Frontend bundle size monitoring
- **Artillery**: Backend load testing

## 📊 Monitoring & Observability

### Application Monitoring
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Health Checks**: Application status endpoints

### Log Management
- **Structured Logging**: JSON formatted logs
- **Log Aggregation**: Centralized log collection
- **Error Tracking**: Application error monitoring

## 🎯 Testing Strategy

### Frontend Testing
- **Unit Tests**: Component and service testing with Jest
- **Integration Tests**: Module integration testing
- **E2E Tests**: End-to-end testing with Cypress
- **Accessibility Tests**: WCAG compliance testing (manual or local only; automated CI checks are currently disabled, see PIPELINE_GUIDE.md)

### Backend Testing
- **Unit Tests**: Function and method testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Repository layer testing
- **Performance Tests**: Load and stress testing

## 🚀 Deployment

### Development Deployment
```bash
# Start all services locally
npm run start

# Or with Docker
docker-compose up -d
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
Create `.env` files for different environments:

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/microshell_db
SECRET_KEY=your-secret-key
DEBUG=false
ALLOWED_ORIGINS=https://your-domain.com
```

## 📚 Documentation

### API Documentation
- **Swagger UI**: Available at `http://localhost:8000/docs`
- **ReDoc**: Available at `http://localhost:8000/redoc`
- **OpenAPI Spec**: Available at `http://localhost:8000/openapi.json`

### Architecture Documentation
- **Module Federation**: Microfrontend communication patterns
- **State Management**: RxJS and Angular services
- **Authentication Flow**: JWT token handling
- **Database Schema**: SQLAlchemy models and relationships

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- Follow **Angular Style Guide**
- Use **TypeScript** strict mode
- Write **comprehensive tests**
- Document **public APIs**
- Follow **conventional commits**

### PR Requirements
- ✅ All tests pass
- ✅ Code coverage > 80%
- ✅ Linting passes
- ✅ Security scan passes
- ✅ Performance impact assessed

## 📋 Requirements

### Development Requirements
- **Node.js** 20.19+
- **npm** 8+
- **Python** 3.11+
- **Docker** 20+
- **Docker Compose** 2+

### Production Requirements
- **Kubernetes** 1.24+ (recommended)
- **PostgreSQL** 15+
- **Redis** 7+
- **nginx** 1.20+

## 🔖 Versioning

We use [Semantic Versioning](https://semver.org/) for releases:
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Nx Team** for the amazing monorepo tooling
- **Angular Team** for the robust frontend framework
- **FastAPI** for the modern Python web framework
- **Module Federation** for microfrontend capabilities

---

**Made with ❤️ by Antonino Mirabile**

For questions or support, please [open an issue](https://github.com/microshell/microshell/issues/new)
