import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Carrega variáveis do cypress.env.json
const cypressEnvPath = path.resolve(__dirname, '../../cypress.env.json');
const cypressEnv = JSON.parse(fs.readFileSync(cypressEnvPath, 'utf-8'));

// Caminho da pasta de relatórios
const reportDir = path.resolve(__dirname, '../../report');

// Lista todos os arquivos .pdf da pasta report/
function getAllPdfAttachments(): { filename: string, content: fs.ReadStream }[] {
    const files = fs.readdirSync(reportDir)
        .filter(file => file.endsWith('.pdf'));

    if (files.length === 0) {
        console.warn('⚠️ Nenhum PDF encontrado na pasta report/');
    }

    return files.map(file => ({
        filename: file,
        content: fs.createReadStream(path.join(reportDir, file)),
    }));
}

const sendEmail = async () => {
    const attachments = getAllPdfAttachments();

    if (attachments.length === 0) {
        console.error('❌ Nenhum arquivo para enviar. Abortando envio de e-mail.');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: cypressEnv.EMAIL_USER,
            pass: cypressEnv.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Relatórios QA" <${cypressEnv.EMAIL_USER}>`,
        to: 'johnny.malta@cd2.com.br, soraia.mendes@asssai.com.br, fernando.sparapani@cd2.com.br, washington.brandao@cd2.com.br',
        subject: `Relatórios de Testes Automatizados`,
        text: 'Segue em anexo os relatórios gerados pelos testes.',
        attachments,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email enviado com ${attachments.length} arquivo(s) PDF.`);
    } catch (error) {
        console.error('❌ Erro ao enviar email:', error);
    }
};

sendEmail();
