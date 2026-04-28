import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { signInWithGoogle } from '../lib/firebase';
import { Logo } from '../components/Logo';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (user) return <Navigate to="/" />;

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const benefits = [
    "Automatic, smart invoice follow-ups",
    "Identify reliable vs. chronic late-payers",
    "Embedded one-click payment links",
    "Real-time tracking of invoice opens"
  ];

  return (
    <div className="min-h-screen flex items-stretch font-sans">
      {/* Left side: Visuals/Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111110] relative overflow-hidden items-center justify-center p-24">
        <div className="absolute inset-0 opacity-5">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl font-display italic leading-tight mb-8 text-[#F7F6F2]">
              The art of being paid.
            </h1>
            <p className="text-lg text-[#B3B2AE] font-medium mb-12 max-w-md">
              ChasePro orchestrates your invoice lifecycle with surgical precision and human warmth.
            </p>
            
            <div className="space-y-6">
              {benefits.map((benefit, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="flex items-center gap-4 py-2 border-l border-white/10 pl-6"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#D96C75]" />
                  <span className="text-sm font-bold uppercase tracking-widest text-[#B3B2AE]">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-[#F7F6F2]">
        <div className="max-w-md w-full">
          <div className="mb-16">
            <Logo className="h-10 w-10 text-[#111110] mb-8" />
            <h2 className="text-3xl font-display italic text-[#1A1816] mb-2 leading-tight">Welcome to ChasePro.</h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#6B6860]">Professional Identity required to proceed.</p>
          </div>

          <div className="space-y-8">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              onClick={handleLogin}
              className="w-full h-14 bg-white border border-[#1E19141A] rounded-xl flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest shadow-sm hover:shadow-md transition-all text-[#1A1816]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smart_lock/google.svg" alt="Google" className="h-5 w-5" />
              Continue with Google
            </motion.button>
            
            <div className="relative py-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B3B2AE]">Identity verification via Google Vault</span>
            </div>

            <p className="text-center text-[10px] font-medium leading-relaxed text-[#6B6860]">
               By initiating a session, you agree to our terms of governance and privacy architecture. 
            </p>
          </div>
          
          <div className="mt-32 pt-10 border-t border-[#1E19141A]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B6860] mb-6">Preferred by top-tier contractors</p>
            <div className="flex gap-8 grayscale opacity-30 items-center">
              <div className="text-xs font-bold uppercase tracking-widest">Stripe</div>
              <div className="text-xs font-bold uppercase tracking-widest">Vercel</div>
              <div className="text-xs font-bold uppercase tracking-widest">Linear</div>
              <div className="text-xs font-bold uppercase tracking-widest">Posthog</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
