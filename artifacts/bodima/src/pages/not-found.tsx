import { Link } from 'wouter';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#f7f4ef] px-4">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-8xl font-bold text-[#1a3c5e] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">Page not found</h2>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
