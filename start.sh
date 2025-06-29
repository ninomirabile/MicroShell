#!/bin/bash

# MicroShell Application Startup Script
# This script helps you start the entire MicroShell application stack

set -e

echo "🚀 Starting MicroShell Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "All requirements are met!"
}

# Install Node.js dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dependencies installed!"
    else
        print_warning "Dependencies already installed. Run 'npm install' manually if you want to update."
    fi
}

# Create environment file if it doesn't exist
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f "backend/.env" ]; then
        cp backend/env.example backend/.env
        print_success "Environment file created from example!"
        print_warning "Please review backend/.env and update configuration as needed."
    else
        print_warning "Environment file already exists."
    fi
}

# Build and start services
start_services() {
    print_status "Building and starting services..."
    
    # Start core services (database and backend)
    print_status "Starting database and backend..."
    docker-compose up -d postgres backend
    
    # Wait for backend to be ready
    print_status "Waiting for backend to be ready..."
    sleep 10
    
    # Start frontend services
    print_status "Starting frontend applications..."
    docker-compose up -d shell dashboard utenti report
    
    print_success "All services started!"
}

# Display service URLs
show_urls() {
    echo ""
    echo "🌐 Application URLs:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}🏠 Shell Application (Main):${NC}     http://localhost:4200"
    echo -e "${BLUE}📊 Dashboard Microfrontend:${NC}      http://localhost:4201"
    echo -e "${YELLOW}👥 Utenti Microfrontend:${NC}         http://localhost:4202"
    echo -e "${BLUE}📋 Report Microfrontend:${NC}         http://localhost:4203"
    echo -e "${GREEN}🔧 Backend API:${NC}                  http://localhost:8000"
    echo -e "${GREEN}📚 API Documentation:${NC}           http://localhost:8000/docs"
    echo -e "${BLUE}🐘 PostgreSQL Database:${NC}         localhost:5432"
    echo ""
    echo "Optional Services:"
    echo -e "${YELLOW}🌐 Nginx Reverse Proxy:${NC}         http://localhost (if enabled)"
    echo -e "${BLUE}📈 Prometheus Monitoring:${NC}       http://localhost:9090 (if enabled)"
    echo -e "${GREEN}📊 Grafana Dashboard:${NC}           http://localhost:3000 (if enabled, admin/admin123)"
    echo -e "${RED}🔴 Redis Cache:${NC}                  localhost:6379 (if enabled)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Default Login Credentials:"
    echo "  Username: admin"
    echo "  Password: admin123"
    echo ""
    echo "🎉 MicroShell is now running! Happy coding!"
}

# Main execution
main() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🏗️  MicroShell Application Startup"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    check_requirements
    install_dependencies
    setup_environment
    start_services
    show_urls
}

# Handle script arguments
case "${1:-start}" in
    "start")
        main
        ;;
    "stop")
        print_status "Stopping all services..."
        docker-compose down
        print_success "All services stopped!"
        ;;
    "restart")
        print_status "Restarting all services..."
        docker-compose down
        sleep 2
        main
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        docker-compose ps
        ;;
    "clean")
        print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            print_status "Cleaning up..."
            docker-compose down -v --rmi all --remove-orphans
            print_success "Cleanup completed!"
        else
            print_status "Cleanup cancelled."
        fi
        ;;
    "help"|"-h"|"--help")
        echo "MicroShell Startup Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start     Start all services (default)"
        echo "  stop      Stop all services"
        echo "  restart   Restart all services"
        echo "  logs      Show logs from all services"
        echo "  status    Show status of all services"
        echo "  clean     Remove all containers, images and volumes"
        echo "  help      Show this help message"
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' to see available commands."
        exit 1
        ;;
esac 