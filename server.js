const express = require('express');
const cors = require('cors');
const { generatePDF } = require('./generate-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS désactivé - géré par nginx
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API Magellim PDF Generator',
        endpoints: {
            generatePdf: 'POST /generate-pdf',
            testApicil: 'GET /test-apicil'
        }
    });
});

// Route de test APICIL
app.get('/test-apicil', async (req, res) => {
    try {
        const { extractApicilData } = require('./extract-apicil');
        console.log('🧪 Test extraction APICIL...');

        const data = await extractApicilData(req.query.debug === 'true');

        console.log('✅ Données extraites:', data);

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route principale : génération du PDF
app.post('/generate-pdf', async (req, res) => {
    try {
        const { url, template, css } = req.body;

        if (!url) {
            return res.status(400).json({
                error: 'URL manquante. Envoie { "url": "https://...", "template": "...", "css": "..." }'
            });
        }

        console.log(`📄 Génération du PDF pour : ${url}`);

        // Génère le PDF avec template/CSS optionnels
        const { pdfBuffer, fileName } = await generatePDF(url, template, css);

        // Envoie le PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(pdfBuffer);

        console.log(`✅ PDF envoyé : ${fileName}`);

    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({
            error: 'Erreur lors de la génération du PDF',
            details: error.message
        });
    }
});

// Écoute sur toutes les interfaces (IPv4 + IPv6)
const server = app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

// Force l'écoute en dual-stack
server.on('listening', () => {
    const address = server.address();
    console.log(`📡 Écoute sur ${address.address}:${address.port}`);
});
