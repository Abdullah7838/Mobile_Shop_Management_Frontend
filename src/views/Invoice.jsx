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
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
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
      cloneElement.style.width = '80mm';
      cloneElement.style.backgroundColor = '#ffffff';
      cloneElement.style.margin = '0';
      cloneElement.style.padding = '4mm';
      cloneElement.style.zIndex = '9999';
      
      document.body.appendChild(cloneElement);
      
      const canvas = await html2canvas(cloneElement, {
        scale: 3,
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
        format: [80, 297],
        orientation: "portrait",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 6;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xPosition = (pdfWidth - imgWidth) / 2;
      
      pdf.addImage(imgData, "PNG", xPosition, 2, imgWidth, imgHeight);
      pdf.save(`receipt_${invoice.invoiceNumber}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank', 'width=450,height=650');
    
    if (!printWindow) {
      alert("Please allow pop-ups to print the invoice");
      return;
    }
    
    const styles = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          background: white;
          width: 80mm;
          margin: 0 auto;
          padding: 4mm;
        }
        @media print {
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
          body {
            margin: 0;
            padding: 4mm;
          }
        }
      </style>
    `;
    
    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${invoice.invoiceNumber}</title>
          <meta charset="UTF-8">
          ${styles}
        </head>
        <body>
          ${printContent.outerHTML}
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
      <div style={styles.loadingContainer}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading receipt...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.mainContainer}>
      <div style={styles.contentWrapper}>
        {/* Action Buttons */}
        <div style={styles.buttonContainer} className="no-print">
          <button onClick={downloadPDF} disabled={isDownloading} style={styles.downloadButton}>
            Download PDF
          </button>
          <button onClick={handlePrint} style={styles.printButton}>
            Print Receipt
          </button>
        </div>

        {/* Professional Receipt Design */}
        <div ref={invoiceRef} style={styles.receipt}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.storeName}>MOBILE SHOP</div>
            <div style={styles.separatorDouble}></div>
            <div style={styles.storeInfo}>123 Main Street, City</div>
            <div style={styles.storeInfo}>Phone: +92 123 4567890</div>
            <div style={styles.storeInfo}>Email: info@mobileshop.com</div>
            <div style={styles.storeInfo}>GST: 1234567890</div>
            <div style={styles.separatorSingle}></div>
          </div>

          {/* Receipt Type */}
          <div style={styles.receiptType}>
            <div style={styles.typeBadge}>SALES RECEIPT</div>
          </div>

          {/* Transaction Details */}
          <div style={styles.card}>
            <div style={styles.cardRow}>
              <span style={styles.cardLabel}>Invoice Number</span>
              <span style={styles.cardValue}>{invoice.invoiceNumber}</span>
            </div>
            <div style={styles.cardRow}>
              <span style={styles.cardLabel}>Date & Time</span>
              <span style={styles.cardValue}>{formatDate(invoice.createdAt)}</span>
            </div>
            <div style={styles.cardRow}>
              <span style={styles.cardLabel}>Payment Method</span>
              <span style={styles.cardValue}>{invoice.paymentMethod?.toUpperCase()}</span>
            </div>
            <div style={styles.cardRow}>
              <span style={styles.cardLabel}>Payment Status</span>
              <span style={invoice.paymentStatus === 'paid' ? styles.statusPaid : styles.statusPending}>
                {invoice.paymentStatus?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>CUSTOMER DETAILS</div>
            <div style={styles.customerCard}>
              <div style={styles.customerName}>{invoice.customerId?.name || "Guest Customer"}</div>
              {invoice.customerId?.city && (
                <div style={styles.customerDetail}>Mobile Color: {invoice.customerId.color}</div>
              )}
              {invoice.customerId?.phone && (
                <div style={styles.customerDetail}>Phone: {invoice.customerId.phone}</div>
              )}
              {invoice.customerId?.cnic && (
                <div style={styles.customerDetail}>CNIC: {invoice.customerId.cnic}</div>
              )}
              {invoice.customerId?.city && (
                <div style={styles.customerDetail}>City: {invoice.customerId.city}</div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>ORDER SUMMARY</div>
            <div style={styles.itemsHeader}>
              <span style={{...styles.itemsHeaderText, width: '45%'}}>ITEM</span>
              <span style={{...styles.itemsHeaderText, width: '15%', textAlign: 'center'}}>QTY</span>
              <span style={{...styles.itemsHeaderText, width: '20%', textAlign: 'right'}}>PRICE</span>
              <span style={{...styles.itemsHeaderText, width: '20%', textAlign: 'right'}}>TOTAL</span>
            </div>
            {invoice.items?.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <span style={{...styles.itemName, width: '45%'}}>{item.name}</span>
                <span style={{...styles.itemQty, width: '15%', textAlign: 'center'}}>1</span>
                <span style={{...styles.itemPrice, width: '20%', textAlign: 'right'}}>{item.price?.toLocaleString()}</span>
                <span style={{...styles.itemTotal, width: '20%', textAlign: 'right'}}>{item.price?.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={styles.totalsCard}>
            {invoice.discount > 0 && (
              <div style={styles.totalLine}>
                <span>DISCOUNT</span>
                <span>- {invoice.discount?.toLocaleString()}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div style={styles.totalLine}>
                <span>TAX</span>
                <span>{invoice.tax?.toLocaleString()}</span>
              </div>
            )}
            <div style={styles.grandTotalLine}>
              <span style={styles.grandTotalText}>TOTAL AMOUNT</span>
              <span style={styles.grandTotalAmount}>{invoice.total?.toLocaleString()}</span>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div style={styles.termsCard}>
            <div style={styles.termsTitle}>TERMS & CONDITIONS</div>
            <div style={styles.termItem}>1. Items cannot be returned after 7 days</div>
            <div style={styles.termItem}>2. Original receipt required for warranty</div>
            <div style={styles.termItem}>3. Warranty valid for 12 months from purchase</div>
            <div style={styles.termItem}>4. Keep this receipt for future reference</div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <div style={styles.separatorSingle}></div>
            <div style={styles.thankYou}>Thank you for your business!</div>
            <div style={styles.footerText}>This is a computer generated receipt</div>
          </div>
        </div>
      </div>

      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  loadingContainer: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '4px',
    textAlign: 'center',
  },
  loadingSpinner: {
    width: '32px',
    height: '32px',
    border: '2px solid #e5e7eb',
    borderTop: '2px solid #000000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  loadingText: {
    color: '#000000',
    fontSize: '12px',
  },
  mainContainer: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '20px',
  },
  contentWrapper: {
    maxWidth: '420px',
    margin: '0 auto',
  },
  buttonContainer: {
    marginBottom: '16px',
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  downloadButton: {
    backgroundColor: '#000000',
    color: '#ffffff',
    padding: '8px 20px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  printButton: {
    backgroundColor: '#374151',
    color: '#ffffff',
    padding: '8px 20px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  receipt: {
    fontFamily: "'Courier New', 'Courier', monospace",
    width: '80mm',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    padding: '3mm',
    fontSize: '10px',
    fontWeight: 'normal',
    color: '#000000',
    lineHeight: '1.4',
  },
  header: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  storeName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '6px',
  },
  separatorDouble: {
    height: '2px',
    backgroundColor: '#000000',
    margin: '6px 0',
  },
  separatorSingle: {
    height: '1px',
    backgroundColor: '#000000',
    margin: '6px 0',
  },
  storeInfo: {
    fontSize: '9px',
    color: '#000000',
    margin: '2px 0',
  },
  receiptType: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  typeBadge: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: '1px',
  },
  card: {
    border: '1px solid #000000',
    padding: '8px',
    marginBottom: '10px',
  },
  cardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  cardLabel: {
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#000000',
  },
  cardValue: {
    fontSize: '9px',
    fontWeight: 'normal',
    color: '#000000',
  },
  statusPaid: {
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#000000',
  },
  statusPending: {
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#000000',
  },
  section: {
    marginBottom: '10px',
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '6px',
    textDecoration: 'underline',
  },
  customerCard: {
    border: '1px solid #000000',
    padding: '8px',
  },
  customerName: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '4px',
  },
  customerDetail: {
    fontSize: '9px',
    color: '#000000',
    marginTop: '3px',
  },
  itemsHeader: {
    display: 'flex',
    padding: '5px 0',
    borderBottom: '1px solid #000000',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  itemsHeaderText: {
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#000000',
  },
  itemRow: {
    display: 'flex',
    padding: '3px 0',
  },
  itemName: {
    fontSize: '9px',
    color: '#000000',
  },
  itemQty: {
    fontSize: '9px',
    color: '#000000',
  },
  itemPrice: {
    fontSize: '9px',
    color: '#000000',
  },
  itemTotal: {
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#000000',
  },
  totalsCard: {
    border: '1px solid #000000',
    padding: '8px',
    marginBottom: '10px',
  },
  totalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    padding: '3px 0',
    color: '#000000',
  },
  grandTotalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0 3px',
    marginTop: '4px',
    borderTop: '1px solid #000000',
  },
  grandTotalText: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#000000',
  },
  grandTotalAmount: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#000000',
  },
  termsCard: {
    border: '1px solid #000000',
    padding: '8px',
    marginBottom: '10px',
  },
  termsTitle: {
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '5px',
    textDecoration: 'underline',
  },
  termItem: {
    fontSize: '8px',
    color: '#000000',
    padding: '2px 0',
  },
  footer: {
    textAlign: 'center',
    marginTop: '5px',
  },
  thankYou: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '4px',
  },
  footerText: {
    fontSize: '8px',
    color: '#000000',
    margin: '2px 0',
  },
};

export default Invoice;