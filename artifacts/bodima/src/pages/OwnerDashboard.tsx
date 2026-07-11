import { useGetOwnerSummary, useGetOwnerListings, useGetOwnerBookings, useUpdateBookingStatus, BookingStatusUpdateStatus, useCreateListing, useUpdateListing, useDeleteListing } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { Plus, Home as HomeIcon, CheckCircle, Clock, XCircle, MapPin, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OwnerDashboard() {
  const { user, isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'listings'|'bookings'>('listings');

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'owner') {
      setLocation('/');
    }
  }, [isLoggedIn, user, setLocation]);

  const { data: summary, isLoading: isSummaryLoading } = useGetOwnerSummary({ query: { enabled: !!user && user.role === 'owner' }});
  const { data: listings, refetch: refetchListings } = useGetOwnerListings({ query: { enabled: !!user && user.role === 'owner' }});
  const { data: bookings, refetch: refetchBookings } = useGetOwnerBookings({ query: { enabled: !!user && user.role === 'owner' }});

  const updateBooking = useUpdateBookingStatus();
  const deleteListing = useDeleteListing();

  const handleUpdateBooking = (id: number, status: BookingStatusUpdateStatus) => {
    updateBooking.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: `Booking ${status}` });
        refetchBookings();
      }
    });
  };

  const handleDeleteListing = (id: number) => {
    if(confirm('Are you sure you want to delete this listing?')) {
      deleteListing.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Listing deleted" });
          refetchListings();
        }
      });
    }
  };

  if (!user || user.role !== 'owner') return null;

  return (
    <div className="min-h-screen bg-[#f7f4ef] pb-12">
      <div className="bg-[#1a3c5e] pb-24 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-serif font-bold text-white">Owner Dashboard</h1>
            <button className="btn-accent flex items-center gap-2 shadow-lg shadow-orange-900/20">
              <Plus className="w-4 h-4" /> Add New Listing
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e8e0d5]">
            <div className="text-gray-500 text-sm font-medium mb-1">Total Listings</div>
            <div className="text-3xl font-bold text-[#1a3c5e]">{summary?.total_listings || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e8e0d5]">
            <div className="text-gray-500 text-sm font-medium mb-1">Pending Bookings</div>
            <div className="text-3xl font-bold text-[#e8a045]">{summary?.pending_bookings || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e8e0d5]">
            <div className="text-gray-500 text-sm font-medium mb-1">Confirmed Bookings</div>
            <div className="text-3xl font-bold text-green-600">{summary?.confirmed_bookings || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e8e0d5]">
            <div className="text-gray-500 text-sm font-medium mb-1">Avg Rating</div>
            <div className="text-3xl font-bold text-[#1a3c5e]">{summary?.average_rating?.toFixed(1) || '0.0'}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e8e0d5] overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button 
              className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'listings' ? 'border-[#1a3c5e] text-[#1a3c5e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('listings')}
            >
              My Listings
            </button>
            <button 
              className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'bookings' ? 'border-[#1a3c5e] text-[#1a3c5e]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('bookings')}
            >
              Bookings & Requests
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'listings' && (
              <div>
                {!listings || listings.length === 0 ? (
                  <div className="text-center py-12">
                    <HomeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#2c3e50]">No listings yet</h3>
                    <p className="text-gray-500 mb-4">You haven't added any properties to Bodima.</p>
                    <button className="btn-primary">Create your first listing</button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="pb-3 text-sm font-medium text-gray-500">Property</th>
                          <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                          <th className="pb-3 text-sm font-medium text-gray-500">Price</th>
                          <th className="pb-3 text-sm font-medium text-gray-500">Rating</th>
                          <th className="pb-3 text-sm font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {listings.map((listing) => (
                          <tr key={listing.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <img src={listing.img || 'https://via.placeholder.com/150'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                <div>
                                  <div className="font-bold text-[#1a3c5e]">{listing.name}</div>
                                  <div className="text-xs text-gray-500 flex items-center"><MapPin className="w-3 h-3 mr-1"/>{listing.area}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                listing.status === 'approved' ? 'bg-green-100 text-green-700' :
                                listing.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {listing.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 font-medium">Rs. {listing.price.toLocaleString()}</td>
                            <td className="py-4 text-sm">{listing.rating} ({listing.review_count})</td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 text-gray-500 hover:text-[#1a3c5e] bg-gray-100 rounded"><Edit2 className="w-4 h-4"/></button>
                                <button onClick={() => handleDeleteListing(listing.id)} className="p-1.5 text-gray-500 hover:text-red-500 bg-gray-100 rounded"><Trash2 className="w-4 h-4"/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                {!bookings || bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#2c3e50]">No booking requests</h3>
                    <p className="text-gray-500">You don't have any requests from students yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center bg-gray-50/50">
                        <div className="flex gap-4 items-start">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                            {(booking.student_name || 'S')[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-[#1a3c5e]">{booking.student_name}</h4>
                            <p className="text-sm text-gray-600 mb-1">Requested to visit <span className="font-medium">{booking.listing_name}</span></p>
                            <div className="text-xs text-gray-500 flex items-center gap-3">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Move in: {new Date(booking.move_in_date!).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1">Requested on: {new Date(booking.created_at).toLocaleDateString()}</span>
                            </div>
                            {booking.message && (
                              <div className="mt-2 text-sm bg-white p-2 rounded border border-gray-100 italic text-gray-600">"{booking.message}"</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="w-full md:w-auto flex items-center justify-end gap-2 border-t md:border-0 pt-4 md:pt-0">
                          {booking.status === 'pending' ? (
                            <>
                              <button onClick={() => handleUpdateBooking(booking.id, BookingStatusUpdateStatus.rejected)} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">Reject</button>
                              <button onClick={() => handleUpdateBooking(booking.id, BookingStatusUpdateStatus.confirmed)} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">Confirm</button>
                            </>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {booking.status === 'confirmed' ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                              {booking.status.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
