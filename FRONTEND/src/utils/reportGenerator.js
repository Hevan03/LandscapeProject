import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateAppointmentsReport = (appointments) => {
  const doc = new jsPDF();
  const tableColumn = ["Customer Name", "Date", "Time Slot", "Site City", "Status"];
  const tableRows = [];

  appointments.forEach(app => {
    const formattedDate = app.appointmentDate 
      ? format(new Date(app.appointmentDate), 'yyyy-MM-dd') 
      : 'N/A';
    
    const appointmentData = [
      app.customer?.name || 'N/A',
      formattedDate,
      app.timeSlot || 'N/A',
      app.siteAddress?.city || 'N/A',
      app.status || 'N/A',
    ];
    tableRows.push(appointmentData);
  });

  doc.setFontSize(18);
  doc.text("Landscaper Appointments Report", 14, 22);

  // Call the imported autoTable function directly, passing the doc instance to it.
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
  });
  

  const date = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.text(`Report generated on: ${date}`, 14, doc.internal.pageSize.height - 10);

  doc.save(`appointments-report_${new Date().toISOString().split('T')[0]}.pdf`);
};