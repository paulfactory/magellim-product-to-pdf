const express = require('express');
const cors = require('cors');
const { generatePDF } = require('./generate-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'https://www.groupemagellim.com',
    exposedHeaders: ['Content-Disposition']
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

// Écoute sur toutes les interfaces (IPv4 + IPv6)
const server = app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

// Force l'écoute en dual-stack
server.on('listening', () => {
    const address = server.address();
    console.log(`📡 Écoute sur ${address.address}:${address.port}`);
});
