#!/bin/bash
set -e

# Pull the Docker image from Docker Hub
echo "Pull the Docker image from Docker Hub"
docker pull jaironberiguete/auth

# Run the Docker image as a container
echo "Run the Docker image as a container"
docker run -d -p 5000:8000 jaironberiguete/auth 