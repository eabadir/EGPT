#!/bin/bash

# The Address Is The Map Visualizer - Development Server Launcher
# This script provides convenient commands to manage the visualizer development environment

set -e

VISUALIZER_DIR="/Users/eabadir/Documents/Code/PnPproofs/PprobablyEqualsNP/web/the-address-is-the-map-visualizer"

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

# Function to check if dependencies are installed
check_dependencies() {
    if [ ! -d "$VISUALIZER_DIR/node_modules" ]; then
        print_warning "Dependencies not found. Installing..."
        cd "$VISUALIZER_DIR"
        npm install
        print_success "Dependencies installed successfully"
    else
        print_status "Dependencies already installed"
    fi
}

# Function to start development server
start_dev() {
    print_status "Starting The Address Is The Map Visualizer development server..."
    print_status "Server will be available at: http://localhost:3000"
    print_status "Press Ctrl+C to stop the server"
    echo ""
    
    cd "$VISUALIZER_DIR"
    npm run dev
}

# Function to build the project
build_project() {
    print_status "Building The Address Is The Map Visualizer..."
    cd "$VISUALIZER_DIR"
    npm run build
    print_success "Build completed successfully"
}

# Function to preview the built project
preview_project() {
    print_status "Starting preview server for built project..."
    print_status "Preview will be available at: http://localhost:4173"
    print_status "Press Ctrl+C to stop the preview server"
    echo ""
    
    cd "$VISUALIZER_DIR"
    npm run preview
}

# Function to clean the project
clean_project() {
    print_status "Cleaning project files..."
    cd "$VISUALIZER_DIR"
    rm -rf dist node_modules
    print_success "Project cleaned successfully"
}

# Function to show help
show_help() {
    echo "The Address Is The Map Visualizer - Development Launcher"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev, start    Start the development server (default)"
    echo "  build         Build the project for production"
    echo "  preview       Preview the built project"
    echo "  clean         Clean build artifacts and dependencies"
    echo "  install       Install dependencies"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0            # Start development server"
    echo "  $0 dev        # Start development server"
    echo "  $0 build      # Build for production"
    echo "  $0 preview    # Preview built project"
    echo ""
    echo "The development server will be available at: http://localhost:3000"
    echo "The preview server will be available at: http://localhost:4173"
}

# Main script logic
case "${1:-dev}" in
    "dev"|"start")
        check_dependencies
        start_dev
        ;;
    "build")
        check_dependencies
        build_project
        ;;
    "preview")
        check_dependencies
        preview_project
        ;;
    "clean")
        clean_project
        ;;
    "install")
        print_status "Installing dependencies..."
        cd "$VISUALIZER_DIR"
        npm install
        print_success "Dependencies installed successfully"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
