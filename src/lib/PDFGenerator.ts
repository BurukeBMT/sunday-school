import jsPDF from 'jspdf';
import { Student, Parent } from '../types';

export class PDFGenerator {
    static generateStudentPDF(student: Student, credentials: { username: string; password: string; email: string }): Promise<Blob> {
        return new Promise((resolve) => {
            const pdf = new jsPDF();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Header
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ፍሬ ሃይማኖት ሰ/ት/ቤት', pageWidth / 2, 30, { align: 'center' });

            pdf.setFontSize(16);
            pdf.text('Sunday School Management System', pageWidth / 2, 45, { align: 'center' });

            // Subtitle
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Student Registration Confirmation', pageWidth / 2, 60, { align: 'center' });

            // Student Information
            pdf.setFontSize(12);
            let yPos = 80;

            pdf.setFont('helvetica', 'bold');
            pdf.text('Student Information:', 20, yPos);
            yPos += 15;

            pdf.setFont('helvetica', 'normal');
            pdf.text(`Full Name: ${student.fullName}`, 20, yPos);
            yPos += 10;
            pdf.text(`Student ID: ${student.id}`, 20, yPos);
            yPos += 10;
            pdf.text(`Grade: ${student.grade}`, 20, yPos);
            yPos += 10;
            pdf.text(`Department: ${student.department}`, 20, yPos);
            yPos += 20;

            // Login Credentials
            pdf.setFont('helvetica', 'bold');
            pdf.text('Login Credentials:', 20, yPos);
            yPos += 15;

            pdf.setFont('helvetica', 'normal');
            pdf.text(`Username: ${credentials.username}`, 20, yPos);
            yPos += 10;
            pdf.text(`Temporary Password: ${credentials.password}`, 20, yPos);
            yPos += 10;
            pdf.text(`Email: ${credentials.email}`, 20, yPos);
            yPos += 20;

            // Instructions
            pdf.setFont('helvetica', 'bold');
            pdf.text('Important Instructions:', 20, yPos);
            yPos += 15;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const instructions = [
                '1. Use your Student ID as username to login',
                '2. Use the temporary password provided above',
                '3. You will be required to change your password on first login',
                '4. Keep this document safe and secure',
                '5. Contact school administration if you have any issues'
            ];

            instructions.forEach(instruction => {
                pdf.text(instruction, 20, yPos);
                yPos += 8;
            });

            // Footer
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'italic');
            pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, pageHeight - 20);
            pdf.text(`Student ID: ${student.id}`, pageWidth - 20, pageHeight - 20, { align: 'right' });

            resolve(pdf.output('blob'));
        });
    }

    static generateParentPDF(parent: Parent, children: Student[], credentials: { username: string; password: string; email?: string }): Promise<Blob> {
        return new Promise((resolve) => {
            const pdf = new jsPDF();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Header
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ፍሬ ሃይማኖት ሰ/ት/ቤት', pageWidth / 2, 30, { align: 'center' });

            pdf.setFontSize(16);
            pdf.text('Parent Portal Access', pageWidth / 2, 45, { align: 'center' });

            // Subtitle
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Parent Registration Confirmation', pageWidth / 2, 60, { align: 'center' });

            // Parent Information
            pdf.setFontSize(12);
            let yPos = 80;

            pdf.setFont('helvetica', 'bold');
            pdf.text('Parent Information:', 20, yPos);
            yPos += 15;

            pdf.setFont('helvetica', 'normal');
            pdf.text(`Parent ID: ${parent.parentId}`, 20, yPos);
            yPos += 10;
            pdf.text(`Phone: ${parent.phone}`, 20, yPos);
            yPos += 10;
            if (parent.email) {
                pdf.text(`Email: ${parent.email}`, 20, yPos);
                yPos += 10;
            }
            yPos += 10;

            // Login Credentials
            pdf.setFont('helvetica', 'bold');
            pdf.text('Login Credentials:', 20, yPos);
            yPos += 15;

            pdf.setFont('helvetica', 'normal');
            pdf.text(`Username: ${credentials.username}`, 20, yPos);
            yPos += 10;
            pdf.text(`Temporary Password: ${credentials.password}`, 20, yPos);
            yPos += 10;
            if (credentials.email) {
                pdf.text(`Email: ${credentials.email}`, 20, yPos);
                yPos += 10;
            }
            yPos += 10;

            // Children Information
            pdf.setFont('helvetica', 'bold');
            pdf.text('Registered Children:', 20, yPos);
            yPos += 15;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            children.forEach((child, index) => {
                pdf.text(`${index + 1}. ${child.fullName} (ID: ${child.id}, Grade: ${child.grade})`, 25, yPos);
                yPos += 8;
            });

            yPos += 10;

            // Instructions
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text('Important Instructions:', 20, yPos);
            yPos += 15;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const instructions = [
                '1. Use your phone number as username to login',
                '2. Use the temporary password provided above',
                '3. You will be required to change your password on first login',
                '4. You can monitor your children\'s attendance and grades',
                '5. Keep this document safe and secure',
                '6. Contact school administration if you have any issues'
            ];

            instructions.forEach(instruction => {
                pdf.text(instruction, 20, yPos);
                yPos += 8;
            });

            // Footer
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'italic');
            pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, pageHeight - 20);
            pdf.text(`Parent ID: ${parent.parentId}`, pageWidth - 20, pageHeight - 20, { align: 'right' });

            resolve(pdf.output('blob'));
        });
    }

    static downloadBlob(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}