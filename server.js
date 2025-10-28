const express = require('express');
const cors = require('cors');
const { generatePDF } = require('./generate-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    exposedHeaders: ['Content-Disposition'] // Expose le header pour le navigateur
}));
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API Magellim PDF Generator',
        endpoints: {
            generatePdf: 'POST /generate-pdf'
        }
    });
});

// Route principale : génération du PDF
app.post('/generate-pdf', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                error: 'URL manquante. Envoie { "url": "https://..." }'
            });
        }

        console.log(`📄 Génération du PDF pour : ${url}`);

        // Génère le PDF
        const { pdfBuffer, fileName } = await generatePDF(url);

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

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
