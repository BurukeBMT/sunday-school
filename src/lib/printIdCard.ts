import QRCode from 'qrcode';
import { Student } from '../types';

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

export const printIdCard = async (student: Student): Promise<Blob> => {
    const qrData = JSON.stringify({ id: student.id, token: student.qrToken });
    const qrUrl = await QRCode.toDataURL(qrData, { width: 256 });
    const qrImg = await loadImage(qrUrl);

    const width = 1050;
    const height = 740;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Unable to create canvas context');

    // Background
    ctx.fillStyle = '#FFFFF0';
    ctx.fillRect(0, 0, width, height);

    // QR background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(60, 90, 260, 260);

    // QR image
    ctx.drawImage(qrImg, 70, 100, 240, 240);

    // Text
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 52px Arial';
    ctx.fillText(student.fullName, 360, 140);

    ctx.font = 'bold 36px Arial';
    ctx.fillText(`ID: ${student.id}`, 360, 200);

    ctx.font = '28px Arial';
    ctx.fillText(student.department, 360, 250);
    ctx.fillText(student.phone, 360, 300);

    ctx.font = '24px Arial';
    if (student.email) {
        ctx.fillText(student.email, 360, 350);
    }

    return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to generate PNG blob'));
        }, 'image/png');
    });
};


