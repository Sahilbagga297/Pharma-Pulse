import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { BarChart3, TrendingUp, DollarSign, Calendar, Download, Filter, X, Eye } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground.jsx';

const MRDataManagementHome = () => {
  const heroRef = useRef(null);
  const [showReports, setShowReports] = useState(false);
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { token } = useAuth();


  const handleGetStarted = () => {
    alert('Welcome to MR Data Management System! Ready to streamline your medical sales tracking?');
  };

  const handleNavigation = (section) => {
    alert(`Navigating to ${section.replace('-', ' ')} section...`);
  };

  const fetchReports = async () => {
    if (!token) {
      alert('Please login to view reports');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://pharma-pulse-8vof.onrender.com/api/billing/reports?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReportsData(data);
      } else {
        alert('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const handleReportsClick = () => {
    if (!token) {
      alert('Please login to view reports');
      return;
    }
    setShowReports(true);
    fetchReports();
  };

  const downloadReport = async (format = 'excel') => {
    if (!token) {
      alert('Please login to download reports');
      return;
    }

    try {
      const response = await fetch(`https://pharma-pulse-8vof.onrender.com/api/billing/reports/download?period=${selectedPeriod}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  return (
    <AnimatedBackground>
      {/* Additional CSS for Home page specific styles */}
      <style jsx>{`
        @keyframes card-hover {
          0% { transform: translateY(0) scale(1); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          100% { transform: translateY(-10px) scale(1.02); box-shadow: 0 20px 50px rgba(0,0,0,0.15); }
        }

        .card-hover:hover {
          animation: card-hover 0.3s ease-out forwards;
        }
      `}</style>




      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 mt-20 md:mt-24">
        {/* Hero Section */}
        <section ref={heroRef} className="text-center mb-12 md:mb-20">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold mb-6 md:mb-8 leading-tight">
            <span className="gradient-text">Medical Representative</span>
            <br />
            <span className="text-white">Data Management</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-5xl mx-auto">
            Transform your pharmaceutical sales with intelligent tracking, automated calculations,
            and comprehensive analytics - all powered by cutting-edge technology
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
            <button
              onClick={handleGetStarted}
              className="group relative px-6 py-3 sm:px-10 sm:py-5 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full text-base sm:text-lg font-semibold overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              <span className="relative z-10">Start Your Journey</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>

            <button
              onClick={() => handleNavigation('demo')}
              className="px-6 py-3 sm:px-10 sm:py-5 w-full sm:w-auto glass-effect text-white rounded-full text-base sm:text-lg font-semibold hover:bg-white hover:bg-opacity-20 transition-all duration-300"
            >
              Watch Demo
            </button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { number: '1,247+', label: 'Active Doctors', icon: '👨‍⚕️' },
            { number: '₹12.8M', label: 'Total Revenue', icon: '💰' },
            { number: '23%', label: 'Growth Rate', icon: '📈' },
            { number: '₹1.2M', label: 'Monthly Savings', icon: '💎' }
          ].map((stat, index) => (
            <div
              key={index}
              className="glass-effect p-6 sm:p-8 rounded-3xl text-center card-hover transform transition-all duration-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-3xl sm:text-4xl mb-4">{stat.icon}</div>
              <div className="text-2xl sm:text-4xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-gray-300 text-xs sm:text-sm uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Feature Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: '📊',
              title: 'Smart Purchase Tracking',
              desc: 'AI-powered tracking of medicine purchases with predictive analytics and automated inventory management.',
              color: 'from-blue-600 to-blue-800'
            },
            {
              icon: '💰',
              title: 'Dynamic Discount Engine',
              desc: 'Intelligent discount calculations with tiered pricing, bulk discounts, and personalized offers.',
              color: 'from-slate-600 to-blue-700'
            },
            {
              icon: '🧾',
              title: 'Automated Payments',
              desc: 'Streamlined payment processing with automated reminders and integrated billing systems.',
              color: 'from-blue-700 to-slate-700'
            },
            {
              icon: '📈',
              title: 'Advanced Analytics',
              desc: 'Real-time dashboards with predictive insights and comprehensive financial reporting.',
              color: 'from-blue-800 to-slate-800'
            },
            {
              icon: '👨‍⚕️',
              title: 'Doctor CRM',
              desc: 'Complete doctor relationship management with interaction history and preference tracking.',
              color: 'from-slate-600 to-blue-600'
            },
            {
              icon: '🎯',
              title: 'Smart Inventory',
              desc: 'Predictive inventory management with expiry tracking and automated reorder points.',
              color: 'from-blue-600 to-slate-600'
            }
          ].map((card, index) => (
            <div
              key={index}
              className="glass-effect rounded-3xl p-8 card-hover group relative overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

              <div className="relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-r ${card.color} rounded-2xl flex items-center justify-center mb-6 text-2xl transform group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                <h3 className="text-white text-2xl font-bold mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300">
                  {card.title}
                </h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {card.desc}
                </p>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white group-hover:border-opacity-20 transition-all duration-300" />
            </div>
          ))}
        </section>
      </main>

      {/* Reports Modal */}
      {showReports && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Sales Reports</h2>
              </div>
              <button
                onClick={() => setShowReports(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Controls */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => {
                      setSelectedPeriod(e.target.value);
                      fetchReports();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                    <option value="all">All Time</option>
                  </select>
                </div>

                <button
                  onClick={() => fetchReports()}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Filter className="w-4 h-4" />
                  )}
                  {loading ? 'Loading...' : 'Refresh'}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => downloadReport('excel')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Excel
                  </button>
                  <button
                    onClick={() => downloadReport('pdf')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Reports Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : reportsData ? (
                <div className="space-y-8">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Total Sales</p>
                          <p className="text-3xl font-bold">₹{reportsData.totalSales?.toLocaleString() || '0'}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Total Orders</p>
                          <p className="text-3xl font-bold">{reportsData.totalOrders || '0'}</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-green-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Active Doctors</p>
                          <p className="text-3xl font-bold">{reportsData.activeDoctors || '0'}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Avg Order Value</p>
                          <p className="text-3xl font-bold">₹{reportsData.averageOrderValue?.toLocaleString() || '0'}</p>
                        </div>
                        <Eye className="w-8 h-8 text-orange-200" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-pink-100 text-sm">Net Sales</p>
                          <p className="text-3xl font-bold">₹{reportsData.totalNetSales?.toLocaleString() || '0'}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-pink-200" />
                      </div>
                    </div>
                  </div>

                  {/* Top Doctors */}
                  {reportsData.topDoctors && reportsData.topDoctors.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Performing Doctors</h3>
                      <div className="space-y-3">
                        {reportsData.topDoctors.map((doctor, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{doctor.doctorName}</p>
                                <p className="text-sm text-gray-600">{doctor.doctorDegree}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-800">₹{doctor.totalSales?.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">{doctor.orderCount} orders</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Sales */}
                  {reportsData.recentSales && reportsData.recentSales.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Sales</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600">Doctor</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600">Sample Units</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600">Amount</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600">Net Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportsData.recentSales.map((sale, index) => (
                              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-gray-800">
                                  {new Date(sale.timestamp).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-gray-800">
                                  <div>
                                    <p className="font-medium">{sale.doctorName}</p>
                                    <p className="text-sm text-gray-600">{sale.doctorDegree}</p>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-gray-800">{sale.sampleUnits}</td>
                                <td className="py-3 px-4 text-gray-800">₹{sale.totalOrderAmount?.toLocaleString()}</td>
                                <td className="py-3 px-4 text-gray-800">₹{sale.netAmount?.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* No Data Message */}
                  {(!reportsData.topDoctors || reportsData.topDoctors.length === 0) &&
                    (!reportsData.recentSales || reportsData.recentSales.length === 0) && (
                      <div className="text-center py-12">
                        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No sales data available for the selected period</p>
                        <p className="text-gray-500 text-sm">Start recording sales to see your reports</p>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Click Refresh to load reports</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 mt-20 glass-effect border-t border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold gradient-text mb-4">MR DataHub</div>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">Empowering medical representatives with intelligent data management</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {['Privacy', 'Terms', 'Support', 'Contact'].map((item) => (
                <button key={item} className="py-2 px-4 sm:py-3 sm:px-6 rounded-xl font-semibold text-white text-sm sm:text-base transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl">
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </AnimatedBackground>
  );
};

export default MRDataManagementHome;
