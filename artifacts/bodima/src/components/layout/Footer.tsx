import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--dark)' }} className="text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Col */}
          <div>
            <Link href="/" className="brand-text text-3xl tracking-tight text-white mb-6 block">
              බෝ<span>dima</span>.lk
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Sri Lanka's most trusted student boarding finder. We connect university students with safe, verified, and comfortable accommodations in Negombo and beyond.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Nav Col */}
          <div>
            <h4 className="text-lg font-serif font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/search" className="text-gray-400 hover:text-white transition-colors">Find Boarding</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/reviews" className="text-gray-400 hover:text-white transition-colors">Student Reviews</Link></li>
              <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors">List Your Property</Link></li>
            </ul>
          </div>

          {/* Areas Col */}
          <div>
            <h4 className="text-lg font-serif font-bold mb-6 text-white">Top Areas</h4>
            <ul className="space-y-3">
              <li><Link href="/search?location=Negombo Town" className="text-gray-400 hover:text-white transition-colors">Negombo Town</Link></li>
              <li><Link href="/search?location=Kochchikade" className="text-gray-400 hover:text-white transition-colors">Kochchikade</Link></li>
              <li><Link href="/search?location=Periyamulla" className="text-gray-400 hover:text-white transition-colors">Periyamulla</Link></li>
              <li><Link href="/search?location=Dalupotha" className="text-gray-400 hover:text-white transition-colors">Dalupotha</Link></li>
              <li><Link href="/search?location=Katunayake" className="text-gray-400 hover:text-white transition-colors">Katunayake</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-lg font-serif font-bold mb-6 text-white">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-400 text-sm">123 Main Street,<br/>Negombo, Sri Lanka</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-400 text-sm">+94 77 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-400 text-sm">hello@bodima.lk</span>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} බෝdima.lk. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
