import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Coffee } from 'lucide-react'; // Example icon, replace if needed

// Navbar Component (from your previous request, integrated here)
const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Workhere', path: '/workhere' },
  ];

  const authenticatedNavItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Workhere', path: '/workhere' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-lg z-50 shadow-lg border-b border-blue-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">⚕️</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              MR Data Manager
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {(user ? authenticatedNavItems : navItems).map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `text-blue-800 hover:text-blue-600 transition-all duration-300 font-medium relative group px-3 py-2 rounded-lg hover:bg-blue-50 ${
                    isActive ? "text-blue-600 bg-blue-100" : ""
                  }`
                }
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 group-hover:w-full transition-all duration-300"></span>
              </NavLink>
            ))}
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300 font-medium"
                >
                  Logout
                </button>
              ) : (
                <NavLink
                  to="/login"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 font-medium"
                >
                  Login
                </NavLink>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden bg-blue-100 hover:bg-blue-200 p-2 rounded-lg transition-colors duration-200"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-5 h-5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-blue-200/50 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {(user ? authenticatedNavItems : navItems).map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block text-blue-800 hover:text-blue-600 transition-all duration-300 font-medium px-4 py-3 rounded-lg hover:bg-blue-50 ${
                      isActive ? "text-blue-600 bg-blue-100" : ""
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="pt-2 border-t border-blue-200">
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-red-600 hover:text-red-800 transition-colors duration-300 font-medium"
                  >
                    Logout
                  </button>
                ) : (
                  <NavLink
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-blue-600 hover:text-blue-800 transition-colors duration-300 font-medium"
                  >
                    Login
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

// Main App component that sets up routing
