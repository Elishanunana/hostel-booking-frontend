import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../utils/api';

interface Booking {
  id: number;
  student_info: {
    username: string;
    email: string;
  };
  room: {
    id: number;
    room_number: string;
    hostel_name: string;
    price_per_night: string;
    location: string;
  };
  check_in_date: string;
  check_out_date: string;
  total_amount: string;
  booking_status: string;
  booking_status_display: string;
  created_at: string;
}

const BookingRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingBookingId, setProcessingBookingId] = useState<number | null>(null);

  useEffect(() => {
    // Redirect if not a provider
    if (user && user.role !== 'provider') {
      navigate('/');
      return;
    }
    
    fetchBookingRequests();
  }, [user, navigate]);

  const fetchBookingRequests = async () => {
    try {
      const response = await api.get('/bookings/requests/');
      setBookings(response.data);
    } catch (error: any) {
      if (error.response?.status === 200 && error.response?.data?.detail) {
        // No pending requests - this is normal
        setBookings([]);
      } else {
        setError('Failed to load booking requests');
        console.error('Error fetching booking requests:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: number, newStatus: 'approved' | 'rejected') => {
    setProcessingBookingId(bookingId);
    
    try {
      await api.post(`/bookings/${bookingId}/status/`, {
        status: newStatus
      });
      
      // Update the booking in local state or remove it if it's no longer pending
      setBookings(prevBookings => 
        prevBookings.filter(booking => booking.id !== bookingId)
      );
      
      // Show success message (you could add a toast notification here)
      console.log(`Booking ${bookingId} ${newStatus} successfully`);
      
    } catch (error: any) {
      console.error(`Error ${newStatus === 'approved' ? 'approving' : 'rejecting'} booking:`, error);
      alert(`Failed to ${newStatus === 'approved' ? 'approve' : 'reject'} booking. Please try again.`);
    } finally {
      setProcessingBookingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return nights;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                <Calendar className="h-8 w-8 text-orange-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Booking Requests</span>
              </div>
            </div>
            <div className="text-sm text-gray-700">
              Welcome, {user?.username}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pending Booking Requests</h1>
          <p className="text-gray-600">Review and approve or reject student booking requests</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
            <p className="text-gray-600 mb-4">
              You don't have any pending booking requests at the moment.
            </p>
            <Link
              to="/provider/dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  {/* Booking Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="text-sm font-medium text-yellow-700">
                          Pending Approval
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {booking.room.hostel_name} - Room {booking.room.room_number}
                      </h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{booking.room.location}</span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                      <div className="text-2xl font-bold text-green-600">
                        GH₵ {booking.total_amount}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total Amount
                      </div>
                    </div>
                  </div>

                  {/* Student Information */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Student Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Name:</span>
                        <span className="ml-2 text-sm text-gray-900">{booking.student_info.username}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <span className="ml-2 text-sm text-gray-900">{booking.student_info.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-600">Check-in</div>
                        <div className="text-sm text-gray-900">{formatDate(booking.check_in_date)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-red-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-600">Check-out</div>
                        <div className="text-sm text-gray-900">{formatDate(booking.check_out_date)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-purple-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-600">Duration</div>
                        <div className="text-sm text-gray-900">
                          {calculateNights(booking.check_in_date, booking.check_out_date)} night(s)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Summary */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Rate per night:</span>
                        <span className="ml-2 font-semibold">GH₵ {booking.room.price_per_night}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Number of nights:</span>
                        <span className="ml-2 font-semibold">
                          {calculateNights(booking.check_in_date, booking.check_out_date)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total amount:</span>
                        <span className="ml-2 font-semibold text-green-600">GH₵ {booking.total_amount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'approved')}
                      disabled={processingBookingId === booking.id}
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {processingBookingId === booking.id ? 'Processing...' : 'Approve Booking'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                      disabled={processingBookingId === booking.id}
                      className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {processingBookingId === booking.id ? 'Processing...' : 'Reject Booking'}
                    </button>
                  </div>

                  {/* Request Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Request submitted: {formatDate(booking.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Information Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Approve:</strong> Student can proceed to payment after approval</li>
            <li>• <strong>Reject:</strong> Booking will be cancelled and student will be notified</li>
            <li>• <strong>Payment:</strong> Only confirmed bookings (after payment) count toward room occupancy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingRequestsPage;
