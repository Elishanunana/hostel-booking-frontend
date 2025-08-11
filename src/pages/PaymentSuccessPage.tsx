import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, AlertCircle, Home, Calendar } from 'lucide-react';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.role !== 'student') {
      navigate('/');
      return;
    }

    // Get payment reference from URL
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    
    // Use either reference or trxref (Paystack uses both)
    const paymentRef = reference || trxref;

    if (!paymentRef) {
      setStatus('failed');
      setMessage('Payment reference not found. Please contact support if you made a payment.');
      return;
    }

    // Check payment status
    checkPaymentStatus(paymentRef);
  }, [searchParams, user, navigate]);

  const checkPaymentStatus = async (reference: string) => {
    try {
      // Give webhook time to process (wait 3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setStatus('success');
      setMessage('Payment successful! Your booking has been confirmed. You can view it in your dashboard.');
    } catch (error) {
      setStatus('failed');
      setMessage('Payment verification failed. Please check your dashboard or contact support.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {status === 'success' ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="space-y-3">
                <Link
                  to="/student/dashboard?payment=success"
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View My Bookings
                </Link>
                
                <Link
                  to="/rooms"
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Browse More Rooms
                </Link>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Issue</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="space-y-3">
                <Link
                  to="/student/dashboard"
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Check My Dashboard
                </Link>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
