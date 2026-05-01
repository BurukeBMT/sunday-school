import jsPDF from 'jspdf';
import { getTranscriptData } from '../lib/firebaseService';
import { TranscriptData } from '../types';

export const generateTranscriptPDF = async (studentId: string): Promise<void> => {
    try {
        // Fetch transcript data
        const transcript: TranscriptData = await getTranscriptData(studentId);

        // Create PDF document
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 20;

        // School Header
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('የኢትዮጵያ ኦርቶዶክስ ተያያዮች ቤተ ክርስቲያን', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        pdf.setFontSize(16);
        pdf.text('የሰንበት ትምህርት ቤት ስርዓት', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;

        // Title
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('የለምዱ ስብዕና ምስክር ወረቀት', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;

        // Student Information
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        const studentInfo = [
            ['የለምዱ ስም:', transcript.studentName],
            ['የለምዱ መለያ ቁጥር:', transcript.studentId],
            ['ክፍል:', transcript.grade],
            ['አጠቃላይ አማካኝ ውጤት:', `${transcript.totalAverage.toFixed(1)}%`],
            ['አጠቃላይ ደረጃ:', `#${transcript.overallRank}`]
        ];

        studentInfo.forEach(([label, value]) => {
            pdf.text(`${label} ${value}`, 20, yPosition);
            yPosition += 8;
        });

        yPosition += 10;

        // Course Results Header
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('የኮርሶች ውጤቶች', 20, yPosition);
        yPosition += 15;

        // Table Header
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        const tableHeaders = ['ኮርስ ስም', 'ውጤት (%)', 'ደረጃ'];
        const columnWidths = [80, 30, 30];
        let xPosition = 20;

        tableHeaders.forEach((header, index) => {
            pdf.text(header, xPosition, yPosition);
            xPosition += columnWidths[index];
        });

        yPosition += 5;

        // Table separator line
        pdf.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 8;

        // Course Results
        pdf.setFont('helvetica', 'normal');
        transcript.courses.forEach((course) => {
            if (yPosition > pageHeight - 30) {
                pdf.addPage();
                yPosition = 20;
            }

            xPosition = 20;
            pdf.text(course.courseName, xPosition, yPosition);
            xPosition += columnWidths[0];
            pdf.text(`${course.score.toFixed(1)}%`, xPosition, yPosition);
            xPosition += columnWidths[1];
            pdf.text(`#${course.rank}`, xPosition, yPosition);
            yPosition += 8;
        });

        yPosition += 15;

        // Performance Summary
        if (yPosition > pageHeight - 60) {
            pdf.addPage();
            yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('የስብዕና ማጠቃለያ', 20, yPosition);
        yPosition += 15;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');

        const performance = [
            ['አጠቃላይ ኮርሶች:', transcript.courses.length.toString()],
            ['ከፍተኛ ውጤት:', `${Math.max(...transcript.courses.map(c => c.score)).toFixed(1)}%`],
            ['ዝቅተኛ ውጤት:', `${Math.min(...transcript.courses.map(c => c.score)).toFixed(1)}%`],
            ['አማካኝ ውጤት:', `${transcript.totalAverage.toFixed(1)}%`]
        ];

        performance.forEach(([label, value]) => {
            pdf.text(`${label} ${value}`, 20, yPosition);
            yPosition += 8;
        });

        yPosition += 20;

        // Footer
        if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 20;
        }

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text('ይህ ምስክር ወረቀት በራሱ በራሱ የሆነ አውቶማቲክ ስርዓት ተሰራ።', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;
        pdf.text(`የተሰራበት ቀን: ${new Date().toLocaleDateString('am-ET')}`, pageWidth / 2, yPosition, { align: 'center' });

        // Save the PDF
        const fileName = `transcript_${transcript.studentId}_${Date.now()}.pdf`;
        pdf.save(fileName);

    } catch (error) {
        console.error('Error generating transcript PDF:', error);
        throw new Error('Failed to generate transcript PDF');
    }
};