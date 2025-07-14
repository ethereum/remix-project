#!/bin/bash
set -e

echo "Setting up virtual display for Electron tests in CI..."

# Check if we're in a CI environment
if [ "$GITHUB_ACTIONS" = "true" ] || [ "$CI" = "true" ]; then
    echo "Detected CI environment"
    
    # Only set up virtual display on Linux
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "Linux detected - setting up virtual display..."
        
        # Install xvfb if not already installed
        if ! command -v xvfb-run &> /dev/null; then
            echo "Installing xvfb..."
            sudo apt-get update
            sudo apt-get install -y xvfb
        fi
        
        # Start Xvfb in the background
        echo "Starting virtual display..."
        export DISPLAY=:99
        Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
        
        # Wait a moment for Xvfb to start
        sleep 3
        
        echo "Virtual display started on :99"
        echo "DISPLAY=$DISPLAY"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macOS detected - no virtual display needed"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        echo "Windows detected - no virtual display needed"
    else
        echo "Unknown OS: $OSTYPE - skipping virtual display setup"
    fi
else
    echo "Not in CI environment, skipping virtual display setup"
fi
