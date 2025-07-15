#!/bin/bash

echo "🚀 Starting Git HTTP Backend Server locally..."
echo "This will set up test git repositories and start the server on localhost:6868"

# Navigate to the git HTTP backend directory
cd ../remix-ide-e2e/src/githttpbackend/

echo "📦 Installing dependencies..."
yarn

echo "🛠️  Setting up test repositories..."
sh setup.sh

echo "🔥 Starting the server..."
echo "Server will be available at: http://localhost:6868"
echo "Test repositories:"
echo "  - http://localhost:6868/bare.git"
echo "  - http://localhost:6868/bare2.git"
echo ""
echo "Press Ctrl+C to stop the server"

# Start the server with /tmp/ as the directory (where the git repos are set up)
yarn start:server /tmp/
