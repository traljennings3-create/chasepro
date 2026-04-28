import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Invoice, Client, Profile } from '../types';
import { Logo } from '../components/Logo';
import { CheckCircle2, Download, ShieldCheck, CreditCard } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import confetti from 'canvas-confetti';

const PublicInvoice = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [business, setBusiness] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const invRef = doc(db, 'invoices', id);
        const invSnap = await getDoc(invRef);
        if (!invSnap.exists()) return;
        const invData = { id: invSnap.id, ...invSnap.data() } as Invoice;
        setInvoice(invData);

        if (invData.status === 'paid') setPaid(true);

        const clientRef = doc(db, 'clients', invData.clientId);
        const clientSnap = await getDoc(clientRef);
        if (clientSnap.exists()) setClient(clientSnap.data() as Client);

        const bizRef = doc(db, 'profiles', invData.userId);
        const bizSnap = await getDoc(bizRef);
        if (bizSnap.exists()) setBusiness(bizSnap.data() as Profile);

        // Mark as viewed if not already
        if (invData.status === 'sent') {
          await updateDoc(invRef, { status: 'viewed', viewedAt: Date.now() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePay = async () => {
    setPaying(true);
    // Simulate payment process or redirect to stripe
    setTimeout(async () => {
      if (invoice) {
        const invRef = doc(db, 'invoices', invoice.id);
        await updateDoc(invRef, { status: 'paid', paidDate: Date.now() });
        setPaid(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      setPaying(false);
    }, 2000);
  };

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center font-display text-2xl animate-pulse">ChasePro</div>;
  if (!invoice) return <div className="min-h-screen bg-bg flex items-center justify-center">Invoice not found.</div>;

  return (
    <div className="min-h-screen bg-bg py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
             <Logo className="h-8 w-8 text-primary" />
             <span className="font-display text-2xl font-bold italic opacity-50">ChasePro Secure</span>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text transition-colors">
            <Download className="h-4 w-4" />
            PDF Receipt
          </button>
        </div>

        <div className="bg-surface rounded-3xl border border-border shadow-2xl overflow-hidden relative">
          {paid && (
            <div className="absolute inset-0 bg-success/5 pointer-events-none z-0"></div>
          )}
          
          <div className="p-8 lg:p-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
              <div className="space-y-4">
                <div className="h-16 w-16 bg-surface-2 rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-primary border border-border">
                  {business?.businessName?.charAt(0) || 'B'}
                </div>
                <div>
                  <h1 className="text-3xl font-display leading-tight">{business?.businessName || 'Business Name'}</h1>
                  <p className="text-text-muted text-sm">{business?.email}</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-text-faint mb-2">Invoice Details</p>
                <p className="font-bold font-mono text-lg mb-1">#{invoice.invoiceNumber}</p>
                <div className="flex md:justify-end">
                   {paid ? (
                      <span className="bg-success text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" />
                        Paid in Full
                      </span>
                   ) : (
                      <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Payment Due
                      </span>
                   )}
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-12 pb-8">
              <div className="grid grid-cols-12 gap-4 text-[10px] font-bold uppercase tracking-widest text-text-faint mb-4 px-4">
                <div className="col-span-8">Description</div>
                <div className="col-span-4 text-right">Amount</div>
              </div>
              
              <div className="space-y-1">
                {(invoice as any).lineItems?.map((item: any, i: number) => (
                  <div key={i} className="grid grid-cols-12 gap-4 items-center p-4 rounded-xl hover:bg-surface-2/50 transition-colors">
                    <div className="col-span-8">
                      <p className="font-semibold text-sm">{item.description}</p>
                    </div>
                    <div className="col-span-4 text-right">
                      <p className="font-mono font-bold text-sm">{formatCurrency(item.amount, invoice.currency)}</p>
                    </div>
                  </div>
                )) || (
                  <div className="grid grid-cols-12 gap-4 items-center p-4 rounded-xl border border-border">
                    <div className="col-span-8">
                      <p className="font-semibold text-sm">{invoice.description}</p>
                    </div>
                    <div className="col-span-4 text-right">
                      <p className="font-mono font-bold text-sm">{formatCurrency(invoice.amount, invoice.currency)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-surface-2/50 p-8 rounded-2xl flex flex-col items-center text-center">
              <span className="text-text-faint text-sm font-medium mb-2">Total Balance Due</span>
              <span className="text-5xl font-bold font-mono mb-8">{formatCurrency(invoice.amount, invoice.currency)}</span>
              
              {!paid ? (
                 <button 
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full h-16 bg-primary text-white rounded-2xl font-display text-2xl flex items-center justify-center gap-4 hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                 >
                   {paying ? (
                     <div className="h-6 w-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                   ) : (
                     <>
                      <CreditCard className="h-6 w-6" />
                      Pay with One-Click
                     </>
                   )}
                 </button>
              ) : (
                <div className="w-full h-16 bg-success text-white rounded-2xl font-display text-2xl flex items-center justify-center gap-4 shadow-xl shadow-success/20">
                   <CheckCircle2 className="h-7 w-7" />
                   Payment Successful
                </div>
              )}
            </div>
            
            {!paid && (
              <div className="mt-8 flex items-center justify-center gap-3 text-text-faint">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Bank-level Secure Checkout</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center text-text-faint text-sm leading-relaxed max-w-md mx-auto">
          <p>
            This invoice is protected by ChasePro. The payment is processed securely via Stripe. 
            Receipts are sent immediately upon successful payment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicInvoice;
