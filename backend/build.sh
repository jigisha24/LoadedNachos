#!/usr/bin/env bash
# exit on error
set -o errexit

# Build Frontend
echo "Building Frontend..."
cd ../frontend
npm install
npm run build
cd ../backend

# Build Backend
echo "Building Backend..."
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
