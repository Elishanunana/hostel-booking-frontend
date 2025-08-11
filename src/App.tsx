import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StudentRegisterPage from './pages/StudentRegisterPage';
import ProviderRegisterPage from './pages/ProviderRegisterPage';
import StudentHomePage from './pages/StudentHomePage';
import StudentDashboard from './pages/StudentDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import BrowseRoomsPage from './pages/BrowseRoomsPage';
import CreateRoomPage from './pages/CreateRoomPage';
import BookRoomPage from './pages/BookRoomPage';
import BookingRequestsPage from './pages/BookingRequestsPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register/student" element={<StudentRegisterPage />} />
            <Route path="/register/provider" element={<ProviderRegisterPage />} />
            <Route path="/student/home" element={<StudentHomePage />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
            <Route path="/rooms" element={<BrowseRoomsPage />} />
            <Route path="/rooms/create" element={<CreateRoomPage />} />
            <Route path="/room/:roomId/book" element={<BookRoomPage />} />
            <Route path="/booking-requests" element={<BookingRequestsPage />} />
            <Route path="/payment/:bookingId" element={<PaymentPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
