import QRCode from 'qrcode';
import { Student } from '../types';

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

export const printIdCard = async (student: Student): Promise<Blob> => {
    const templateUrl = encodeURI('/id templates.png');
    const [templateImg, qrDataUrl] = await Promise.all([
        loadImage(templateUrl),
        QRCode.toDataURL(JSON.stringify({ id: student.id, token: student.qrToken }), { width: 256 })
    ]);

    const qrImg = await loadImage(qrDataUrl);
    const width = templateImg.naturalWidth;
    const height = templateImg.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to create canvas context');

    ctx.drawImage(templateImg, 0, 0, width, height);

    const padding = Math.round(width * 0.05);
    const qrSize = Math.round(width * 0.2);
    const qrX = padding;
    const qrY = Math.round(height * 0.28);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);

    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    const textX = qrX + qrSize + padding;
    const textWidth = width - textX - padding;
    let currentY = qrY;
    ctx.fillStyle = '#1a1a1a';
    ctx.textBaseline = 'top';

    ctx.font = `bold ${Math.max(Math.round(width * 0.055), 30)}px Arial`;
    ctx.fillText(student.fullName, textX, currentY, textWidth);

    currentY += Math.round(height * 0.08);
    ctx.font = `bold ${Math.max(Math.round(width * 0.04), 24)}px Arial`;
    ctx.fillText(`ID: ${student.id}`, textX, currentY, textWidth);

    currentY += Math.round(height * 0.06);
    ctx.font = `${Math.max(Math.round(width * 0.035), 20)}px Arial`;
    ctx.fillText(student.department, textX, currentY, textWidth);

    currentY += Math.round(height * 0.05);
    ctx.fillText(student.phone, textX, currentY, textWidth);

    if (student.email) {
        currentY += Math.round(height * 0.045);
        ctx.fillText(student.email, textX, currentY, textWidth);
    }

    return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to generate PNG blob'));
        }, 'image/png');
    });
};


