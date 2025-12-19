#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status
set -o pipefail  # Fail if any command in a pipeline fails

echo "🚀 Starting Render deployment script..."

# 1. Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# 2. Generate Prisma client
echo "🛠 Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prisma

# 3. Run database migrations
echo "🗄 Running Prisma migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

# 4. Build TypeScript project
echo "🛠 Building TypeScript project..."
npm run build

echo "✅ Build completed successfully!"
