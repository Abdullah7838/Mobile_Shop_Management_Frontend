// AddProduct Component - Frontend with buyprice and toastify
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BackendApi = import.meta.env.VITE_BACKEND_API;

function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "Apple",
    modelNumber: "",
    description: "",
    storage: "",
    color: "",
    batteryHealth: "",
    condition: "new",
    buyprice: "",
    price: "",
    discountPrice: "",
    stock: "",
    images: "",
    warrantyMonths: "",
    imeiNumber: "",
  });

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // FETCH CATEGORIES FROM SERVER
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BackendApi}/api/categories`);
        setCategories(res.data.data);
        const appleExists = res.data.some((cat) => cat.name === "Apple");
        if (!appleExists && res.data.length > 0) {
          setFormData((prev) => ({ ...prev, category: res.data[0].name }));
        }
      } catch (err) {
        console.log(err);
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // Validate required fields
    if (!formData.name || !formData.brand || !formData.buyprice || !formData.price) {
      toast.error("Please fill in all required fields (Name, Brand, Buy Price, Price)");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Adding product...");

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

      const res = await axios.post(`${BackendApi}/api/products`, payload);

      console.log(res.data);
      
      toast.dismiss(loadingToast);
      toast.success("Product Added Successfully!");

      // Reset form
      setFormData({
        name: "",
        brand: "",
        category: "Apple",
        modelNumber: "",
        description: "",
        storage: "",
        color: "",
        batteryHealth: "",
        condition: "new",
        buyprice: "",
        price: "",
        discountPrice: "",
        stock: "",
        images: "",
        warrantyMonths: "",
        imeiNumber: "",
      });
    } catch (err) {
      console.log(err);
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Failed to Add Product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Add Product
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Fill in the details to add a new product to your catalog
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., iPhone 15 Pro"
                  value={formData.name}
                  onChange={handleChange}
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
                  placeholder="e.g., Apple, Samsung"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                />
              </div>

              {/* Category - Fetched from server */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                {loadingCategories ? (
                  <div className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      <span className="text-gray-400 text-sm">
                        Loading categories...
                      </span>
                    </div>
                  </div>
                ) : (
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                  >
                    {categories.length === 0 ? (
                      <option value="Apple">Apple (Default)</option>
                    ) : (
                      categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                )}
                {!loadingCategories && categories.length === 0 && (
                  <p className="text-xs text-amber-600">
                    No categories found on server. Using default "Apple".
                  </p>
                )}
              </div>

              {/* Model Number */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Model Number
                </label>
                <input
                  type="text"
                  name="modelNumber"
                  placeholder="e.g., A2849"
                  value={formData.modelNumber}
                  onChange={handleChange}
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
                  placeholder="e.g., 128GB, 256GB"
                  value={formData.storage}
                  onChange={handleChange}
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
                  placeholder="e.g., Black, Silver"
                  value={formData.color}
                  onChange={handleChange}
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
                  placeholder="e.g., 95"
                  value={formData.batteryHealth}
                  onChange={handleChange}
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
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>

              {/* Buy Price - NEW FIELD */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Buy Price (Rs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="buyprice"
                  placeholder="e.g., 150000"
                  value={formData.buyprice}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                />
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Sell Price (Rs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="e.g., 199999"
                  value={formData.price}
                  onChange={handleChange}
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
                  placeholder="e.g., 179999"
                  value={formData.discountPrice}
                  onChange={handleChange}
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
                  placeholder="e.g., 10"
                  value={formData.stock}
                  onChange={handleChange}
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
                  placeholder="e.g., 12"
                  value={formData.warrantyMonths}
                  onChange={handleChange}
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
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  value={formData.images}
                  onChange={handleChange}
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
                  placeholder="123456789012345, 987654321098765"
                  value={formData.imeiNumber}
                  onChange={handleChange}
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
                  placeholder="Provide a detailed description of the product..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  id="Submitbutton"
                  className="w-full cursor-pointer bg-black text-white py-3.5 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding Product...</span>
                    </div>
                  ) : (
                    "Add Product"
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

export default AddProduct;