import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, User, Check, CheckCircle, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginPhase, setLoginPhase] = useState<'idle' | 'loading' | 'success'>('idle');
  const [signInText, setSignInText] = useState('Sign In');
  const [progress, setProgress] = useState(0);
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const progressInterval = useRef<NodeJS.Timeout>();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const shouldRemember = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && shouldRemember) {
      setValue('email', savedEmail);
      if (savedPassword) {
        setValue('password', savedPassword);
      }
      setRememberMe(true);
    }
  }, [setValue]);

  useEffect(() => {
    if (loginPhase === 'loading') {
      // Simulate progress animation
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval.current);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (loginPhase === 'success') {
        setProgress(100);
      } else {
        setProgress(0);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [loginPhase]);

  const extractUsernameFromEmail = (email: string) => {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  const animateLoginProgress = () => {
    setLoginPhase('loading');
    setSignInText('Authenticating...');
    
    // Update text based on progress
    const messages = [
      'Verifying credentials...',
      'Checking security...',
      'Finalizing...',
      // 'Welcome back!'
    ];
    
    let index = 0;
    const messageInterval = setInterval(() => {
      if (index < messages.length) {
        setSignInText(messages[index]);
        index++;
      }
    }, 500);
    
    return messageInterval;
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setLoginPhase('loading');
    setProgress(0);
    
    const messageInterval = animateLoginProgress();

    try {
      const success = await login(data.email, data.password);
      
      if (success) {
        // Save credentials if "Remember Me" is checked
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', data.email);
          localStorage.setItem('rememberedPassword', data.password);
          localStorage.setItem('rememberMe', 'true');
        } else {
          // Clear saved credentials if "Remember Me" is unchecked
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('rememberMe');
        }
        
        clearInterval(messageInterval);
        setLoginPhase('success');
        setSignInText('Access Granted');
        
        // Add a small delay for the success animation to complete
        setTimeout(() => {
          const username = extractUsernameFromEmail(data.email);
          toast.success(`Welcome back, ${username}!`);
          navigate('/dashboard');
        }, 800);
      }
    } catch (error: any) {
      clearInterval(messageInterval);
      setLoginPhase('idle');
      setSignInText('Sign In');
      setProgress(0);
      toast.error(error?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setValue('email', 'demo@vault.app');
    setValue('password', 'demo123');
  };

  const handleGuestAccess = () => {
    loginAsGuest();
    toast.success('Welcome, Guest!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="inline-block mb-8 ml-28">
            <Logo />
          </Link>

          <h1 className="text-2xl font-bold mb-2 text-center">Welcome back</h1>
          <p className="text-muted-foreground mb-8 text-center">
            Sign in to access your secure vault
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"  
                type="email"
                placeholder="you@example.com"
                className="mt-1.5 rounded-none"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative mt-1.5">
                <Input className='rounded-none'
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="relative flex items-center justify-center w-4 h-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-checked={rememberMe}
                role="checkbox"
              >
                {rememberMe && (
                  <Check className="w-3 h-3 text-primary" />
                )}
              </button>
              <Label 
                htmlFor="remember-me" 
                className="text-sm font-normal cursor-pointer"
                onClick={() => setRememberMe(!rememberMe)}
              >
                Remember me
              </Label>
            </div>

            {/* Enhanced Sign In Button */}
            <Button 
              type="submit" 
              className="w-full gap-2 rounded-full relative overflow-hidden group"
              disabled={isLoading || loginPhase === 'loading' || loginPhase === 'success'}
            >
              {/* Background progress indicator */}
              <motion.div 
                className="absolute inset-0 bg-primary/20"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Button Content */}
              <div className="relative z-10 flex items-center justify-center gap-2">
                <AnimatePresence mode="wait">
                  {loginPhase === 'idle' && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Sign In</span>
                    </motion.div>
                  )}
                  
                  {loginPhase === 'loading' && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-4 h-4" />
                      </motion.div>
                      <motion.span
                        key={signInText}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {signInText}
                      </motion.span>
                    </motion.div>
                  )}
                  
                  {loginPhase === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </motion.div>
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {signInText}
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Success pulse effect */}
              {loginPhase === 'success' && (
                <motion.div
                  className="absolute inset-0 bg-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 0.6, times: [0, 0.5, 1] }}
                />
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Optional buttons remain commented out */}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-foreground hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-primary-foreground text-center max-w-md"
        >
          <div className="w-24 h-24 rounded-full bg-primary-foreground/10 flex items-center justify-center mx-auto mb-8">
            <Logo size="lg" showText={false} className="[&_svg]:text-primary-foreground [&_div]:bg-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Your documents, always secure</h2>
          <p className="opacity-80">
            Access your personal vault from anywhere. All your sensitive documents are encrypted and protected.
          </p>
        </motion.div>
      </div>
    </div>
  );
} 