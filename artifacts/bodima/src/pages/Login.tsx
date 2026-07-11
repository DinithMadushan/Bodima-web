import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { useLogin, useRegister, RegisterInputRole } from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { setAuth, isLoggedIn } = useAuth();
  const { toast } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  useEffect(() => {
    if (isLoggedIn) {
      setLocation('/');
    }
  }, [isLoggedIn, setLocation]);

  const loginMutation = useLogin();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data: values }, {
      onSuccess: (res) => {
        setAuth(res.token, res.user);
        toast({ title: "Welcome back!", description: `Logged in as ${res.user.first_name}` });
        
        // Redirect based on role
        if (res.user.role === 'admin') setLocation('/admin');
        else if (res.user.role === 'owner') setLocation('/owner');
        else setLocation('/dashboard');
      },
      onError: (err: any) => {
        toast({ 
          title: "Login failed", 
          description: err.error || "Invalid credentials", 
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row bg-[#f7f4ef]">
      {/* Left Panel - Hero/Testimonial */}
      <div className="hidden md:flex md:w-[55%] relative flex-col justify-between overflow-hidden bg-[#1a3c5e]">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1f30] via-transparent to-transparent" />
        
        <div className="relative z-10 p-12 lg:p-16 text-white h-full flex flex-col justify-between">
          <div>
            <h1 className="font-serif text-5xl lg:text-6xl font-bold mb-6">Welcome to<br/>your new home.</h1>
            <p className="text-xl text-gray-300 max-w-md font-light">
              Join thousands of students who have found their perfect boarding place through our verified network.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl max-w-lg mb-8">
            <div className="flex text-[#e8a045] mb-4">
              {/* Stars */}
              {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
            </div>
            <p className="text-lg italic mb-6">"Found my boarding place in just two days. The owner is amazing and it's just 5 mins from the university. Highly recommended!"</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-400 rounded-full overflow-hidden border-2 border-white/30">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Student" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-white">Sarah Perera</h4>
                <p className="text-sm text-gray-400">Medical Student, NSBM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full md:w-[45%] flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-[#e8e0d5]">
          
          {/* Tab Switcher */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
            <button 
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === 'login' ? 'bg-white text-[#1a3c5e] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('login')}
            >
              Log In
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === 'register' ? 'bg-white text-[#1a3c5e] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setLocation('/register')}
            >
              Sign Up
            </button>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-[#1a3c5e] mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Enter your credentials to access your account.</p>
          </div>

          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2c3e50] font-medium">Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#e8a045]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-[#2c3e50] font-medium">Password</FormLabel>
                      <a href="#" className="text-sm font-medium text-[#e8a045] hover:text-[#d99035]">Forgot password?</a>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#e8a045]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <button 
                type="submit" 
                className="w-full h-14 mt-4 btn-primary flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
                {!loginMutation.isPending && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </Form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <button type="button" className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl text-[#2c3e50] font-medium hover:bg-gray-50 transition-colors">
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 41.939 C -8.804 40.009 -11.514 38.989 -14.754 38.989 C -19.444 38.989 -23.494 41.689 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Google
          </button>
          
        </div>
      </div>
    </div>
  );
}
