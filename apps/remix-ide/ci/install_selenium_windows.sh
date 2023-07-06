#!/usr/bin/env bash

set -e

VERSION=$(powershell "Get-AppxPackage -Name *MicrosoftEdge.* | Foreach Version")

echo "Installing Selenium for Edge version $VERSION"

# find 114 in string VERSION



