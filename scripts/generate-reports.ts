import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import os from 'os';

function getFormattedDateTime(): string {
  const now = new Date();
  const date = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
  const time = now
    .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    .replace(':', '-');
  return `${date} ${time}`;
}

interface TestCase {
  title: string;
  screenshotName: string;
}

interface TestContext {
  contextoTitle: string;
  testCases: TestCase[];
}

function extractContextsAndTests(filePath: string): TestContext[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const contexts: TestContext[] = [];

  const describeRegex =
    /describe\s*\(\s*["'`](.+?)["'`],\s*\(\)\s*=>\s*\{([\s\S]*?)\n\}\s*\)/g;
  let describeMatch;

  while ((describeMatch = describeRegex.exec(content)) !== null) {
    const describeTitle = describeMatch[1];
    const describeBlockContent = describeMatch[2];

    const contextRegex =
      /context\s*\(\s*["'`](.+?)["'`],\s*\(\)\s*=>\s*\{([\s\S]*?)\n\}\s*\)/g;
    const contextsFound: TestContext[] = [];
    let contextMatch;

    while ((contextMatch = contextRegex.exec(describeBlockContent)) !== null) {
      const contextTitle = contextMatch[1];
      const contextBlock = contextMatch[2];

      const itRegex = /it\s*\(\s*["'`](.+?)["'`],/g;
      const screenshotRegex = /cy\.screenshot\s*\(\s*["'`](.+?)["'`]\s*\)/g;

      const its = [...contextBlock.matchAll(itRegex)].map((m) => m[1]);
      const shots = [...contextBlock.matchAll(screenshotRegex)].map((m) => m[1]);

      const testCases: TestCase[] = [];
      const count = Math.min(its.length, shots.length);

      for (let i = 0; i < count; i++) {
        testCases.push({ title: its[i], screenshotName: shots[i] });
      }

      if (testCases.length > 0) {
        contextsFound.push({ contextoTitle: contextTitle, testCases });
      }
    }

    if (contextsFound.length > 0) {
      contexts.push(...contextsFound);
    } else {
      const itRegex = /it\s*\(\s*["'`](.+?)["'`],/g;
      const screenshotRegex = /cy\.screenshot\s*\(\s*["'`](.+?)["'`]\s*\)/g;

      const its = [...describeBlockContent.matchAll(itRegex)].map((m) => m[1]);
      const shots = [...describeBlockContent.matchAll(screenshotRegex)].map(
        (m) => m[1]
      );

      const testCases: TestCase[] = [];
      const count = Math.min(its.length, shots.length);

      for (let i = 0; i < count; i++) {
        testCases.push({ title: its[i], screenshotName: shots[i] });
      }

      if (testCases.length > 0) {
        contexts.push({ contextoTitle: describeTitle, testCases });
      }
    }
  }

  if (contexts.length === 0) {
    const itRegex = /it\s*\(\s*["'`](.+?)["'`],/g;
    const screenshotRegex = /cy\.screenshot\s*\(\s*["'`](.+?)["'`]\s*\)/g;

    const its = [...content.matchAll(itRegex)].map((m) => m[1]);
    const shots = [...content.matchAll(screenshotRegex)].map((m) => m[1]);

    const testCases: TestCase[] = [];
    const count = Math.min(its.length, shots.length);

    for (let i = 0; i < count; i++) {
      testCases.push({ title: its[i], screenshotName: shots[i] });
    }

    if (testCases.length > 0) {
      contexts.push({ contextoTitle: 'Contexto não definido', testCases });
    }
  }

  return contexts;
}

function generateReportForFolder(folderPath: string) {
  const folderName = path.basename(folderPath);
  const dateTime = getFormattedDateTime();
  const userName = os.userInfo().username;

  const outputDir = path.resolve(__dirname, '../report');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(
    outputDir,
    `${folderName}_${dateTime.replace(' ', '_')}.pdf`
  );

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(fs.createWriteStream(outputPath));

  // === Fonte Arial ===
  const arialFontPath =
    process.platform === 'win32'
      ? 'C:/Windows/Fonts/arial.ttf'
      : '/System/Library/Fonts/Supplemental/Arial.ttf';

  doc.registerFont('Arial', arialFontPath);
  doc.font('Arial');

  // Cabeçalho geral
  doc
    .fontSize(20)
    .font('Arial')
    .fillColor('black')
    .text(`Relatório de Testes: Funcionalidade | ${folderName}`, {
      align: 'center',
    });
  doc.moveDown();

  const screenshotsBase = path.resolve(__dirname, '../cypress/screenshots');

  const testFiles = fs
    .readdirSync(folderPath)
    .filter((f) => f.endsWith('.cy.ts') || f.endsWith('.cy.js'));
  if (testFiles.length === 0) {
    doc
      .fillColor('red')
      .font('Arial')
      .fontSize(14)
      .text(
        'Nenhum arquivo de teste (.cy.ts) encontrado nesta funcionalidade.'
      );
  }

  for (const testFile of testFiles) {
    const testFilePath = path.join(folderPath, testFile);
    const contexts = extractContextsAndTests(testFilePath);

    for (const context of contexts) {
      // Contexto
      doc
        .fontSize(14)
        .font('Arial')
        .fillColor('#8e44ad')
        .text('Contexto: ', { continued: true })
        .fillColor('black')
        .font('Arial')
        .text(context.contextoTitle);
      doc.moveDown(0.5);

      // Tester e Data
      doc
        .fontSize(12)
        .font('Arial')
        .fillColor('#2980b9')
        .text('Tester: ', { continued: true })
        .fillColor('black')
        .font('Arial')
        .text(userName, { continued: true })
        .fillColor('#2980b9')
        .font('Arial')
        .text('    Data: ', { continued: true })
        .fillColor('black')
        .font('Arial')
        .text(dateTime);
      doc.moveDown(1);

      // Casos de teste
      context.testCases.forEach((testCase, idx) => {
        // Número em preto
        doc
          .fontSize(12)
          .font('Arial')
          .fillColor('black')
          .text(`${idx + 1}. `, { continued: true });
        // Título inteiro em verde
        doc
          .fillColor('#27ae60')
          .font('Arial')
          .text(testCase.title);
        doc.moveDown(0.5);

        const possiblePaths = [
          path.join(screenshotsBase, folderName, `${testCase.screenshotName}.png`),
          path.join(screenshotsBase, testFile, `${testCase.screenshotName}.png`),
          path.join(screenshotsBase, folderName, testCase.screenshotName + '.png'),
        ];

        let imagePath: string | null = null;
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            imagePath = p;
            break;
          }
        }

        if (imagePath) {
          try {
            doc.image(imagePath, { fit: [400, 300], align: 'center' });
            doc.moveDown(1);
          } catch {
            doc
              .fillColor('red')
              .font('Arial')
              .text(`Erro ao inserir imagem: ${imagePath}`);
            doc.moveDown(1);
          }
        } else {
          doc
            .fillColor('red')
            .font('Arial')
            .text(`Imagem não encontrada para "${testCase.screenshotName}"`);
          doc.moveDown(1);
        }
      });

      // Linha separadora antes de outro contexto
      doc
        .moveDown(1)
        .strokeColor('#cccccc')
        .lineWidth(1)
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke()
        .moveDown(1);
    }
  }

  doc.end();
  console.log(`PDF gerado: ${outputPath}`);
}

function main() {
  const e2ePath = path.resolve(__dirname, '../cypress/e2e');
  if (!fs.existsSync(e2ePath)) {
    console.error('Pasta cypress/e2e não encontrada');
    return;
  }

  const funcionalidades = fs
    .readdirSync(e2ePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(e2ePath, dirent.name));

  if (funcionalidades.length === 0) {
    console.error('Nenhuma funcionalidade (pasta) encontrada em cypress/e2e');
    return;
  }

  for (const funcPath of funcionalidades) {
    generateReportForFolder(funcPath);
  }
}

main();
