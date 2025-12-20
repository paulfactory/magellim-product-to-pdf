# Configuration du Cron pour la mise à jour APICIL

## Mise à jour quotidienne automatique

Pour mettre à jour les données APICIL automatiquement tous les jours à 2h du matin, configure un cron sur le serveur.

### Option 1 : Cron système (recommandé)

Connecte-toi au serveur et édite le crontab :

```bash
crontab -e
```

Ajoute cette ligne (pour une mise à jour à 2h du matin tous les jours) :

```bash
0 2 * * * curl -X POST https://pdf-api.groupemagellim.com/update-apicil-data
```

Ou avec un script plus verbeux :

```bash
0 2 * * * curl -X POST https://pdf-api.groupemagellim.com/update-apicil-data >> /var/log/apicil-update.log 2>&1
```

### Option 2 : Utiliser node-cron (dans l'application)

Si tu préfères gérer le cron depuis l'application Node.js :

1. Installer node-cron :
```bash
npm install node-cron
```

2. Ajouter dans `server.js` :
```javascript
const cron = require('node-cron');
const { updateCache } = require('./apicil-cache');

// Mise à jour quotidienne à 2h du matin
cron.schedule('0 2 * * *', async () => {
    console.log('🕐 Exécution du cron : mise à jour APICIL');
    try {
        await updateCache();
        console.log('✅ Mise à jour APICIL réussie');
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour APICIL:', error);
    }
});
```

### Option 3 : Service externe (cron-job.org, etc.)

Configure un service externe pour appeler l'endpoint :
- URL : `https://pdf-api.groupemagellim.com/update-apicil-data`
- Méthode : POST
- Fréquence : Tous les jours à 2h00

## Test manuel

Pour tester la mise à jour manuellement :

```bash
curl -X POST https://pdf-api.groupemagellim.com/update-apicil-data
```

Ou depuis le navigateur, va sur :
```
https://pdf-api.groupemagellim.com/update-apicil-data
```

## Vérification

Pour vérifier les données en cache :

```bash
curl https://pdf-api.groupemagellim.com/apicil-data
```

## Logs

Le serveur Node.js affichera dans les logs :
- `🔄 Mise à jour du cache APICIL...` quand la mise à jour démarre
- `✅ Cache APICIL mis à jour` quand c'est terminé
- `❌ Erreur lors de la mise à jour du cache` en cas d'erreur
