import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import jsPDF from 'jspdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fs = await import('fs/promises');
const PathMod = await import('path');

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post('/api/bulk-qr', async (req, res) => {
    try {
      const { students } = req.body; // Array of { id, fullName, qrToken }
      const zip = new JSZip();

      for (const student of students) {
        const qrData = JSON.stringify({ id: student.id, token: student.qrToken });
        const qrBuffer = await QRCode.toBuffer(qrData);
        zip.file(`${student.id.replace(/\//g, '_')}_${student.fullName}.png`, qrBuffer);
      }

      const content = await zip.generateAsync({ type: 'nodebuffer' });
      res.set('Content-Type', 'application/zip');
      res.set('Content-Disposition', 'attachment; filename=student_qrs.zip');
      res.send(content);
    } catch (error) {
      console.error('Bulk QR error:', error);
      res.status(500).json({ error: 'Failed to generate ZIP' });
    }
  });

  app.post('/api/bulk-id', async (req, res) => {
    try {
      const { students } = req.body;
      const zip = new JSZip();

      for (const student of students) {
        const qrData = JSON.stringify({ id: student.id, token: student.qrToken });
        const qrUrl = await QRCode.toDataURL(qrData, { width: 256, margin: 1 });

        const pdf = new jsPDF({ unit: 'mm', format: [85.6, 53.98] });

        // Logo - read file
        let logoDataUrl;
        try {
          const logoBuffer = await fs.readFile(PathMod.join(__dirname, '../logo.jpg'));
          const base64 = logoBuffer.toString('base64');
          logoDataUrl = `data:image/jpeg;base64,${base64}`;
          pdf.addImage(logoDataUrl, 'JPEG', 2, 2, 81.6, 49.98, undefined, 'FAST');
        } catch {
          pdf.setFillColor(245, 245, 220);
          pdf.rect(0, 0, 85.6, 53.98, 'F');
        }

        // Pattern
        pdf.setDrawColor(220, 220, 200);
        for (let i = 0; i < 85.6; i += 5) pdf.line(i, 0, i, 53.98);

        // Texts
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.text('Sunday School ID Card', 42.8, 8, { align: 'center' });
        pdf.setFont('courier', 'bold');
        pdf.setFontSize(14);
        pdf.text(student.id, 42.8, 22, { align: 'center' });
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(student.fullName, 42.8, 30, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.text(student.department, 42.8, 38, { align: 'center' });
        pdf.text(student.phone, 42.8, 42, { align: 'center' });

        // QR
        pdf.addImage(qrUrl, 'PNG', 18, 35, 50, 50);

        const pdfBuffer = pdf.output('arraybuffer') as ArrayBuffer;
        zip.file(`SundaySchool_ID_${student.id.replace(/\//g, '_')}.pdf`, Buffer.from(pdfBuffer));
      }

      const content = await zip.generateAsync({ type: 'nodebuffer' });
      res.set('Content-Type', 'application/zip');
      res.set('Content-Disposition', 'attachment; filename=sunday_school_ids.zip');
      res.send(content);
    } catch (error) {
      console.error('Bulk ID error:', error);
      res.status(500).json({ error: 'Failed to generate ID ZIP' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
