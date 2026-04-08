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
        QRCode.toDataURL(
            JSON.stringify({ id: student.id, token: student.qrToken }),
            { width: 300 }
        )
    ]);

    const qrImg = await loadImage(qrDataUrl);

    const width = templateImg.naturalWidth;
    const height = templateImg.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to create canvas context');

    // 🖼 Draw background template
    ctx.drawImage(templateImg, 0, 0, width, height);

    // 🔧 Layout settings
    const padding = Math.round(width * 0.04);

    // 🔳 Bigger QR (LEFT SIDE)
    const qrSize = Math.round(width * 0.3);
    const qrX = padding;
    const qrY = Math.round(height * 0.22);

    // 🟦 White background behind QR (clean look)
    const border = Math.round(width * 0.01);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(qrX - border, qrY - border, qrSize + border * 2, qrSize + border * 2);

    // 🔳 Draw QR
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // 📝 TEXT AREA (RIGHT SIDE)
    const textX = qrX + qrSize + padding * 1.5;
    const textWidth = width - textX - padding;

    let currentY = qrY + Math.round(height * 0.02);

    ctx.fillStyle = '#1a1a1a';
    ctx.textBaseline = 'top';

    // 👤 Full Name
    ctx.font = `bold ${Math.round(width * 0.06)}px Arial`;
    ctx.fillText(`ሙሉ ስም፡ ${student.fullName}`, textX, currentY, textWidth);

    // 🆔 ID
    currentY += Math.round(height * 0.08);
    ctx.font = `bold ${Math.round(width * 0.045)}px Arial`;
    ctx.fillText(`ID: ${student.id}`, textX, currentY, textWidth);

    // 🏫 Department
    currentY += Math.round(height * 0.06);
    ctx.font = `${Math.round(width * 0.04)}px Arial`;
    ctx.fillText(`ክፍል፡ ${student.department}`, textX, currentY, textWidth);

    // 📧 Email (optional)
    if (student.email) {
        currentY += Math.round(height * 0.05);
        ctx.fillText(`ኢ-ሜይል፡ ${student.email}`, textX, currentY, textWidth);
    }

    // 📦 Convert canvas to image blob
    return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to generate PNG blob'));
        }, 'image/png');
    });
};