import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/Sidebar';
import { useAuth } from '../components/AuthProvider';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Invoice, Client } from '../types';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  ExternalLink, 
  MoreVertical,
  ArrowUpDown,
  Mail,
  Eye,
  CreditCard,
  AlertCircle,
  FileText
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const StatusBadge = ({ status }: { status: Invoice['status'] }) => {
  const styles = {
    draft: 'bg-text-faint/10 text-text-faint border-text-faint/20',
    sent: 'bg-primary/10 text-primary border-primary/20',
    viewed: 'bg-warning/10 text-warning border-warning/20',
    partial: 'bg-accent/10 text-accent border-accent/20',
    paid: 'bg-success/10 text-success border-success/20',
    overdue: 'bg-error/10 text-error border-error/20',
    written_off: 'bg-dark-surface text-white border-dark-border'
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      styles[status] || styles.draft
    )}>
      {status.replace('_', ' ')}
    </span>
  );
};

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch Clients first for mapping
        const clientsPath = 'clients';
        const clientsRef = collection(db, clientsPath);
        const clientsSnap = await getDocs(query(clientsRef, where('userId', '==', user.uid)));
        const clientsData: Record<string, Client> = {};
        clientsSnap.docs.forEach(doc => {
          clientsData[doc.id] = { id: doc.id, ...doc.data() } as Client;
        });
        setClients(clientsData);

        // Fetch Invoices
        const invoicesPath = 'invoices';
        const invoicesRef = collection(db, invoicesPath);
        const q = query(invoicesRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[];
        setInvoices(data);
      } catch (error) {
        // Since there are two collections, we can genericize the error path or use the first one that fails
        handleFirestoreError(error, OperationType.LIST, 'invoices/clients');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredInvoices = invoices.filter(invoice => {
    const clientName = clients[invoice.clientId]?.name?.toLowerCase() || '';
    const invoiceNum = invoice.invoiceNumber.toLowerCase();
    const desc = invoice.description.toLowerCase();
    const matchesSearch = clientName.includes(search.toLowerCase()) || 
                          invoiceNum.includes(search.toLowerCase()) ||
                          desc.includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || invoice.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppLayout>
      <div className="flex-1 min-h-screen bg-[#F7F6F2] -m-8">
        <header className="h-16 border-b border-[#1E19141A] bg-white flex items-center justify-between px-8 sticky top-0 z-40">
          <div>
            <h1 className="text-lg font-bold text-[#1A1816]">Invoices</h1>
            <p className="text-[10px] text-[#6B6860] uppercase tracking-wider font-bold -mt-1">Manage billing</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/invoices/new"
              className="bg-[#D96C75] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#C55B64] transition-colors shadow-sm"
            >
              New Invoice
            </Link>
          </div>
        </header>

        <main className="p-8">
          <div className="bg-white border border-[#1E19141A] rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#1E19141A] flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B6860]" />
                <input 
                  type="text" 
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F7F6F2] border border-[#1E19141A] rounded-lg text-xs font-medium focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {['all', 'draft', 'sent', 'overdue', 'paid'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all",
                      filter === f 
                        ? "bg-[#111110] text-white" 
                        : "bg-[#F7F6F2] text-[#6B6860] hover:text-[#111110]"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead>
                  <tr className="bg-[#F7F6F2] text-[10px] uppercase tracking-widest font-bold text-[#6B6860]">
                    <th className="px-6 py-4">Invoice</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E19141A]">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-6"><div className="h-3 bg-[#F7F6F2] rounded w-24"></div></td>
                        <td className="px-6 py-6"><div className="h-3 bg-[#F7F6F2] rounded w-32"></div></td>
                        <td className="px-6 py-6"><div className="h-3 bg-[#F7F6F2] rounded w-16"></div></td>
                        <td className="px-6 py-6"><div className="h-3 bg-[#F7F6F2] rounded w-20"></div></td>
                        <td className="px-6 py-6"><div className="h-5 bg-[#F7F6F2] rounded-full w-16"></div></td>
                        <td className="px-6 py-6 text-right"><div className="h-3 bg-[#F7F6F2] rounded w-6 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredInvoices.length > 0 ? filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-[#F7F6F2]/30 transition-colors group">
                      <td className="px-6 py-4">
                        <Link to={`/invoices/${invoice.id}`} className="text-sm font-bold text-[#1A1816] group-hover:text-primary transition-colors block">
                          #{invoice.invoiceNumber}
                        </Link>
                        <span className="text-[10px] text-[#6B6860] uppercase font-bold tracking-tight">{invoice.description}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-[#F7F6F2] flex items-center justify-center text-[10px] font-bold text-[#1A1816]">
                            {clients[invoice.clientId]?.name?.charAt(0) || '?'}
                          </div>
                          <span className="text-sm text-[#1A1816] font-medium">{clients[invoice.clientId]?.name || 'Unknown Client'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-[#6B6860]">
                        {invoice.issuedDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-[#1A1816]">{formatCurrency(invoice.amount, invoice.currency)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Link 
                            to={`/invoices/${invoice.id}`}
                            className="p-1.5 rounded-lg hover:bg-[#F7F6F2] text-[#6B6860] hover:text-[#1A1816] transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <button className="p-1.5 rounded-lg hover:bg-[#F7F6F2] text-[#6B6860] hover:text-[#1A1816] transition-colors">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#6B6860]">
                         <p className="text-sm">No invoices found matching your criteria.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default Invoices;
