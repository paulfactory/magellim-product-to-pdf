# Magellim PDF Generator API

API Node.js pour générer automatiquement des PDFs à partir des pages produits.

## Prérequis Serveur

- **Node.js** version 18+
- **npm**
- Accès SSH
- **Dépendances système pour Puppeteer**

## Mise à jour du projet

Quand je push des modifications, lancer sur le serveur :
```bash
./update.sh
Ou manuellement :
git pull origin main
npm install
pm2 restart magellim-pdf-api

