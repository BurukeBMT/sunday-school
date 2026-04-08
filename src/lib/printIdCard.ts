import QRCode from 'qrcode'; // Library to generate QR codes
import { Student } from '../types'; // Your Student type definition

// 🔧 Helper function to load images (template + QR)
const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image(); // Create new image object
        img.crossOrigin = 'anonymous'; // Allow loading images safely (important for canvas)
        img.onload = () => resolve(img); // Resolve when image loads
        img.onerror = reject; // Reject if loading fails
        img.src = src; // Set image source
    });
};

// 🎯 Main function to generate ID card as image (PNG blob)
export const printIdCard = async (student: Student): Promise<Blob> => {

    // 📌 Path to your background ID template
    const templateUrl = encodeURI('/id templates.png');

    // ⏳ Load template image and generate QR at the same time
    const [templateImg, qrDataUrl] = await Promise.all([
        loadImage(templateUrl), // Load background image
        QRCode.toDataURL( // Generate QR code as base64 image
            JSON.stringify({ id: student.id, token: student.qrToken }), // QR content
            { width: 260 } // QR resolution (smaller for better layout)
        )
    ]);

    // 🖼 Convert QR base64 into image
    const qrImg = await loadImage(qrDataUrl);

    // 📏 Get template dimensions
    const width = templateImg.naturalWidth;
    const height = templateImg.naturalHeight;

    // 🎨 Create canvas with same size as template
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // 🖌 Get drawing context
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas error'); // Safety check

    // 🖼 Draw the background template first
    ctx.drawImage(templateImg, 0, 0, width, height);

    // 📐 General spacing from edges
    const padding = Math.round(width * 0.1);

    // 🔳 QR CODE SETTINGS

    const qrSize = Math.round(width * 0.40); // QR size (25% of width)
    const qrX = padding; // Left position
    const qrY = Math.round(height * 0.36); // Move QR down for better alignment

    // ⚪ Draw white background behind QR for visibility
    const border = Math.round(width * 0.001); // Small padding around QR
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; // Almost white
    ctx.fillRect(
        qrX - border,
        qrY - border,
        qrSize + border * 2,
        qrSize + border * 2
    );

    // 🔳 Draw QR image on canvas
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // 📝 TEXT AREA (RIGHT SIDE)

    const textX = qrX + qrSize + padding; // Start after QR
    const textWidth = width - textX - padding; // Max width for text

    let currentY = qrY + 20; // Align text with top of QR

    ctx.fillStyle = '#1a1a1a'; // Text color (dark)
    ctx.textBaseline = 'top'; // Align text from top

    // 👤 FULL NAME
    ctx.font = `bold ${Math.round(width * 0.04)}px Nyala`; // Big bold font
    ctx.fillText(
        `ሙሉ ስም፡ ${student.fullName}`, // Text content
        textX,
        currentY,
        textWidth
    );

    // 🆔 STUDENT ID
    currentY += Math.round(height * 0.07); // Move down
    ctx.font = `bold ${Math.round(width * 0.04)}px Nyala`;
    ctx.fillText(
        `ID: ${student.id}`,
        textX,
        currentY,
        textWidth
    );

    // 🏫 DEPARTMENT
    currentY += Math.round(height * 0.07);
    ctx.font = `${Math.round(width * 0.038)}px Nyala`;
    ctx.fillText(
        `ክፍል፡ ${student.department}`,
        textX,
        currentY,
        textWidth
    );

    // 📧 EMAIL (optional)
    if (student.email) {
        currentY += Math.round(height * 0.07);
        ctx.fillText(
            `ኢ-ሜይል፡ ${student.email}`,
            textX,
            currentY,
            textWidth
        );
    }

    // � PHONE (optional)
    if (student.phone) {
        currentY += Math.round(height * 0.07);
        ctx.fillText(
            `ስልክ፡ ${student.phone}`,
            textX,
            currentY,
            textWidth
        );
    }
    return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob); // Return image
            else reject(new Error('PNG generation failed'));
        }, 'image/png');
    });
};