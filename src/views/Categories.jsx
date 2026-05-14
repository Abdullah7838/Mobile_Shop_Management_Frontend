import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const BackendApi = import.meta.env.VITE_BACKEND_API;

  // GET ALL
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BackendApi}/api/categories`);

      setCategories(res.data.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // DELETE
  const deleteCategory = async (id) => {
    const confirm = window.confirm("Delete this category?");
    if (!confirm) return;

    try {
      await axios.delete(`${BackendApi}/api/categories/${id}`);

      setCategories((prev) => prev.filter((c) => c._id !== id));

      toast.success("Category deleted");
    } catch (err) {
      console.log(err);
      toast.error("Delete failed");
    }
  };

  // INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ADD
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${BackendApi}/api/categories`, form);

      setForm({ name: "", description: "" });

      fetchCategories();

      toast.success("Category added");
    } catch (err) {
      console.log(err);
      toast.error("Add failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Categories
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your product categories</p>
        </div>

        {/* FORM SECTION */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Add New Category</h2>
            <p className="text-sm text-gray-400 mt-0.5">Create a new category for your products</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Category Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Smartphones, Laptops"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Brief description of the category"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <button 
                  type="submit" 
                  className="w-full cursor-pointer md:w-auto px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Add Category
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* LIST SECTION */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-800">All Categories</h2>
            <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {categories.length} {categories.length === 1 ? 'category' : 'categories'}
            </span>
          </div>

          {categories.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">No categories yet</p>
              <p className="text-gray-400 text-sm mt-1">Add your first category using the form above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div 
                  key={cat._id} 
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1.5 leading-relaxed">
                          {cat.description || "No description provided"}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 text-sm font-mono">
                        {cat.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="mt-5 pt-3 border-t border-gray-50">
                      <button
                        onClick={() => deleteCategory(cat._id)}
                        className="w-full cursor-pointer bg-white border border-red-200 text-red-600 px-4 py-2.5 rounded-xl font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                      >
                        Delete Category
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Categories;