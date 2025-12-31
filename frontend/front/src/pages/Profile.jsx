
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Phone, MapPin, Briefcase, Stethoscope, Plus, Edit3, Save, X, Minus, DollarSign, TrendingUp, Package, Eye, Trash2, Mail } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground.jsx';

const Profile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    designation: ''
  });
  const [newVisit, setNewVisit] = useState({
    doctorName: '',
    doctorDegree: '',
    doctorLocation: ''
  });
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [message, setMessage] = useState('');
  const [editingVisits, setEditingVisits] = useState(false);
  const [editedVisits, setEditedVisits] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'edit' or 'analysis'
  const [editDoctorData, setEditDoctorData] = useState({
    doctorName: '',
    doctorDegree: '',
    doctorLocation: '',
    noOfVisits: 0
  });
  const [analyzingDoctor, setAnalyzingDoctor] = useState(null);

  // Reports functionality
  const [showReports, setShowReports] = useState(false);
  const [reportsData, setReportsData] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/billing/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || '',
          email: data.profile.email || '',
          phone: data.profile.phone || '',
          address: data.profile.address || '',
          designation: data.profile.designation || ''
        });
        // Initialize edited visits with current data
        setEditedVisits(data.profile.doctorVisits ? [...data.profile.doctorVisits] : []);
        // Reset editing state
        setEditingVisits(false);
      } else {
        setMessage('Failed to load profile');
      }
    } catch (error) {
      setMessage('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/billing/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditing(false);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      setMessage('Error updating profile');
    }
  };

  // Add doctor visit
  const addDoctorVisit = async () => {
    if (!newVisit.doctorName || !newVisit.doctorDegree || !newVisit.doctorLocation) {
      setMessage('Please fill in doctor name, degree, and location');
      return;
    }

    try {
      // Add to user profile as before
      const response = await fetch('http://localhost:5000/api/billing/profile/visit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVisit)
      });

      // Also add to Doctor collection for dropdown
      await fetch('http://localhost:5000/api/doctors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name: newVisit.doctorName, 
          degree: newVisit.doctorDegree,
          location: newVisit.doctorLocation
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setNewVisit({ doctorName: '', doctorDegree: '', doctorLocation: '' });
        setShowVisitForm(false);
        setMessage('Doctor visit recorded successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to record doctor visit');
      }
    } catch (error) {
      setMessage('Error recording doctor visit');
    }
  };

  // Increase visit count
  const increaseVisit = (index) => {
    const updatedVisits = [...editedVisits];
    updatedVisits[index].noOfVisits += 1;
    setEditedVisits(updatedVisits);
  };

  // Decrease visit count
  const decreaseVisit = (index) => {
    const updatedVisits = [...editedVisits];
    if (updatedVisits[index].noOfVisits > 0) {
      updatedVisits[index].noOfVisits -= 1;
      setEditedVisits(updatedVisits);
    }
  };

  // Update all visit counts
  const updateVisits = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/billing/profile/visits/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctorVisits: editedVisits
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditingVisits(false);
        setMessage('Visits updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update visits');
      }
    } catch (error) {
      setMessage('Error updating visits');
    }
  };



  // Handle edit doctor
  const handleEditDoctor = (visit, index) => {
    setSelectedDoctor({ ...visit, index });
    setEditDoctorData({
      doctorName: visit.doctorName,
      doctorDegree: visit.doctorDegree,
      doctorLocation: visit.doctorLocation || '',
      noOfVisits: visit.noOfVisits
    });
    setModalType('edit');
    setShowDoctorModal(true);
  };

  // Handle analyze doctor
  const handleAnalyzeDoctor = async (visit) => {
    console.log('Analysis button clicked for:', visit.doctorName); // Debug log
    setAnalyzingDoctor(visit.doctorName);
    try {
      // Fetch business summary for the specific doctor
      const response = await fetch('http://localhost:5000/api/billing/profile/business-summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Business summary response:', data); // Debug log
        
        // Find the specific doctor's business data
        const doctorBusiness = data.doctorBusinessSummary?.find(doc => 
          doc.doctorName === visit.doctorName
        );
        
        console.log('Found doctor business data:', doctorBusiness); // Debug log
        
        if (doctorBusiness) {
          setSelectedDoctor({ ...visit, businessData: doctorBusiness });
        } else {
          setSelectedDoctor(visit);
        }
      } else {
        console.log('Response not ok:', response.status); // Debug log
        // If no business data found, just show the visit info
        setSelectedDoctor(visit);
      }
      setModalType('analysis');
      setShowDoctorModal(true);
    } catch (error) {
      console.error('Error fetching doctor business data:', error);
      setSelectedDoctor(visit);
      setModalType('analysis');
      setShowDoctorModal(true);
    } finally {
      setAnalyzingDoctor(null);
    }
  };

  // Update doctor data
  const updateDoctorData = async () => {
    try {
      // Validate required fields
      if (!editDoctorData.doctorName || !editDoctorData.doctorName.trim()) {
        setMessage('Please enter the doctor\'s name.');
        return;
      }

      if (!editDoctorData.doctorDegree || !editDoctorData.doctorDegree.trim()) {
        setMessage('Please enter the doctor\'s degree.');
        return;
      }

      if (!editDoctorData.doctorLocation || !editDoctorData.doctorLocation.trim()) {
        setMessage('Please enter the doctor\'s location.');
        return;
      }

      const updatedVisits = [...profile.doctorVisits];
      const oldDoctorData = updatedVisits[selectedDoctor.index];
      updatedVisits[selectedDoctor.index] = {
        ...updatedVisits[selectedDoctor.index],
        ...editDoctorData
      };

      // Update profile visits
      const response = await fetch('http://localhost:5000/api/billing/profile/visits/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctorVisits: updatedVisits
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        
        // Also update the Doctor collection for dropdown synchronization
        try {
          const doctorUpdateResponse = await fetch('http://localhost:5000/api/doctors', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              oldName: oldDoctorData.doctorName,
              newName: editDoctorData.doctorName,
              degree: editDoctorData.doctorDegree,
              location: editDoctorData.doctorLocation
            })
          });

          if (doctorUpdateResponse.ok) {
            // Trigger refresh of doctors list in other components
            localStorage.setItem('doctorsUpdated', Date.now().toString());
            // Also dispatch a custom event for same-tab updates
            window.dispatchEvent(new CustomEvent('doctorsUpdated'));
            setMessage('Doctor information updated successfully in both Profile and Workhere sections!');
          } else {
            setMessage('Doctor information updated in Profile, but failed to sync with Workhere dropdown');
          }
        } catch (doctorUpdateError) {
          console.error('Error updating doctor collection:', doctorUpdateError);
          setMessage('Doctor information updated in Profile, but failed to sync with Workhere dropdown');
        }
        
        setShowDoctorModal(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update doctor information');
      }
    } catch (error) {
      setMessage('Error updating doctor information');
    }
  };

  // Delete doctor visit
  const handleDeleteDoctorVisit = async (visitIndex) => {
    if (window.confirm('Are you sure you want to delete this doctor visit? This action cannot be undone.')) {
      try {
        const response = await fetch('http://localhost:5000/api/billing/profile/visit', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ visitIndex })
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
          setMessage('Doctor visit deleted successfully!');
          setTimeout(() => setMessage(''), 3000);
          
          // Trigger refresh of doctors list in other components
          localStorage.setItem('doctorsUpdated', Date.now().toString());
        } else {
          const errorData = await response.json();
          setMessage(`Failed to delete visit: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting doctor visit:', error);
        setMessage('Error deleting doctor visit. Please try again.');
      }
    }
  };

  // Fetch reports data
  const fetchReports = async () => {
    if (!token) {
      setMessage('Please login to view reports');
      return;
    }

    setReportsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/billing/reports?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReportsData(data);
      } else {
        setMessage('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setMessage('Error fetching reports');
    } finally {
      setReportsLoading(false);
    }
  };

  // Download report
  const downloadReport = async (format = 'excel') => {
    if (!token) {
      setMessage('Please login to download reports');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/billing/reports/download?period=${selectedPeriod}&format=${format}`, {
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
        setMessage(`Report downloaded successfully as ${format.toUpperCase()}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to download report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      setMessage('Error downloading report');
    }
  };

  // Handle reports button click
  const handleReportsClick = () => {
    setShowReports(true);
    fetchReports();
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AnimatedBackground>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-blue-100">Manage your personal information and track doctor visits</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Profile Information */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <User className="w-6 h-6" />
              Personal Information
            </h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={updateProfile}
                  className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: profile.name || '',
                      email: profile.email || '',
                      phone: profile.phone || '',
                      address: profile.address || '',
                      designation: profile.designation || ''
                    });
                  }}
                  className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-blue-100 text-sm font-medium mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg">
                  <p className="text-white font-medium">{profile?.name || 'Not specified'}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-blue-100 text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg">
                  <p className="text-white font-medium">{profile?.email || 'Not specified'}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-blue-100 text-sm font-medium mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg">
                  <p className="text-white font-medium">{profile?.phone || 'Not specified'}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-blue-100 text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </label>
              {editing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your address"
                  rows="3"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg">
                  <p className="text-white font-medium whitespace-pre-wrap">{profile?.address || 'Not specified'}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-blue-100 text-sm font-medium mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Designation
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your designation (e.g., MR)"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg">
                  <p className="text-white font-medium">{profile?.designation || 'Not specified'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Doctor Visits */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <Stethoscope className="w-6 h-6" />
              Doctor Visits
            </h2>
            <div className="flex gap-2">
              {!editingVisits ? (
                <button
                  onClick={() => {
                    setEditingVisits(true);
                    setEditedVisits([...profile.doctorVisits]);
                  }}
                  className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Visits
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={updateVisits}
                    className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl"
                  >
                    <Save className="w-4 h-4" />
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setEditingVisits(false);
                      setEditedVisits([...profile.doctorVisits]);
                    }}
                    className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowVisitForm(!showVisitForm)}
                className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                Add Visit
              </button>
            </div>
          </div>

          {/* Add Visit Form */}
          {showVisitForm && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Add New Doctor Visit</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-blue-100 text-sm font-medium mb-2">Doctor Name</label>
                  <input
                    type="text"
                    value={newVisit.doctorName}
                    onChange={(e) => setNewVisit({...newVisit, doctorName: e.target.value})}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-blue-100 text-sm font-medium mb-2">Degree</label>
                  <input
                    type="text"
                    value={newVisit.doctorDegree}
                    onChange={(e) => setNewVisit({...newVisit, doctorDegree: e.target.value})}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MBBS, MD"
                  />
                </div>
                <div>
                  <label className="block text-blue-100 text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={newVisit.doctorLocation}
                    onChange={(e) => setNewVisit({...newVisit, doctorLocation: e.target.value})}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mumbai, Delhi, Bangalore"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addDoctorVisit}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-300"
                >
                  Record Visit
                </button>
                <button
                  onClick={() => {
                    setShowVisitForm(false);
                    setNewVisit({ doctorName: '', doctorDegree: '', doctorLocation: '' });
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Visits List */}
          <div className="space-y-4">
            {profile?.doctorVisits && profile.doctorVisits.length > 0 ? (
              (editingVisits ? editedVisits : profile.doctorVisits).map((visit, index) => (
                <div key={index} className="bg-white/5 rounded-lg border border-white/10 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left side - Doctor info and visit counter */}
                    <div className="flex items-center gap-4">
                      {editingVisits && (
                        <div className="flex flex-col items-center gap-2 min-w-[120px]">
                          <label className="text-blue-100 text-sm font-medium">Visit Count</label>
                          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2">
                            <button
                              onClick={() => decreaseVisit(index)}
                              className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xl font-bold"
                              disabled={visit.noOfVisits <= 0}
                              aria-label="Decrease visit count"
                            >
                              <span className="pointer-events-none select-none text-center text-lg font-bold">-</span>
                            </button>
                            <span className="text-white font-semibold min-w-[3rem] text-center text-lg">
                              {visit.noOfVisits}
                            </span>
                            <button
                              onClick={() => increaseVisit(index)}
                              className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 text-xl font-bold"
                              aria-label="Increase visit count"
                            >
                              <span className="pointer-events-none select-none text-center text-lg font-bold">+</span>
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="cursor-pointer flex-1" onClick={() => handleAnalyzeDoctor(visit)}>
                        <p className="text-white font-medium hover:text-blue-300 transition-colors duration-200">{visit.doctorName}</p>
                        <p className="text-blue-200 text-sm">{visit.doctorDegree}</p>
                        <p className="text-blue-100 text-xs">Click to view analysis</p>
                      </div>
                    </div>
                    
                    {/* Right side - Visit count badge and action buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {visit.noOfVisits} {visit.noOfVisits === 1 ? 'visit' : 'visits'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEditDoctor(visit, index)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors duration-300"
                          title="Edit doctor information"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleAnalyzeDoctor(visit)}
                          className={`flex items-center gap-1 px-3 py-1 text-white text-xs rounded-lg transition-colors duration-300 ${
                            analyzingDoctor === visit.doctorName 
                              ? 'bg-gray-500 cursor-not-allowed' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                          title="View detailed analysis"
                          disabled={analyzingDoctor === visit.doctorName}
                        >
                          {analyzingDoctor === visit.doctorName ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <TrendingUp className="w-3 h-3" />
                          )}
                          {analyzingDoctor === visit.doctorName ? 'Loading...' : 'Analysis'}
                        </button>
                        <button
                          onClick={() => handleDeleteDoctorVisit(index)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors duration-300"
                          title="Delete doctor visit"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Stethoscope className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <p className="text-blue-200">No doctor visits recorded yet</p>
                <p className="text-blue-100 text-sm">Click "Add Visit" to start tracking</p>
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Close the main grid */}
      </div>

      {/* Doctor Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                {modalType === 'edit' ? 'Edit Doctor' : 'Doctor Analysis'}
              </h3>
              <button
                onClick={() => setShowDoctorModal(false)}
                className="text-blue-300 hover:text-white transition-colors duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalType === 'edit' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-blue-100 text-sm font-medium mb-2">Doctor Name</label>
                  <input
                    type="text"
                    value={editDoctorData.doctorName}
                    onChange={(e) => setEditDoctorData({...editDoctorData, doctorName: e.target.value})}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-blue-100 text-sm font-medium mb-2">Degree</label>
                  <input
                    type="text"
                    value={editDoctorData.doctorDegree}
                    onChange={(e) => setEditDoctorData({...editDoctorData, doctorDegree: e.target.value})}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MBBS, MD"
                  />
                </div>
                <div>
                  <label className="block text-blue-100 text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={editDoctorData.doctorLocation}
                    onChange={(e) => setEditDoctorData({...editDoctorData, doctorLocation: e.target.value})}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mumbai, Delhi, Bangalore"
                  />
                </div>
                <div>
                  <label className="block text-blue-100 text-sm font-medium mb-2">Number of Visits</label>
                  <input
                    type="number"
                    value={editDoctorData.noOfVisits}
                    onChange={(e) => setEditDoctorData({...editDoctorData, noOfVisits: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={updateDoctorData}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-300"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setShowDoctorModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowDoctorModal(false);
                      handleDeleteDoctorVisit(selectedDoctor.index);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-2">{selectedDoctor?.doctorName}</h4>
                  <p className="text-blue-200 text-sm mb-3">{selectedDoctor?.doctorDegree}</p>
                  <p className="text-green-300 text-xs mb-3">✓ Analysis modal is working!</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-blue-200 text-xs">Total Visits</p>
                      <p className="text-white font-semibold text-lg">{selectedDoctor?.noOfVisits}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-200 text-xs">Visit Frequency</p>
                      <p className="text-white font-semibold text-lg">
                        {selectedDoctor?.noOfVisits > 0 ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Business Analysis if available */}
                  {selectedDoctor?.businessData ? (() => {
                    const doctorBusiness = selectedDoctor.businessData;
                    console.log('Rendering business data:', doctorBusiness); // Debug log
                    
                    // Handle different possible data structures
                    const businessSummary = doctorBusiness.businessSummary || doctorBusiness;
                    const totalOrders = businessSummary.totalOrders || 0;
                    const totalAmount = businessSummary.totalAmount || 0;
                    const totalNetAmount = businessSummary.totalNetAmount || 0;
                    const totalSampleUnits = businessSummary.totalSampleUnits || 0;
                    const averageOrderValue = businessSummary.averageOrderValue || 0;
                    const totalDiscount = businessSummary.totalDiscount || 0;
                    const recentOrders = businessSummary.recentOrders || [];
                    
                    return (
                      <div className="border-t border-white/20 pt-4">
                        <h5 className="text-white font-medium mb-3 text-sm">Business Summary</h5>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="text-center p-2 bg-white/5 rounded">
                            <p className="text-blue-200">Orders</p>
                            <p className="text-white font-semibold">{totalOrders}</p>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded">
                            <p className="text-blue-200">Revenue</p>
                            <p className="text-white font-semibold">₹{totalAmount.toLocaleString()}</p>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded">
                            <p className="text-blue-200">Net Amount</p>
                            <p className="text-white font-semibold">₹{totalNetAmount.toLocaleString()}</p>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded">
                            <p className="text-blue-200">Samples</p>
                            <p className="text-white font-semibold">{totalSampleUnits}</p>
                          </div>
                        </div>
                        
                        {averageOrderValue > 0 && (
                          <div className="mt-3 text-center p-2 bg-white/5 rounded">
                            <p className="text-blue-200 text-xs">Average Order Value</p>
                            <p className="text-white font-semibold">₹{averageOrderValue.toLocaleString()}</p>
                          </div>
                        )}
                        
                        {totalDiscount > 0 && (
                          <div className="mt-3 text-center p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                            <p className="text-yellow-300 text-xs">Total Discount Given</p>
                            <p className="text-white font-semibold">₹{totalDiscount.toLocaleString()}</p>
                          </div>
                        )}
                        
                        {recentOrders && recentOrders.length > 0 && (
                          <div className="mt-3">
                            <h6 className="text-white font-medium mb-2 text-xs">Recent Orders:</h6>
                            <div className="space-y-1 max-h-20 overflow-y-auto">
                              {recentOrders.slice(0, 3).map((order, orderIndex) => (
                                <div key={orderIndex} className="flex justify-between items-center p-1 bg-white/5 rounded text-xs">
                                  <div>
                                    <p className="text-white">{order.sampleUnits || 0} units</p>
                                    <p className="text-blue-200 text-xs">
                                      {order.timestamp ? new Date(order.timestamp).toLocaleDateString() : 'N/A'}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-white">₹{order.totalOrderAmount || 0}</p>
                                    <p className="text-green-300 text-xs">Net: ₹{order.netAmount || 0}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })() : (
                    <div className="border-t border-white/20 pt-4">
                      <div className="text-center p-3 bg-white/5 rounded">
                        <DollarSign className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                        <p className="text-blue-200 text-sm">No business data available</p>
                        <p className="text-blue-100 text-xs">Add billing entries for this doctor to see business summary</p>
                        <p className="text-blue-100 text-xs mt-2">Debug: Analysis button is working!</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => setShowDoctorModal(false)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Reports Section */}
      <div className="mt-12">
        <div className="glass-effect p-8 rounded-2xl text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4">
            📊
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Sales Reports & Analytics</h2>
          <p className="text-blue-200 text-lg mb-6 leading-relaxed">
            Get comprehensive insights into your sales performance, doctor relationships, and business metrics
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="text-white font-semibold mb-2">Sales Analytics</h3>
              <p className="text-blue-200 text-sm">Track revenue trends and performance metrics</p>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="text-3xl mb-2">👨‍⚕️</div>
              <h3 className="text-white font-semibold mb-2">Doctor Performance</h3>
              <p className="text-blue-200 text-sm">Monitor doctor relationships and sales patterns</p>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-white font-semibold mb-2">Export Reports</h3>
              <p className="text-blue-200 text-sm">Download data in Excel and PDF formats</p>
            </div>
          </div>
          
          <button
            onClick={handleReportsClick}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center justify-center gap-3">
              📊 View Reports & Analytics
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          </button>
          
          <p className="text-blue-300 text-sm mt-4">
            Access comprehensive billing data, generate reports, and analyze your business performance
          </p>
        </div>
      </div>

      {/* Reports Modal */}
      {showReports && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white">
                  📊
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Sales Reports & Analytics</h2>
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
                  <div className="w-5 h-5 text-gray-600">📅</div>
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
                  disabled={reportsLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {reportsLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <div className="w-4 h-4">🔄</div>
                  )}
                  {reportsLoading ? 'Loading...' : 'Refresh'}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => downloadReport('excel')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <div className="w-4 h-4">📥</div>
                    Excel
                  </button>
                  <button
                    onClick={() => downloadReport('pdf')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <div className="w-4 h-4">📥</div>
                    PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Reports Content */}
            <div className="p-6">
              {reportsLoading ? (
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
                        <div className="w-8 h-8 text-green-200">📊</div>
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
                      <div className="w-16 h-16 text-gray-400 mx-auto mb-4">📊</div>
                      <p className="text-gray-600 text-lg">No sales data available for the selected period</p>
                      <p className="text-gray-500 text-sm">Start recording sales to see your reports</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 text-gray-400 mx-auto mb-4">📊</div>
                  <p className="text-gray-600 text-lg">Click Refresh to load reports</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatedBackground>
  );
};

export default Profile;
