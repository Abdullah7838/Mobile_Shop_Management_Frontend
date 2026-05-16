import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  const BackendApi = import.meta.env.VITE_BACKEND_API;

  // FETCH INVOICES
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get(`${BackendApi}/api/invoices`);

        setInvoices([...(res.data.data || [])].reverse());
      } catch (err) {
        console.log(err);
        toast.error("Failed to load invoices");
      }
    };

    fetchInvoices();
  }, []);

  // VIEW DETAILS
  const goToDetails = (invoiceNumber) => {
    navigate(`/invoice/${invoiceNumber}`);
  };

  // DELETE INVOICE
  const deleteInvoice = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${BackendApi}/api/invoices/${id}`);

      setInvoices((prev) => prev.filter((inv) => inv._id !== id));

      toast.success("Invoice deleted successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete invoice");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Invoice History</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoices.map((inv) => (
          <div
            key={inv._id}
            className="bg-white shadow-md rounded-xl p-5 hover:shadow-xl transition"
          >
            {/* Invoice Number */}
            <h2 className="text-lg font-bold">#{inv.invoiceNumber}</h2>

            {/* Customer */}
            <p className="text-gray-600 mt-1">
              Customer: {inv.customerId?.name || "Unknown"}
            </p>

            {/* Phone */}
            <p className="text-gray-600">
              Phone: {inv.customerId?.phone || "N/A"}
            </p>

            {/* Total */}
            <p className="text-black font-bold mt-2">Total: Rs {inv.total}</p>

            {/* Date */}
            <p className="text-sm text-gray-500 mt-1">
              Date: {new Date(inv.createdAt).toLocaleString()}
            </p>

            {/* BUTTONS */}
            <div className="mt-4 space-y-2">
              <button
                onClick={() => goToDetails(inv.invoiceNumber)}
                className="w-full cursor-pointer  bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
              >
                View Details
              </button>

              <button
                onClick={() => deleteInvoice(inv._id)}
                className="w-full cursor-pointer bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete Invoice
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InvoiceHistory;
