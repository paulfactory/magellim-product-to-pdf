const fetch = require('node-fetch');
const pdfParse = require('pdf-parse');

const APICIL_PDF_URL = 'https://www.viagenerations.fr/documents/2/Relevé%20de%20situation%20Groupe%20APICIL.pdf';

async function extractApicilData(debug = false) {
    console.log('📥 Téléchargement du PDF APICIL...');

    try {
        // Télécharge le PDF
        const response = await fetch(APICIL_PDF_URL);
        if (!response.ok) {
            throw new Error(`Erreur téléchargement: ${response.status}`);
        }

        const buffer = await response.buffer();
        console.log('✅ PDF téléchargé');

        // Parse le PDF
        console.log('📄 Extraction du texte...');
        const data = await pdfParse(buffer);
        const fullText = data.text;

        // Mode debug : affiche le texte complet
        if (debug) {
            console.log('='.repeat(80));
            console.log('TEXTE COMPLET EXTRAIT :');
            console.log('='.repeat(80));
            console.log(fullText);
            console.log('='.repeat(80));
        }

        // Extrait les données avec les regex du script Python
        const results = {
            actif_net: null,
            valeur_liquidative: null,
            poche_immobiliere: { pourcentage: null, nb_lignes: 0 },
            poche_liquide: { pourcentage: null, nb_lignes: 0 }
        };

        // Actif net : cherche un grand nombre (avec espaces) suivi de €
        const actifNetPattern = /Actif\s+net[\s\S]{0,100}?([\d\s]{5,}[\d,]+)\s*€/i;
        let match = fullText.match(actifNetPattern);
        if (match) {
            results.actif_net = match[1].trim().replace(/\s+/g, ' ');
        }

        // Valeur liquidative : cherche un petit nombre (< 1000) suivi de €
        const vlPattern = /Valeur\s+liquidative[\s\S]{0,100}?(\d{1,3},\d{2})\s*€/i;
        match = fullText.match(vlPattern);
        if (match) {
            results.valeur_liquidative = match[1].trim();
        }

        // Poche immobilière : proche de 98% avec 505 lignes
        const pocheImmoPattern = /Poche\s+immobili[èe]re[\s\S]{0,50}?([\d,]+)%\s*\((\d+)\s+lignes\)/i;
        match = fullText.match(pocheImmoPattern);
        if (match) {
            results.poche_immobiliere.pourcentage = match[1];
            results.poche_immobiliere.nb_lignes = parseInt(match[2]);
        }

        // Poche liquide : cherche APRÈS poche immobilière
        const pocheImmoIndex = fullText.toLowerCase().indexOf('poche immobilière');
        const textAfterImmo = pocheImmoIndex >= 0 ? fullText.substring(pocheImmoIndex + 50) : fullText;
        const pocheLiquidePattern = /Poche\s+liquide[\s\S]{0,50}?([\d,]+)%\s*\((\d+)\s+lignes\)/i;
        match = textAfterImmo.match(pocheLiquidePattern);
        if (match) {
            results.poche_liquide.pourcentage = match[1];
            results.poche_liquide.nb_lignes = parseInt(match[2]);
        }

        console.log('✅ Données APICIL extraites:', results);
        return results;

    } catch (error) {
        console.error('❌ Erreur extraction APICIL:', error.message);
        // Retourne des valeurs null en cas d'erreur
        return {
            actif_net: null,
            valeur_liquidative: null,
            poche_immobiliere: { pourcentage: null, nb_lignes: 0 },
            poche_liquide: { pourcentage: null, nb_lignes: 0 }
        };
    }
}

module.exports = { extractApicilData };
