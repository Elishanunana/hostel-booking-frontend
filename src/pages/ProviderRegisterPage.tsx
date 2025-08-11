import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Building, User, Mail, Lock, Phone, MapPin, CreditCard, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import axios from 'axios';

interface ProviderRegistrationForm {
  username: string;
  password: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone_number: string;
  address: string;
  bank_details: string;
}

interface RegistrationResponse {
  message: string;
  user: {
    username: string;
    role: string;
    business_name: string;
    contact_person: string;
    email: string;
    phone_number: string;
    address: string;
    bank_details: string;
  };
  refresh: string;
  access: string;
}

const ProviderRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<ProviderRegistrationForm>({
    username: '',
    password: '',
    business_name: '',
    contact_person: '',
    email: '',
    phone_number: '',
    address: '',
    bank_details: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // Create a clean request without any auth headers
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/register/provider/`, 
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Provider registration response:', response.data);
      
      const { user, access, refresh } = response.data;
      
      // Transform the provider user data to match our User interface
      const userData = {
        id: 0, // Will be updated when we get proper user data
        username: user.username,
        email: user.email,
        role: 'provider' as const
      };
      
      // Use the auth context to log in
      login(userData, access, refresh);
      
      // Redirect to provider dashboard
      navigate('/provider/dashboard');
    } catch (err: any) {
      console.error('Full registration error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      }
      if (err.response?.data?.details) {
        setFieldErrors(err.response.data.details);
      }
      if (!err.response?.data?.error && !err.response?.data?.details) {
        setError(`Registration failed: ${err.response?.status} ${err.response?.statusText || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldName: string): string | null => {
    return fieldErrors[fieldName]?.[0] || null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center">
          <Home className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">HostelBook</h1>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register as a Hostel Provider
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <div className="mt-1 relative">
                <input
                  id="business_name"
                  name="business_name"
                  type="text"
                  required
                  value={formData.business_name}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    getFieldError('business_name') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Golden Gate Hostel"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {getFieldError('business_name') && (
                <p className="mt-2 text-sm text-red-600">{getFieldError('business_name')}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700">
                Contact Person
              </label>
              <div className="mt-1 relative">
                <input
                  id="contact_person"
                  name="contact_person"
                  type="text"
                  required
                  value={formData.contact_person}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    getFieldError('contact_person') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Full name of contact person"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {getFieldError('contact_person') && (
                <p className="mt-2 text-sm text-red-600">{getFieldError('contact_person')}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    getFieldError('username') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Choose a username"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {getFieldError('username') && (
                <p className="mt-2 text-sm text-red-600">{getFieldError('username')}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    getFieldError('email') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Business email address"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {getFieldError('email') && (
                <p className="mt-2 text-sm text-red-600">{getFieldError('email')}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    getFieldError('password') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {getFieldError('password') && (
                <p className="mt-2 text-sm text-red-600">{getFieldError('password')}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    getFieldError('phone_number') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0244123456"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {getFieldError('phone_number') && (
                <p className="mt-2 text-sm text-red-600">{getFieldError('phone_number')}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Business Address
              </label>
              <div className="mt-1 relative">
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    getFieldError('address') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Full business address"
                />
                <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {getFieldError('address') && (
                <p className="mt-2 text-sm text-red-600">{getFieldError('address')}</p>
              )}
            </div>

            <div>
              <label htmlFor="bank_details" className="block text-sm font-medium text-gray-700">
                Bank Details
              </label>
              <div className="mt-1 relative">
                <textarea
                  id="bank_details"
                  name="bank_details"
                  rows={2}
                  required
                  value={formData.bank_details}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    getFieldError('bank_details') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Bank name and account number"
                />
                <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {getFieldError('bank_details') && (
                <p className="mt-2 text-sm text-red-600">{getFieldError('bank_details')}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Create provider account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Looking for accommodation?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register/student"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Register as a Student instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegisterPage;