// App.jsx - Class Component with Authentication
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

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
import ManageAdmins from "./views/ManageAdmins";
import Login from "./views/Login";
import ScrollToTop from "./components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BackendApi = import.meta.env.VITE_BACKEND_API;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      currentAdmin: null,
      loading: true,
    };
  }

  componentDidMount() {
    this.checkAuth();
  }

  checkAuth = () => {
    const adminData = localStorage.getItem("admin");
    const token = localStorage.getItem("token");

    if (adminData && token) {
      this.setState({
        isLoggedIn: true,
        currentAdmin: JSON.parse(adminData),
        loading: false,
      });
    } else {
      this.setState({ loading: false });
    }
  };

  handleLogin = (adminData, token) => {
    localStorage.setItem("admin", JSON.stringify(adminData));
    localStorage.setItem("token", token);
    this.setState({
      isLoggedIn: true,
      currentAdmin: adminData,
    });
  };

  handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    this.setState({
      isLoggedIn: false,
      currentAdmin: null,
    });
  };

  // Protected Route wrapper
  ProtectedRoute = ({ children }) => {
    const { loading, isLoggedIn } = this.state;

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  render() {
    const { isLoggedIn, currentAdmin } = this.state;

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
        />
        {isLoggedIn && (
          <Navbar onLogout={this.handleLogout} currentAdmin={currentAdmin} />
        )}
        <Routes>
          <Route path="/login" element={<Login onLogin={this.handleLogin} />} />
          <Route
            path="/products"
            element={
              <this.ProtectedRoute>
                <AllProducts />
              </this.ProtectedRoute>
            }
          />
          <Route
            path="/add"
            element={
              <this.ProtectedRoute>
                <AddProduct />
              </this.ProtectedRoute>
            }
          />
          <Route
            path="/product/:id"
            element={
              <this.ProtectedRoute>
                <ProductDetails />
              </this.ProtectedRoute>
            }
          />
          <Route
            path="/category"
            element={
              <this.ProtectedRoute>
                <Categories />
              </this.ProtectedRoute>
            }
          />
          <Route
            path="/edit-product/:id"
            element={
              <this.ProtectedRoute>
                <EditProduct />
              </this.ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <this.ProtectedRoute>
                <Customers />
              </this.ProtectedRoute>
            }
          />
          <Route
            path="/selling"
            element={
              <this.ProtectedRoute>
                <Selling />
              </this.ProtectedRoute>
            }
          />
          <Route
            path="/invoice/:invoiceNumber"
            element={
              <this.ProtectedRoute>
                <Invoice />
              </this.ProtectedRoute>
            }
          />
          <Route
            path="/invoice-verification"
            element={
              <this.ProtectedRoute>
                <InvoiceVerification />
              </this.ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <this.ProtectedRoute>
                <InvoiceHistory />
              </this.ProtectedRoute>
            }
          />
          <Route
            path="/manage-admins"
            element={
              <this.ProtectedRoute>
                <ManageAdmins />
              </this.ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <this.ProtectedRoute>
                <Dashboard />
              </this.ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
