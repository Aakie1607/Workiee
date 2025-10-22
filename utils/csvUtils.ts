import { WorkLog } from '../types';

// Add this to handle the global jsPDF variable from the CDN
declare const jspdf: any;

export const exportToPdf = (logs: WorkLog[], username: string, currency: string) => {
    if (logs.length === 0) {
        alert("No logs to export.");
        return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });

    // Title
    doc.setFontSize(18);
    doc.text(`Work Logs for ${username}`, 14, 20);

    // Summary
    const totalHours = logs.reduce((sum, log) => sum + log.hoursWorked, 0);
    const totalEarnings = logs.reduce((sum, log) => sum + log.pay, 0);
    doc.setFontSize(11);
    doc.text(`Total Hours Logged: ${totalHours.toFixed(2)}`, 14, 30);
    doc.text(`Total Earnings: ${currency}${totalEarnings.toFixed(2)}`, 14, 36);

    // Table
    // Changed "Skipped Break" to "Break (hrs)"
    const tableColumn = ["Date", "Work Type", "Start Time", "End Time", "Break (hrs)", "Hours Worked", "Pay Type", `Pay Rate (${currency})`, `Pay (${currency})`, "Notes"];
    const tableRows: (string | number)[][] = [];

    // Sort logs by date ascending for the report
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedLogs.forEach(log => {
        const logData = [
            log.date,
            log.workType === 'Custom' ? log.customWorkType || 'Custom' : log.workType,
            log.startTime,
            log.endTime,
            // Display break duration
            log.breakDuration === 0 ? '0.0 hrs' : `${log.breakDuration.toFixed(1)} hrs`, 
            log.hoursWorked.toFixed(2),
            log.payType === 'Custom Pay' ? 'Custom' : log.payType,
            log.payType === 'Custom Pay' ? (log.customPayRate || 0).toFixed(2) : 'N/A',
            log.pay.toFixed(2),
            log.notes || ''
        ];
        tableRows.push(logData);
    });
    
    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 42,
        theme: 'striped',
        styles: {
            fontSize: 8,
            cellPadding: 1.5,
        },
        headStyles: {
            fillColor: [168, 85, 247], 
            textColor: 255,
            fontStyle: 'bold',
        },
        columnStyles: {
            9: { cellWidth: 50 }, // Notes column
        }
    });

    const date = new Date().toISOString().split('T')[0];
    doc.save(`workie_logs_${username}_${date}.pdf`);
};