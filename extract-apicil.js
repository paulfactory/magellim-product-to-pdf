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

        // Les données sont sur des lignes séparées dans ce PDF
        // On cherche les patterns directement : "XXX €" ou "XX,XX% (N lignes)"

        // Cherche tous les patterns "nombre €"
        const euroMatches = fullText.match(/[\d\s]+,\d+\s*€/g);
        if (euroMatches && euroMatches.length >= 2) {
            // Le premier gros nombre est l'actif net
            results.actif_net = euroMatches[0].replace('€', '').trim().replace(/\s+/g, ' ');
            // Le second petit nombre est la valeur liquidative
            results.valeur_liquidative = euroMatches[1].replace('€', '').trim().replace(/\s+/g, ' ');
        }

        // Cherche tous les patterns "XX,XX% (N lignes)"
        const pocheMatches = fullText.match(/([\d,]+)%\s*\((\d+)\s+lignes\)/g);
        if (pocheMatches && pocheMatches.length >= 2) {
            // Premier match = poche immobilière
            const immoMatch = pocheMatches[0].match(/([\d,]+)%\s*\((\d+)\s+lignes\)/);
            if (immoMatch) {
                results.poche_immobiliere.pourcentage = immoMatch[1];
                results.poche_immobiliere.nb_lignes = parseInt(immoMatch[2]);
            }

            // Deuxième match = poche liquide
            const liquideMatch = pocheMatches[1].match(/([\d,]+)%\s*\((\d+)\s+lignes\)/);
            if (liquideMatch) {
                results.poche_liquide.pourcentage = liquideMatch[1];
                results.poche_liquide.nb_lignes = parseInt(liquideMatch[2]);
            }
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
