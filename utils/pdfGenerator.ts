import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Offer, CompanyProfile } from '../types';
import { formatCurrency } from './calculations';

export const generatePDF = (offer: Offer, company: CompanyProfile) => {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor = [234, 179, 8]; // Yellow-500 equivalent approx rgb
  const black = [30, 41, 59]; // Slate-800

  // --- Header ---
  doc.setFontSize(22);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text('OFERTA COMERCIALA', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Numar: ${offer.offerNumber}`, 14, 28);
  doc.text(`Data: ${new Date(offer.createdAt).toLocaleDateString('ro-RO')}`, 14, 33);
  doc.text(`Valabila pana la: ${new Date(offer.validUntil).toLocaleDateString('ro-RO')}`, 14, 38);

  // --- Supplier (Right Side) ---
  const pageWidth = doc.internal.pageSize.width;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(company.companyName, pageWidth - 14, 20, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.text(company.cui, pageWidth - 14, 25, { align: 'right' });
  doc.text(company.regNo, pageWidth - 14, 30, { align: 'right' });
  doc.text(company.address, pageWidth - 14, 35, { align: 'right' });
  doc.text(company.email, pageWidth - 14, 40, { align: 'right' });
  if (company.iban) {
    doc.text(`IBAN: ${company.iban}`, pageWidth - 14, 45, { align: 'right' });
  }

  // --- Client Box (Left Side) ---
  doc.setDrawColor(200);
  doc.line(14, 50, pageWidth - 14, 50);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Client:', 14, 60);
  
  doc.setFont('helvetica', 'normal');
  doc.text(offer.clientName, 14, 66);
  if (offer.clientCompany) doc.text(offer.clientCompany, 14, 71);
  if (offer.clientAddress) doc.text(offer.clientAddress, 14, 76);
  if (offer.clientEmail) doc.text(offer.clientEmail, 14, 81);

  // --- Line Items Table ---
  const tableColumn = ["Produs / Serviciu", "Cant.", "UM", "Pret Unit.", "Total"];
  const tableRows: any[] = [];

  offer.items.forEach(item => {
    const itemData = [
      `${item.name}\n${item.description || ''}`,
      item.quantity,
      item.unit,
      formatCurrency(item.unitPrice, offer.currency),
      formatCurrency(item.lineTotalInclVat, offer.currency)
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    startY: 90,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 'auto' }, // Desc
      4: { halign: 'right' }   // Total
    },
    styles: { fontSize: 9, cellPadding: 3 }
  });

  // --- Totals ---
  // @ts-ignore - autoTable adds lastAutoTable to doc
  const finalY = doc.lastAutoTable.finalY + 10;
  
  const totalXLabel = pageWidth - 70;
  const totalXValue = pageWidth - 14;

  doc.text("Subtotal:", totalXLabel, finalY);
  doc.text(formatCurrency(offer.subtotalExVat, offer.currency), totalXValue, finalY, { align: 'right' });

  doc.text("TVA Total:", totalXLabel, finalY + 5);
  doc.text(formatCurrency(offer.totalVat, offer.currency), totalXValue, finalY + 5, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text("Total General:", totalXLabel, finalY + 12);
  doc.text(formatCurrency(offer.grandTotal, offer.currency), totalXValue, finalY + 12, { align: 'right' });

  // --- Footer / Notes ---
  if (offer.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text("Note:", 14, finalY + 25);
    doc.setFontSize(8);
    const splitNotes = doc.splitTextToSize(offer.notes, pageWidth - 28);
    doc.text(splitNotes, 14, finalY + 30);
  }

  doc.save(`${offer.offerNumber}.pdf`);
};