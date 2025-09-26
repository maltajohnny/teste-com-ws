import fs from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';

const screenshotsDir = './cypress/screenshots';
const outputPath = './report/test-report-login.pdf';

const generatePDF = () => {
    const doc = new PDFDocument({ margin: 30 });
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    doc.fontSize(20).text('Relatório de Teste: Funcionalidade | Login', { align: 'center' });
    doc.moveDown();

    const specs = fs.readdirSync(screenshotsDir);
    specs.forEach(specFile => {
        const specPath = path.join(screenshotsDir, specFile);
        const images = fs.readdirSync(specPath);

        images.forEach(img => {
            const testName = img.replace('.png', '');

            doc.fontSize(14).fillColor('black').text(`Teste: ${testName}`, { underline: true });
            doc.image(path.join(specPath, img), {
                fit: [500, 300],
                align: 'center',
                valign: 'center',
            });
            doc.addPage(); // nova página por teste
        });
    });

    doc.end();
};

generatePDF();
