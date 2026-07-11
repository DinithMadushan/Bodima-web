import { Link } from 'wouter';
import { Heart, MapPin, Star } from 'lucide-react';
import { Listing } from '@workspace/api-client-react';

interface ListingCardProps {
  listing: Listing;
  layout?: 'grid' | 'list';
}

export default function ListingCard({ listing, layout = 'grid' }: ListingCardProps) {
  const isList = layout === 'list';
  
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(listing.price);

  const fallbackImage = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400';
  const imgUrl = listing.img || fallbackImage;

  return (
    <div className={`card-shadow bg-white rounded-2xl overflow-hidden flex ${isList ? 'flex-col sm:flex-row' : 'flex-col'} group`}>
      {/* Image Container */}
      <div className={`relative overflow-hidden ${isList ? 'w-full sm:w-[280px] sm:h-auto h-48 flex-shrink-0' : 'w-full h-[220px]'}`}>
        <img 
          src={imgUrl} 
          alt={listing.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {listing.badge && (
            <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${
              listing.badge.toLowerCase() === 'featured' ? 'bg-[#1a3c5e]' : 
              listing.badge.toLowerCase() === 'new' ? 'bg-[#e8a045]' : 
              'bg-[#c0392b]'
            }`}>
              {listing.badge.toUpperCase()}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
          <Heart className="w-4 h-4" />
        </button>

        {/* Gender Badge */}
        {listing.gender && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-medium text-gray-700">
            {listing.gender === 'male' ? 'Male Only' : listing.gender === 'female' ? 'Female Only' : 'Any Gender'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-5 flex flex-col flex-grow`}>
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-serif text-xl font-bold text-[#1a3c5e] line-clamp-1">
              {listing.name}
            </h3>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{listing.location || listing.area}</span>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(listing.amenities || []).slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="bg-[#f7f4ef] border border-[#e8e0d5] text-[#2c3e50] text-xs px-2 py-1 rounded">
                {amenity}
              </span>
            ))}
            {(listing.amenities?.length || 0) > 3 && (
              <span className="bg-[#f7f4ef] border border-[#e8e0d5] text-[#2c3e50] text-xs px-2 py-1 rounded">
                +{(listing.amenities?.length || 0) - 3}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-[#e8e0d5] flex items-center justify-between">
          <div>
            <div className="text-[#e8a045] font-bold text-lg leading-none">
              {formattedPrice}
            </div>
            <div className="text-xs text-gray-500 mt-1">per month</div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#e8a045] fill-current" />
              <span className="font-medium text-sm text-[#2c3e50]">{listing.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({listing.review_count})</span>
            </div>
            
            <Link href={`/listings/${listing.id}`} className="btn-primary text-sm py-1.5 px-4 rounded-md">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
