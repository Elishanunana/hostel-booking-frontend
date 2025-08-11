import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../utils/api';

interface BookingDetails {
  id: number;
  room: {
    id: number;
    room_number: string;
    hostel_name: string;
    price_per_night: string;
  };
  check_in_date: string;
  check_out_date: string;
  total_amount: string;
  booking_status: string;
  student_info: {
    username: string;
    email: string;
  };
}

const PaymentPage: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'student') {
      navigate('/');
      return;
    }

    fetchBookingDetails();
  }, [bookingId, user, navigate]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/bookings/my/');
      const booking = response.data.find((b: BookingDetails) => b.id === parseInt(bookingId!));
      
      if (!booking) {
        setError('Booking not found');
        return;
      }

      if (booking.booking_status !== 'approved') {
        setError(`This booking is ${booking.booking_status}. Only approved bookings can be paid for.`);
        return;
      }

      setBooking(booking);
    } catch (error) {
      setError('Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    setIsProcessing(true);
    setError('');

    try {
      const response = await api.post('/payments/initiate/', {
        booking_id: booking.id,
        email: user?.email,
        amount: parseFloat(booking.total_amount),
        callback_url: `${window.location.origin}/payment-success`
      });

      // Redirect to Paystack payment page
      window.location.href = response.data.authorization_url;
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to initialize payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateNights = () => {
    if (!booking) return 0;
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Link 
            to="/student/dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertCircle className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Payment Error</h1>
            </div>
            <p className="text-gray-700 mb-4">{error}</p>
            <Link 
              to="/student/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Booking not found</p>
        </div>
      </div>
    );
  }

  const nights = calculateNights();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            to="/student/dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
        </div>

        {/* Booking Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Booking Approved</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">{booking.room.hostel_name}</h3>
              <p className="text-gray-600">Room {booking.room.room_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">GH₵{parseFloat(booking.total_amount).toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Check-in</p>
                <p className="font-medium">{new Date(booking.check_in_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Check-out</p>
                <p className="font-medium">{new Date(booking.check_out_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Duration</p>
                <p className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Rate per night</span>
              <span>GH₵{parseFloat(booking.room.price_per_night).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Number of nights</span>
              <span>{nights}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-blue-600">GH₵{parseFloat(booking.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CreditCard className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            You will be redirected to Paystack to complete your payment securely using:
          </p>
          
          <ul className="text-sm text-gray-600 mb-6 space-y-1">
            <li>• Credit/Debit Cards (Visa, Mastercard)</li>
            <li>• Mobile Money (MTN, Vodafone, AirtelTigo)</li>
            <li>• Bank Transfer</li>
          </ul>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Pay GH₵${parseFloat(booking.total_amount).toFixed(2)} with Paystack`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
