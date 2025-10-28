#!/bin/bash
# Script de mise à jour automatique

echo "🔄 Mise à jour du projet..."

# Pull les dernières modifications
git pull origin main

# Installe les nouvelles dépendances si nécessaire
npm install --production

# Redémarre l'API
pm2 restart magellim-pdf-api

echo "✅ Mise à jour terminée !"
pm2 status
