import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';
import { ArrowRight, Building2, MapPin, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const Onboarding = () => {
  const { profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    fullName: profile?.fullName || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const navigate = useNavigate();

  const handleComplete = async () => {
    if (!profile) return;
    try {
      const docRef = doc(db, 'profiles', profile.id);
      await updateDoc(docRef, {
        ...formData,
        onboarded: true
      });
      await refreshProfile();
      toast.success("Welcome aboard, " + formData.fullName);
      navigate('/');
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const steps = [
    { title: "Your Business", icon: Building2 },
    { title: "Preferences", icon: MapPin },
    { title: "Ready", icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-12">
          <Logo className="h-10 w-10 text-[#111110]" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#1E19141A] p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#F7F6F2]">
             <motion.div 
               className="h-full bg-[#111110]" 
               initial={{ width: "33%" }}
               animate={{ width: `${(step/3)*100}%` }}
             />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-display italic text-[#1A1816] mb-1">Company Details</h3>
                  <p className="text-xs text-[#6B6860] uppercase font-bold tracking-widest">How should we identify you?</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6B6860]">Legal Business Name</label>
                    <input 
                      type="text" 
                      value={formData.businessName}
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      placeholder="e.g. Acme Design Studio"
                      className="w-full h-11 px-4 bg-[#F7F6F2] border border-[#1E19141A] rounded-lg focus:outline-none focus:border-primary transition-colors text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6B6860]">Your Identity (Full Name)</label>
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full h-11 px-4 bg-[#F7F6F2] border border-[#1E19141A] rounded-lg focus:outline-none focus:border-primary transition-colors text-xs font-medium"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => formData.businessName && setStep(2)}
                  disabled={!formData.businessName}
                  className="w-full h-12 bg-[#111110] text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#1A1917] transition-all"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-display italic text-[#1A1816] mb-1">Localization</h3>
                  <p className="text-xs text-[#6B6860] uppercase font-bold tracking-widest">Perfect timing for reminders.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6B6860]">Your Region</label>
                  <select 
                    value={formData.timezone}
                    onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    className="w-full h-11 px-4 bg-[#F7F6F2] border border-[#1E19141A] rounded-lg focus:outline-none focus:border-primary transition-colors text-xs font-medium appearance-none"
                  >
                    {Intl.supportedValuesOf('timeZone').map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setStep(1)} className="flex-1 h-12 border border-[#1E19141A] rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F6F2] transition-colors">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 h-12 bg-[#111110] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">Continue</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="h-16 w-16 bg-[#111110] text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-display italic text-[#1A1816] mb-1">Configuration Ready</h3>
                  <p className="text-xs text-[#6B6860] uppercase font-bold tracking-widest">Everything is set for ChasePro.</p>
                </div>
                <div className="bg-[#F7F6F2] p-6 rounded-lg text-left border border-[#1E19141A] space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-[#1E19141A]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6860]">Business</span>
                    <span className="text-xs font-bold text-[#1A1816]">{formData.businessName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B6860]">Name</span>
                    <span className="text-xs font-bold text-[#1A1816]">{formData.fullName}</span>
                  </div>
                </div>
                <button 
                  onClick={handleComplete}
                  className="w-full h-12 bg-[#D96C75] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-[#C55B64] transition-all"
                >
                  Enter Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
