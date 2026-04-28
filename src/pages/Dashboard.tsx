import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/Sidebar';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Invoice, Client } from '../types';
import { motion } from 'motion/react';
import { 
  Zap,
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Users,
  Send,
  MoreHorizontal,
  ArrowUpRight,
  Eye,
  TrendingUp,
  Settings
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const KPICard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white border border-[#1E19141A] rounded-xl p-5 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 rounded-lg bg-[#F7F6F2]">
        <Icon className="h-5 w-5" style={{ color: color }} />
      </div>
      {change && (
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
          change.startsWith('+') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        )}>
          {change}
        </span>
      )}
    </div>
    <p className="text-[10px] uppercase font-bold tracking-widest text-[#6B6860] mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-[#1A1816]">{value}</h3>
  </div>
);

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    totalOverdue: 0,
    paidThisMonth: 0,
    avgDaysToPay: 0,
    collectionRate: 0
  });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const invoicesRef = collection(db, 'invoices');
        const q = query(invoicesRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[];
        setInvoices(data);

        // Calculate stats
        const outstanding = data.filter(i => i.status !== 'paid' && i.status !== 'written_off').reduce((acc, curr) => acc + curr.amount, 0);
        const overdue = data.filter(i => i.status === 'overdue').reduce((acc, curr) => acc + curr.amount, 0);
        const paidThisMonth = data.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0); // Simplified month calculation
        
        setStats({
          totalOutstanding: outstanding,
          totalOverdue: overdue,
          paidThisMonth,
          avgDaysToPay: 12, // Mock for now
          collectionRate: 94 // Mock for now
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const activeInvoices = invoices.filter(i => i.status !== 'paid').slice(0, 5);

  const chartData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 5000 },
    { name: 'Apr', amount: 4500 },
    { name: 'May', amount: 6000 },
    { name: 'Jun', amount: 5500 },
  ];

  return (
    <AppLayout>
      <div className="flex-1 min-h-screen bg-[#F7F6F2] -m-8">
        <header className="h-16 border-b border-[#1E19141A] bg-white flex items-center justify-between px-8 sticky top-0 z-40">
          <div>
            <h1 className="text-lg font-bold text-[#1A1816]">Dashboard</h1>
            <p className="text-[10px] text-[#6B6860] uppercase tracking-wider font-bold -mt-1">Overview</p>
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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard 
              title="Total Outstanding" 
              value={formatCurrency(stats.totalOutstanding)} 
              icon={Clock} 
              change={invoices.length > 0 ? `+${invoices.length}` : '0'}
              color="#D96C75" 
            />
            <KPICard 
              title="Avg. Payment Time" 
              value={`${stats.avgDaysToPay} days`} 
              icon={Zap} 
              change="-2 days"
              color="#6B6860" 
            />
            <KPICard 
              title="Total Overdue" 
              value={formatCurrency(stats.totalOverdue)} 
              icon={AlertCircle} 
              change="Needs action"
              color="#D96C75" 
            />
            <KPICard 
              title="Collection Rate" 
              value={`${stats.collectionRate}%`} 
              icon={CheckCircle} 
              change="+0.5%"
              color="#111110" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Main Chart */}
              <section className="bg-white border border-[#1E19141A] rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold">Revenue Flow</h2>
                    <p className="text-xs text-[#6B6860]">Last 6 months projection vs actual</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-[10px] font-bold uppercase text-[#6B6860]">Revenue</span>
                    </div>
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                        tickFormatter={(value) => `$${value/1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="var(--primary)" 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Recent Activity / Invoices */}
              <section className="bg-white border border-[#1E19141A] rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[#1E19141A] flex justify-between items-center">
                  <h2 className="text-lg font-bold">Recent Invoices</h2>
                  <Link to="/invoices" className="text-[10px] font-bold uppercase tracking-widest text-[#6B6860] hover:text-[#1A1816] transition-colors">View All</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#F7F6F2] text-[10px] uppercase tracking-widest font-bold text-[#6B6860]">
                        <th className="px-6 py-4">Invoice</th>
                        <th className="px-6 py-4">Client</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E19141A]">
                      {invoices.slice(0, 5).map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-[#F7F6F2]/50 transition-colors group">
                          <td className="px-6 py-4">
                            <Link to={`/invoices/${invoice.id}`} className="text-sm font-bold text-[#1A1816] group-hover:text-primary">#{invoice.invoiceNumber}</Link>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#6B6860]">{invoice.clientName || 'Unknown Client'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-[#1A1816]">{formatCurrency(invoice.amount)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                              invoice.status === 'paid' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                            )}>
                              {invoice.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-[#111110] text-[#F7F6F2] rounded-xl p-6 shadow-premium relative overflow-hidden">
                 <div className="relative z-10">
                  <h2 className="text-xl font-display italic mb-2">Automate your chasing</h2>
                  <p className="text-sm text-[#B3B2AE] mb-6">Let AI handle the "hey just checking in" emails while you focus on work.</p>
                  <button className="w-full bg-[#D96C75] text-white rounded-lg py-3 text-sm font-bold hover:bg-[#C55B64] transition-colors">
                    Setup Sequences
                  </button>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Zap className="h-24 w-24" />
                </div>
              </section>

              <section className="bg-white border border-[#1E19141A] rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Needs Attention</h2>
                <div className="space-y-4">
                  {activeInvoices.length > 0 ? activeInvoices.slice(0, 3).map((invoice, i) => (
                    <Link key={i} to={`/invoices/${invoice.id}`} className="flex gap-3 items-start group">
                      <div className={cn("mt-0.5 p-1 rounded bg-[#F7F6F2]", invoice.status === 'overdue' ? 'text-red-500' : 'text-[#6B6860]')}>
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm text-[#1A1816] group-hover:text-primary transition-colors">
                        Invoice #{invoice.invoiceNumber} is {invoice.status.replace('_', ' ')}
                      </p>
                    </Link>
                  )) : (
                    <p className="text-sm text-[#6B6860]">All caught up!</p>
                  )}
                </div>
              </section>

              <section className="bg-white border border-[#1E19141A] rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-6">Recent Activity</h2>
                <div className="space-y-6">
                  {[
                    { user: 'Sarah', action: 'viewed your invoice', desc: 'Web Design Project', time: '2m ago', icon: Eye, iconColor: 'text-primary bg-primary/10' },
                    { user: 'ChasePro', action: 'sent a reminder to', desc: 'Acme Corp', time: '1h ago', icon: Send, iconColor: 'text-orange-500 bg-orange-50' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center mt-0.5", item.iconColor)}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="text-[#1A1816] leading-tight">
                          <span className="font-bold">{item.user}</span> {item.action} <span className="font-semibold">{item.desc}</span>
                        </p>
                        <span className="text-[10px] text-[#6B6860] uppercase font-bold tracking-wider">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
