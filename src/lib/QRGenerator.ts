import QRCode from 'qrcode';

export class QRGenerator {
    static async generateLoginQR(username: string, password: string, userType: 'student' | 'parent'): Promise<string> {
        const loginUrl = `${window.location.origin}/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=${userType}`;

        try {
            const qrCodeDataURL = await QRCode.toDataURL(loginUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            });

            return qrCodeDataURL;
        } catch (error) {
            console.error('Error generating QR code:', error);
            throw new Error('Failed to generate QR code');
        }
    }

    static async generateStudentQR(studentId: string, username: string, password: string): Promise<string> {
        return this.generateLoginQR(username, password, 'student');
    }

    static async generateParentQR(parentId: string, username: string, password: string): Promise<string> {
        return this.generateLoginQR(username, password, 'parent');
    }

    static downloadQRImage(qrDataURL: string, filename: string): void {
        const link = document.createElement('a');
        link.href = qrDataURL;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    static createQRCanvas(qrDataURL: string): Promise<HTMLCanvasElement> {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                resolve(canvas);
            };

            img.onerror = () => {
                reject(new Error('Failed to load QR code image'));
            };

            img.src = qrDataURL;
        });
    }
}