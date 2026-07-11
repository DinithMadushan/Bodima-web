import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSearchListings } from '@workspace/api-client-react';
import ListingCard from '@/components/ListingCard';
import { Search as SearchIcon, SlidersHorizontal, LayoutGrid, List as ListIcon, MapPin } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

export default function Search() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [locFilter, setLocFilter] = useState(searchParams.get('location') || '');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  
  const { data, isLoading } = useSearchListings({
    q: q || undefined,
    location: locFilter || undefined,
    min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
    max_price: priceRange[1] < 50000 ? priceRange[1] : undefined,
    gender: gender || undefined,
  }, {
    query: { keepPreviousData: true }
  });

  const listings = data?.listings || [];
  const total = data?.total || 0;

  return (
    <div className="w-full bg-[#f7f4ef] min-h-[calc(100vh-80px)]">
      {/* Search Header */}
      <div className="bg-[#1a3c5e] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search boardings..." 
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 outline-none transition-all"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select 
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white focus:bg-white focus:text-gray-900 outline-none appearance-none transition-all"
                value={locFilter}
                onChange={(e) => setLocFilter(e.target.value)}
              >
                <option value="" className="text-gray-900">Any Location</option>
                <option value="Negombo Town" className="text-gray-900">Negombo Town</option>
                <option value="Kochchikade" className="text-gray-900">Kochchikade</option>
                <option value="Periyamulla" className="text-gray-900">Periyamulla</option>
                <option value="Dalupotha" className="text-gray-900">Dalupotha</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-[300px] flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8e0d5] sticky top-24">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <SlidersHorizontal className="w-5 h-5 text-[#1a3c5e]" />
              <h3 className="font-serif text-xl font-bold text-[#1a3c5e]">Filters</h3>
            </div>

            {/* Price Filter */}
            <div className="mb-8">
              <h4 className="font-bold text-[#2c3e50] mb-4">Price Range (LKR)</h4>
              <Slider 
                defaultValue={[0, 50000]} 
                max={100000} 
                step={1000}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mb-4"
              />
              <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                <span>Rs. {priceRange[0].toLocaleString()}</span>
                <span>{priceRange[1] >= 50000 ? 'Any' : `Rs. ${priceRange[1].toLocaleString()}`}</span>
              </div>
            </div>

            {/* Gender Filter */}
            <div className="mb-8">
              <h4 className="font-bold text-[#2c3e50] mb-4">Gender Allowed</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox 
                    checked={gender === ''} 
                    onCheckedChange={() => setGender('')} 
                  />
                  <span className="text-gray-700">Any Gender</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox 
                    checked={gender === 'male'} 
                    onCheckedChange={() => setGender('male')} 
                  />
                  <span className="text-gray-700">Male Only</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox 
                    checked={gender === 'female'} 
                    onCheckedChange={() => setGender('female')} 
                  />
                  <span className="text-gray-700">Female Only</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#2c3e50]">
              {isLoading ? 'Searching...' : `${total} Results Found`}
            </h2>
            
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-[#e8e0d5]">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#f7f4ef] text-[#1a3c5e]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#f7f4ef] text-[#1a3c5e]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`bg-white rounded-2xl animate-pulse ${viewMode === 'list' ? 'h-48 flex' : 'h-[380px]'}`}>
                  <div className={`bg-gray-200 ${viewMode === 'list' ? 'w-[280px] h-full rounded-l-2xl' : 'h-[200px] w-full rounded-t-2xl'}`}></div>
                  <div className="p-5 flex-1 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-10 bg-gray-200 rounded w-full mt-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#e8e0d5]">
              <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold text-[#1a3c5e] mb-2">No listings found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search filters to find what you're looking for.</p>
              <button 
                onClick={() => { setQ(''); setLocFilter(''); setGender(''); setPriceRange([0,50000]); }}
                className="btn-accent"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-6"}>
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} layout={viewMode} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
