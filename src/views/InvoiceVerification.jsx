import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function InvoiceVerification() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  const BackendApi = import.meta.env.VITE_BACKEND_API;

  const searchInvoice = async () => {
    if (!invoiceNumber) return;

    try {
      setLoading(true);
      setNotFound(false);
      setInvoice(null);

      const res = await axios.get(
        `${BackendApi}/api/invoices/${invoiceNumber}`
      );

      setInvoice(res.data.data);
    } catch (err) {
      console.log(err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (invoice && invoice.invoiceNumber) {
      navigate(`/invoice/${invoice.invoiceNumber}`);
    }
  };

  const handleWhatsAppShare = () => {
    if (!invoice) return;

    const message = `
🧾 Invoice: ${invoice.invoiceNumber}

👤 Customer: ${invoice.customerId?.name}
📞 Phone: ${invoice.customerId?.phone}

💰 Total: Rs ${invoice.total}
    `;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Invoice Verification
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Search and verify any invoice by its number</p>
        </div>

        {/* SEARCH BOX */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  placeholder="Enter Invoice Number (e.g. INV-ABC123)"
                  className="w-full border border-gray-200 rounded-xl p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchInvoice()}
                />
              </div>

              <button
                onClick={searchInvoice}
                className="w-full cursor-pointer bg-black text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Search Invoice
              </button>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <p className="text-gray-600">Searching invoice...</p>
            </div>
          </div>
        )}

        {/* NOT FOUND */}
        {notFound && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium text-lg">Invalid Invoice Number</p>
              <p className="text-gray-400 text-sm mt-1">Please check the invoice number and try again</p>
            </div>
          </div>
        )}

        {/* INVOICE DISPLAY */}
        {invoice && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Success Badge */}
            <div className="bg-green-50 px-6 py-3 border-b border-green-100">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-700 font-medium">Invoice Verified Successfully</span>
              </div>
            </div>

            {/* HEADER */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    INVOICE
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Official Receipt</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
                    #{invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(invoice.createdAt).toLocaleString()}
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                    invoice.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {invoice.paymentStatus?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* CUSTOMER DETAILS */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="font-medium text-gray-800">{invoice.customerId?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone Number</p>
                  <p className="font-medium text-gray-800">{invoice.customerId?.phone || "N/A"}</p>
                </div>
                {(invoice.customerId?.cnic || invoice.customerId?.city) && (
                  <>
                    <div>
                      <p className="text-xs text-gray-400">CNIC</p>
                      <p className="font-medium text-gray-800">{invoice.customerId?.cnic || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">City</p>
                      <p className="font-medium text-gray-800">{invoice.customerId?.city || "N/A"}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* PRODUCTS TABLE */}
            <div className="px-6 py-5">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Products Purchased
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 text-sm">Product Name</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-600 text-sm">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items?.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-2 text-gray-800">{item.name}</td>
                        <td className="py-3 px-2 text-right font-medium text-gray-800">Rs {item.price?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOTAL */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700 text-lg">Total Amount</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Rs {invoice.total?.toLocaleString()}
                </span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-gray-500">Discount Applied</span>
                  <span className="text-green-600">- Rs {invoice.discount?.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleViewDetails}
                className="flex-1 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Full Invoice Details
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="flex-1 cursor-pointer bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Share on WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceVerification;