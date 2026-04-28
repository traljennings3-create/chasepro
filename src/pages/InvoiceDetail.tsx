import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '../components/Sidebar';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Invoice, Client, ChaseLog } from '../types';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Eye, 
  Send, 
  Pause, 
  Play, 
  FileEdit,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  MessageSquare,
  MoreHorizontal
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { toast } from 'sonner';

const TimelineNode = ({ event, isLast }: { event: any, isLast?: boolean, key?: any }) => {
  const icons: Record<string, any> = {
    created: { icon: FileEdit, color: 'text-text-faint bg-surface-2' },
    sent: { icon: Send, color: 'text-primary bg-primary/10' },
    viewed: { icon: Eye, color: 'text-warning bg-warning/10' },
    reminder: { icon: Clock, color: 'text-accent bg-accent/10' },
    paid: { icon: CheckCircle2, color: 'text-success bg-success/10' }
  };

  const { icon: Icon, color } = icons[event.type] || icons.sent;

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {!isLast && <div className="absolute left-[15px] top-[30px] bottom-0 w-0.5 bg-border"></div>}
      <div className={cn("absolute left-0 top-0 h-8 w-8 rounded-full flex items-center justify-center border-4 border-surface z-10", color)}>
        <Icon className="h-3 w-3" />
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-sm">{event.title}</span>
          <span className="text-[10px] uppercase tracking-wider text-text-faint font-bold">{event.time}</span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">{event.description}</p>
      </div>
    </div>
  );
};

const InvoiceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    const fetchData = async () => {
      try {
        const invRef = doc(db, 'invoices', id);
        const invSnap = await getDoc(invRef);
        if (!invSnap.exists()) return;
        const invData = { id: invSnap.id, ...invSnap.data() } as Invoice;
        setInvoice(invData);

        const clientRef = doc(db, 'clients', invData.clientId);
        const clientSnap = await getDoc(clientRef);
        if (clientSnap.exists()) {
          setClient({ id: clientSnap.id, ...clientSnap.data() } as Client);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, id]);

  const togglePause = async () => {
    if (!invoice) return;
    try {
      const invRef = doc(db, 'invoices', invoice.id);
      await updateDoc(invRef, { reminderPaused: !invoice.reminderPaused });
      setInvoice({ ...invoice, reminderPaused: !invoice.reminderPaused });
      toast.success(invoice.reminderPaused ? "Chasing resumed" : "Chasing paused");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const markAsPaid = async () => {
    if (!invoice) return;
    try {
      const invRef = doc(db, 'invoices', invoice.id);
      const now = Date.now();
      await updateDoc(invRef, { status: 'paid', paidDate: now });
      setInvoice({ ...invoice, status: 'paid', paidDate: now });
      toast.success("Invoice marked as paid!");
    } catch (err) {
      toast.error("Failed to mark as paid");
    }
  };

  if (loading) return <AppLayout><div className="animate-pulse h-96 bg-surface-2 rounded-2xl"></div></AppLayout>;
  if (!invoice) return <AppLayout><div>Invoice not found</div></AppLayout>;

  const timelineEvents = [
    { type: 'created', title: 'Invoice Created', description: `Invoice #${invoice.invoiceNumber} was created and scheduled.`, time: 'April 28, 9:51 PM' },
    { type: 'sent', title: 'Sent to Client', description: `Emailed to ${client?.email}`, time: 'April 28, 9:52 PM' },
    { type: 'viewed', title: 'Client Viewed', description: `Invoice was opened via mobile device from New York, NY.`, time: 'April 28, 10:15 PM' },
    // Ongoing events would go here
  ];

  if (invoice.status === 'paid') {
    timelineEvents.push({ type: 'paid', title: 'Payment Received', description: `Full payment of ${formatCurrency(invoice.amount)} received via Stripe.`, time: 'Today' });
  }

  return (
    <AppLayout>
      <div className="flex-1 min-h-screen bg-[#F7F6F2] -m-8">
        <header className="h-16 border-b border-[#1E19141A] bg-white flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <Link to="/invoices" className="p-2 rounded-lg hover:bg-[#F7F6F2] text-[#6B6860] transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[#1A1816]">Invoice Detail</h1>
              <p className="text-[10px] text-[#6B6860] uppercase tracking-wider font-bold -mt-1">#{invoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {invoice.status !== 'paid' && (
              <button 
                onClick={markAsPaid}
                className="bg-[#111110] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#1A1917] transition-colors shadow-sm"
              >
                Mark as Paid
              </button>
            )}
          </div>
        </header>

        <main className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-8">
              {/* Main Card */}
              <section className="bg-white border border-[#1E19141A] rounded-xl p-8 shadow-sm">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-display italic mb-2">{invoice.description}</h2>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                        invoice.status === 'paid' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      )}>
                        {invoice.status}
                      </span>
                      <span className="text-xs text-[#6B6860] font-medium">Issued {invoice.issuedDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#1A1816] mb-1">{formatCurrency(invoice.amount, invoice.currency)}</div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-[#6B6860]">Due {invoice.dueDate}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-[#1E19141A] mb-8">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#6B6860] mb-3">Recipient</h4>
                    <p className="font-bold text-[#1A1816] mb-1">{client?.name}</p>
                    <p className="text-sm text-[#6B6860]">{client?.company}</p>
                    <p className="text-sm text-[#6B6860] mt-2">{client?.email}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#6B6860] mb-3">Automated Chasing</h4>
                    <div className="flex items-center justify-between mb-4">
                       <span className={cn("text-sm font-medium", invoice.reminderPaused ? "text-orange-600" : "text-green-600")}>
                        {invoice.reminderPaused ? 'Paused' : 'Active'}
                      </span>
                      <button 
                        onClick={togglePause}
                        className="text-xs font-bold text-[#111110] hover:underline transition-all"
                      >
                        {invoice.reminderPaused ? 'Resume' : 'Pause'}
                      </button>
                    </div>
                    <div className="h-1.5 w-full bg-[#F7F6F2] rounded-full overflow-hidden">
                       <div className="h-full bg-[#111110] w-3/4" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 bg-[#F7F6F2] border border-[#1E19141A] text-[#1A1816] py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#F0EFED] transition-colors">
                    <Send className="h-3.5 w-3.5" />
                    Send Manual Reminder
                  </button>
                  <button className="px-4 bg-white border border-[#1E19141A] text-[#1A1816] py-3 rounded-lg hover:bg-[#F7F6F2] transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </section>

              {/* Items Table */}
              <section className="bg-white border border-[#1E19141A] rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-[#F7F6F2] border-b border-[#1E19141A]">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#6B6860]">Billable Items</h3>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest font-bold text-[#6B6860] border-b border-[#1E19141A]">
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Rate</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E19141A]">
                    {invoice.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 text-sm font-medium text-[#1A1816]">{item.description}</td>
                        <td className="px-6 py-4 text-sm text-[#6B6860]">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm text-[#6B6860]">{formatCurrency(item.rate, invoice.currency)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-[#1A1816] text-right">{formatCurrency(item.quantity * item.rate, invoice.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>

            <div className="w-full lg:w-96 space-y-8">
              <section className="bg-white border border-[#1E19141A] rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Chase Timeline</h3>
                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-[#1E19141A]">
                  {timelineEvents.map((event, i) => (
                    <div key={i} className="relative pl-8">
                      <div className="absolute left-0 top-1 h-[22px] w-[22px] rounded-full border border-[#1E19141A] bg-white flex items-center justify-center z-10">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#111110]" />
                      </div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-[#1A1816]">{event.title}</span>
                        <span className="text-[10px] text-[#6B6860] uppercase font-bold">{event.time.split(',')[1]}</span>
                      </div>
                      <p className="text-xs text-[#6B6860]">{event.description}</p>
                    </div>
                  ))}
                  
                  {invoice.status !== 'paid' && !invoice.reminderPaused && (
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1 h-[22px] w-[22px] rounded-full border border-[#1E19141A] bg-[#F7F6F2] flex items-center justify-center z-10 border-dashed">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#6B6860] opacity-30" />
                      </div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-[#6B6860]">Next Reminder</span>
                      </div>
                      <p className="text-xs text-[#B3B2AE] italic font-medium">Scheduled for May 1st</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-[#111110] text-[#F7F6F2] rounded-xl p-6 shadow-premium">
                <h3 className="text-lg font-display italic mb-2 text-[#D96C75]">AI Intelligence</h3>
                <p className="text-sm text-[#B3B2AE] mb-6">"Acme Corp usually pays when reminded via SMS rather than email. Would you like to switch the channel?"</p>
                <button className="w-full bg-[#D96C75] text-white py-3 rounded-lg text-xs font-bold hover:bg-[#C55B64] transition-colors">
                  Switch to SMS
                </button>
              </section>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default InvoiceDetail;
