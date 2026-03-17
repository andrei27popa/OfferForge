
import React, { useEffect, useState } from 'react';
import { getOffers, getCompanyProfile } from '../utils/storage';
import { Offer, OfferStatus } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, Clock, Plus, ArrowRight, History, Wallet, Bell } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentOffers, setRecentOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState({ pendingCount: 0, pendingValue: 0, acceptedCount: 0 });
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const profile = getCompanyProfile();
    setCompanyName(profile.companyName || 'Apex Inc.'); // Default from prototype if empty

    const allOffers = getOffers();
    setRecentOffers(allOffers.slice(0, 4));

    const pending = allOffers.filter(o => o.status === OfferStatus.DRAFT || o.status === OfferStatus.SENT);
    // Fix: OfferStatus.EDITED does not exist, using OfferStatus.ACCEPTED instead
    const accepted = allOffers.filter(o => o.status === OfferStatus.ACCEPTED); 

    const pendingVal = pending.reduce((acc, curr) => acc + (curr.currency === 'RON' ? curr.grandTotal : 0), 0);

    setStats({
      pendingCount: pending.length,
      pendingValue: pendingVal,
      acceptedCount: allOffers.filter(o => o.status === OfferStatus.SENT).length // Treating SENT as 'Completed/Accepted' for stat purposes
    });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-slate-500 font-medium">Bine ai revenit,</p>
          <h1 className="text-2xl font-extrabold text-slate-900">{companyName}</h1>
        </div>
        <div className="relative p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <Bell size={24} className="text-slate-700" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </div>
      </div>

      {/* Hero Banner */}
      <div 
        onClick={() => navigate('/new')}
        className="bg-primary-300 rounded-[2.5rem] p-8 flex justify-between items-center cursor-pointer hover:bg-primary-400 transition-colors shadow-lg shadow-primary-200/50 group"
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
            Creează o<br/>Ofertă Nouă
          </h2>
          <p className="text-slate-800 font-medium opacity-80">Trimite oferta în secunde</p>
        </div>
        <div className="w-16 h-16 bg-[#FDF099] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus size={32} className="text-slate-900" strokeWidth={2.5} />
        </div>
      </div>

      {/* Overview Stats */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Pending Card */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col justify-between h-40">
            <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-2">
              <Clock size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-3xl font-extrabold text-slate-900">
                  {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON', maximumFractionDigits: 0 }).format(stats.pendingValue)}
                </h4>
              </div>
              <p className="text-slate-500 font-medium">În așteptare ({stats.pendingCount})</p>
            </div>
          </div>

          {/* Accepted Card */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col justify-between h-40">
             <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-2">
              <CheckCircle size={20} />
            </div>
            <div>
              <h4 className="text-3xl font-extrabold text-slate-900">{stats.acceptedCount}</h4>
              <p className="text-slate-500 font-medium">Trimise / Acceptate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Acces Rapid</h3>
        <div className="grid grid-cols-2 gap-4">
           <Link to="/history" className="bg-slate-800 rounded-[2rem] p-6 text-white relative overflow-hidden group h-32 flex flex-col justify-end shadow-lg shadow-slate-200">
             <History className="absolute top-4 right-4 text-slate-600 group-hover:text-slate-400 transition-colors" size={40} />
             <span className="font-bold text-lg relative z-10">Istoric</span>
             <span className="text-slate-400 text-sm">Vezi oferte trecute</span>
           </Link>
           <Link to="/catalog" className="bg-[#6B705C] rounded-[2rem] p-6 text-white relative overflow-hidden group h-32 flex flex-col justify-end shadow-lg shadow-slate-200">
             <Wallet className="absolute top-4 right-4 text-[#A5A58D] group-hover:text-white transition-colors" size={40} />
             <span className="font-bold text-lg relative z-10">Catalog</span>
             <span className="text-slate-200 text-sm">Produse & Servicii</span>
           </Link>
        </div>
      </div>

      {/* Recent Activity List */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-bold text-slate-900">Activitate Recentă</h3>
          <Link to="/history" className="text-sm font-semibold text-slate-500 hover:text-slate-900">Vezi tot</Link>
        </div>
        
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-50">
          {recentOffers.length === 0 ? (
            <p className="text-center text-slate-400 py-4">Fără activitate recentă.</p>
          ) : (
            <div className="space-y-1">
              {recentOffers.map(offer => (
                <Link to={`/new/${offer.id}`} key={offer.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{offer.clientName || 'Client Nou'}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {offer.offerNumber} • {new Date(offer.createdAt).toLocaleDateString('ro-RO')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(offer.grandTotal, offer.currency)}</p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full inline-block mt-1 ${
                      offer.status === OfferStatus.SENT ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {offer.status === OfferStatus.SENT ? 'TRIMIS' : 'CIORNĂ'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
