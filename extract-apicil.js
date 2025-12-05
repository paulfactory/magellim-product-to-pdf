const fetch = require('node-fetch');
const pdfParse = require('pdf-parse');

const APICIL_PDF_URL = 'https://www.viagenerations.fr/documents/2/Relevé%20de%20situation%20Groupe%20APICIL.pdf';

async function extractApicilData() {
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

        // Extrait les données avec les regex du script Python
        const results = {
            actif_net: null,
            valeur_liquidative: null,
            poche_immobiliere: { pourcentage: null, nb_lignes: 0 },
            poche_liquide: { pourcentage: null, nb_lignes: 0 }
        };

        // Actif net
        const actifNetPattern = /Actif\s+net\s*:?\s*([\d\s,\.]+)\s*€?/i;
        let match = fullText.match(actifNetPattern);
        if (match) {
            results.actif_net = match[1].trim();
        }

        // Valeur liquidative
        const vlPattern = /Valeur\s+liquidative\s*:?\s*([\d\s,\.]+)\s*€?/i;
        match = fullText.match(vlPattern);
        if (match) {
            results.valeur_liquidative = match[1].trim();
        }

        // Poche immobilière
        const pocheImmoPattern = /[Pp]oche\s+immobili[èe]re\s*([\d,\.]+)%\s*\((\d+)\s+lignes\)/;
        match = fullText.match(pocheImmoPattern);
        if (match) {
            results.poche_immobiliere.pourcentage = match[1];
            results.poche_immobiliere.nb_lignes = parseInt(match[2]);
        }

        // Poche liquide
        const pocheLiquidePattern = /[Pp]oche\s+liquide\s*([\d,\.]+)%\s*\((\d+)\s+lignes\)/;
        match = fullText.match(pocheLiquidePattern);
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
