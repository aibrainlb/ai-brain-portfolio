#!/bin/bash

# Andy Ters Portfolio - Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "==============================================="
echo "   Andy Ters Portfolio - Setup Script"
echo "==============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found:${NC} $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm found:${NC} $(npm --version)"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not installed${NC}"
    echo "You can:"
    echo "  1. Install MongoDB locally: https://docs.mongodb.com/manual/installation/"
    echo "  2. Use MongoDB Atlas: https://www.mongodb.com/cloud/atlas"
    echo ""
fi

echo ""
echo "Installing dependencies..."
echo ""

# Install dependencies
npm install

echo ""
echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Please edit .env file and add your configuration${NC}"
    echo ""
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
    echo ""
fi

# Check if MongoDB is running
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✅ MongoDB is running${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB is not running${NC}"
        echo "Start MongoDB with: sudo systemctl start mongod"
        echo "Or use: mongod --dbpath /path/to/data/directory"
    fi
    echo ""
fi

echo "==============================================="
echo "   Setup Complete!"
echo "==============================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env file with your configuration:"
echo "   nano .env"
echo ""
echo "2. Start MongoDB (if using local database):"
echo "   sudo systemctl start mongod"
echo ""
echo "3. Run the application:"
echo "   npm run dev    (development mode)"
echo "   npm start      (production mode)"
echo ""
echo "4. Open browser and visit:"
echo "   http://localhost:3000"
echo ""
echo "==============================================="
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
