import { BrowserRouter, Routes, Route } from "react-router-dom";

import AllProducts from "./views/AllProducts";
import AddProduct from "./views/AddProduct";
import ProductDetails from "./views/ProductDetails";
import Categories from "./views/Categories";
import EditProduct from "./views/EditProduct";
import Customers from "./views/Customers";
import Selling from "./views/Selling";
import Invoice from "./views/Invoice";
import InvoiceVerification from "./views/InvoiceVerification";
import Navbar from "./components/Navbar";
import InvoiceHistory from "./views/InvoiceHistory";
import Dashboard from "./views/Dashboard";
import ScrollToTop from "./components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
        theme="light"
      />{" "}
      <Navbar />
      <Routes>
        <Route path="/products" element={<AllProducts />} />
        <Route path="/add" element={<AddProduct />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/category" element={<Categories />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/selling" element={<Selling />} />
        <Route path="/invoice/:invoiceNumber" element={<Invoice />} />
        <Route path="/invoice-verification" element={<InvoiceVerification />} />
        <Route path="/invoices" element={<InvoiceHistory />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
