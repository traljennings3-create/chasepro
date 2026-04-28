import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/Sidebar';
import { useAuth } from '../components/AuthProvider';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { Client } from '../types';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  BadgeCheck, 
  AlertTriangle,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const PayScoreBadge = ({ score }: { score: number }) => {
  let color = 'text-success bg-success/10 border-success/20';
  let label = 'Reliable payer';
  
  if (score < 40) {
    color = 'text-error bg-error/10 border-error/20';
    label = 'Chronically late';
  } else if (score < 70) {
    color = 'text-warning bg-warning/10 border-warning/20';
    label = 'Occasionally late';
  }

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold whitespace-nowrap", color)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
      {score} — {label}
    </div>
  );
};

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', company: '' });

  useEffect(() => {
    if (!user) return;
    const fetchClients = async () => {
      const path = 'clients';
      try {
        const q = query(collection(db, path), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Client));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [user]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const path = 'clients';
    try {
      const clientPayload = {
        ...newClient,
        userId: user.uid,
        payScore: 85, // Default score
        tags: [],
        preferredChannel: 'email',
        createdAt: Date.now()
      };
      const docRef = await addDoc(collection(db, path), clientPayload);
      setClients([{ id: docRef.id, ...clientPayload } as Client, ...clients]);
      setIsAdding(false);
      setNewClient({ name: '', email: '', company: '' });
      toast.success("Client added successfully");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex-1 min-h-screen bg-[#F7F6F2] -m-8">
        <header className="h-16 border-b border-[#1E19141A] bg-white flex items-center justify-between px-8 sticky top-0 z-40">
          <div>
            <h1 className="text-lg font-bold text-[#1A1816]">Clients</h1>
            <p className="text-[10px] text-[#6B6860] uppercase tracking-wider font-bold -mt-1">Directory</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#111110] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#1A1917] transition-colors shadow-sm"
            >
              Add Client
            </button>
          </div>
        </header>

        <main className="p-8">
          <div className="mb-8 flex justify-between items-center">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B6860]" />
              <input 
                type="text" 
                placeholder="Find a client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#1E19141A] rounded-lg text-xs font-medium focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isAdding && (
              <div className="bg-white rounded-xl border border-dashed border-[#D96C75] p-6 shadow-sm">
                <form onSubmit={handleAddClient} className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#6B6860]">New Client</h3>
                  <input 
                    autoFocus
                    placeholder="Full Name"
                    className="w-full bg-[#F7F6F2] border border-[#1E19141A] rounded-lg p-2 text-xs font-medium outline-none"
                    value={newClient.name}
                    onChange={e => setNewClient({...newClient, name: e.target.value})}
                    required
                  />
                  <input 
                    placeholder="Email Address"
                    className="w-full bg-[#F7F6F2] border border-[#1E19141A] rounded-lg p-2 text-xs font-medium outline-none"
                    value={newClient.email}
                    onChange={e => setNewClient({...newClient, email: e.target.value})}
                    required
                    type="email"
                  />
                  <input 
                    placeholder="Company Name"
                    className="w-full bg-[#F7F6F2] border border-[#1E19141A] rounded-lg p-2 text-xs font-medium outline-none"
                    value={newClient.company}
                    onChange={e => setNewClient({...newClient, company: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-[#111110] text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest">Save</button>
                    <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6B6860]">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {filteredClients.map((client) => (
              <div 
                key={client.id}
                className="bg-white border border-[#1E19141A] rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="h-10 w-10 rounded-lg bg-[#F7F6F2] flex items-center justify-center text-sm font-bold text-[#1A1816]">
                    {client.name.charAt(0)}
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    client.payScore > 70 ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-700 border-orange-100"
                  )}>
                    Score: {client.payScore}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-display italic text-[#1A1816] group-hover:text-primary transition-colors">{client.name}</h3>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#6B6860]">{client.company || 'Private'}</p>
                </div>

                <div className="space-y-3 mb-8 pt-6 border-t border-[#1E19141A]">
                  <div className="flex items-center gap-3 text-xs font-medium text-[#6B6860]">
                    <Mail className="h-3.5 w-3.5 opacity-50" />
                    {client.email}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-[#6B6860]">
                    <Users className="h-3.5 w-3.5 opacity-50" />
                    {client.avgDaysToPay ? `~${client.avgDaysToPay} day turnaround` : 'New Client'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/clients/${client.id}`} className="flex-1 py-2 text-center rounded-lg border border-[#1E19141A] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F6F2] transition-colors">Profile</Link>
                  <Link to="/invoices/new" className="flex-1 py-2 text-center rounded-lg bg-[#F7F6F2] text-[#1A1816] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F0EFED] transition-colors">Bill</Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default Clients;
