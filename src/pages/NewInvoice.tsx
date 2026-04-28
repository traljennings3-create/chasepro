import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/Sidebar';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Client, Invoice } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight, 
  UserPlus, 
  Plus, 
  Trash2, 
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const NewInvoice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [invoiceData, setInvoiceData] = useState({
    clientId: '',
    invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 8999)}`,
    description: '',
    issuedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'USD',
  });

  const [lineItems, setLineItems] = useState([
    { description: '', amount: 0 }
  ]);

  useEffect(() => {
    if (!user) return;
    const fetchClients = async () => {
      try {
        const q = query(collection(db, 'clients'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Client));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [user]);

  const totalAmount = lineItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const addLineItem = () => setLineItems([...lineItems, { description: '', amount: 0 }]);
  const removeLineItem = (index: number) => setLineItems(lineItems.filter((_, i) => i !== index));
  const updateLineItem = (index: number, field: string, value: any) => {
    const newItems = [...lineItems];
    (newItems[index] as any)[field] = value;
    setLineItems(newItems);
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const invoicesRef = collection(db, 'invoices');
      const invoicePayload = {
        ...invoiceData,
        userId: user.uid,
        amount: totalAmount,
        status: 'sent',
        escalationLevel: 0,
        reminderPaused: false,
        createdAt: Date.now(),
        lineItems, // Storing line items inside for simplicity
      };
      
      const docRef = await addDoc(invoicesRef, invoicePayload);
      toast.success("Invoice created successfully!");
      navigate(`/invoices/${docRef.id}`);
    } catch (err) {
      toast.error("Failed to create invoice.");
      console.error(err);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 min-h-screen bg-[#F7F6F2] -m-8">
        <header className="h-16 border-b border-[#1E19141A] bg-white flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <Link to="/invoices" className="p-2 rounded-lg hover:bg-[#F7F6F2] text-[#6B6860] transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[#1A1816]">New Invoice</h1>
              <p className="text-[10px] text-[#6B6860] uppercase tracking-wider font-bold -mt-1">Step {step} of 3</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={cn(
                  "h-1 px-3 rounded-full transition-all duration-300",
                  step >= i ? "bg-[#111110]" : "bg-[#F7F6F2]"
                )} 
              />
            ))}
          </div>
        </header>

        <main className="p-8 max-w-4xl mx-auto">
          <div className="bg-white border border-[#1E19141A] rounded-xl shadow-sm overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 lg:p-12 space-y-8"
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-[#6B6860]">Client</label>
                        <select 
                          value={invoiceData.clientId}
                          onChange={(e) => setInvoiceData({...invoiceData, clientId: e.target.value})}
                          className="w-full h-11 px-4 bg-[#F7F6F2] border border-[#1E19141A] rounded-lg text-xs font-medium focus:outline-none focus:border-primary transition-colors appearance-none"
                        >
                          <option value="">Select client...</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-[#6B6860]">Invoice #</label>
                        <input 
                          type="text"
                          value={invoiceData.invoiceNumber}
                          onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                          className="w-full h-11 px-4 bg-[#F7F6F2] border border-[#1E19141A] rounded-lg text-xs font-medium focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#6B6860]">Project Description</label>
                      <input 
                        type="text"
                        placeholder="e.g. Website Branding and UI Design"
                        value={invoiceData.description}
                        onChange={(e) => setInvoiceData({...invoiceData, description: e.target.value})}
                        className="w-full h-11 px-4 bg-[#F7F6F2] border border-[#1E19141A] rounded-lg text-xs font-medium focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={() => invoiceData.clientId && invoiceData.description && setStep(2)}
                      disabled={!invoiceData.clientId || !invoiceData.description}
                      className="bg-[#111110] text-white px-8 py-3 rounded-lg text-xs font-bold hover:bg-[#1A1917] transition-colors disabled:opacity-50"
                    >
                      Line Items →
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 lg:p-12 space-y-8"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-bold uppercase tracking-widest text-[#6B6860]">
                      <div className="col-span-8">Description</div>
                      <div className="col-span-3">Amount</div>
                    </div>
                    <div className="space-y-3">
                      {lineItems.map((item, i) => (
                        <div key={i} className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-8">
                            <input 
                              type="text"
                              placeholder="Line item description..."
                              value={item.description}
                              onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                              className="w-full h-11 px-4 bg-[#F7F6F2] border border-[#1E19141A] rounded-lg text-xs font-medium focus:outline-none focus:border-primary transition-colors"
                            />
                          </div>
                          <div className="col-span-3">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B3B2AE] text-xs">$</span>
                              <input 
                                type="number"
                                value={item.amount || ''}
                                onChange={(e) => updateLineItem(i, 'amount', e.target.value)}
                                className="w-full h-11 pl-7 pr-4 bg-[#F7F6F2] border border-[#1E19141A] rounded-lg text-xs font-medium focus:outline-none focus:border-primary transition-colors"
                              />
                            </div>
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <button 
                              onClick={() => removeLineItem(i)}
                              className={cn(
                                "p-2 text-[#B3B2AE] hover:text-[#D96C75] transition-colors",
                                lineItems.length === 1 && "opacity-0 pointer-events-none"
                              )}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={addLineItem}
                      className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#6B6860] hover:text-[#111110] transition-colors py-2"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add item
                    </button>
                  </div>
                  
                  <div className="bg-[#F7F6F2] p-6 rounded-xl border border-[#1E19141A] flex justify-between items-center mt-8">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#6B6860]">Total Amount</span>
                    <span className="text-2xl font-bold text-[#1A1816]">{formatCurrency(totalAmount)}</span>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="px-6 py-3 rounded-lg text-xs font-bold text-[#6B6860] hover:bg-[#F7F6F2] transition-colors"
                    >
                      ← Back
                    </button>
                    <button 
                      onClick={() => totalAmount > 0 && setStep(3)}
                      disabled={totalAmount <= 0}
                      className="bg-[#111110] text-white px-8 py-3 rounded-lg text-xs font-bold hover:bg-[#1A1917] transition-colors disabled:opacity-50"
                    >
                      Finalize →
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="p-8 lg:p-12 space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#6B6860]">Issue Date</label>
                      <input 
                        type="date"
                        value={invoiceData.issuedDate}
                        onChange={(e) => setInvoiceData({...invoiceData, issuedDate: e.target.value})}
                        className="w-full h-11 px-4 bg-[#F7F6F2] border border-[#1E19141A] rounded-lg text-xs font-medium focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#6B6860]">Due Date</label>
                      <input 
                        type="date"
                        value={invoiceData.dueDate}
                        onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                        className="w-full h-11 px-4 bg-[#F7F6F2] border border-[#1E19141A] rounded-lg text-xs font-medium focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="bg-[#111110] text-[#F7F6F2] rounded-xl p-8 shadow-premium relative overflow-hidden">
                     <div className="relative z-10">
                        <h4 className="font-display text-xl italic mb-1 text-[#D96C75]">Smart Sequences Ready</h4>
                        <p className="text-sm text-[#B3B2AE] leading-relaxed">
                          ChasePro will handle follow-ups automatically if this isn't paid by the due date.
                        </p>
                      </div>
                      <Sparkles className="absolute top-0 right-0 h-32 w-32 -mr-8 -mt-8 opacity-10 text-white" />
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      onClick={() => setStep(2)}
                      className="px-6 py-3 rounded-lg text-xs font-bold text-[#6B6860] hover:bg-[#F7F6F2] transition-colors"
                    >
                      ← Back
                    </button>
                    <button 
                      onClick={handleSubmit}
                      className="bg-[#D96C75] text-white px-10 py-4 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#C55B64] transition-all shadow-lg"
                    >
                      Start Chasing Invoice
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default NewInvoice;
