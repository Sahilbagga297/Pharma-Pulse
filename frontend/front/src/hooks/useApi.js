import { useState, useCallback } from 'react';

export const useBillingApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getBillingEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/billing/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data, message: data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const saveBillingEntry = useCallback(async (billingData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/billing/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(billingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, message: data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadExcel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/billing/download', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        // Try to get error message from response
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // Check if response is actually a blob
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('spreadsheet')) {
        throw new Error('Invalid response format. Expected Excel file.');
      }

      const blob = await response.blob();
      
      // Check if blob is empty
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty. Please try again.');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `billing-entries-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      return { success: true, message: 'Excel file downloaded successfully' };
    } catch (err) {
      console.error('Excel download error:', err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const createSampleData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/billing/create-sample', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, message: data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getBillingEntries,
    saveBillingEntry,
    downloadExcel,
    createSampleData,
    loading,
    error,
    clearError
  };
};
