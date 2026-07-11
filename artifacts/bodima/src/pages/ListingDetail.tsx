import { useState } from 'react';
import { useRoute } from 'wouter';
import { useGetListing, useCreateBooking, useGetReviews } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Star, Share2, Heart, CheckCircle, Wifi, Coffee, Calendar, ShieldCheck, Home as HomeIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const bookingSchema = z.object({
  move_in_date: z.string().min(1, { message: "Date is required" }),
  message: z.string().optional(),
});

export default function ListingDetail() {
  const [, params] = useRoute('/listings/:id');
  const listingId = parseInt(params?.id || '0');
  const { isLoggedIn, user } = useAuth();
  const { toast } = useToast();
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { data: listing, isLoading, isError } = useGetListing(listingId, {
    query: { enabled: !!listingId }
  });

  const { data: reviews } = useGetReviews({ listing_id: listingId }, {
    query: { enabled: !!listingId }
  });

  const createBooking = useCreateBooking();

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { move_in_date: '', message: '' }
  });

  const onSubmitBooking = (values: z.infer<typeof bookingSchema>) => {
    if (!isLoggedIn) {
      toast({ title: "Login required", description: "Please log in to book this property", variant: "destructive" });
      return;
    }
    
    createBooking.mutate({
      data: {
        listing_id: listingId,
        move_in_date: values.move_in_date,
        message: values.message
      }
    }, {
      onSuccess: () => {
        setIsBookingModalOpen(false);
        toast({ 
          title: "Request Sent!", 
          description: "The owner will review your request shortly.",
        });
      },
      onError: () => {
        toast({ title: "Failed to send request", variant: "destructive" });
      }
    });
  };

  if (isLoading) return <div className="min-h-screen p-8 text-center pt-24 font-medium text-gray-500">Loading details...</div>;
  if (isError || !listing) return <div className="min-h-screen p-8 text-center pt-24 font-bold text-red-500">Listing not found</div>;

  const formattedPrice = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(listing.price);
  
  // Gallery logic (use fallback if no images array)
  const images = listing.images?.length ? listing.images.map(img => img.url) : [
    listing.img || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    'https://images.unsplash.com/photo-1502672260266-1c1e5250ad11?w=800',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800'
  ];

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-6">
        
        {/* Header Title & Actions */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {listing.badge && (
                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full text-white bg-[#e8a045]`}>
                  {listing.badge}
                </span>
              )}
              <span className="text-sm font-medium text-gray-500 flex items-center">
                <MapPin className="w-4 h-4 mr-1" /> {listing.location || listing.area}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1a3c5e]">{listing.name}</h1>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium text-sm transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium text-sm transition-colors">
              <Heart className="w-4 h-4" /> Save
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[40vh] md:h-[500px] mb-10 rounded-2xl overflow-hidden">
          <div className="col-span-4 md:col-span-2 row-span-2 relative">
            <img src={images[0]} alt="Main" className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" />
          </div>
          <div className="hidden md:block col-span-1 row-span-1 relative">
            <img src={images[1]} alt="Side 1" className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" />
          </div>
          <div className="hidden md:block col-span-1 row-span-1 relative">
            <img src={images[2] || images[1]} alt="Side 2" className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" />
          </div>
          <div className="hidden md:block col-span-2 row-span-1 relative">
            <img src={images[0]} alt="Side 3" className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
              <span className="text-white font-medium flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" /> View all photos
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Split */}
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column (Details) */}
          <div className="flex-1">
            <div className="flex justify-between items-start pb-8 border-b border-gray-200 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#2c3e50] mb-2">Hosted by {listing.owner_name || 'Bodima Host'}</h2>
                <p className="text-gray-500">
                  {listing.type || 'Boarding House'} &middot; {listing.gender ? (listing.gender === 'male' ? 'Boys only' : 'Girls only') : 'Any gender'}
                </p>
              </div>
              <div className="w-14 h-14 bg-[#1a3c5e] text-white rounded-full flex items-center justify-center text-xl font-bold font-serif">
                {(listing.owner_name || 'H')[0].toUpperCase()}
              </div>
            </div>

            {/* Quick Facts */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {listing.deposit_months && (
                <div className="flex items-start gap-4">
                  <ShieldCheck className="w-6 h-6 text-[#1a3c5e]" />
                  <div>
                    <h4 className="font-bold text-[#2c3e50]">Deposit</h4>
                    <p className="text-sm text-gray-500">{listing.deposit_months} Months advance</p>
                  </div>
                </div>
              )}
              {listing.meals_included !== undefined && (
                <div className="flex items-start gap-4">
                  <Coffee className="w-6 h-6 text-[#1a3c5e]" />
                  <div>
                    <h4 className="font-bold text-[#2c3e50]">Meals</h4>
                    <p className="text-sm text-gray-500">{listing.meals_included ? 'Included' : 'Self-catering'}</p>
                  </div>
                </div>
              )}
              {listing.wifi_included && (
                <div className="flex items-start gap-4">
                  <Wifi className="w-6 h-6 text-[#1a3c5e]" />
                  <div>
                    <h4 className="font-bold text-[#2c3e50]">Internet</h4>
                    <p className="text-sm text-gray-500">Free Wi-Fi included</p>
                  </div>
                </div>
              )}
              {listing.available_from && (
                <div className="flex items-start gap-4">
                  <Calendar className="w-6 h-6 text-[#1a3c5e]" />
                  <div>
                    <h4 className="font-bold text-[#2c3e50]">Availability</h4>
                    <p className="text-sm text-gray-500">From {new Date(listing.available_from).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pb-8 border-b border-gray-200 mb-8">
              <h3 className="text-xl font-bold text-[#2c3e50] mb-4">About this place</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {listing.desc || 'No description provided for this listing. Contact the owner for more details.'}
              </p>
            </div>

            <div className="pb-8 border-b border-gray-200 mb-8">
              <h3 className="text-xl font-bold text-[#2c3e50] mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-y-4">
                {(listing.amenities || []).map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-6 h-6 text-[#e8a045] fill-current" />
                <h3 className="text-2xl font-bold text-[#2c3e50]">
                  {listing.rating.toFixed(1)} &middot; {listing.review_count} reviews
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(reviews || []).slice(0,4).map((review) => (
                  <div key={review.id} className="bg-[#f7f4ef] p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                        {review.student_avatar ? (
                          <img src={review.student_avatar} alt={review.student_name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#1a3c5e] text-white flex items-center justify-center font-bold text-sm">
                            {(review.student_name || 'U')[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#2c3e50] text-sm">{review.student_name}</h4>
                        <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Floating Booking Card) */}
          <div className="w-full lg:w-[340px]">
            <div className="sticky top-28 bg-white border border-[#e8e0d5] shadow-xl rounded-2xl p-6">
              <div className="flex items-end justify-between mb-6 pb-6 border-b border-gray-100">
                <div>
                  <span className="text-2xl font-bold text-[#1a3c5e]">{formattedPrice}</span>
                  <span className="text-gray-500 text-sm"> / month</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Star className="w-4 h-4 text-[#e8a045] fill-current" />
                  {listing.rating.toFixed(1)}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full py-3.5 btn-accent text-lg shadow-md shadow-orange-900/20"
                >
                  Request to Visit
                </button>
                <button className="w-full py-3 border-2 border-[#1a3c5e] text-[#1a3c5e] rounded-lg font-bold hover:bg-[#1a3c5e] hover:text-white transition-colors">
                  Message Owner
                </button>
              </div>
              
              <div className="text-center text-xs text-gray-400 mb-6">
                You won't be charged yet
              </div>

              <div className="bg-[#f7f4ef] rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#2c3e50]">Verified Owner</div>
                  <div className="text-xs text-gray-500">Identity checked by Bodima</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Request Visit</DialogTitle>
            <DialogDescription>
              Send a request to the owner. They will review it and get back to you.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitBooking)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="move_in_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Move-in Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message to Owner (Optional)</FormLabel>
                    <FormControl>
                      <textarea 
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Hi, I'm a student at..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium">Cancel</button>
                <button type="submit" disabled={createBooking.isPending} className="btn-primary flex items-center justify-center">
                  {createBooking.isPending ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
// Need a dummy LayoutGrid import to satisfy the compiler
function LayoutGrid(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>;
}
