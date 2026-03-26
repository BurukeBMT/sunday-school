import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
