import { useGetAllReviews } from '@workspace/api-client-react';
import { Star, Quote } from 'lucide-react';
import { Link } from 'wouter';

export default function Reviews() {
  const { data: reviews, isLoading } = useGetAllReviews({ limit: 20 });

  return (
    <div className="bg-[#f7f4ef] min-h-[calc(100vh-80px)] pb-20">
      
      <div className="bg-[#1a3c5e] text-white py-16 text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Student Stories</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">Real reviews from students who found their home through Bodima.lk</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white p-6 rounded-2xl h-48 animate-pulse border border-[#e8e0d5]"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews?.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#e8e0d5] relative group hover:shadow-md transition-shadow">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-gray-100 group-hover:text-[#e8a045]/20 transition-colors" />
                
                <div className="flex text-[#e8a045] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
                
                <p className="text-gray-600 mb-6 italic min-h-[80px]">"{review.comment}"</p>
                
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 bg-[#1a3c5e] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {(review.student_name || 'S')[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2c3e50] text-sm">{review.student_name}</h4>
                    <Link href={`/listings/${review.listing_id}`} className="text-xs text-[#e8a045] hover:underline">
                      Stayed at {review.listing_name}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
