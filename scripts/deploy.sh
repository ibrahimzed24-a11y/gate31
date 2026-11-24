#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo "==> Building Gate 31"
npm ci
npm run build
echo "==> dist/ is ready"
echo
echo "Next steps (accounts must be yours — I cannot create them for you):"
echo "  1. GitHub:  git init && git remote add origin <YOUR_REPO_URL> && git push -u origin main"
echo "  2. Vercel:  npx vercel --prod   (or import the repo at vercel.com/new)"
echo "  3. Supabase (optional): run supabase/schema.sql, copy .env.example -> .env.local,"
echo "     fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then rebuild."
echo "  4. Desktop: npm i -D electron electron-builder && npm run electron:dev"
echo "  5. Mobile:  npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android"
echo "             npx cap add ios && npx cap add android && npm run build && npm run cap:sync"
