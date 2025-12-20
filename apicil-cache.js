const fs = require('fs').promises;
const path = require('path');
const { extractApicilData } = require('./extract-apicil');

const CACHE_FILE = path.join(__dirname, 'cache-apicil.json');

/**
 * Lit les données depuis le cache
 */
async function getCachedData() {
    try {
        const data = await fs.readFile(CACHE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('⚠️  Pas de cache trouvé ou erreur de lecture');
        return null;
    }
}

/**
 * Met à jour le cache avec de nouvelles données
 */
async function updateCache() {
    console.log('🔄 Mise à jour du cache APICIL...');

    try {
        // Extrait les données depuis le PDF
        const apicilData = await extractApicilData();

        // Crée l'objet de cache avec timestamp
        const cacheData = {
            data: apicilData,
            lastUpdate: new Date().toISOString(),
            timestamp: Date.now()
        };

        // Écrit dans le fichier cache
        await fs.writeFile(CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf8');

        console.log('✅ Cache APICIL mis à jour:', cacheData);
        return cacheData;
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du cache:', error.message);
        throw error;
    }
}

/**
 * Récupère les données (depuis le cache si disponible, sinon met à jour)
 */
async function getApicilData(forceUpdate = false) {
    if (forceUpdate) {
        return await updateCache();
    }

    const cached = await getCachedData();

    // Si pas de cache ou cache vide, on met à jour
    if (!cached || !cached.data) {
        console.log('📥 Pas de cache disponible, mise à jour...');
        return await updateCache();
    }

    console.log(`✅ Données APICIL depuis le cache (dernière mise à jour: ${cached.lastUpdate})`);
    return cached;
}

module.exports = {
    getCachedData,
    updateCache,
    getApicilData
};
