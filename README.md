# Magellim Product to PDF

API Node.js pour générer automatiquement des PDFs à partir des pages produits.

## Prérequis Serveur

- **Node.js** version 18+
- Accès SSH
- Dépendances système pour Puppeteer

## Installation

- Cloner le projet
- Installer les dépendances
- Installer PM2 (gestionnaire de processus)
- Démarrer l'API

## Mise à jour du projet

Quand je push des modifications, lancer sur le serveur :
```bash
./update.sh
Ou manuellement :
git pull origin main
npm install
pm2 restart magellim-pdf-api