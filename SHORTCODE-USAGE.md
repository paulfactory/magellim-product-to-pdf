# Utilisation des Shortcodes WordPress

## Shortcode pour afficher les données APICIL

Le plugin WordPress inclut maintenant un shortcode `[apicil_data]` pour afficher les données APICIL sur n'importe quelle page.

### Affichage complet (tableau)

Pour afficher toutes les données APICIL sous forme de tableau :

```
[apicil_data]
```

Résultat :
- Tableau avec toutes les 5 données
- Date de dernière mise à jour
- Style automatique (responsive)

### Affichage d'un champ spécifique

Pour afficher une seule valeur :

**Actif net :**
```
[apicil_data field="actif_net"]
```
Affiche : `957 126 490,74 €`

**Valeur liquidative :**
```
[apicil_data field="valeur_liquidative"]
```
Affiche : `145,54 €`

**Volatilité 1 an :**
```
[apicil_data field="volatilite_1an"]
```
Affiche : `0,12%`

**Poche immobilière :**
```
[apicil_data field="poche_immobiliere"]
```
Affiche : `98,94% (503 lignes)`

**Poche liquide :**
```
[apicil_data field="poche_liquide"]
```
Affiche : `1,06% (3 lignes)`

## Shortcode pour le bouton PDF

Le shortcode existant pour le bouton de téléchargement PDF accepte maintenant un paramètre `label` :

**Avec le label par défaut :**
```
[magellim_pdf]
```

**Avec un label personnalisé :**
```
[magellim_pdf label="Télécharger le reporting"]
```

Ou sans emoji :
```
[magellim_pdf label="Télécharger en PDF"]
```

## Exemples d'utilisation

### Dans une page produit

```html
<h3>Données APICIL en temps réel</h3>
<p>Actif net : [apicil_data field="actif_net"]</p>
<p>Valeur liquidative : [apicil_data field="valeur_liquidative"]</p>

[magellim_pdf label="Télécharger le PDF"]
```

### Tableau complet

```html
<h3>Informations APICIL</h3>
[apicil_data]

<p style="text-align: center; margin-top: 20px;">
    [magellim_pdf]
</p>
```

## Personnalisation du style

Le shortcode `[apicil_data]` inclut des styles par défaut, mais tu peux les surcharger dans ton thème :

```css
/* Personnaliser le tableau */
.apicil-table {
    border: 2px solid #000;
}

.apicil-table th {
    background-color: #333;
    color: white;
}

/* Personnaliser les valeurs individuelles */
.apicil-value {
    font-weight: bold;
    color: #0066cc;
}
```

## Notes importantes

- Les données sont mises à jour automatiquement tous les jours à 2h du matin
- Si l'API est indisponible, un message d'erreur s'affiche
- Le chargement initial affiche un message "⏳ Chargement..."
- Les données sont en cache pour des performances optimales
