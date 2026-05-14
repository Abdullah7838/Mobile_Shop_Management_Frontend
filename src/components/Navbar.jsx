import { NavLink } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-white bg-black px-3 py-2 rounded-md"
      : "text-gray-700 hover:text-black px-3 py-2";

  const mobileLinkClass = ({ isActive }) =>
    isActive
      ? "block w-full text-left bg-gray-100 text-black px-4 py-3 rounded-lg font-medium"
      : "block w-full text-left text-gray-600 hover:bg-gray-50 hover:text-black px-4 py-3 rounded-lg transition-colors";

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              MobileShop Admin
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/products" className={linkClass}>
              Products
            </NavLink>
            <NavLink to="/add" className={linkClass}>
              Add Product
            </NavLink>
            <NavLink to="/category" className={linkClass}>
              Categories
            </NavLink>
            <NavLink to="/customers" className={linkClass}>
              Customers
            </NavLink>
            <NavLink to="/selling" className={linkClass}>
              Selling
            </NavLink>
            <NavLink to="/invoices" className={linkClass}>
              Invoices
            </NavLink>
            <NavLink to="/invoice-verification" className={linkClass}>
              Verification
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
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
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden ${isOpen ? "block" : "hidden"} border-t border-gray-100 bg-white`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          <NavLink
            to="/"
            className={mobileLinkClass}
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/products"
            className={mobileLinkClass}
            onClick={() => setIsOpen(false)}
          >
            Products
          </NavLink>
          <NavLink
            to="/add"
            className={mobileLinkClass}
            onClick={() => setIsOpen(false)}
          >
            Add Product
          </NavLink>
          <NavLink
            to="/category"
            className={mobileLinkClass}
            onClick={() => setIsOpen(false)}
          >
            Categories
          </NavLink>
          <NavLink
            to="/customers"
            className={mobileLinkClass}
            onClick={() => setIsOpen(false)}
          >
            Customers
          </NavLink>
          <NavLink
            to="/selling"
            className={mobileLinkClass}
            onClick={() => setIsOpen(false)}
          >
            Selling
          </NavLink>
          <NavLink
            to="/invoices"
            className={mobileLinkClass}
            onClick={() => setIsOpen(false)}
          >
            Invoices
          </NavLink>
          <NavLink
            to="/invoice-verification"
            className={mobileLinkClass}
            onClick={() => setIsOpen(false)}
          >
            Verification
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
