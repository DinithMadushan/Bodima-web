import { useState } from 'react';
import { useLocation } from 'wouter';
import { useGetFeaturedListings, useGetDashboardStats } from '@workspace/api-client-react';
import ListingCard from '@/components/ListingCard';
import { Search, MapPin, Home as HomeIcon, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const { data: featuredListings, isLoading: isLoadingFeatured } = useGetFeaturedListings();
  const { data: stats } = useGetDashboardStats();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (searchLocation) params.append('location', searchLocation);
    setLocation(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1800)' }}
        >
          <div className="absolute inset-0 bg-[#0f1f30]/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f1f30]/90"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
            Find Your Perfect <br/><span className="text-[#e8a045]">Student Home</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
            Sri Lanka's most trusted platform for university students to find safe, verified, and comfortable boarding places.
          </p>

          {/* Search Box - Glassmorphism */}
          <div className="bg-white/10 backdrop-blur-[20px] border border-white/20 p-4 md:p-6 rounded-2xl shadow-2xl max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search by university, landmark..." 
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-white border-0 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-[#e8a045] outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select 
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-white border-0 text-gray-800 focus:ring-2 focus:ring-[#e8a045] outline-none appearance-none"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                >
                  <option value="">Any Location</option>
                  <option value="Negombo Town">Negombo Town</option>
                  <option value="Kochchikade">Kochchikade</option>
                  <option value="Periyamulla">Periyamulla</option>
                  <option value="Dalupotha">Dalupotha</option>
                </select>
              </div>
              <button type="submit" className="h-14 px-8 bg-[#e8a045] hover:bg-[#d99035] text-white font-bold rounded-xl transition-colors shadow-lg whitespace-nowrap">
                Search Boardings
              </button>
            </form>
          </div>

          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-3xl mx-auto border-t border-white/10 pt-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-serif font-bold text-white mb-1">{stats?.total_listings || "240"}+</div>
              <div className="text-sm text-gray-300">Verified Listings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-serif font-bold text-white mb-1">{stats?.total_students || "1.2k"}+</div>
              <div className="text-sm text-gray-300">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-serif font-bold text-white mb-1">{stats?.satisfaction_rate || "98"}%</div>
              <div className="text-sm text-gray-300">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 bg-[#f7f4ef]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1a3c5e] mb-4">Top Rated Places</h2>
              <p className="text-gray-600">Discover our most loved student accommodations</p>
            </div>
            <button onClick={() => setLocation('/search')} className="hidden md:inline-flex items-center font-medium text-[#1a3c5e] hover:text-[#e8a045] transition-colors pb-1 border-b-2 border-transparent hover:border-[#e8a045]">
              View All Places &rarr;
            </button>
          </div>

          {isLoadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-[400px] animate-pulse">
                  <div className="h-[220px] bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-5 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredListings?.slice(0, 6).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
          
          <div className="mt-10 text-center md:hidden">
            <button onClick={() => setLocation('/search')} className="btn-primary w-full max-w-sm">
              View All Places
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white border-y border-[#e8e0d5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1a3c5e] mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Your journey to finding the perfect boarding place is simple, safe, and entirely online.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-[#e8e0d5] z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#1a3c5e] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3">
                <Search className="w-10 h-10 -rotate-3" />
              </div>
              <h3 className="text-xl font-bold text-[#2c3e50] mb-3">1. Search & Filter</h3>
              <p className="text-gray-600">Browse hundreds of verified listings. Filter by location, price, gender, and amenities to find your match.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#e8a045] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg -rotate-3">
                <CheckCircle className="w-10 h-10 rotate-3" />
              </div>
              <h3 className="text-xl font-bold text-[#2c3e50] mb-3">2. Request to Visit</h3>
              <p className="text-gray-600">Found a place you like? Send a direct request to the owner to schedule a visit or ask questions.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#c0392b] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3">
                <HomeIcon className="w-10 h-10 -rotate-3" />
              </div>
              <h3 className="text-xl font-bold text-[#2c3e50] mb-3">3. Move In safely</h3>
              <p className="text-gray-600">Once approved, finalize the details with the owner directly. Rate and review after your stay.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Owner CTA Section */}
      <section className="py-20 bg-[#1a3c5e] text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#e8a045 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1">
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Have an extra room? <br/><span className="text-[#e8a045]">Become a host.</span></h2>
              <p className="text-xl text-gray-300 mb-8 max-w-xl font-light">
                List your property on බෝdima.lk and connect with thousands of university students looking for a place to stay. Manage bookings, messages, and payments all in one place.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <ShieldCheck className="text-[#e8a045] w-6 h-6" />
                  <span>Verified university student tenants</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-[#e8a045] w-6 h-6" />
                  <span>Free to list and easy to manage</span>
                </li>
              </ul>
              <button onClick={() => setLocation('/register')} className="btn-accent text-lg px-8 py-4 shadow-xl">
                List Your Property
              </button>
            </div>
            <div className="flex-1 w-full max-w-md relative">
              <div className="absolute inset-0 bg-[#e8a045] rounded-3xl transform rotate-6 scale-105"></div>
              <img 
                src="https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800" 
                alt="Happy host" 
                className="relative z-10 rounded-3xl w-full h-auto object-cover shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
