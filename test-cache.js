// Script de test du système de cache APICIL

const { updateCache, getApicilData, getCachedData } = require('./apicil-cache');

async function testCache() {
    console.log('🧪 Test du système de cache APICIL\n');

    // Test 1 : Mise à jour du cache
    console.log('📝 Test 1 : Mise à jour du cache');
    console.log('-'.repeat(50));
    try {
        const updated = await updateCache();
        console.log('✅ Cache mis à jour avec succès');
        console.log('Données:', JSON.stringify(updated, null, 2));
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error.message);
    }

    console.log('\n');

    // Test 2 : Lecture du cache
    console.log('📖 Test 2 : Lecture du cache');
    console.log('-'.repeat(50));
    try {
        const cached = await getCachedData();
        if (cached) {
            console.log('✅ Cache lu avec succès');
            console.log('Dernière mise à jour:', cached.lastUpdate);
            console.log('Données:', JSON.stringify(cached.data, null, 2));
        } else {
            console.log('⚠️  Aucun cache trouvé');
        }
    } catch (error) {
        console.error('❌ Erreur lors de la lecture:', error.message);
    }

    console.log('\n');

    // Test 3 : Récupération avec fallback
    console.log('🔄 Test 3 : Récupération avec fallback');
    console.log('-'.repeat(50));
    try {
        const data = await getApicilData();
        console.log('✅ Données récupérées');
        console.log('Source:', data.lastUpdate ? 'Cache' : 'Nouvelle extraction');
        console.log('Données:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Erreur lors de la récupération:', error.message);
    }

    console.log('\n');
    console.log('✅ Tests terminés');
}

// Lance les tests
testCache().catch(console.error);
