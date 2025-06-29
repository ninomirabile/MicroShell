#!/bin/bash

# MicroShell Development Setup Script
# This script helps set up the development environment

set -e

echo "🚀 MicroShell Development Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm not found"
        exit 1
    fi
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python found: $PYTHON_VERSION"
    else
        print_error "Python 3 not found. Please install Python 3.11+"
        exit 1
    fi
    
    # Check Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker found: $DOCKER_VERSION"
    else
        print_warning "Docker not found. Some features may not work."
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_success "Docker Compose found: $COMPOSE_VERSION"
    else
        print_warning "Docker Compose not found. Using docker compose instead."
    fi
}

# Install frontend dependencies
install_frontend_deps() {
    print_step "Installing frontend dependencies..."
    npm ci
    print_success "Frontend dependencies installed"
}

# Setup backend environment
setup_backend() {
    print_step "Setting up backend environment..."
    
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_step "Creating Python virtual environment..."
        python3 -m venv venv
        print_success "Virtual environment created"
    fi
    
    # Activate virtual environment and install dependencies
    print_step "Installing backend dependencies..."
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    print_success "Backend dependencies installed"
    
    cd ..
}

# Create environment files
create_env_files() {
    print_step "Creating environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# Database
DATABASE_URL=sqlite:///./microshell.db

# Security
SECRET_KEY=development-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:4201,http://localhost:4202,http://localhost:4203

# Debug
DEBUG=true
EOF
        print_success "Backend .env file created"
    else
        print_warning "Backend .env file already exists"
    fi
}

# Initialize database
init_database() {
    print_step "Initializing database..."
    
    cd backend
    source venv/bin/activate
    
    if [ -f "init_db.py" ]; then
        python init_db.py
        print_success "Database initialized"
    else
        print_warning "init_db.py not found. Skipping database initialization."
    fi
    
    cd ..
}

# Setup Git hooks (optional)
setup_git_hooks() {
    print_step "Setting up Git hooks..."
    
    # Pre-commit hook
    if [ ! -f ".git/hooks/pre-commit" ]; then
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix the issues and try again."
    exit 1
fi

# Run tests
npm run test -- --watch=false
if [ $? -ne 0 ]; then
    echo "Tests failed. Please fix the issues and try again."
    exit 1
fi

echo "Pre-commit checks passed!"
EOF
        chmod +x .git/hooks/pre-commit
        print_success "Git pre-commit hook installed"
    else
        print_warning "Git pre-commit hook already exists"
    fi
}

# Start services
start_services() {
    print_step "Would you like to start the development servers? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_step "Starting development servers..."
        
        # Start backend
        echo "Starting backend server..."
        cd backend
        source venv/bin/activate
        uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
        BACKEND_PID=$!
        cd ..
        
        # Wait a bit for backend to start
        sleep 3
        
        # Start frontend applications
        echo "Starting frontend applications..."
        npm run start:shell &
        npm run start:dashboard &
        npm run start:utenti &
        npm run start:report &
        
        print_success "Development servers started!"
        echo ""
        echo "🌐 Available services:"
        echo "  - Backend API: http://localhost:8000"
        echo "  - Shell App: http://localhost:4200"
        echo "  - Dashboard: http://localhost:4201"
        echo "  - Utenti: http://localhost:4202"
        echo "  - Report: http://localhost:4203"
        echo ""
        echo "Press Ctrl+C to stop all services"
        
        # Wait for interrupt
        trap 'kill $BACKEND_PID; exit' INT
        wait
    fi
}

# Main setup flow
main() {
    echo ""
    check_prerequisites
    echo ""
    install_frontend_deps
    echo ""
    setup_backend
    echo ""
    create_env_files
    echo ""
    init_database
    echo ""
    setup_git_hooks
    echo ""
    
    print_success "🎉 Development environment setup complete!"
    echo ""
    echo "📚 Quick commands:"
    echo "  npm run start              - Start all services"
    echo "  npm run build:all          - Build all applications"
    echo "  npm run test               - Run all tests"
    echo "  npm run lint               - Run linting"
    echo "  docker-compose up -d       - Start with Docker"
    echo ""
    
    start_services
}

# Run main function
main "$@" 