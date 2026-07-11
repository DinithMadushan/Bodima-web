import { useGetBookings, useGetMe } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { Home as HomeIcon, Clock, CheckCircle, XCircle, MapPin, Calendar } from 'lucide-react';
import { Link } from 'wouter';

export default function Dashboard() {
  const { user, isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'student') {
      setLocation('/');
    }
  }, [isLoggedIn, user, setLocation]);

  const { data: bookings, isLoading } = useGetBookings({ query: { enabled: !!user && user.role === 'student' }});

  if (!user || user.role !== 'student') return null;

  return (
    <div className="min-h-screen bg-[#f7f4ef] pb-12">
      <div className="bg-[#1a3c5e] pb-24 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#e8a045] rounded-full flex items-center justify-center text-white text-2xl font-serif font-bold shadow-lg">
              {user.first_name[0]}
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Hello, {user.first_name}!</h1>
              <p className="text-gray-300">Welcome to your dashboard</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-xl shadow-sm border border-[#e8e0d5] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-bold text-lg text-[#1a3c5e]">My Applications</h2>
            <Link href="/search" className="text-sm font-medium text-[#e8a045] hover:text-[#d99035]">Find more places</Link>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1,2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>)}
              </div>
            ) : !bookings || bookings.length === 0 ? (
              <div className="text-center py-12">
                <HomeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#2c3e50]">No applications yet</h3>
                <p className="text-gray-500 mb-6">You haven't requested to visit any properties.</p>
                <Link href="/search" className="btn-primary inline-block">Start Exploring</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 group hover:border-[#1a3c5e] transition-colors">
                    <img 
                      src={booking.listing_img || 'https://via.placeholder.com/150'} 
                      alt="" 
                      className="w-full md:w-32 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <Link href={`/listings/${booking.listing_id}`} className="font-bold text-lg text-[#1a3c5e] hover:underline">
                          {booking.listing_name}
                        </Link>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                          booking.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {booking.status === 'confirmed' ? <CheckCircle className="w-3 h-3"/> : 
                           booking.status === 'rejected' ? <XCircle className="w-3 h-3"/> : 
                           <Clock className="w-3 h-3"/>}
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                        <MapPin className="w-3.5 h-3.5"/> {booking.listing_area}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium bg-gray-50 p-2 rounded w-fit">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3.5 h-3.5"/> Move in: {new Date(booking.move_in_date!).toLocaleDateString()}
                        </span>
                        <span className="text-[#e8a045]">Rs. {booking.listing_price?.toLocaleString()}/mo</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
