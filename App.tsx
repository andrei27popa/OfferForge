import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, ShoppingBag, Settings, Plus, Menu, X, Rocket, User as UserIcon, LogOut, Users } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import NewOffer from './pages/NewOffer';
import History from './pages/History';
import Catalog from './pages/Catalog';
import SettingsPage from './pages/Settings';
import ClientsPage from './pages/Clients';
import Login from './pages/Login';
import { getCompanyProfile, getUserSession, clearUserSession } from './utils/storage';

const SidebarLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all font-medium ${
      active 
        ? 'bg-slate-900 text-white shadow-lg' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    <span>{label}</span>
  </Link>
);

const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const session = getUserSession();
    if (!session && location.pathname !== '/login') {
      navigate('/login');
    }
    setUser(session);
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    clearUserSession();
    navigate('/login');
  };

  if (location.pathname === '/login') return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md z-30 px-6 py-4 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="bg-primary-400 p-2 rounded-xl">
             <Rocket className="text-slate-900" size={20} />
          </div>
          <span className="font-bold text-xl text-slate-900">OfferForge</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block flex flex-col py-6 px-4
      `}>
        <div className="flex-1">
          <div className="h-20 flex items-center px-4 mb-8">
            <div className="bg-primary-300 p-2.5 rounded-2xl mr-3 shadow-sm">
              <Rocket className="text-slate-900" size={24} />
            </div>
            <span className="font-extrabold text-2xl text-slate-900">OfferForge</span>
          </div>

          <div className="space-y-1">
            <SidebarLink to="/" icon={LayoutDashboard} label="Overview" active={location.pathname === '/'} />
            <SidebarLink to="/history" icon={FileText} label="Oferte & Comenzi" active={location.pathname === '/history'} />
            <SidebarLink to="/clients" icon={Users} label="Clienți" active={location.pathname === '/clients'} />
            <SidebarLink to="/catalog" icon={ShoppingBag} label="Produse & Servicii" active={location.pathname === '/catalog'} />
            <SidebarLink to="/settings" icon={Settings} label="Setări Companie" active={location.pathname === '/settings'} />
          </div>
        </div>

        {/* User Profile / Login Bottom Left */}
        <div className="mt-auto border-t border-slate-100 pt-6">
          {user ? (
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-3xl group">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-primary-400 rounded-full flex items-center justify-center text-slate-900 shrink-0">
                  <UserIcon size={20} />
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm"
                title="Deconectare"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-3 bg-slate-900 text-white p-4 rounded-3xl hover:bg-slate-800 transition-colors">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                <UserIcon size={20} />
              </div>
              <span className="font-bold">Autentificare</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-24 md:pt-0 overflow-y-auto h-screen relative no-scrollbar">
        <div className="max-w-4xl mx-auto p-6 md:p-10 pb-32">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewOffer />} />
          <Route path="/new/:id" element={<NewOffer />} />
          <Route path="/history" element={<History />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}