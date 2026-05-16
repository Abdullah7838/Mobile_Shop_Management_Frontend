import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  const BackendApi = import.meta.env.VITE_BACKEND_API;

  // GET PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // Start loading
      try {
        const res = await axios.get(`${BackendApi}/api/products`);
        setProducts([...res.data.data].reverse());
      } catch (err) {
        console.log(err);
        toast.error("Failed to load products");
      } finally {
        setLoading(false); // End loading
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

  const goToDetails = (id) => {
    navigate(`/product/${id}`);
  };

  const goToEdit = (id) => {
    navigate(`/edit-product/${id}`);
  };

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${BackendApi}/api/products/${id}`);
      setProducts((prev) => prev.filter((item) => item._id !== id));
      toast.success("Product deleted successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
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
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            All Products
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Browse and manage your product catalog
          </p>
        </div>

        <Link
          to="/add"
          className="bg-gradient-to-r from-gray-800 to-gray-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Add Product
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
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
            placeholder="Search products by name, brand or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-5 w-5"
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

        {/* Search results count */}
        <div className="mt-2 text-sm text-gray-500">
          {searchTerm && !loading && (
            <span>
              Found {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"} for "
              {searchTerm}"
            </span>
          )}
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 max-w-7xl mx-auto">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 text-lg">Loading products...</p>
          <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your catalog</p>
        </div>
      )}

      {/* GRID - Only show when not loading */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 max-w-7xl mx-auto">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 relative"
              >
                {/* Stock Status Badge - Top Right */}
                <div className="absolute top-3 right-3 z-10">
                  {product.stock === 0 ? (
                    <div className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Out of Stock
                    </div>
                  ) : product.stock < 5 ? (
                    <div className="bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Low Stock: {product.stock}
                    </div>
                  ) : (
                    <div className="bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      In Stock: {product.stock}
                    </div>
                  )}
                </div>

                {/* IMAGE with overlay when out of stock */}
                <div className="relative overflow-hidden bg-gray-50 h-48 flex items-center justify-center p-4">
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                      <span className="text-white text-sm font-bold px-3 py-1.5 bg-red-500 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  <img
                    src={product.images?.[0] || "https://via.placeholder.com/300"}
                    alt={product.name}
                    className={`h-full w-full object-contain transform group-hover:scale-105 transition-transform duration-300 ${
                      product.stock === 0 ? "opacity-50" : ""
                    }`}
                  />
                </div>

                {/* CONTENT */}
                <div className="p-5 border-t border-gray-50">
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold text-gray-800 truncate leading-tight">
                      {product.name}
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">{product.brand}</p>
                  </div>

                  <p className="mt-2 text-2xl font-bold text-gray-900 tracking-tight">
                    Rs {product.price}
                  </p>

                  {/* Stock text indicator */}
                  <div className="mt-2">
                    {product.stock > 0 ? (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {product.stock} units available
                      </p>
                    ) : (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Not available
                      </p>
                    )}
                  </div>

                  <div className="space-y-2.5 mt-4">
                    {/* VIEW */}
                    <button
                      onClick={() => goToDetails(product._id)}
                      className="w-full cursor-pointer bg-white border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                    >
                      View Details
                    </button>

                    {/* EDIT */}
                    <button
                      onClick={() => goToEdit(product._id)}
                      className="w-full cursor-pointer bg-gray-900 text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors duration-200 shadow-sm"
                    >
                      Edit
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="w-full cursor-pointer bg-white border border-red-200 text-red-600 py-2.5 rounded-xl font-medium hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No results message - Only show when not loading */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 max-w-7xl mx-auto">
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
              {searchTerm ? (
                <>
                  <p className="text-gray-400 text-lg">
                    No products found matching "{searchTerm}"
                  </p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-3 text-gray-500 underline hover:text-gray-700 transition-colors"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-400 text-lg">No products found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Get started by adding your first product
                  </p>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AllProducts;