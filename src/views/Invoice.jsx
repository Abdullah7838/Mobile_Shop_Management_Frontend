import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Invoice() {
  const { invoiceNumber } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const invoiceRef = useRef(null);

  const BackendApi = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(`${BackendApi}/api/invoices/${invoiceNumber}`);
        setInvoice(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchInvoice();
  }, [invoiceNumber]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current || isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      const element = invoiceRef.current;
      
      const cloneElement = element.cloneNode(true);
      cloneElement.style.position = 'fixed';
      cloneElement.style.top = '0';
      cloneElement.style.left = '0';
      cloneElement.style.width = '800px';
      cloneElement.style.backgroundColor = '#ffffff';
      cloneElement.style.margin = '0';
      cloneElement.style.padding = '20px';
      cloneElement.style.zIndex = '9999';
      
      document.body.appendChild(cloneElement);
      
      const canvas = await html2canvas(cloneElement, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: false,
        allowTaint: true,
        imageTimeout: 0,
      });
      
      document.body.removeChild(cloneElement);
      
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xPosition = (pdfWidth - imgWidth) / 2;
      let yPosition = 10;
      
      if (imgHeight <= pdfHeight - 20) {
        pdf.addImage(imgData, "PNG", xPosition, yPosition, imgWidth, imgHeight);
      } else {
        const scaledHeight = pdfHeight - 20;
        const scaledWidth = (imgWidth * scaledHeight) / imgHeight;
        const adjustedXPosition = (pdfWidth - scaledWidth) / 2;
        pdf.addImage(imgData, "PNG", adjustedXPosition, yPosition, scaledWidth, scaledHeight);
      }
      
      pdf.save(`invoice_${invoice.invoiceNumber}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again or use Print option.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert("Please allow pop-ups to print the invoice");
      return;
    }
    
    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', 'Monaco', monospace;
              background: white;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .print-wrapper {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
            }
            .border-bottom-2 { border-bottom: 2px solid #000000; }
            .border-bottom-1 { border-bottom: 1px solid #000000; }
            .border-top-2 { border-top: 2px solid #000000; }
            .bg-gray-50 { background-color: #f9f9f9; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .p-24 { padding: 24px; }
            .p-16 { padding: 16px; }
            .p-8 { padding: 8px; }
            .mb-12 { margin-bottom: 12px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .grid-cols-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; }
            th { text-align: left; font-weight: bold; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            ${printContent.outerHTML}
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md">
          <p className="text-black text-lg">Loading Invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="mb-6 flex gap-3 justify-end no-print">
          <button
            onClick={downloadPDF}
            disabled={isDownloading}
            className="bg-black cursor-pointer hover:bg-gray-800 text-white px-6 py-2 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isDownloading ? "Generating PDF..." : "Download PDF"}
          </button>
          <button
            onClick={handlePrint}
            className="bg-gray-700 cursor-pointer hover:bg-gray-800 text-white px-6 py-2 rounded transition-colors"
          >
            Print Invoice
          </button>
        </div>

        {/* Invoice Design */}
        <div
          ref={invoiceRef}
          className="invoice-container"
          style={{
            fontFamily: "'Courier New', 'Monaco', monospace",
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            color: '#000000',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          {/* Header Section */}
          <div style={{ borderBottom: '2px solid #000000', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 
                  style={{ 
                    fontSize: '36px', 
                    fontWeight: 'bold', 
                    marginBottom: '8px',
                    color: '#000000',
                    fontFamily: "'Courier New', 'Monaco', monospace"
                  }}
                >
                  INVOICE
                </h1>
                <p style={{ color: '#000000', fontSize: '14px' }}>Tax Invoice / Bill of Supply</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div 
                  style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    marginBottom: '4px',
                    color: '#000000',
                    fontFamily: "'Courier New', 'Monaco', monospace"
                  }}
                >
                  Mobile Shop
                </div>
                <p style={{ color: '#000000', fontSize: '12px', margin: '2px 0' }}>123 Main Street, City</p>
                <p style={{ color: '#000000', fontSize: '12px', margin: '2px 0' }}>Phone: +92 123 4567890</p>
                <p style={{ color: '#000000', fontSize: '12px', margin: '2px 0' }}>Email: info@mobileshop.com</p>
                <p style={{ color: '#000000', fontSize: '12px', margin: '2px 0' }}>GST No: 1234567890</p>
              </div>
            </div>
          </div>

          {/* Invoice Info & Date/Time */}
          <div style={{ borderBottom: '1px solid #000000', padding: '24px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#000000', fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Invoice Number</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#000000', margin: '0 0 12px 0' }}>
                  {invoice.invoiceNumber}
                </p>
                <p style={{ color: '#000000', fontSize: '14px', fontWeight: 'bold', margin: '12px 0 4px 0' }}>Invoice Status</p>
                <p style={{ color: '#000000', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                  {invoice.invoiceStatus?.toUpperCase()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#000000', fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Date & Time</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#000000', margin: '0 0 12px 0' }}>
                  {formatDate(invoice.createdAt)}
                </p>
                <p style={{ color: '#000000', fontSize: '14px', fontWeight: 'bold', margin: '12px 0 4px 0' }}>Payment Method</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#000000', margin: 0 }}>
                  {invoice.paymentMethod?.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div style={{ padding: '24px', borderBottom: '1px solid #000000' }}>
            <h2 
              style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#000000', 
                marginBottom: '12px',
                fontFamily: "'Courier New', 'Monaco', monospace"
              }}
            >
              Bill To:
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <p style={{ color: '#000000', fontSize: '12px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Customer Name</p>
                <p style={{ fontWeight: '500', color: '#000000', margin: 0, fontSize: '14px' }}>
                  {invoice.customerId?.name || "N/A"}
                </p>
              </div>
              <div>
                <p style={{ color: '#000000', fontSize: '12px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Phone Number</p>
                <p style={{ fontWeight: '500', color: '#000000', margin: 0, fontSize: '14px' }}>
                  {invoice.customerId?.phone || "N/A"}
                </p>
              </div>
              <div>
                <p style={{ color: '#000000', fontSize: '12px', fontWeight: 'bold', margin: '0 0 4px 0' }}>CNIC Number</p>
                <p style={{ fontWeight: '500', color: '#000000', margin: 0, fontSize: '14px' }}>
                  {invoice.customerId?.cnic || "N/A"}
                </p>
              </div>
              <div>
                <p style={{ color: '#000000', fontSize: '12px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Phone Color</p>
                <p style={{ fontWeight: '500', color: '#000000', margin: 0, fontSize: '14px' }}>
                  {invoice.customerId?.color || "N/A"}
                </p>
              </div>
              <div>
                <p style={{ color: '#000000', fontSize: '12px', fontWeight: 'bold', margin: '0 0 4px 0' }}>City</p>
                <p style={{ fontWeight: '500', color: '#000000', margin: 0, fontSize: '14px' }}>
                  {invoice.customerId?.city || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ padding: '24px' }}>
            <h2 
              style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#000000', 
                marginBottom: '12px',
                fontFamily: "'Courier New', 'Monaco', monospace"
              }}
            >
              Order Items
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #000000', backgroundColor: '#f9f9f9' }}>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold', color: '#000000', fontSize: '12px' }}>S.No</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold', color: '#000000', fontSize: '12px' }}>Product Name</th>
                    <th style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold', color: '#000000', fontSize: '12px' }}>Unit Price</th>
                    <th style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold', color: '#000000', fontSize: '12px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #000000' }}>
                      <td style={{ padding: '8px', color: '#000000', fontSize: '12px' }}>{index + 1}</td>
                      <td style={{ padding: '8px', color: '#000000', fontSize: '12px' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#000000', fontSize: '12px' }}>
                        Rs. {item.price?.toLocaleString()}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#000000', fontSize: '12px' }}>
                        Rs. {item.price?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div style={{ borderTop: '2px solid #000000', padding: '24px', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '320px' }}>
                {invoice.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ color: '#000000', fontSize: '14px', fontWeight: 'bold' }}>Discount:</span>
                    <span style={{ fontWeight: '500', color: '#000000', fontSize: '14px' }}>
                      - Rs. {invoice.discount?.toLocaleString()}
                    </span>
                  </div>
                )}
                {invoice.tax > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ color: '#000000', fontSize: '14px', fontWeight: 'bold' }}>Tax:</span>
                    <span style={{ fontWeight: '500', color: '#000000', fontSize: '14px' }}>
                      Rs. {invoice.tax?.toLocaleString()}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #000000', marginTop: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>
                    Total Amount:
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#000000' }}>
                    Rs. {invoice.total?.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#000000', fontSize: '14px', fontWeight: 'bold' }}>Payment Status:</span>
                  <span style={{ fontWeight: '600', color: '#000000', fontSize: '14px' }}>
                    {invoice.paymentStatus?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #000000', padding: '16px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <p style={{ color: '#000000', fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
              Thank you for your business!
            </p>
            <p style={{ color: '#000000', fontSize: '11px', margin: 0 }}>
              This is a computer generated invoice
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Invoice;