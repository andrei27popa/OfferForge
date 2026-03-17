
import React, { useState, useEffect } from 'react';
import { getOffers } from '../utils/storage';
import { Offer, OfferStatus } from '../types';
import { Link } from 'react-router-dom';
import { FileText, Search, MoreHorizontal, FileDown, Copy, Edit, Check, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { generatePDF } from '../utils/pdfGenerator';
import { getCompanyProfile } from '../utils/storage';

const StatusBadge = ({ status }: { status: OfferStatus }) => {
  const styles = {
    [OfferStatus.DRAFT]: 'bg-slate-100 text-slate-500',
    [OfferStatus.SENT]: 'bg-[#FDF099] text-yellow-800',
    // Fix: Using ACCEPTED instead of EDITED
    [OfferStatus.ACCEPTED]: 'bg-blue-100 text-blue-700' 
  };
  
  const labels = {
    [OfferStatus.DRAFT]: 'DRAFT',
    [OfferStatus.SENT]: 'SENT',
    // Fix: Using ACCEPTED instead of EDITED
    [OfferStatus.ACCEPTED]: 'ACCEPTED'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide ${styles[status] || styles[OfferStatus.DRAFT]}`}>
      {labels[status] || labels[OfferStatus.DRAFT]}
    </span>
  );
};

export default function History() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'SENT'>('ALL');

  useEffect(() => {
    setOffers(getOffers());
  }, []);

  const filteredOffers = offers.filter(o => {
    const matchesSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || o.offerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' 
      ? true 
      : filter === 'DRAFT' 
        ? o.status === OfferStatus.DRAFT 
        // Fix: Using ACCEPTED instead of EDITED
        : (o.status === OfferStatus.SENT || o.status === OfferStatus.ACCEPTED);
    return matchesSearch && matchesFilter;
  });

  const handleDownload = (e: React.MouseEvent, offer: Offer) => {
    e.preventDefault();
    const profile = getCompanyProfile();
    generatePDF(offer, profile);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-slate-500 font-medium text-sm">Welcome back</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Offer History</h1>
        </div>
        <div className="w-10 h-10 bg-primary-400 rounded-full flex items-center justify-center shadow-lg shadow-primary-200 cursor-pointer hover:scale-110 transition-transform">
           <Link to="/new"><Plus size={20} className="text-slate-900" /></Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
         <input 
            type="text" 
            placeholder="Search offers by name or ID..." 
            className="w-full bg-white border-none rounded-[1.5rem] py-4 pl-12 pr-4 shadow-sm text-slate-700 font-medium focus:ring-2 focus:ring-primary-300 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
         {['ALL', 'DRAFT', 'SENT'].map((f) => (
           <button
             key={f}
             onClick={() => setFilter(f as any)}
             className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
               filter === f 
               ? 'bg-slate-900 text-white shadow-lg' 
               : 'bg-white text-slate-600 hover:bg-slate-100'
             }`}
           >
             {f}
           </button>
         ))}
      </div>

      {/* List */}
      <div className="space-y-4">
         {filteredOffers.length === 0 ? (
           <div className="text-center py-10 text-slate-400">Nu am găsit oferte.</div>
         ) : (
           filteredOffers.map(offer => (
             <Link to={`/new/${offer.id}`} key={offer.id} className="block bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 hover:shadow-md transition-shadow relative group">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700">
                         {offer.clientCompany ? <span className="font-bold text-xs">{offer.clientCompany.substring(0,2).toUpperCase()}</span> : <FileText size={20} />}
                      </div>
                      <div>
                         <h3 className="font-bold text-lg text-slate-900">{offer.clientName}</h3>
                         <p className="text-xs text-slate-400 font-semibold">{offer.offerNumber} • {new Date(offer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                   </div>
                   <button className="text-slate-300 hover:text-slate-600 p-1">
                      <MoreHorizontal size={20} />
                   </button>
                </div>
                
                <div className="flex items-center justify-between">
                   <StatusBadge status={offer.status} />
                   <span className="text-xl font-extrabold text-slate-900">{formatCurrency(offer.grandTotal, offer.currency)}</span>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-[2rem] flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                   <button onClick={(e) => handleDownload(e, offer)} className="flex flex-col items-center gap-1 text-slate-600 hover:text-primary-600">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><FileDown size={18} /></div>
                      <span className="text-[10px] font-bold">PDF</span>
                   </button>
                   <div className="flex flex-col items-center gap-1 text-slate-600 hover:text-primary-600">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><Edit size={18} /></div>
                      <span className="text-[10px] font-bold">Edit</span>
                   </div>
                </div>
             </Link>
           ))
         )}
      </div>
    </div>
  );
}
