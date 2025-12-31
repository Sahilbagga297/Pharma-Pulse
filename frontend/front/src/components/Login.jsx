import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground.jsx';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error message when user starts typing
    if (message) {
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let result;
      if (isRegister) {
        result = await register(formData.name, formData.email, formData.password);
      } else {
        result = await login(formData.email, formData.password);
      }

      if (result.success) {
        navigate('/profile');
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4">
              💼
            </div>
            <h1 className="text-3xl font-bold text-blue-800 mb-2">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {isRegister ? 'Sign up to start managing billing data' : 'Sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required={isRegister}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('success') 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : message.includes('No user found') || message.includes('Wrong password')
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                <div className="flex items-center gap-2">
                  {message.includes('No user found') && (
                    <span className="text-red-600">⚠️</span>
                  )}
                  {message.includes('Wrong password') && (
                    <span className="text-red-600">🔒</span>
                  )}
                  {message.includes('Connection error') && (
                    <span className="text-yellow-600">🌐</span>
                  )}
                  <span>{message}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isRegister ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
            >
              {isRegister 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </button>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default Login;
