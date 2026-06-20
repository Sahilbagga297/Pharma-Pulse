import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Heart } from 'lucide-react';

const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing to MR Data Manager updates!');
  };

  return (
    <footer className="relative z-10 w-full mt-auto glass-effect border-t border-white border-opacity-10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-xl">⚕️</span>
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                MR Data Manager
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Empowering medical representatives with intelligent, real-time sales tracking, automated calculations, and comprehensive analytics.
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-400 pt-2">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
              <span>for healthcare professionals.</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    `hover:text-blue-400 transition-colors duration-200 ${isActive ? 'text-blue-400 font-medium' : 'text-gray-300'}`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/about" 
                  className={({ isActive }) => 
                    `hover:text-blue-400 transition-colors duration-200 ${isActive ? 'text-blue-400 font-medium' : 'text-gray-300'}`
                  }
                >
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/workhere" 
                  className={({ isActive }) => 
                    `hover:text-blue-400 transition-colors duration-200 ${isActive ? 'text-blue-400 font-medium' : 'text-gray-300'}`
                  }
                >
                  Work Space
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Contact & Support Column */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">Contact & Support</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="truncate hover:text-blue-400 cursor-pointer">Sahilbagga297@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>+91 7307973865</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">Stay Updated</h3>
            <p className="text-gray-300 text-sm">
              Subscribe to our newsletter for the latest updates, features, and insights.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 mt-2">
              <input 
                type="email" 
                required 
                placeholder="Email address"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
              >
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white border-opacity-10 my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <span>&copy; {new Date().getFullYear()} MR Data Manager. All rights reserved.</span>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-gray-300 font-medium">All systems operational</span>
          </div>

          <div className="flex space-x-6 text-gray-400">
            <a href="#" className="hover:text-blue-400 transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400 transition-colors duration-200">Terms of Service</a>
            <a href="#" className="hover:text-blue-400 transition-colors duration-200">Cookie Settings</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;