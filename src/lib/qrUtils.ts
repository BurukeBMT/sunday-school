import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Student } from '../types';

export const generateQRUrl = (student: Student): string => {
    const qrData = JSON.stringify({ id: student.id, token: student.qrToken });
    return qrData;
};

export const generateIdCardPdf = (student: Student): Blob => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [105, 74]
    });

    // Background
    doc.setFillColor(255, 255, 240);
    doc.rect(0, 0, 105, 74, 'F');

    // QR area
    doc.setFillColor(255, 255, 255);
    doc.rect(5, 15, 30, 30, 'F');

    // QR (use canvas for embedding)
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        QRCode.toCanvas(canvas, generateQRUrl(student), { width: 128 }, (err) => {
            if (err) console.error('QR error', err);
        });
    }

    const qrDataUrl = canvas.toDataURL('image/png');
    doc.addImage(qrDataUrl, 'PNG', 7, 17, 26, 26);

    // Text
    doc.setFontSize(12);
    doc.text(student.fullName, 42, 20);
    doc.setFontSize(10);
    doc.text(student.id, 42, 32);
    doc.text(student.department, 42, 40);
    doc.text(student.phone, 42, 48);

    return doc.output('blob');
};

export const downloadIdCard = async (student: Student) => {
    const blob = generateIdCardPdf(student);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SundaySchool_ID_${student.id.replace(/\//g, '_')}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
};

