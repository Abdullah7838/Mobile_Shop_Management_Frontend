import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [profitPercentage, setProfitPercentage] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [totalSellingValue, setTotalSellingValue] = useState(0);
  const [potentialProfit, setPotentialProfit] = useState(0);

  const BackendApi = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, customerRes, invoiceRes] = await Promise.all([
          axios.get(`${BackendApi}/api/products`),
          axios.get(`${BackendApi}/api/customers`),
          axios.get(`${BackendApi}/api/invoices`),
        ]);

        const productsData = productRes.data?.data || [];
        const customersData = customerRes.data.data || [];
        const invoicesData = invoiceRes.data.data || [];
        console.log(invoicesData)

        setProducts(productsData);
        setProductsCount(productsData.length);
        setCustomers(customersData.length);
        setInvoices(invoicesData);

        // Calculate total revenue from invoices
        const totalRevenue = invoicesData.reduce(
          (acc, inv) => acc + (inv.total || 0),
          0
        );
        setRevenue(totalRevenue);

        // Calculate total investment (buyprice * stock for all products)
        const investment = productsData.reduce(
          (acc, product) => acc + ((product.buyprice || 0) * (product.stock || 0)),
          0
        );
        setTotalInvestment(investment);

        // Calculate total stock value at selling price
        const sellingValue = productsData.reduce(
          (acc, product) => {
            const sellPrice = product.discountPrice && product.discountPrice > 0 
              ? product.discountPrice 
              : (product.price || 0);
            return acc + (sellPrice * (product.stock || 0));
          },
          0
        );
        setTotalSellingValue(sellingValue);

        // Calculate potential profit from current stock
        const potential = sellingValue - investment;
        setPotentialProfit(potential);

        // For sold items profit calculation, we need to track cost vs selling
        // This requires items in invoice to have buyprice info
        let soldInvestment = 0;
        let soldRevenue = 0;

        invoicesData.forEach(invoice => {
          if (invoice.items && Array.isArray(invoice.items)) {
            invoice.items.forEach(item => {
              if (item.productId) {
                // Find the product to get buyprice
                const product = productsData.find(p => p._id === item.productId?._id || p._id === item.productId);
                if (product) {
                  const quantity = item.quantity || 1;
                  const itemBuyPrice = (product.buyprice || 0) * quantity;
                  const itemSellPrice = (item.price || 0) * quantity;
                  soldInvestment += itemBuyPrice;
                  soldRevenue += itemSellPrice;
                }
              }
            });
          }
        });

        const profit = soldRevenue - soldInvestment;
        setTotalProfit(profit);
        
        const profitPercent = soldInvestment > 0 ? (profit / soldInvestment) * 100 : 0;
        setProfitPercentage(profitPercent);

      } catch (err) {
        console.log(err);
        toast.error("Failed to load dashboard data");
      }
    };

    fetchData();
  }, []);

  // Calculate low stock products (less than 5 units)
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 5);
  
  // Calculate out of stock products
  const outOfStockProducts = products.filter(p => p.stock === 0);
  
  // Calculate top selling products (based on invoice items)
  const getTopSellingProducts = () => {
    const productSales = {};
    
    invoices.forEach(invoice => {
      if (invoice.items && Array.isArray(invoice.items)) {
        invoice.items.forEach(item => {
          const productId = item.productId?._id || item.productId;
          const productName = item.productId?.name || item.name || productId;
          const quantity = item.quantity || 1;
          
          if (!productSales[productId]) {
            productSales[productId] = {
              name: productName,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += quantity;
          productSales[productId].revenue += (item.price || 0) * quantity;
        });
      }
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const topProducts = getTopSellingProducts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Overview of your business performance
          </p>
        </div>

        {/* Financial Stats Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Revenue */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">Rs {revenue.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">From {invoices.length} invoices</p>
            </div>

            {/* Total Investment */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm font-medium">Total Investment</h3>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">Rs {totalInvestment.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">Current stock value at cost</p>
            </div>

            {/* Total Profit */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm font-medium">Total Profit</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rs {totalProfit.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Profit Margin: {profitPercentage.toFixed(2)}%
              </p>
            </div>

            {/* Profit Percentage */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl shadow-sm p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white/80 text-sm font-medium">ROI</h3>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold">
                {profitPercentage.toFixed(1)}%
              </p>
              <p className="text-white/60 text-xs mt-2">
                Return on Investment
              </p>
            </div>
          </div>
        </div>

        {/* Stock Stats Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Products */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{productsCount}</p>
              <p className="text-xs text-gray-400 mt-2">Total SKUs</p>
            </div>

            {/* Total Stock Value */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm font-medium">Stock Value (Sell)</h3>
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">Rs {totalSellingValue.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">At selling price</p>
            </div>

            {/* Potential Profit */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm font-medium">Potential Profit</h3>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">Rs {potentialProfit.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">From current stock</p>
            </div>

            {/* Stock Alerts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm font-medium">Stock Alerts</h3>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                <span className="text-orange-600">{lowStockProducts.length}</span> / <span className="text-red-600">{outOfStockProducts.length}</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">Low / Out of Stock</p>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        {topProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Selling Products</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Product Name</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Units Sold</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, idx) => (
                      <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-800 font-medium">{product.name}</td>
                        <td className="p-4 text-gray-600">{product.quantity} units</td>
                        <td className="p-4 text-gray-800 font-semibold">Rs {product.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Recent Invoices */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Invoices</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Invoice #</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Customer</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Items</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Total</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-700 font-mono text-sm">
                        {inv.invoiceNumber || inv._id.slice(-6)}
                      </td>
                      <td className="p-4 text-gray-700">
                        {inv.customerId?.name || "Unknown"}
                      </td>
                      <td className="p-4 text-gray-600">
                        {inv.items?.length || 0} products
                      </td>
                      <td className="p-4 text-gray-800 font-semibold">
                        Rs {inv.total?.toLocaleString()}
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400">
                        No invoices found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;