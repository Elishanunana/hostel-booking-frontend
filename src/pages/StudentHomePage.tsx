import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Room {
  id: number;
  room_number: string;
  hostel_name: string;
  price_per_night: string;
  max_occupancy: number;
  description: string;
  location: string;
  image: string | null;
  is_available: boolean;
  facilities: Array<{id: number; name: string}>;
}

const StudentHomePage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Redirect non-students
    if (user && user.role !== 'student') {
      navigate('/provider/dashboard');
      return;
    }

    fetchFeaturedRooms();
  }, [user, navigate]);

  const fetchFeaturedRooms = async () => {
    try {
      const response = await fetch('https://test-backend-deploy-svk3.onrender.com/api/rooms/?is_available=true');
      if (response.ok) {
        const data = await response.json();
        // Show first 8 available rooms
        setRooms(data.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/rooms?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/rooms');
    }
  };

  const handleBookRoom = (roomId: number) => {
    navigate(`/room/${roomId}/book`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your personalized homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">HostelBook</h1>
              <span className="text-gray-600">|</span>
              <span className="text-gray-800">Welcome back, {user?.username}! 👋</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                My Dashboard
              </button>
              <button
                onClick={() => navigate('/rooms')}
                className="text-blue-600 hover:text-blue-800 px-3 py-2"
              >
                Browse All Rooms
              </button>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-800 px-3 py-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Find Your Perfect Hostel Room</h2>
          <p className="text-xl mb-8 text-blue-100">Discover comfortable, affordable accommodation near your campus</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by location, hostel name, or facilities..."
              className="flex-1 px-6 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={handleSearch}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section
        className="features-section relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        style={{
          backgroundImage: "url('/images/test3.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 rounded-2xl"></div>
        <div className="features-content relative z-10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-white drop-shadow">Featured Available Rooms</h3>
            <button
              onClick={() => navigate('/rooms')}
              className="text-blue-100 hover:text-white font-semibold bg-blue-700 bg-opacity-60 px-4 py-2 rounded-lg transition"
            >
              View All Rooms →
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-200 text-6xl mb-4">🏠</div>
              <h4 className="text-xl font-semibold text-white mb-2">No Rooms Available</h4>
              <p className="text-blue-100">Check back later for new listings!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rooms.map((room) => (
                <div key={room.id} className="bg-white bg-opacity-90 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 relative">
                    {room.image ? (
                      <img
                        src={room.image}
                        alt={`${room.hostel_name} - ${room.room_number}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-4xl">🏠</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Available
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-bold text-lg text-gray-900 mb-1">{room.hostel_name}</h4>
                    <p className="text-gray-600 text-sm mb-2">Room {room.room_number} • {room.location}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-blue-600">₵{room.price_per_night}</span>
                      <span className="text-gray-500 text-sm">per night</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <span>👥 Up to {room.max_occupancy} guests</span>
                    </div>
                    
                    {room.facilities && room.facilities.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {room.facilities.slice(0, 3).map((facility) => (
                            <span key={facility.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {facility.name}
                            </span>
                          ))}
                          {room.facilities.length > 3 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{room.facilities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleBookRoom(room.id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Quick Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/student/dashboard')}>
              <div className="text-blue-600 text-5xl mb-4">📋</div>
              <h4 className="text-xl font-semibold mb-2">My Bookings</h4>
              <p className="text-gray-600">View and manage your current bookings</p>
            </div>
            
            <div className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/rooms')}>
              <div className="text-blue-600 text-5xl mb-4">🔍</div>
              <h4 className="text-xl font-semibold mb-2">Browse Rooms</h4>
              <p className="text-gray-600">Explore all available accommodations</p>
            </div>
            
            <div className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/student/dashboard')}>
              <div className="text-blue-600 text-5xl mb-4">💳</div>
              <h4 className="text-xl font-semibold mb-2">Payment History</h4>
              <p className="text-gray-600">Check your payment status and history</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 HostelBook. Making student accommodation simple and accessible.</p>
        </div>
      </footer>
    </div>
  );
};

export default StudentHomePage;