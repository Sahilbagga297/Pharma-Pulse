
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useBillingApi } from '../hooks/useApi.js';
import './BillingForm.css';

const MRSalesTransactionDashboard = () => {
  const particlesRef = useRef(null);
  const {
    getBillingEntries,
    saveBillingEntry,
    downloadExcel,
    createSampleData: createSampleDataApi,
    loading: apiLoading,
    error: apiError,
    clearError
  } = useBillingApi();

  const [formData, setFormData] = useState({
    doctorName: '',
    doctorDegree: '',
    doctorLocation: '',
    sampleUnits: '',
    totalOrderAmount: '',
    discountPercentage: '',
  });
  const [doctors, setDoctors] = useState([]);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    degree: '',
    location: ''
  });
  const [addingDoctor, setAddingDoctor] = useState(false);

  // Fetch doctors for dropdown
  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping doctors fetch');
        setDoctors([]);
        return;
      }

      const response = await fetch('https://pharma-pulse-8vof.onrender.com/api/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDoctors(data || []);
      } else {
        console.error('Failed to fetch doctors:', response.status, response.statusText);
        setDoctors([]);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setDoctors([]);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Listen for storage events to refresh doctors when deleted from other tabs/pages
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'doctorsUpdated') {
        fetchDoctors();
      }
    };

    const handleCustomEvent = () => {
      fetchDoctors();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('doctorsUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('doctorsUpdated', handleCustomEvent);
    };
  }, []);

  const [result, setResult] = useState({
    amountToPay: '0.00',
    mrAmount: '0.00',
  });

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState('');
  const [entries, setEntries] = useState([]);
  const [showEntries, setShowEntries] = useState(false);
  const [creatingSample, setCreatingSample] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    // Create floating particles
    const createParticles = () => {
      const particlesContainer = particlesRef.current;
      if (!particlesContainer) return;

      const particleCount = 15;
      particlesContainer.innerHTML = '';

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-1 h-1 bg-white bg-opacity-40 rounded-full';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animation = `particleFloat ${Math.random() * 8 + 8}s linear infinite`;
        particlesContainer.appendChild(particle);
      }
    };

    createParticles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If doctorName is changed from dropdown, auto-fill degree and location
    if (name === 'doctorName') {
      const selected = doctors.find(d => d.name === value);
      setFormData((prevData) => ({
        ...prevData,
        doctorName: value,
        doctorDegree: selected ? selected.degree : '',
        doctorLocation: selected ? selected.location : ''
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleNewDoctorChange = (e) => {
    const { name, value } = e.target;
    setNewDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setAddingDoctor(true);
    setMessage('');

    // Validate required fields
    if (!newDoctor.name.trim()) {
      setMessage('Please enter the doctor\'s name.');
      setAddingDoctor(false);
      return;
    }

    if (!newDoctor.degree.trim()) {
      setMessage('Please enter the doctor\'s degree.');
      setAddingDoctor(false);
      return;
    }

    if (!newDoctor.location.trim()) {
      setMessage('Please enter the doctor\'s location.');
      setAddingDoctor(false);
      return;
    }

    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to add a doctor');
      }

      // Create new doctor
      const doctorResponse = await fetch('https://pharma-pulse-8vof.onrender.com/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newDoctor.name.trim(),
          degree: newDoctor.degree.trim(),
          location: newDoctor.location.trim()
        })
      });

      if (!doctorResponse.ok) {
        let errorMessage = 'Failed to create doctor';
        let existingDoctor = null;

        try {
          const errorData = await doctorResponse.json();
          errorMessage = errorData.message || errorMessage;
          existingDoctor = errorData.doctor;
        } catch (parseError) {
          // If response is not JSON (like HTML error page), use status text
          errorMessage = `Server error: ${doctorResponse.status} ${doctorResponse.statusText}`;
        }

        // If doctor already exists, handle it gracefully
        if (doctorResponse.status === 409 && existingDoctor) {
          // Refresh doctors list to include the existing doctor
          const doctorsResponse = await fetch('https://pharma-pulse-8vof.onrender.com/api/doctors', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (doctorsResponse.ok) {
            const doctorsData = await doctorsResponse.json();
            setDoctors(doctorsData || []);
          }

          // Auto-populate form with existing doctor
          setFormData((prevData) => ({
            ...prevData,
            doctorName: existingDoctor.name,
            doctorDegree: existingDoctor.degree,
            doctorLocation: existingDoctor.location
          }));

          // Reset new doctor form and close modal
          setNewDoctor({ name: '', degree: '', location: '' });
          setShowAddDoctorModal(false);
          setMessage(`Doctor "${existingDoctor.name}" already exists! Form populated with existing doctor. 🔄`);
          setAddingDoctor(false);
          return;
        }

        throw new Error(errorMessage);
      }

      const doctorData = await doctorResponse.json();

      // Add doctor visit (this will automatically set visits to 1)
      const visitResponse = await fetch('https://pharma-pulse-8vof.onrender.com/api/billing/profile/visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorName: newDoctor.name.trim(),
          doctorDegree: newDoctor.degree.trim()
        })
      });

      if (!visitResponse.ok) {
        let errorMessage = 'Failed to record doctor visit';
        try {
          const errorData = await visitResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = `Server error: ${visitResponse.status} ${visitResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Refresh doctors list
      const doctorsResponse = await fetch('https://pharma-pulse-8vof.onrender.com/api/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (doctorsResponse.ok) {
        const doctorsData = await doctorsResponse.json();
        setDoctors(doctorsData || []);
      }

      // Auto-populate form with new doctor
      setFormData((prevData) => ({
        ...prevData,
        doctorName: newDoctor.name.trim(),
        doctorDegree: newDoctor.degree.trim(),
        doctorLocation: newDoctor.location.trim()
      }));

      // Reset new doctor form and close modal
      setNewDoctor({ name: '', degree: '', location: '' });
      setShowAddDoctorModal(false);
      setMessage(`Doctor "${newDoctor.name}" added successfully and visit recorded! 🎉`);

    } catch (error) {
      console.error('Error adding doctor:', error);
      setMessage(`Failed to add doctor: ${error.message}`);
    } finally {
      setAddingDoctor(false);
    }
  };


  const calculateAmounts = () => {
    const { totalOrderAmount, discountPercentage } = formData;
    const total = parseFloat(totalOrderAmount);
    const discount = parseFloat(discountPercentage);

    if (!isNaN(total) && !isNaN(discount)) {
      const discountAmount = total * (discount / 100);
      const netAmount = total - discountAmount;
      const mrAmount = discountAmount;
      setResult({
        amountToPay: netAmount.toFixed(2),
        mrAmount: mrAmount.toFixed(2),
      });
    } else {
      setResult({ amountToPay: '0.00', mrAmount: '0.00' });
    }
  };

  useEffect(() => {
    calculateAmounts();
  }, [formData.totalOrderAmount, formData.discountPercentage]);

  const loadEntries = useCallback(async () => {
    try {
      const data = await getBillingEntries();
      if (data.success) {
        setEntries(data.data.entries || []);
        setMessage(data.data.message || `Found ${data.data.entries?.length || 0} entries`);
      } else {
        setMessage('Failed to load entries');
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      setMessage('Error loading entries. Please check your connection.');
    }
  }, [getBillingEntries]);

  // Wrapper functions to handle UI state for API calls
  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      setMessage('Preparing Excel file for download...');

      // First check if there are entries to download
      if (entries.length === 0) {
        setMessage('No data available to download. Please add some transactions first.');
        setDownloading(false);
        return;
      }

      await downloadExcel();
      setMessage('Excel file downloaded successfully! 📊');
    } catch (error) {
      console.error('Download error:', error);
      setMessage('Connection error during download. Please check if the server is running.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCreateSampleData = async () => {
    try {
      setCreatingSample(true);
      setMessage('Creating sample data for testing...');

      const response = await createSampleDataApi();
      if (response.success) {
        setMessage(`Sample data created successfully! ${response.message}`);
        loadEntries(); // Reload entries to show the new sample data
      } else {
        setMessage(`Failed to create sample data: ${response.message}`);
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      setMessage('Connection error while creating sample data.');
    } finally {
      setCreatingSample(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Handle API errors
  useEffect(() => {
    if (apiError) {
      setMessage(`Error: ${apiError}`);
      clearError();
    }
  }, [apiError, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate required fields
    if (!formData.doctorName.trim()) {
      setMessage('Please enter the doctor\'s name.');
      setLoading(false);
      return;
    }

    if (!formData.doctorDegree.trim()) {
      setMessage('Please enter the doctor\'s degree.');
      setLoading(false);
      return;
    }

    if (!formData.doctorLocation || !formData.doctorLocation.trim()) {
      setMessage('Please enter the doctor\'s location.');
      setLoading(false);
      return;
    }

    if (!formData.sampleUnits || parseFloat(formData.sampleUnits) <= 0) {
      setMessage('Please enter a valid number of sample units greater than 0.');
      setLoading(false);
      return;
    }

    if (!formData.totalOrderAmount || parseFloat(formData.totalOrderAmount) <= 0) {
      setMessage('Please enter a valid total order amount greater than 0.');
      setLoading(false);
      return;
    }

    if (!formData.discountPercentage || parseFloat(formData.discountPercentage) < 0) {
      setMessage('Please enter a valid discount percentage (0 or greater).');
      setLoading(false);
      return;
    }



    try {
      const dataToSend = {
        ...formData,
        doctorDegree: formData.doctorDegree.trim(),
        doctorLocation: formData.doctorLocation.trim(),
        sampleUnits: parseFloat(formData.sampleUnits),
        totalOrderAmount: parseFloat(formData.totalOrderAmount),
        discountPercentage: parseFloat(formData.discountPercentage),
        netAmount: parseFloat(result.amountToPay), // Use calculated net amount
        // Keep backward compatibility
        totalAmount: parseFloat(formData.totalOrderAmount),
        amountToPay: parseFloat(result.amountToPay),
        mrAmount: parseFloat(result.mrAmount)
      };

      const responseData = await saveBillingEntry(dataToSend);
      if (responseData.success) {
        setMessage(`Transaction saved successfully! ${responseData.message}`);
        setFormData({ doctorName: '', doctorDegree: '', doctorLocation: '', sampleUnits: '', totalOrderAmount: '', discountPercentage: '' });
        setResult({ amountToPay: '0.00', mrAmount: '0.00' });
        loadEntries();
      } else {
        setMessage(`Failed to save transaction: ${responseData.message}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setMessage('Connection error. Please check if the server is running and you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditData({ ...entries[index] });
  };

  // Handle edit input change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Save edited entry
  const handleEditSave = async (id) => {
    try {
      setLoading(true);
      // Calculate netAmount and mrAmount if relevant fields changed
      let totalOrderAmount = parseFloat(editData.totalOrderAmount);
      let discountPercentage = parseFloat(editData.discountPercentage);
      let netAmount = totalOrderAmount - (totalOrderAmount * (discountPercentage / 100));
      let mrAmount = totalOrderAmount * (discountPercentage / 100);
      const updatePayload = {
        ...editData,
        sampleUnits: parseFloat(editData.sampleUnits),
        totalOrderAmount,
        discountPercentage,
        netAmount,
        mrAmount,
        amountToPay: netAmount,
        totalAmount: totalOrderAmount
      };
      const response = await fetch(`https://pharma-pulse-8vof.onrender.com/api/billing/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatePayload)
      });
      if (response.ok) {
        const responseData = await response.json();
        setMessage(responseData.message || 'Entry updated successfully!');
        setEditIndex(null);
        setEditData({});
        loadEntries();
      } else {
        const errorData = await response.json();
        setMessage(`Failed to update entry: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      setMessage('Error updating entry. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditIndex(null);
    setEditData({});
  };

  // Delete billing entry
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this billing entry? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await fetch(`https://pharma-pulse-8vof.onrender.com/api/billing/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const responseData = await response.json();
          setMessage(responseData.message || 'Entry deleted successfully!');
          loadEntries(); // Reload entries to reflect the deletion
        } else {
          const errorData = await response.json();
          setMessage(`Failed to delete entry: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
        setMessage('Error deleting entry. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes particleFloat {
          0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(50px); opacity: 0; }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-slide-in { animation: slideIn 0.8s ease-out; }
        .animate-pulse-gentle { animation: pulse 3s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
      `}</style>

      {/* Background Particles */}
      <div ref={particlesRef} className="absolute inset-0" />

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-32 h-32 rounded-full bg-white bg-opacity-5 top-10 left-10 animate-pulse-gentle" />
        <div className="absolute w-24 h-24 rounded-full bg-white bg-opacity-8 bottom-20 right-20 animate-pulse-gentle" style={{ animationDelay: '1s' }} />
        <div className="absolute w-16 h-16 rounded-full bg-white bg-opacity-6 top-1/2 right-10 animate-pulse-gentle" style={{ animationDelay: '2s' }} />

        {/* Medical symbols */}
        <div className="absolute text-6xl text-white text-opacity-5 top-1/4 left-1/4 animate-pulse-gentle">⚕️</div>
        <div className="absolute text-4xl text-white text-opacity-8 bottom-1/3 right-1/3 animate-pulse-gentle" style={{ animationDelay: '1.5s' }}>💊</div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white bg-opacity-95 backdrop-blur-lg shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💼</span>
              <div>
                <h1 className="text-2xl font-bold text-blue-800">Medical Billing Dashboard</h1>
                <p className="text-sm text-blue-600">Doctor Order & Sample Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {entries.length} Entries
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl backdrop-blur-lg animate-slide-in ${message.includes('successfully')
            ? 'bg-green-500 bg-opacity-20 text-green-100 border border-green-400 border-opacity-30'
            : 'bg-red-50 bg-opacity-20 text-white border border-red-400 border-opacity-30'
            }`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {message.includes('successfully') ? '✅' : '⚠️'}
              </span>
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Transaction Form */}
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl p-5 md:p-8 mb-8 animate-slide-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white text-xl">
              📋
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-800">New Billing Entry</h2>
              <p className="text-gray-600">Enter doctor order and sample details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Doctor Name Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-blue-800 mb-2">
                  👨‍⚕️ Doctor's Name
                </label>
                <div className="flex gap-2">
                  <select
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    required
                    className="flex-1 px-4 py-3 bg-white bg-opacity-80 border border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300 text-gray-800 placeholder-gray-500"
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((doc) => (
                      <option key={doc._id} value={doc.name}>{doc.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const token = localStorage.getItem('token');
                      if (!token) {
                        setMessage('Please log in to add a new doctor');
                        return;
                      }
                      setShowAddDoctorModal(true);
                    }}
                    className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors duration-300 flex items-center gap-2"
                    title="Add New Doctor"
                  >
                    <span className="text-lg">➕</span>
                  </button>
                </div>
              </div>

              {/* Doctor Degree (auto-filled) */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-blue-800 mb-2">
                  🎓 Doctor's Degree
                </label>
                <input
                  type="text"
                  name="doctorDegree"
                  value={formData.doctorDegree}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white bg-opacity-80 border border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300 text-gray-800 placeholder-gray-500"
                  placeholder="e.g., MBBS, MD, MS"
                  readOnly={!!formData.doctorName}
                />
              </div>

              {/* Doctor Location (auto-filled) */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-blue-800 mb-2">
                  📍 Location of Doctor
                </label>
                <input
                  type="text"
                  name="doctorLocation"
                  value={formData.doctorLocation}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white bg-opacity-80 border border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300 text-gray-800 placeholder-gray-500"
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Sample Units */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-blue-800 mb-2">
                  📦 Sample Units
                </label>
                <input
                  type="number"
                  name="sampleUnits"
                  value={formData.sampleUnits}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white bg-opacity-80 border border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300 text-gray-800 placeholder-gray-500"
                  placeholder="0"
                  min="1"
                  step="1"
                />
              </div>

              {/* Total Order Amount */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-blue-800 mb-2">
                  💰 Total Order Amount (₹)
                </label>
                <input
                  type="number"
                  name="totalOrderAmount"
                  value={formData.totalOrderAmount}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white bg-opacity-80 border border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300 text-gray-800 placeholder-gray-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            {/* Discount Percentage */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                🏷️ Discount Percentage (%)
              </label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white bg-opacity-80 border border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300 text-gray-800 placeholder-gray-500"
                placeholder="0"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            {/* Calculation Results */}
            <div className="grid md:grid-cols-2 gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-3xl mb-2">💳</div>
                <p className="text-sm font-medium text-gray-600 mb-1">Net Amount (After Discount)</p>
                <p className="text-2xl font-bold text-green-600">₹{result.amountToPay}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-3xl mb-2">🏢</div>
                <p className="text-sm font-medium text-gray-600 mb-1">Discount Amount</p>
                <p className="text-2xl font-bold text-red-500">₹{result.mrAmount}</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Transaction...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl">💾</span>
                  Save Billing Entry
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Transaction History Section */}
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl p-5 md:p-8 animate-slide-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center text-white text-xl flex-shrink-0">
                📊
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-800">Billing History</h3>
                <p className="text-gray-600">Recent billing entries ({entries.length} total)</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <button
                onClick={loadEntries}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-medium transition-colors duration-300 flex items-center gap-2"
              >
                <span>🔄</span> Refresh
              </button>
              <button
                onClick={() => setShowEntries(!showEntries)}
                className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl font-medium transition-colors duration-300 flex items-center gap-2"
              >
                <span>{showEntries ? '🔼' : '🔽'}</span>
                {showEntries ? 'Hide' : 'Show'} Entries
              </button>
              <button
                onClick={handleDownloadExcel}
                disabled={downloading || entries.length === 0}
                className={`px-4 py-2 rounded-xl font-medium transition-colors duration-300 flex items-center gap-2 ${downloading || entries.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-100 hover:bg-green-200 text-green-700'
                  }`}
              >
                {downloading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    Downloading...
                  </div>
                ) : (
                  <>
                    <span>📊</span> Download Excel
                  </>
                )}
              </button>
            </div>
          </div>

          {showEntries && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {entries.length > 0 ? (
                entries.map((entry, index) => (
                  <div
                    key={index}
                    className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                  >
                    {editIndex === index ? (
                      <form
                        className="space-y-2"
                        onSubmit={e => {
                          e.preventDefault();
                          handleEditSave(entry._id);
                        }}
                      >
                        <div className="grid md:grid-cols-4 gap-4">
                          <input
                            type="text"
                            name="doctorName"
                            value={editData.doctorName}
                            onChange={handleEditChange}
                            className="px-2 py-1 border rounded w-full"
                            placeholder="Doctor Name"
                            required
                          />
                          <input
                            type="text"
                            name="doctorDegree"
                            value={editData.doctorDegree}
                            onChange={handleEditChange}
                            className="px-2 py-1 border rounded w-full"
                            placeholder="Doctor Degree"
                            required
                          />
                          <input
                            type="text"
                            name="doctorLocation"
                            value={editData.doctorLocation}
                            onChange={handleEditChange}
                            className="px-2 py-1 border rounded w-full"
                            placeholder="Doctor Location"
                            required
                          />
                          <input
                            type="number"
                            name="sampleUnits"
                            value={editData.sampleUnits}
                            onChange={handleEditChange}
                            className="px-2 py-1 border rounded w-full"
                            min="1"
                            placeholder="Sample Units"
                            required
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <input
                            type="number"
                            name="totalOrderAmount"
                            value={editData.totalOrderAmount}
                            onChange={handleEditChange}
                            className="px-2 py-1 border rounded w-full"
                            step="0.01"
                            required
                          />
                          <input
                            type="number"
                            name="discountPercentage"
                            value={editData.discountPercentage}
                            onChange={handleEditChange}
                            className="px-2 py-1 border rounded w-full"
                            min="0"
                            max="100"
                            step="0.1"
                            required
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="px-3 py-1 bg-green-500 text-white rounded"
                              disabled={loading}
                            >Save</button>
                            <button
                              type="button"
                              className="px-3 py-1 bg-gray-300 text-gray-800 rounded"
                              onClick={handleEditCancel}
                            >Cancel</button>
                            <button
                              type="button"
                              className="px-3 py-1 bg-red-500 text-white rounded"
                              onClick={() => handleDelete(entry._id)}
                            >Delete</button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">👨‍⚕️</span>
                            <h4 className="text-lg font-bold text-blue-800 break-words">{entry.doctorName}</h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-500">Degree:</span>
                              <p className="font-semibold text-gray-800">{entry.doctorDegree}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Location:</span>
                              <p className="font-semibold text-gray-800">{entry.doctorLocation}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Sample Units:</span>
                              <p className="font-semibold text-blue-600">{entry.sampleUnits}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Discount:</span>
                              <p className="font-semibold text-orange-600">{entry.discountPercentage}%</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Total Order:</span>
                              <p className="font-semibold text-gray-800">₹{entry.totalOrderAmount}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Net Amount:</span>
                              <p className="font-semibold text-green-600">₹{entry.netAmount}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Discount Amount:</span>
                              <p className="font-semibold text-red-500">₹{entry.mrAmount}</p>
                            </div>
                          </div>
                        </div>
                        <div className="w-full md:w-auto text-left md:text-right mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 md:border-none">
                          <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end mb-2 md:mb-0">
                            <span className="text-xs text-gray-500">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-400 md:block">
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              className="px-3 py-1 bg-yellow-400 text-white rounded text-xs"
                              onClick={() => handleEditClick(index)}
                            >Edit</button>
                            <button
                              className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                              onClick={() => handleDelete(entry._id)}
                            >Delete</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h4 className="text-xl font-bold text-gray-600 mb-2">No Billing Entries Yet</h4>
                  <p className="text-gray-500 mb-6">Create your first billing entry above</p>
                  <button
                    onClick={handleCreateSampleData}
                    disabled={creatingSample}
                    className={`px-6 py-3 rounded-xl font-medium transition-colors duration-300 flex items-center gap-2 mx-auto ${creatingSample
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      }`}
                  >
                    {creatingSample ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Creating Sample Data...
                      </div>
                    ) : (
                      <>
                        <span>🧪</span> Create Sample Data
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-slide-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center text-white text-xl">
                👨‍⚕️
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800">Add New Doctor</h3>
                <p className="text-gray-600">Create a new doctor entry</p>
              </div>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-800">
                  Doctor's Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newDoctor.name}
                  onChange={handleNewDoctorChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-green-400 transition-all duration-300 text-gray-800 placeholder-gray-500"
                  placeholder="e.g., Dr. John Smith"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-800">
                  Doctor's Degree *
                </label>
                <input
                  type="text"
                  name="degree"
                  value={newDoctor.degree}
                  onChange={handleNewDoctorChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-green-400 transition-all duration-300 text-gray-800 placeholder-gray-500"
                  placeholder="e.g., MBBS, MD, MS"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-800">
                  Doctor's Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={newDoctor.location}
                  onChange={handleNewDoctorChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-green-400 transition-all duration-300 text-gray-800 placeholder-gray-500"
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={addingDoctor}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 ${addingDoctor
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl'
                    }`}
                >
                  {addingDoctor ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding Doctor...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>➕</span>
                      Add Doctor
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDoctorModal(false);
                    setNewDoctor({ name: '', degree: '', location: '' });
                  }}
                  className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl font-medium transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MRSalesTransactionDashboard;