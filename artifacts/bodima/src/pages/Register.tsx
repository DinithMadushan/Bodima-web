import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { useRegister, RegisterInputRole } from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2, User, Home as HomeIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  first_name: z.string().min(2, { message: "First name is required" }),
  last_name: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum([RegisterInputRole.student, RegisterInputRole.owner]),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { setAuth, isLoggedIn } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (isLoggedIn) {
      setLocation('/');
    }
  }, [isLoggedIn, setLocation]);

  const registerMutation = useRegister();

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      first_name: '', 
      last_name: '', 
      email: '', 
      phone: '', 
      password: '', 
      role: RegisterInputRole.student 
    },
  });

  const selectedRole = registerForm.watch('role');

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({ data: values }, {
      onSuccess: (res) => {
        setAuth(res.token, res.user);
        toast({ title: "Account created!", description: `Welcome to Bodima, ${res.user.first_name}` });
        
        if (res.user.role === 'owner') setLocation('/owner');
        else setLocation('/dashboard');
      },
      onError: (err: any) => {
        toast({ 
          title: "Registration failed", 
          description: err.error || "An error occurred", 
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row bg-[#f7f4ef]">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-[55%] relative flex-col justify-between overflow-hidden bg-[#1a3c5e]">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1f30] via-transparent to-transparent" />
        
        <div className="relative z-10 p-12 lg:p-16 text-white h-full flex flex-col justify-between">
          <div>
            <h1 className="font-serif text-5xl lg:text-6xl font-bold mb-6">Join our<br/>community.</h1>
            <p className="text-xl text-gray-300 max-w-md font-light">
              Whether you're looking for a place or have a place to offer, you're in the right spot.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full md:w-[45%] flex items-center justify-center p-6 md:p-12 my-8">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-[#e8e0d5]">
          
          {/* Tab Switcher */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
            <button 
              type="button"
              className="flex-1 py-3 text-sm font-semibold rounded-lg transition-all text-gray-500 hover:text-gray-700"
              onClick={() => setLocation('/login')}
            >
              Log In
            </button>
            <button 
              type="button"
              className="flex-1 py-3 text-sm font-semibold rounded-lg transition-all bg-white text-[#1a3c5e] shadow-sm"
            >
              Sign Up
            </button>
          </div>

          <div className="mb-6">
            <h2 className="font-serif text-3xl font-bold text-[#1a3c5e] mb-2">Create Account</h2>
            <p className="text-gray-500 text-sm">Join Bodima to find or list properties.</p>
          </div>

          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              
              {/* Role Selector */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div 
                  onClick={() => registerForm.setValue('role', RegisterInputRole.student)}
                  className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${selectedRole === RegisterInputRole.student ? 'border-[#1a3c5e] bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedRole === RegisterInputRole.student ? 'bg-[#1a3c5e] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <span className={`font-medium ${selectedRole === RegisterInputRole.student ? 'text-[#1a3c5e]' : 'text-gray-500'}`}>Student</span>
                </div>
                
                <div 
                  onClick={() => registerForm.setValue('role', RegisterInputRole.owner)}
                  className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${selectedRole === RegisterInputRole.owner ? 'border-[#e8a045] bg-orange-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedRole === RegisterInputRole.owner ? 'bg-[#e8a045] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <HomeIcon className="w-5 h-5" />
                  </div>
                  <span className={`font-medium ${selectedRole === RegisterInputRole.owner ? 'text-[#e8a045]' : 'text-gray-500'}`}>Property Owner</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={registerForm.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#2c3e50] font-medium">First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" className="bg-gray-50 border-gray-200 focus-visible:ring-[#e8a045]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#2c3e50] font-medium">Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" className="bg-gray-50 border-gray-200 focus-visible:ring-[#e8a045]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2c3e50] font-medium">Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" className="bg-gray-50 border-gray-200 focus-visible:ring-[#e8a045]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2c3e50] font-medium">Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+94 7X XXX XXXX" className="bg-gray-50 border-gray-200 focus-visible:ring-[#e8a045]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2c3e50] font-medium">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Min 6 characters" className="bg-gray-50 border-gray-200 focus-visible:ring-[#e8a045]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <button 
                type="submit" 
                className={`w-full h-14 mt-6 flex items-center justify-center gap-2 shadow-lg text-white font-bold rounded-xl transition-all ${selectedRole === RegisterInputRole.owner ? 'bg-[#e8a045] hover:bg-[#d99035] shadow-orange-900/20' : 'bg-[#1a3c5e] hover:bg-[#112840] shadow-blue-900/20'}`}
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                {!registerMutation.isPending && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </Form>
          
        </div>
      </div>
    </div>
  );
}
