const puppeteer = require("puppeteer");
const path = require("path");

async function generatePDF(urlToScrape) {
	const browser = await puppeteer.launch({
		headless: true, // Mode headless pour le serveur
		args: ['--no-sandbox', '--disable-setuid-sandbox'] // Nécessaire sur certains serveurs
	});
	const page = await browser.newPage();

	// Augmente la taille du viewport et le devicePixelRatio pour de meilleurs graphiques
	await page.setViewport({
		width: 450,
		height: 1000,
		deviceScaleFactor: 2.5
	});

	await page.goto(urlToScrape, {
		waitUntil: "networkidle0",
	});

	const data = await page.evaluate(() => {
		const getText = (selector) => document.querySelector(selector)?.textContent?.trim() || "";

		// Récupère l'URL du background-image
		const getBackgroundImage = (selector) => {
			const el = document.querySelector(selector);
			if (!el) return "";
			const bg = window.getComputedStyle(el).backgroundImage;
			// Extrait l'URL entre url("...") ou url('...')
			const match = bg.match(/url\(['"]?(.+?)['"]?\)/);
			return match ? match[1] : "";
		};

		return {
			topSection: {
				titre: getText(".top-section .post_title"),
				sousTitre: getText(".top-section .wpb_text_column h2"),
				description: getText(".top-section .wpb_text_column p"),
				imageUrl: getBackgroundImage(".top-section .l-section-img"),
			},
			chiffresCles: Array.from(document.querySelectorAll(".chiffres-cles .w-iconbox")).map((box) => ({
				icon: box.querySelector("#presentation .w-iconbox-icon img")?.src || "",
				titre: box.querySelector("#presentation .w-iconbox-meta .w-iconbox-text")?.textContent?.trim() || "",
			})),
			patrimoine: {
				intro: document.querySelector("#patrimoine .wpb_text_column.intro > .wpb_wrapper")?.innerHTML?.trim() || "",
				titleLeft: document.querySelector("#patrimoine .wpb_text_column.title-column-left > .wpb_wrapper")?.innerHTML?.trim() || "",
				titleRight: document.querySelector("#patrimoine .wpb_text_column.title-column-right > .wpb_wrapper")?.innerHTML?.trim() || "",
				mapImage: document.querySelector("#patrimoine .map img")?.src || "",
				items: Array.from(document.querySelectorAll("#patrimoine .item-list .wpb_text_column")).map((col) => col.querySelector(".wpb_wrapper")?.innerHTML?.trim() || ""),
			},
			frais: {
				title: document.querySelector("#frais .section-title")?.textContent?.trim() || "",
				items: Array.from(document.querySelectorAll("#frais .wpb_text_column"))
					.map((col) => ({
						number: col.querySelector(".wpb_wrapper .h2")?.innerHTML?.trim() || "",
						text: col.querySelector(".wpb_wrapper > p:nth-child(2)")?.textContent?.trim() || "",
					}))
					.filter((item) => item.number && item.text), // Filtre les items vides
			},
			// Tableau de performances uniquement (sans les graphiques interactifs)
			tableauPerformances: document.querySelector("#performances .w-html.tableau-performances")?.innerHTML || "",
			// Caractéristiques
			caracteristiques: {
				title: document.querySelector("#caracteristiques .section-title")?.textContent?.trim() || "",
				table: document.querySelector("#caracteristiques table")?.outerHTML || "",
			},
			disponibilite: {
				title: document.querySelector("#disponibilite .section-title h2")?.textContent?.trim() || "",
				logos: Array.from(document.querySelectorAll("#disponibilite .logo-list img")).map((img) => ({
					src: img.src,
					alt: img.alt || "",
				})),
			},
			risques: {
				intro: document.querySelector("#risques .wpb_text_column.intro-text > .wpb_wrapper")?.innerHTML?.trim() || "",
				pastilles: Array.from(document.querySelectorAll("#risques .wpb_text_column.pastille > .wpb_wrapper")).map((pastille) => pastille.innerHTML?.trim() || ""),
			},
			footer: {
				iconsTitle: document.querySelector("#footer-pdf .icons-title")?.innerHTML?.trim() || "",
				icons: Array.from(document.querySelectorAll("#footer-pdf .footer-icons .wpb_text_column")).map((col) => col.innerHTML?.trim() || ""),
				legals: document.querySelector("#footer-pdf .pdf-legals")?.innerHTML?.trim() || "",
			},
		};
	});

	// Scrape les graphiques
	console.log("⏳ Attente du rendu des graphiques...");
	try {
		await page.waitForFunction(
			() => {
				// Vérifie que les canvas existent et que Chart.js les a initialisés
				const canvas1 = document.querySelector("#evolution-perf-chart");
				const canvas2 = document.querySelector("#perf-calendaire-chart");

				return canvas1 && canvas2 && typeof Chart !== "undefined" && Chart.instances && Object.keys(Chart.instances).length >= 2;
			},
			{ timeout: 15000 }
		);

		// Petit délai pour être sûr que tout est bien rendu
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Convertit les canvas Chart.js en images base64 + récupère les titres
		const graphImages = await page.evaluate(() => {
			const graphs = {};

			// Titre général du bloc (h2 "Les performances au...")
			const h2 = document.querySelector("#performances h2");
			graphs.mainTitle = h2 ? h2.textContent.trim() : "";

			// Graphique 1 : Evolution de la performance
			const canvas1 = document.querySelector("#evolution-perf-chart");
			const h3_1 = document.querySelector("#performances .evolutions-performance h3");
			if (canvas1) {
				graphs.evolutionPerf = {
					image: canvas1.toDataURL("image/png"),
					title: h3_1 ? h3_1.textContent.trim() : "",
				};
			}

			// Graphique 2 : Performances calendaires
			const canvas2 = document.querySelector("#perf-calendaire-chart");
			const h3_2 = document.querySelector("#performances .performances-calendaires h3");
			if (canvas2) {
				graphs.perfCalendaires = {
					image: canvas2.toDataURL("image/png"),
					title: h3_2 ? h3_2.textContent.trim() : "",
				};
			}

			return graphs;
		});

		console.log("✅ Graphiques convertis en images");
		data.graphiques = graphImages;
	} catch (error) {
		console.log("⚠️  Pas de graphiques trouvés ou timeout");
		data.graphiques = {};
	}

	// Va sur le template local
	const templatePath = path.join(__dirname, 'template-magellim.html');
	await page.goto("file://" + templatePath);

	// Utilise la fonction globale du template pour injecter
	await page.evaluate((injectedData) => {
		window.injectData(injectedData);
	}, data);

	// Attend que toutes les images soient chargées
	try {
		await page.waitForFunction(
			() => {
				const topImg = document.querySelector("#top-section-img");
				const logoImgs = Array.from(document.querySelectorAll("#disponibilite .logo-list img"));
				const mapImg = document.querySelector("#patrimoine .map img");

				const allImages = [topImg, ...logoImgs, mapImg].filter(img => img);

				return allImages.every(img => img.complete && img.naturalHeight !== 0);
			},
			{ timeout: 10000 }
		);
		console.log("✅ Toutes les images sont chargées");
	} catch (e) {
		console.log("⚠️  Timeout : certaines images peuvent ne pas être chargées");
	}

	// Génère le nom du fichier PDF (sans accents pour compatibilité)
	const topSectionTitle = data.topSection?.titre || "Document";
	const performanceTitle = data.graphiques?.mainTitle || "";

	// Fonction pour enlever les accents
	const removeAccents = (str) => {
		return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	};

	const fileName = removeAccents(`${topSectionTitle} - Reporting du ${performanceTitle}.pdf`)
		.replace(/[/\\?%*:|"<>]/g, "-");

	// Génère le PDF en buffer (au lieu de le sauvegarder)
	const pdfBuffer = await page.pdf({
		format: "A4",
		printBackground: true,
	});

	console.log(`✅ PDF généré : ${fileName}`);
	await browser.close();

	return {
		pdfBuffer,
		fileName
	};
}

module.exports = { generatePDF };
