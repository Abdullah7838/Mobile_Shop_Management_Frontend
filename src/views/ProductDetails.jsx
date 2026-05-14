import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const BackendApi = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${BackendApi}/api/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const goToEdit = () => {
    navigate(`/edit-product/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Product not found</p>
        </div>
      </div>
    );
  }

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

      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mb-6 cursor-pointer flex items-center gap-2 text-gray-600 hover:text-black transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Product Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
            
            {/* Image Gallery Section */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                <img
                  src={product.images?.[selectedImage] || "https://via.placeholder.com/500x400?text=No+Image"}
                  alt={product.name}
                  className="w-full h-96 object-contain p-4"
                />
              </div>
              
              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === idx 
                          ? "border-black shadow-md" 
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                {product.brand && (
                  <p className="text-gray-500 text-lg">by {product.brand}</p>
                )}
              </div>

              {/* Price Section */}
              <div className="space-y-2">
                {product.discountPrice && product.discountPrice > 0 ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-green-600">
                        Rs {product.discountPrice.toLocaleString()}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        Rs {product.price.toLocaleString()}
                      </span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm font-medium">
                        Save Rs {(product.price - product.discountPrice).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Original Price: Rs {product.price.toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-green-600">
                    Rs {product.price?.toLocaleString()}
                  </p>
                )}
                
                {/* Buy Price (Admin info) */}
                {product.buyprice && (
                  <p className="text-sm text-gray-700">
                    Cost Price: Rs {product.buyprice.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Stock Status Badge */}
              <div className="inline-flex">
                {product.stock === 0 ? (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Out of Stock
                  </span>
                ) : product.stock < 5 ? (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Low Stock: {product.stock} units
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    In Stock: {product.stock} units
                  </span>
                )}
              </div>

              {/* Key Specifications Grid */}
              <div className="border-t border-b border-gray-100 py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-900">{product.category}</span>
                    </div>
                  )}
                  {product.modelNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Model No:</span>
                      <span className="font-medium text-gray-900">{product.modelNumber}</span>
                    </div>
                  )}
                  {product.storage && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Storage:</span>
                      <span className="font-medium text-gray-900">{product.storage}</span>
                    </div>
                  )}
                  {product.color && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Color:</span>
                      <span className="font-medium text-gray-900">{product.color}</span>
                    </div>
                  )}
                  {product.condition && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Condition:</span>
                      <span className={`font-medium px-2 py-0.5 rounded-full text-sm ${
                        product.condition === 'new' ? 'bg-green-100 text-green-700' :
                        product.condition === 'used' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                      </span>
                    </div>
                  )}
                  {product.batteryHealth && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Battery Health:</span>
                      <span className="font-medium text-gray-900">{product.batteryHealth}%</span>
                    </div>
                  )}
                  {product.warrantyMonths > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Warranty:</span>
                      <span className="font-medium text-gray-900">{product.warrantyMonths} months</span>
                    </div>
                  )}
                </div>
              </div>

              {/* IMEI Numbers */}
              {product.imeiNumber && product.imeiNumber.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">IMEI Numbers</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.imeiNumber.map((imei, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-mono">
                        {imei}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => window.location.href = "/selling"}
                  className="flex-1 bg-black cursor-pointer text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Sell Now
                </button>
                <button
                  onClick={goToEdit}
                  className="flex-1 bg-blue-600 cursor-pointer text-white py-3 rounded-xl font-medium shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Product
                </button>
              </div>

              {/* Additional Info */}
              <div className="text-center text-xs text-gray-700 pt-4 border-t border-gray-100">
                <p>Product ID: {product._id}</p>
                {product.createdAt && (
                  <p>Added on: {new Date(product.createdAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;