import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Student } from '../types';

export const printIdCard = async (student: Student): Promise<Blob> => {
    const qrData = JSON.stringify({ id: student.id, token: student.qrToken });
    const qrUrl = await QRCode.toDataURL(qrData, { width: 256 });

    // Create PDF
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [105, 74] // ID card size approx 105x74mm
    });

    // Background (simulate template)
    doc.setFillColor(255, 255, 240);
    doc.rect(0, 0, 105, 74, 'F');

    doc.setFillColor(255, 255, 255);
    doc.rect(5, 15, 30, 30, 'F'); // QR background

    // QR Code
    const qrImg = new Image();
    qrImg.src = qrUrl;
    doc.addImage(qrImg, 'PNG', 7, 17, 26, 26);

    // Student Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(student.fullName, 42, 20);

    doc.setFontSize(10);
    doc.text(`ID: ${student.id}`, 42, 32);
    doc.text(student.department, 42, 40);
    doc.text(student.phone, 42, 48);

    return new Promise<Blob>((resolve) => {
        const blob = doc.output('blob');
        resolve(blob);
    });
};

export const generateBulkQRs = async (students: Student[]): Promise<Blob> => {
    const zip = new JSZip();
    for (const student of students) {
        const blob = await printIdCard(student);
        zip.file(`${student.id.replace(/\//g, '_')}.pdf`, blob);
    }
    return zip.generateAsync({ type: 'blob' });
};

