import { lazy, Suspense } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Lazy loaded pages
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Search = lazy(() => import('@/pages/Search'));
const ListingDetail = lazy(() => import('@/pages/ListingDetail'));
const About = lazy(() => import('@/pages/About'));
const Reviews = lazy(() => import('@/pages/Reviews'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const OwnerDashboard = lazy(() => import('@/pages/OwnerDashboard'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const Messages = lazy(() => import('@/pages/Messages'));
const NotFound = lazy(() => import('@/pages/not-found'));

const queryClient = new QueryClient();

// Page loader fallback
const PageLoader = () => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-[var(--primary)] rounded-full animate-spin mb-4"></div>
      <p className="text-[var(--primary)] font-medium">Loading...</p>
    </div>
  </div>
);

function AppRouter() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/search" component={Search} />
            <Route path="/listings/:id" component={ListingDetail} />
            <Route path="/about" component={About} />
            <Route path="/reviews" component={Reviews} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/owner" component={OwnerDashboard} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/messages" component={Messages} />
            
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AppRouter />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
