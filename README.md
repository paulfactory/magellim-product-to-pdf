# Magellim PDF Generator API

API Node.js pour générer des PDFs à partir de pages WordPress.

## Architecture

1. **Scraping** : L'API scrape la page WordPress et extrait les données
2. **Template** : Utilise le template HTML fourni par WordPress (ou template local par défaut)
3. **CSS** : Applique le CSS fourni par WordPress (ou CSS local par défaut)
4. **PDF** : Génère le PDF avec Puppeteer

## URL Production

`https://pdf-api.groupemagellim.com/`

## Utilisation

### Mode 1 : Template local (par défaut)
```json
{
  "url": "https://www.groupemagellim.com/produit/"
}
```

### Mode 2 : Template custom depuis WordPress
```json
{
  "url": "https://www.groupemagellim.com/produit/",
  "template": "<html>...</html>",
  "css": "body { ... }"
}
```

**Avantage** : Tu peux modifier le design du PDF directement dans WordPress sans redéployer l'API !

## Mise à jour du serveur

```bash
cd /var/www/groupemagellim-pdf/magellim-pdf-api
./update.sh