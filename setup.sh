#!/bin/bash

# TalentPlus Setup Script
# This script automates the setup and validation of the TalentPlus application

set -e  # Exit on error

echo "============================================"
echo "  TalentPlus - Setup & Validation Script"
echo "============================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${NC}ℹ $1${NC}"
}

# Check if Node.js is installed
echo "Step 1: Checking prerequisites..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
print_success "Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
print_success "npm $(npm -v) detected"

echo ""
echo "Step 2: Setting up environment variables..."

# Check if .env.local exists
if [ -f ".env.local" ]; then
    print_warning ".env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local template
cat > .env.local << 'EOF'
# OpenAI API Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
# Get these from: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Optional: GitHub Token (for profile enrichment)
GITHUB_TOKEN=

# Optional: ProxyCurl API Key (for LinkedIn data)
PROXYCURL_API_KEY=

# App Configuration
NEXT_PUBLIC_APP_NAME=TalentPlus
EOF

print_success "Created .env.local template"
print_warning "⚠️  IMPORTANT: Please edit .env.local and add your API keys before running the app!"

echo ""
echo "Step 3: Cleaning previous installations..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    print_success "Removed old node_modules"
fi

if [ -d ".next" ]; then
    rm -rf .next
    print_success "Removed old .next build directory"
fi

echo ""
echo "Step 4: Installing dependencies..."
npm install
print_success "Dependencies installed successfully"

echo ""
echo "Step 5: Validating TypeScript configuration..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
    print_success "TypeScript validation passed"
else
    print_error "TypeScript validation failed. Please fix the errors above."
    exit 1
fi

echo ""
echo "Step 6: Running database migrations..."
print_info "Please ensure you have:"
print_info "1. Created a Supabase project"
print_info "2. Run the SQL schema from database/schema.sql in your Supabase SQL editor"
print_info "3. Added your Supabase credentials to .env.local"
echo ""

echo ""
echo "Step 7: Building the application..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
else
    print_error "Build failed. Please check the errors above."
    exit 1
fi

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
print_success "TalentPlus is ready to run!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your API keys"
echo "2. Run the database schema (database/schema.sql) in Supabase"
echo "3. Start the development server:"
echo ""
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "For production deployment:"
echo "   npm run build && npm start"
echo ""
print_warning "Remember: Never commit .env.local to version control!"
echo ""
