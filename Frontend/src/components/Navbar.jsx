import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-indigo-600 tracking-tight"
        >
          🛒 Nexora
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-indigo-600 transition">
            Home
          </Link>
          <Link to="/products" className="hover:text-indigo-600 transition">
            Products
          </Link>

          {isAdmin && (
            <Link
              to="/admin/products"
              className="hover:text-indigo-600 transition text-amber-600"
            >
              Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-indigo-600 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-9-4h4"
                  />
                </svg>
              </Link>

              {/* User menu */}
              <div className="relative">
                {/* Profile Button */}
                <div
                  onClick={() => setOpen(!open)}
                  className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm cursor-pointer"
                >
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                </div>

                {/* Dropdown */}
                {open && (
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setOpen(false)}
                    >
                      Profile
                    </Link>

                    <button
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white
                  px-4 py-2 rounded-lg font-medium transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
