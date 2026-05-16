import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Customers() {
  const [customers, setCustomers] = useState([]);

  const BackendApi = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${BackendApi}/api/customers`);

        setCustomers(res.data?.data.reverse() || res.data.reverse() || []);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load customers");
      }
    };

    fetchCustomers();
  }, []);

  const deleteCustomer = async (id) => {
    try {
      await axios.delete(`${BackendApi}/api/customers/${id}`);

      setCustomers((prev) => prev.filter((c) => c._id !== id));

      toast.success("Customer deleted successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete customer");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Customers
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage your customer database
            </p>
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-gray-600">
              Total: {customers.length}{" "}
              {customers.length === 1 ? "customer" : "customers"}
            </span>
          </div>
        </div>

        {/* Customer Grid */}
        {customers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-5">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-xl font-medium">
              No customers found
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Customers will appear here once added
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((c) => (
              <div
                key={c._id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200"
              >
                {/* Card Header with Avatar */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-5 pt-5 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                        {c.name}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Customer ID: {c._id?.slice(-6) || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <svg
                      className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <span className="text-gray-400">Phone:</span>
                      <span className="text-gray-700 ml-2 font-medium">
                        {c.phone || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <svg
                      className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <span className="text-gray-700 ml-2 font-medium truncate block max-w-[200px]">
                        {c.email || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <svg
                      className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>
                    <div>
                      <span className="text-gray-400">CNIC:</span>
                      <span className="text-gray-700 ml-2 font-mono text-xs">
                        {c.cnic || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <svg
                      className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <span className="text-gray-400">Address:</span>
                      <span className="text-gray-700 ml-2 font-medium block max-w-[200px]">
                        {c.address || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <svg
                      className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <span className="text-gray-400">City:</span>
                      <span className="text-gray-700 ml-2 font-medium">
                        {c.city || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 pb-5 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => deleteCustomer(c._id)}
                    className="w-full cursor-pointer bg-white border border-red-200 text-red-600 py-2.5 rounded-xl font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  >
                    Delete Customer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Customers;
