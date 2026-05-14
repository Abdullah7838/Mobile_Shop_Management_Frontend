import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const BackendApi = import.meta.env.VITE_BACKEND_API;

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    modelNumber: "",
    description: "",
    storage: "",
    color: "",
    batteryHealth: "",
    condition: "",
    buyprice: "",
    price: "",
    discountPrice: "",
    stock: "",
    warrantyMonths: "",
    images: "",
    imeiNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // GET PRODUCT BY ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${BackendApi}/api/products/${id}`);
        const productData = res.data.data;
        
        // Handle arrays to string for form inputs
        setFormData({
          name: productData.name || "",
          brand: productData.brand || "",
          category: productData.category || "",
          modelNumber: productData.modelNumber || "",
          description: productData.description || "",
          storage: productData.storage || "",
          color: productData.color || "",
          batteryHealth: productData.batteryHealth || "",
          condition: productData.condition || "new",
          buyprice: productData.buyprice || "",
          price: productData.price || "",
          discountPrice: productData.discountPrice || "",
          stock: productData.stock || "",
          warrantyMonths: productData.warrantyMonths || "",
          images: productData.images ? productData.images.join(", ") : "",
          imeiNumber: productData.imeiNumber ? productData.imeiNumber.join(", ") : "",
        });
      } catch (err) {
        console.log(err);
        toast.error("Failed to load product details");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProduct();
  }, [id, BackendApi]);

  // HANDLE INPUT
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // UPDATE PRODUCT
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (loading) return;

    // Validate required fields
    if (!formData.name || !formData.brand || !formData.buyprice || !formData.price) {
      toast.error("Please fill in all required fields (Name, Brand, Buy Price, Price)");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating product...");

    try {
      const payload = {
        ...formData,
        buyprice: parseFloat(formData.buyprice),
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : 0,
        stock: parseInt(formData.stock) || 0,
        batteryHealth: formData.batteryHealth ? parseInt(formData.batteryHealth) : undefined,
        warrantyMonths: parseInt(formData.warrantyMonths) || 0,
        images: formData.images ? formData.images.split(",").map(img => img.trim()) : [],
        imeiNumber: formData.imeiNumber ? formData.imeiNumber.split(",").map(imei => imei.trim()) : [],
      };

      await axios.put(`${BackendApi}/api/products/${id}`, payload);

      toast.update(toastId, {
        render: "Product Updated Successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate("/products"); // go back to list
      }, 1500);
    } catch (err) {
      console.log(err);
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to Update Product",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Edit Product
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Update the product details below
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleUpdate} className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="e.g., iPhone 15 Pro"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                />
              </div>

              {/* Brand */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand || ""}
                  onChange={handleChange}
                  placeholder="e.g., Apple, Samsung"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  placeholder="e.g., Apple, Samsung"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              {/* Model Number */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Model Number
                </label>
                <input
                  type="text"
                  name="modelNumber"
                  value={formData.modelNumber || ""}
                  onChange={handleChange}
                  placeholder="e.g., A2849"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              {/* Storage */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Storage
                </label>
                <input
                  type="text"
                  name="storage"
                  value={formData.storage || ""}
                  onChange={handleChange}
                  placeholder="e.g., 128GB, 256GB"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              {/* Color */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color || ""}
                  onChange={handleChange}
                  placeholder="e.g., Black, Silver"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              {/* Battery Health */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Battery Health (%)
                </label>
                <input
                  type="number"
                  name="batteryHealth"
                  value={formData.batteryHealth || ""}
                  onChange={handleChange}
                  placeholder="e.g., 95"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              {/* Condition */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition || "new"}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>

              {/* Buy Price */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Buy Price (Rs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="buyprice"
                  value={formData.buyprice || ""}
                  onChange={handleChange}
                  placeholder="e.g., 150000"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                />
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Price (Rs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleChange}
                  placeholder="e.g., 199999"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                />
              </div>

              {/* Discount Price */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Discount Price (Rs)
                </label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice || ""}
                  onChange={handleChange}
                  placeholder="e.g., 179999"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              {/* Stock */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock || ""}
                  onChange={handleChange}
                  placeholder="e.g., 10"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              {/* Warranty Months */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Warranty (Months)
                </label>
                <input
                  type="number"
                  name="warrantyMonths"
                  value={formData.warrantyMonths || ""}
                  onChange={handleChange}
                  placeholder="e.g., 12"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              {/* Image URLs */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Image URLs (comma separated)
                </label>
                <input
                  type="text"
                  name="images"
                  value={formData.images || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
                <p className="text-xs text-gray-400">
                  Separate multiple image URLs with commas
                </p>
              </div>

              {/* IMEI Numbers */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  IMEI Numbers (comma separated)
                </label>
                <input
                  type="text"
                  name="imeiNumber"
                  value={formData.imeiNumber || ""}
                  onChange={handleChange}
                  placeholder="123456789012345, 987654321098765"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
                <p className="text-xs text-gray-400">
                  Separate multiple IMEI numbers with commas
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of the product..."
                  rows="4"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer bg-black text-white py-3.5 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating Product...</span>
                    </div>
                  ) : (
                    "Update Product"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;