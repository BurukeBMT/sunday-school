import QRCode from 'qrcode';
import { Student } from '../types';

export const printIdCard = async (student: Student): Promise<Blob> => {
    const qrData = JSON.stringify({ id: student.id, token: student.qrToken });
    const qrUrl = await QRCode.toDataURL(qrData, { width: 512, margin: 1 });

    const canvas = document.createElement('canvas');
    const canvasWidth = 1500;
    const canvasHeight = 950;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    // Load template
    const templateImg = new Image();
    templateImg.crossOrigin = 'anonymous';
    templateImg.src = '/id templates.png';
    await new Promise((resolve, reject) => {
        templateImg.onload = () => resolve(null);
        templateImg.onerror = reject;
    });
    ctx.drawImage(templateImg, 0, 0, canvasWidth, canvasHeight);

    // QR overlay (left, 1 tab down/right)
    const qrSize = 450;
    const qrX = 150;
    const qrY = 320;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = qrUrl;
    await new Promise((resolve, reject) => {
        qrImg.onload = () => resolve(null);
        qrImg.onerror = reject;
    });
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // Student text (right, 1 tab left)
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.font = 'bold 40px \"Segoe UI\", Arial, sans-serif';
    const textX = canvasWidth / 2 + 20;
    let textY = 340;
    ctx.fillText(`ሙሉ ስም: ${student.fullName}`, textX, textY);
    textY += 70;
    ctx.fillText(`መለያ ቁጥር: ${student.id}`, textX, textY);
    textY += 70;
    ctx.fillText(`ክፍል: ${student.department}`, textX, textY);
    textY += 70;
    ctx.fillText(`ስልክ ቁጥር: ${student.phone}`, textX, textY);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) reject(new Error('Failed to create image'));
            else resolve(blob);
        }, 'image/png');
    });
};
