import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Mail,
  Clock
} from 'lucide-react';
import { Logo } from './Logo';
import { logout } from '../lib/firebase';
import { useAuth } from './AuthProvider';
import { cn } from '../lib/utils';

export const Sidebar = () => {
  const { profile } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Invoices', icon: FileText, path: '/invoices' },
    { name: 'Clients', icon: Users, path: '/clients' },
    { name: 'Sequences', icon: Clock, path: '/sequences' },
    { name: 'Templates', icon: Mail, path: '/templates' },
    { name: 'Reports', icon: TrendingUp, path: '/reports' },
  ];

  return (
    <div className="w-64 h-screen bg-[#111110] text-[#F7F6F2] border-r border-[#1E19141A] flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <Logo className="h-8 w-8 text-primary" />
        <span className="font-display text-xl font-semibold tracking-tight italic">ChasePro</span>
      </div>

      <div className="text-[#B3B2AE] text-[10px] uppercase tracking-widest font-bold px-7 py-2 mt-4">Main Menu</div>
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
              isActive 
                ? "bg-[#1A1917] text-white" 
                : "text-[#6B6860] hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 mb-4">
          <div className="h-10 w-10 rounded-full bg-[#D96C75] flex items-center justify-center text-white font-bold">
            {profile?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate text-[#F7F6F2]">{profile?.fullName?.split(' ')[0] || 'User'}</span>
            <span className="text-[10px] text-[#B3B2AE] truncate lowercase">{profile?.plan} plan</span>
          </div>
        </div>
        
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-[#D96C75] hover:bg-[#D96C75]/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
