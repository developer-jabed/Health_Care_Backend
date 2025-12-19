#!/bin/bash
set -o errexit

echo "📦 Installing dependencies"
npm install

echo "🛠️ Building project"
npm run build

echo "⚡ Generating Prisma Client"
npx prisma generate --schema=prisma/schema/schema.prisma

echo "🗄️ Applying Prisma migrations"
npx prisma migrate deploy --schema=prisma/schema/schema.prisma
