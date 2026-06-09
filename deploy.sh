#!/bin/bash
set -e

echo "==> INTIZOM deploy boshlandi"

# .env mavjudligini tekshirish
if [ ! -f .env ]; then
  echo "XATO: .env fayl topilmadi. .env.example dan nusxa oling:"
  echo "  cp .env.example .env && nano .env"
  exit 1
fi

# Eng yangi kodni olish
echo "==> git pull"
git pull origin main

# Eski image larni qayta qurish
echo "==> Docker image lar qurilmoqda"
docker compose build --no-cache

# Xizmatlarni ishga tushirish (zero-downtime: avval backend, keyin miniapp)
echo "==> Xizmatlar yangilanmoqda"
docker compose up -d --remove-orphans

# Holat
echo ""
echo "==> Holat:"
docker compose ps

echo ""
echo "✅ Deploy tugadi!"
