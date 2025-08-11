import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Building, Upload, AlertCircle } from 'lucide-react';
import api from '../utils/api';

interface Facility {
  id: number;
  name: string;
}

const CreateRoomPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    room_number: '',
    hostel_name: '',
    price_per_night: '',
    max_occupancy: '',
    description: '',
    location: '',
    facilities: [] as number[],
    image_upload: null as File | null
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Redirect if not a provider
    if (user && user.role !== 'provider') {
      navigate('/');
      return;
    }
    fetchFacilities();
  }, [user, navigate]);

  const fetchFacilities = async () => {
    try {
      const response = await api.get('/facilities/');
      setFacilities(response.data);
    } catch (error: any) {
      console.error('Error fetching facilities:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image_upload: 'File size should be less than 5MB'
        }));
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image_upload: 'Please select an image file'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        image_upload: file
      }));
      
      // Clear error
      setErrors(prev => ({
        ...prev,
        image_upload: ''
      }));
    }
  };

  const handleFacilityChange = (facilityId: number) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facilityId)
        ? prev.facilities.filter(id => id !== facilityId)
        : [...prev.facilities, facilityId]
    }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.room_number.trim()) {
      newErrors.room_number = 'Room number is required';
    }

    if (!formData.hostel_name.trim()) {
      newErrors.hostel_name = 'Hostel name is required';
    }

    if (!formData.price_per_night || parseFloat(formData.price_per_night) <= 0) {
      newErrors.price_per_night = 'Valid price is required';
    }

    if (!formData.max_occupancy || parseInt(formData.max_occupancy) <= 0) {
      newErrors.max_occupancy = 'Valid occupancy number is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all text fields
      submitData.append('room_number', formData.room_number);
      submitData.append('hostel_name', formData.hostel_name);
      submitData.append('price_per_night', formData.price_per_night);
      submitData.append('max_occupancy', formData.max_occupancy);
      submitData.append('description', formData.description);
      submitData.append('location', formData.location);
      
      // Add facilities as array
      formData.facilities.forEach(facilityId => {
        submitData.append('facilities', facilityId.toString());
      });
      
      // Add image if selected
      if (formData.image_upload) {
        submitData.append('image_upload', formData.image_upload);
      }

      const response = await api.post('/rooms/create/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Room created successfully:', response.data);
      setSuccess(true);
      
      // Redirect to provider dashboard after 2 seconds
      setTimeout(() => {
        navigate('/provider/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating room:', error);
      if (error.response?.data) {
        if (error.response.data.details) {
          setErrors(error.response.data.details);
        } else {
          setError(error.response.data.error || 'Failed to create room');
        }
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-green-600 mb-4">
            <Building className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Created Successfully!</h2>
          <p className="text-gray-600 mb-4">Your room listing has been added to the platform.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                to="/provider/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Create New Room</span>
              </div>
            </div>
            <div className="text-sm text-gray-700">
              Welcome, {user?.username}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Number *
                </label>
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.room_number ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., A101, Room 12"
                />
                {errors.room_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.room_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostel Name *
                </label>
                <input
                  type="text"
                  name="hostel_name"
                  value={formData.hostel_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.hostel_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Golden Gate Hostel"
                />
                {errors.hostel_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.hostel_name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Night (GH₵) *
                </label>
                <input
                  type="number"
                  name="price_per_night"
                  value={formData.price_per_night}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.price_per_night ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="150.00"
                />
                {errors.price_per_night && (
                  <p className="mt-1 text-sm text-red-600">{errors.price_per_night}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Occupancy *
                </label>
                <input
                  type="number"
                  name="max_occupancy"
                  value={formData.max_occupancy}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.max_occupancy ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="2"
                />
                {errors.max_occupancy && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_occupancy}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., KNUST Campus, Ayeduase"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your room, amenities, and what makes it special..."
              />
            </div>

            {/* Facilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facilities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {facilities.map((facility) => (
                  <label key={facility.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.facilities.includes(facility.id)}
                      onChange={() => handleFacilityChange(facility.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{facility.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-sm text-gray-600">
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">Upload an image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="mt-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                {formData.image_upload && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {formData.image_upload.name}
                  </p>
                )}
                {errors.image_upload && (
                  <p className="text-sm text-red-600 mt-2">{errors.image_upload}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                to="/provider/dashboard"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPage;
