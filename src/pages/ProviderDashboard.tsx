import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Calendar, DollarSign, Users, Building, LogOut, User } from 'lucide-react';
import api from '../utils/api';

interface DashboardSummary {
  total_rooms: number;
  total_revenue: number;
  bookings: {
    pending: number;
    confirmed: number;
    cancelled: number;
  };
}

interface Room {
  id: number;
  room_number: string;
  hostel_name: string;
  price_per_night: string;
  is_available: boolean;
  location: string;
}

const ProviderDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryResponse, roomsResponse] = await Promise.all([
        api.get('/dashboard/provider/summary/'),
        api.get('/rooms/mine/')
      ]);
      
      setSummary(summaryResponse.data);
      setRooms(roomsResponse.data);
    } catch (error: any) {
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const toggleRoomAvailability = async (roomId: number) => {
    try {
      await api.post(`/rooms/${roomId}/toggle-availability/`);
      // Update the room in the local state
      setRooms(rooms.map(room => 
        room.id === roomId 
          ? { ...room, is_available: !room.is_available }
          : room
      ));
    } catch (error: any) {
      console.error('Error toggling room availability:', error);
      alert('Failed to update room availability');
    }
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
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Provider Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">Welcome, {user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : null}

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-600">Manage your rooms, bookings, and revenue</p>
        </div>

        {/* Stats Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total_rooms}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">GH₵ {summary.total_revenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.bookings.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Confirmed Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.bookings.confirmed}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/rooms/create"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Plus className="h-8 w-8 mr-4" />
              <div>
                <h3 className="font-semibold">Add New Room</h3>
                <p className="text-sm opacity-90">Create a new room listing</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/booking-requests"
            className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Calendar className="h-8 w-8 mr-4" />
              <div>
                <h3 className="font-semibold">Booking Requests</h3>
                <p className="text-sm opacity-90">Review pending requests</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/revenue"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 mr-4" />
              <div>
                <h3 className="font-semibold">Revenue Report</h3>
                <p className="text-sm opacity-90">View detailed earnings</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Rooms List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">My Rooms</h2>
            <Link
              to="/rooms/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Link>
          </div>
          
          {rooms.length === 0 ? (
            <div className="p-8 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No rooms created yet</p>
              <Link
                to="/rooms/create"
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Room
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {rooms.map((room) => (
                <div key={room.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {room.hostel_name} - Room {room.room_number}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{room.location}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-lg font-bold text-green-600">
                          GH₵ {room.price_per_night}/night
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          room.is_available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {room.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <button
                        onClick={() => toggleRoomAvailability(room.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          room.is_available
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {room.is_available ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
