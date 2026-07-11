import { useGetAdminSummary, useAdminGetListings, useAdminUpdateListingStatus, AdminListingStatusUpdateStatus } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { Users, Home as HomeIcon, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { user, isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'pending'|'all'>('pending');

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'admin') {
      setLocation('/');
    }
  }, [isLoggedIn, user, setLocation]);

  const { data: summary } = useGetAdminSummary({ query: { enabled: !!user && user.role === 'admin' }});
  
  const { data: listings, refetch } = useAdminGetListings(
    { status: activeTab === 'pending' ? 'pending' : undefined },
    { query: { enabled: !!user && user.role === 'admin' } }
  );

  const updateStatus = useAdminUpdateListingStatus();

  const handleUpdate = (id: number, status: AdminListingStatusUpdateStatus) => {
    updateStatus.mutate({ id, data: { status, notes: '' } }, {
      onSuccess: () => {
        toast({ title: `Listing ${status}` });
        refetch();
      }
    });
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#f7f4ef] pb-12">
      <div className="bg-[#0f1f30] pb-24 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Platform Administration</h1>
          <p className="text-gray-400">Manage listings and users</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 text-gray-500 mb-2">
              <Users className="w-5 h-5"/> <span className="font-medium">Total Users</span>
            </div>
            <div className="text-3xl font-bold text-[#1a3c5e]">{summary?.total_users || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 text-gray-500 mb-2">
              <HomeIcon className="w-5 h-5"/> <span className="font-medium">Total Listings</span>
            </div>
            <div className="text-3xl font-bold text-[#1a3c5e]">{summary?.total_listings || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 text-gray-500 mb-2">
              <Clock className="w-5 h-5 text-orange-500"/> <span className="font-medium">Pending Approval</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">{summary?.pending_listings || 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 text-gray-500 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500"/> <span className="font-medium">Approved Listings</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{summary?.approved_listings || 0}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-100 bg-gray-50">
            <button 
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'pending' ? 'border-[#1a3c5e] text-[#1a3c5e] bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Approvals
            </button>
            <button 
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'all' ? 'border-[#1a3c5e] text-[#1a3c5e] bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('all')}
            >
              All Listings
            </button>
          </div>

          <div className="p-0">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings?.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={listing.img || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded-md object-cover"/>
                        <div>
                          <div className="font-bold text-[#2c3e50]">{listing.name}</div>
                          <div className="text-xs text-gray-500">{listing.area}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{listing.owner_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        listing.status === 'approved' ? 'bg-green-100 text-green-700' :
                        listing.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {listing.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {listing.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleUpdate(listing.id, AdminListingStatusUpdateStatus.rejected)} className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 rounded hover:bg-red-50">Reject</button>
                          <button onClick={() => handleUpdate(listing.id, AdminListingStatusUpdateStatus.approved)} className="px-3 py-1.5 text-xs font-bold text-white bg-green-500 rounded hover:bg-green-600">Approve</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!listings || listings.length === 0) && (
              <div className="p-12 text-center text-gray-500">No listings found in this category.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
