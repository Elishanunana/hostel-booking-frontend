import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../utils/api';

interface Room {
  id: number;
  room_number: string;
  hostel_name: string;
  price_per_night: string;
  max_occupancy: number;
  description: string;
  location: string;
  image: string | null;
  facilities: Array<{
    id: number;
    name: string;
  }>;
  provider: {
    business_name: string;
    contact_person: string;
  };
}

const BookRoomPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);

  const [bookingData, setBookingData] = useState({
    check_in_date: '',
    check_out_date: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalDays, setTotalDays] = useState<number>(0);

  useEffect(() => {
    // Redirect if not a student
    if (user && user.role !== 'student') {
      navigate('/rooms');
      return;
    }

    if (roomId) {
      fetchRoom();
    }
  }, [user, navigate, roomId]);

  useEffect(() => {
    calculateTotal();
  }, [bookingData.check_in_date, bookingData.check_out_date, room]);

  const fetchRoom = async () => {
    try {
      const response = await api.get(`/rooms/${roomId}/`);
      setRoom(response.data);
    } catch (error: any) {
      setError('Failed to load room details');
      console.error('Error fetching room:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!room || !bookingData.check_in_date || !bookingData.check_out_date) {
      setTotalAmount(0);
      setTotalDays(0);
      return;
    }

    const checkIn = new Date(bookingData.check_in_date);
    const checkOut = new Date(bookingData.check_out_date);
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      setTotalDays(days);
      setTotalAmount(days * parseFloat(room.price_per_night));
    } else {
      setTotalDays(0);
      setTotalAmount(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    const today = new Date().toISOString().split('T')[0];

    if (!bookingData.check_in_date) {
      newErrors.check_in_date = 'Check-in date is required';
    } else if (bookingData.check_in_date < today) {
      newErrors.check_in_date = 'Check-in date cannot be in the past';
    }

    if (!bookingData.check_out_date) {
      newErrors.check_out_date = 'Check-out date is required';
    } else if (bookingData.check_out_date <= bookingData.check_in_date) {
      newErrors.check_out_date = 'Check-out date must be after check-in date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setBookingLoading(true);
    setError(null);

    try {
      const response = await api.post('/bookings/', {
        room_id: parseInt(roomId!),
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date
      });

      console.log('Booking created successfully:', response.data);
      setBookingId(response.data.id);
      setSuccess(true);

    } catch (error: any) {
      console.error('Error creating booking:', error);
      if (error.response?.data) {
        if (error.response.data.room_id) {
          setError(error.response.data.room_id[0]);
        } else if (error.response.data.non_field_errors) {
          setError(error.response.data.non_field_errors[0]);
        } else if (error.response.data.details) {
          setErrors(error.response.data.details);
        } else {
          setError(error.response.data.error || 'Failed to create booking');
        }
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md mx-auto">
          <div className="text-green-600 mb-4">
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your booking request has been submitted successfully. The provider will review and approve your request.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">Booking ID: <span className="font-semibold">#{bookingId}</span></p>
            <p className="text-sm text-gray-600">Status: <span className="text-yellow-600 font-semibold">Pending Approval</span></p>
          </div>
          <div className="space-y-2">
            <Link
              to="/student/dashboard"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View My Bookings
            </Link>
            <Link
              to="/rooms"
              className="block w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Browse More Rooms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Room not found</p>
          <Link to="/rooms" className="text-blue-600 hover:underline">
            Back to Rooms
          </Link>
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
                to="/rooms"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Rooms
              </Link>
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Book Room</span>
              </div>
            </div>
            <div className="text-sm text-gray-700">
              Welcome, {user?.username}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Room Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Details</h2>
            
            {/* Room Image */}
            <div className="h-64 bg-gray-200 rounded-lg mb-4 overflow-hidden">
              {room.image ? (
                <img
                  src={room.image}
                  alt={`${room.hostel_name} - ${room.room_number}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Calendar className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {room.hostel_name} - Room {room.room_number}
            </h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{room.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2" />
                <span>Max {room.max_occupancy} occupants</span>
              </div>
              <div className="flex items-center text-green-600">
                <DollarSign className="h-5 w-5 mr-2" />
                <span className="text-xl font-bold">GH₵ {room.price_per_night}/night</span>
              </div>
            </div>

            {room.description && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{room.description}</p>
              </div>
            )}

            {room.facilities && room.facilities.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Facilities</h4>
                <div className="flex flex-wrap gap-2">
                  {room.facilities.map((facility) => (
                    <span
                      key={facility.id}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {facility.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Book This Room</h2>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  name="check_in_date"
                  value={bookingData.check_in_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.check_in_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.check_in_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.check_in_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  name="check_out_date"
                  value={bookingData.check_out_date}
                  onChange={handleInputChange}
                  min={bookingData.check_in_date || new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.check_out_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.check_out_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.check_out_date}</p>
                )}
              </div>

              {/* Booking Summary */}
              {totalDays > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Booking Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{totalDays} night{totalDays !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate per night:</span>
                      <span>GH₵ {room.price_per_night}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span>GH₵ {totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your booking request will be sent to the provider for approval. 
                  You'll receive a notification once it's reviewed.
                </p>
              </div>

              <button
                type="submit"
                disabled={bookingLoading || totalDays <= 0}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Creating Booking...' : 'Book Now'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRoomPage;
