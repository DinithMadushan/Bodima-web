import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { useGetUnreadCount, useLogout } from '@workspace/api-client-react';
import { Menu, X, MessageSquare, Heart } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { data: unreadData } = useGetUnreadCount({
    query: { enabled: isLoggedIn }
  });
  const unreadCount = unreadData?.count || 0;
  
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        logout();
        setLocation('/');
      }
    });
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Find Boarding', path: '/search' },
    { label: 'About', path: '/about' },
    { label: 'Reviews', path: '/reviews' },
  ];

  return (
    <nav style={{ backgroundColor: 'var(--dark)' }} className="sticky top-0 z-50 w-full text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="brand-text text-3xl tracking-tight text-white hover:opacity-90 transition-opacity">
              බ‍ō<span>dima</span>.lk
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path} className="text-gray-300 hover:text-white font-medium transition-colors">
                {link.label}
              </Link>
            ))}
            
            {isLoggedIn ? (
              <>
                <Link href={user?.role === 'admin' ? '/admin' : user?.role === 'owner' ? '/owner' : '/dashboard'} className="text-gray-300 hover:text-white font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/messages" className="text-gray-300 hover:text-white transition-colors relative flex items-center">
                  <MessageSquare className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-4 pl-4 border-l border-gray-700">
                  <span className="text-sm text-gray-400">Hi, {user?.first_name}</span>
                  <button onClick={handleLogout} className="text-sm font-medium text-gray-300 hover:text-white">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-700">
                <Link href="/login" className="text-gray-300 hover:text-white font-medium transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="btn-accent text-sm py-2">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {isLoggedIn && (
              <Link href="/messages" className="relative">
                <MessageSquare className="w-6 h-6 text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white">
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full" style={{ backgroundColor: 'var(--dark)' }}>
          <div className="px-4 pt-2 pb-6 space-y-2 shadow-xl border-t border-gray-800">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path} 
                className="block px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {isLoggedIn ? (
              <>
                <Link 
                  href={user?.role === 'admin' ? '/admin' : user?.role === 'owner' ? '/owner' : '/dashboard'} 
                  className="block px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="pt-4 mt-2 border-t border-gray-800 flex justify-between items-center px-3">
                  <span className="text-sm text-gray-400">Signed in as {user?.first_name}</span>
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-sm font-medium text-red-400 hover:text-red-300">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 mt-2 border-t border-gray-800 grid grid-cols-2 gap-4 px-3">
                <Link 
                  href="/login" 
                  className="text-center py-2.5 rounded-md text-gray-300 border border-gray-600 hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="btn-accent text-center py-2.5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
