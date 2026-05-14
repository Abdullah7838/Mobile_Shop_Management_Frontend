import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Selling() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const BackendApi = import.meta.env.VITE_BACKEND_API;

  // CUSTOMER STATE
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    cnic: "",
    address: "",
    city: "",
    color: "",
  });

  // GET PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${BackendApi}/api/products`);
        setProducts(res.data.data);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load products");
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.brand?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower)
    );
  });

  // Get current quantity of a product in cart
  const getCartQuantity = (productId) => {
    const item = cart.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  // ADD TO CART - with stock validation
  const addToCart = (product) => {
    // Check if product is in stock
    if (product.stock === 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    const currentQuantity = getCartQuantity(product._id);
    
    // Check if adding one more exceeds available stock
    if (currentQuantity + 1 > product.stock) {
      toast.error(`Cannot add more than ${product.stock} units of ${product.name}. Only ${product.stock - currentQuantity} left in stock.`);
      return;
    }
    
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.productId === product._id);
    
    if (existingItem) {
      // If exists, increase quantity
      setCart(cart.map(item =>
        item.productId === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success(`${product.name} quantity increased to ${existingItem.quantity + 1}`);
    } else {
      // If new, add with quantity 1
      const cartItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock,
        images: product.images?.[0]
      };
      setCart([...cart, cartItem]);
      toast.success(`${product.name} added to cart`);
    }
  };

  // UPDATE QUANTITY - with stock validation
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    const product = products.find(p => p._id === productId);
    if (product && newQuantity > product.stock) {
      toast.error(`Only ${product.stock} units of ${product.name} available in stock. You cannot add more than available stock.`);
      return;
    }
    
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // REMOVE FROM CART
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
    toast.info("Item removed from cart");
  };

  // TOTAL CALCULATION
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // CUSTOMER INPUT
  const handleChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  // COMPLETE ORDER → CREATE INVOICE
  const [loading, setLoading] = useState(false);

  const completeOrder = async () => {
    if (loading) return;

    if (!cart.length) {
      toast.error("Cart is empty");
      return;
    }

    if (!customer.name || !customer.phone) {
      toast.error("Customer name and phone are required");
      return;
    }

    // Double-check stock before sending to backend
    for (const item of cart) {
      const product = products.find(p => p._id === item.productId);
      if (!product) {
        toast.error(`Product ${item.name} not found`);
        return;
      }
      if (product.stock < item.quantity) {
        toast.error(`Only ${product.stock} units of ${item.name} available in stock. Please reduce quantity.`);
        return;
      }
    }

    setLoading(true);
    const toastId = toast.loading("Creating invoice...");

    try {
      // Prepare products array - send each unit as separate entry
      const payload = {
        customer: {
          name: customer.name,
          phone: customer.phone,
          cnic: customer.cnic || "",
          address: customer.address || "",
          city: customer.city || "",
          color: customer.color || "",
        },
        products: cart.flatMap(item => 
          Array(item.quantity).fill(null).map(() => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: 1
          }))
        ),
        total,
      };

      const res = await axios.post(`${BackendApi}/api/invoices`, payload);

      toast.dismiss(toastId);
      toast.success("Invoice Created Successfully!");

      const invoiceId = res.data.data.invoiceNumber;

      // reset cart and customer
      setCart([]);
      setCustomer({
        name: "",
        phone: "",
        cnic: "",
        address: "",
        city: "",
        color: "",
      });
      setSearchTerm("");

      // Refresh products to update stock display
      const productsRes = await axios.get(`${BackendApi}/api/products`);
      setProducts(productsRes.data.data);

      // redirect to invoice page
      navigate(`/invoice/${invoiceId}`);
    } catch (err) {
      console.log("ERROR RESPONSE:", err.response?.data);
      console.log("ERROR:", err.message);
      
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Point of Sale
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Select products and complete customer orders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PRODUCTS SECTION */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Available Products
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Click add to cart to start selling
                    </p>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Search Results Count */}
                {searchTerm && (
                  <div className="mt-2 text-xs text-gray-500">
                    Found {filteredProducts.length}{" "}
                    {filteredProducts.length === 1 ? "product" : "products"} for
                    "{searchTerm}"
                  </div>
                )}
              </div>

              <div className="p-6">
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-400">No products available</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-400">
                      No products matching "{searchTerm}"
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-2 text-gray-500 underline text-sm hover:text-gray-700"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    {filteredProducts.map((p) => (
                      <div
                        key={p._id}
                        className="group bg-gray-50 rounded-xl hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-gray-200"
                      >
                        <div className="h-32 bg-white flex items-center justify-center p-3 relative">
                          {p.stock === 0 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white text-xs font-bold px-2 py-1 bg-red-500 rounded">Out of Stock</span>
                            </div>
                          )}
                          <img
                            src={
                              p.images?.[0] || "https://via.placeholder.com/100"
                            }
                            alt={p.name}
                            className="h-full w-full object-contain transform group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">
                            {p.name}
                          </h3>
                          <p className="text-lg font-bold text-gray-900 mt-1">
                            Rs {p.price}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Stock: {p.stock} units
                          </p>
                          <button
                            onClick={() => addToCart(p)}
                            disabled={p.stock === 0}
                            className={`w-full cursor-pointer mt-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              p.stock === 0
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-gray-800 to-gray-700 text-white hover:shadow-md"
                            }`}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CART + CUSTOMER SECTION */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-6">
              {/* Cart Header */}
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">
                    Shopping Cart
                  </h2>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                  </span>
                </div>
              </div>

              {/* Cart Items */}
              <div className="max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="w-12 h-12 text-gray-300 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 21v-6"
                      />
                    </svg>
                    <p className="text-gray-400 text-sm">Cart is empty</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {cart.map((item) => {
                      const product = products.find(p => p._id === item.productId);
                      const maxStock = product?.stock || 0;
                      const currentInCart = item.quantity;
                      const remainingStock = maxStock - currentInCart;
                      
                      return (
                        <div
                          key={item.productId}
                          className="px-5 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800 text-sm">
                                {item.name}
                              </p>
                              <p className="text-gray-500 text-xs mt-0.5">
                                Rs {item.price} each
                              </p>
                              {remainingStock === 0 && (
                                <p className="text-red-500 text-xs mt-1">
                                  Max stock reached
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="text-red-400 hover:text-red-600 transition-colors p-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
                              >
                                -
                              </button>
                              <span className="text-sm font-medium text-gray-700 w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                disabled={remainingStock === 0}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors ${
                                  remainingStock === 0
                                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                +
                              </button>
                            </div>
                            <span className="font-semibold text-gray-800 text-sm">
                              Rs {item.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Total */}
              {cart.length > 0 && (
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      Rs {total}
                    </span>
                  </div>
                </div>
              )}

              {/* Customer Form */}
              <div className="px-5 py-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <input
                    name="name"
                    placeholder="Full Name *"
                    value={customer.name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                  <input
                    name="phone"
                    placeholder="Phone Number *"
                    value={customer.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                  <input
                    name="color"
                    placeholder="Color"
                    value={customer.color}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                  <input
                    name="cnic"
                    placeholder="CNIC (Optional)"
                    value={customer.cnic}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                  <input
                    name="address"
                    placeholder="Address (Optional)"
                    value={customer.address}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                  <input
                    name="city"
                    placeholder="City (Optional)"
                    value={customer.city}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>

              {/* Complete Order Button */}
              <div className="px-5 pb-5 pt-2">
                <button
                  onClick={completeOrder}
                  disabled={loading || cart.length === 0}
                  className={`w-full cursor-pointer py-3 rounded-xl font-semibold shadow-md transition-all duration-200 ${
                    loading || cart.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-gray-800 to-gray-700 text-white hover:shadow-lg transform hover:-translate-y-0.5"
                  }`}
                >
                  {loading ? "Creating Invoice..." : "Complete Order"}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  * Name and phone are required
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Selling;