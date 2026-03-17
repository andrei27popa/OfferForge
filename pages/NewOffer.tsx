
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Search, Minus, UserPlus, ChevronRight, ArrowRight, Download, Mail, Check, X as XIcon, Save, Users } from 'lucide-react';
import { Offer, OfferLineItem, VatMode, OfferStatus, Currency, CompanyProfile, Client } from '../types';
import { calculateLineItem, calculateOfferTotals, formatCurrency } from '../utils/calculations';
import { getNextOfferNumber, saveOffer, getOfferById, getCompanyProfile, getCatalog, getClients, saveClient } from '../utils/storage';
import { generatePDF } from '../utils/pdfGenerator';

const EmptyItem: OfferLineItem = {
  id: '', name: '', quantity: 1, unit: 'buc', unitPrice: 0,
  vatMode: VatMode.EXCLUSIVE, vatRate: 0.19,
  lineTotalExVat: 0, lineVatAmount: 0, lineTotalInclVat: 0
};

export default function NewOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [savedClients, setSavedClients] = useState<Client[]>([]);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isClientExpanded, setIsClientExpanded] = useState(true);

  const [offer, setOffer] = useState<Offer>({
    id: crypto.randomUUID(), offerNumber: '', createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: OfferStatus.PENDING, clientName: '', currency: Currency.RON,
    items: [], subtotalExVat: 0, totalVat: 0, grandTotal: 0, template: 'classic'
  });

  useEffect(() => {
    const profile = getCompanyProfile();
    setCompany(profile);
    setCatalogItems(getCatalog());
    setSavedClients(getClients());

    if (id) {
      const existing = getOfferById(id);
      if (existing) {
        setOffer(existing);
        setIsClientExpanded(false);
      } else navigate('/');
    } else {
      setOffer(prev => ({
        ...prev,
        offerNumber: getNextOfferNumber(),
        currency: profile.defaultCurrency,
        items: [{ ...EmptyItem, id: crypto.randomUUID(), vatRate: profile.defaultVatRate, vatMode: profile.vatPayer ? VatMode.EXCLUSIVE : VatMode.EXEMPT }]
      }));
    }
  }, [id, navigate]);

  useEffect(() => {
    const totals = calculateOfferTotals(offer.items);
    setOffer(prev => ({ ...prev, ...totals }));
  }, [offer.items]);

  const handleItemChange = (index: number, field: keyof OfferLineItem, value: any) => {
    const newItems = [...offer.items];
    const item = { ...newItems[index], [field]: value };
    const computed = calculateLineItem(
      field === 'quantity' ? Number(value) : item.quantity,
      field === 'unitPrice' ? Number(value) : item.unitPrice,
      field === 'vatMode' ? value : item.vatMode,
      field === 'vatRate' ? Number(value) : item.vatRate
    );
    newItems[index] = { ...item, ...computed };
    setOffer(prev => ({ ...prev, items: newItems }));
  };

  // Fix: Defining addItem
  const addItem = () => {
    setOffer(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { 
          ...EmptyItem, 
          id: crypto.randomUUID(), 
          vatRate: company?.defaultVatRate || 0.19, 
          vatMode: company?.vatPayer ? VatMode.EXCLUSIVE : VatMode.EXEMPT 
        }
      ]
    }));
  };

  // Fix: Defining removeItem
  const removeItem = (index: number) => {
    if (offer.items.length <= 1) return;
    const newItems = offer.items.filter((_, i) => i !== index);
    setOffer(prev => ({ ...prev, items: newItems }));
  };

  const handleSaveClientFromOffer = () => {
    if (!offer.clientName) return alert("Completați numele clientului!");
    const client: Client = {
      id: crypto.randomUUID(),
      name: offer.clientName,
      company: offer.clientCompany,
      email: offer.clientEmail,
      address: offer.clientAddress
    };
    saveClient(client);
    setSavedClients(getClients());
    alert("Client salvat în baza de date!");
  };

  const selectSavedClient = (clientId: string) => {
    const c = savedClients.find(client => client.id === clientId);
    if (c) {
      setOffer(prev => ({
        ...prev,
        clientName: c.name,
        clientCompany: c.company || '',
        clientEmail: c.email || '',
        clientAddress: c.address || ''
      }));
      setIsClientExpanded(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!company) return;
    saveOffer(offer);
    generatePDF(offer, company);
  };

  const handleSendEmail = () => {
    if (!offer.clientEmail) return alert("Clientul nu are adresă de email setată!");
    const subject = encodeURIComponent(`Ofertă Comercială ${offer.offerNumber}`);
    const body = encodeURIComponent(`Bună ziua,\n\nVă transmitem atașat oferta noastră comercială ${offer.offerNumber}.\n\nCu stimă,\n${company?.companyName}`);
    window.location.href = `mailto:${offer.clientEmail}?subject=${subject}&body=${body}`;
    setOffer(prev => ({ ...prev, status: OfferStatus.SENT }));
    saveOffer({ ...offer, status: OfferStatus.SENT });
  };

  return (
    <div className="pb-40">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{id ? 'Editare Ofertă' : 'Ofertă Nouă'}</h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">{offer.offerNumber}</p>
          </div>
        </div>
        
        {/* Status Picker Pills */}
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
          {[OfferStatus.PENDING, OfferStatus.ACCEPTED, OfferStatus.REFUSED].map(status => (
            <button
              key={status}
              onClick={() => setOffer(prev => ({ ...prev, status }))}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                offer.status === status 
                ? (status === OfferStatus.ACCEPTED ? 'bg-green-500 text-white shadow-md' : status === OfferStatus.REFUSED ? 'bg-red-500 text-white shadow-md' : 'bg-orange-400 text-white shadow-md')
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {status === OfferStatus.PENDING ? 'În așteptare' : status === OfferStatus.ACCEPTED ? 'Acceptată' : 'Refuzată'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Client Management Card */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                <UserPlus size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{offer.clientName || 'Detalii Client'}</h3>
                <p className="text-xs text-slate-400 font-medium">{offer.clientCompany || 'Căutați sau introduceți manual'}</p>
              </div>
            </div>
            <button onClick={() => setIsClientExpanded(!isClientExpanded)} className={`p-2 rounded-full hover:bg-slate-50 transition-transform ${isClientExpanded ? 'rotate-90' : ''}`}>
              <ChevronRight size={24} className="text-slate-300" />
            </button>
          </div>

          {isClientExpanded && (
            <div className="space-y-4 animate-fade-in">
              {savedClients.length > 0 && (
                <div className="relative mb-4">
                   <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <select 
                      className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 outline-none appearance-none"
                      onChange={(e) => selectSavedClient(e.target.value)}
                      defaultValue=""
                   >
                      <option value="" disabled>Încarcă un client salvat...</option>
                      {savedClients.map(c => <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
                   </select>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Nume Client *" 
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-semibold outline-none focus:ring-2 focus:ring-primary-200"
                  value={offer.clientName} onChange={e => setOffer({...offer, clientName: e.target.value})}
                />
                <input 
                  type="text" placeholder="Companie" 
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-semibold outline-none focus:ring-2 focus:ring-primary-200"
                  value={offer.clientCompany} onChange={e => setOffer({...offer, clientCompany: e.target.value})}
                />
                <input 
                  type="email" placeholder="Email Contact" 
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-semibold outline-none focus:ring-2 focus:ring-primary-200"
                  value={offer.clientEmail} onChange={e => setOffer({...offer, clientEmail: e.target.value})}
                />
                <input 
                  type="text" placeholder="Adresă" 
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-semibold outline-none focus:ring-2 focus:ring-primary-200"
                  value={offer.clientAddress} onChange={e => setOffer({...offer, clientAddress: e.target.value})}
                />
              </div>
              
              <button 
                onClick={handleSaveClientFromOffer}
                className="flex items-center gap-2 text-primary-600 font-bold text-xs px-4 py-2 hover:bg-primary-50 rounded-xl transition-all"
              >
                <Save size={16} /> Salvează acest client în bază
              </button>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="text-lg font-bold text-slate-900">Articole Ofertă</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{offer.items.length} PRODUSE</span>
          </div>

          <div className="space-y-4">
            {offer.items.map((item, index) => (
              <div key={item.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="flex-1 space-y-3">
                    <input 
                      type="text" placeholder="Denumire Produs/Serviciu"
                      className="w-full font-bold text-lg text-slate-900 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-200"
                      value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)}
                    />
                    <textarea 
                      placeholder="Descriere tehnică/detalii..."
                      className="w-full text-xs text-slate-400 bg-transparent border-none p-0 focus:ring-0 resize-none h-12"
                      value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)}
                    />
                  </div>
                  <button onClick={() => removeItem(index)} className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl">
                    <button onClick={() => handleItemChange(index, 'quantity', Math.max(1, item.quantity - 1))} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900"><Minus size={16} /></button>
                    {/* QUANTITY INPUT: EDITABLE DIRECTLY */}
                    <input 
                      type="number"
                      className="w-16 text-center bg-transparent border-none p-0 font-bold text-slate-900 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                    <button onClick={() => handleItemChange(index, 'quantity', item.quantity + 1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900"><Plus size={16} /></button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Preț Unitar</p>
                      <input 
                        type="number" 
                        className="text-right font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 w-24"
                        value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)}
                      />
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="text-[10px] font-bold text-primary-600 uppercase">Total Linie</p>
                      <p className="font-extrabold text-slate-900">{formatCurrency(item.lineTotalInclVat, offer.currency)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={addItem} className="flex-1 py-5 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold hover:border-primary-400 hover:text-primary-600 transition-all flex items-center justify-center gap-2">
              <Plus size={20} /> Adaugă Linie Nouă
            </button>
            <button onClick={() => setIsCatalogModalOpen(true)} className="w-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center hover:bg-slate-800 shadow-lg transition-all">
              <Search size={24} />
            </button>
          </div>
        </div>

        {/* Totals Section */}
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-4 shadow-xl shadow-slate-200">
           <div className="flex justify-between items-center text-slate-400">
              <span className="font-bold">Subtotal (fără TVA)</span>
              <span className="font-mono">{formatCurrency(offer.subtotalExVat, offer.currency)}</span>
           </div>
           <div className="flex justify-between items-center text-slate-400">
              <span className="font-bold">TVA Total</span>
              <span className="font-mono">{formatCurrency(offer.totalVat, offer.currency)}</span>
           </div>
           <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <div>
                 <span className="block text-xs font-bold text-primary-400 uppercase tracking-widest mb-1">Total General</span>
                 <span className="text-3xl font-black">{formatCurrency(offer.grandTotal, offer.currency)}</span>
              </div>
              <div className="bg-slate-800 px-4 py-2 rounded-2xl text-primary-400 font-black text-sm">
                {offer.currency}
              </div>
           </div>
        </div>
      </div>

      {/* STICKY SPLIT ACTION BAR */}
      <div className="fixed bottom-8 left-0 right-0 px-6 md:pl-80 max-w-4xl mx-auto w-full z-20 flex gap-4">
         <button 
           onClick={handleDownloadPDF}
           className="flex-1 bg-white text-slate-900 border-2 border-slate-100 font-black py-5 rounded-[2rem] shadow-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95"
         >
            <Download size={22} /> PDF
         </button>
         <button 
           onClick={handleSendEmail}
           className="flex-1 bg-primary-400 text-slate-900 font-black py-5 rounded-[2rem] shadow-xl shadow-primary-200/50 hover:bg-primary-500 transition-all flex items-center justify-center gap-3 active:scale-95"
         >
            <Mail size={22} /> TRIMITE EMAIL <ArrowRight size={20} />
         </button>
      </div>

      {/* Catalog Modal */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-xl rounded-[3rem] max-h-[80vh] flex flex-col shadow-2xl animate-slide-up overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <h3 className="font-black text-2xl text-slate-900">Catalog Produse</h3>
                 <button onClick={() => setIsCatalogModalOpen(false)} className="bg-white p-3 rounded-full shadow-sm hover:text-red-500 transition-colors"><XIcon size={24} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-3 no-scrollbar">
                 {catalogItems.map(item => (
                    <div key={item.id} onClick={() => {
                        handleItemChange(offer.items.length - 1, 'name', item.name);
                        handleItemChange(offer.items.length - 1, 'unitPrice', item.unitPrice);
                        handleItemChange(offer.items.length - 1, 'description', item.description);
                        setIsCatalogModalOpen(false);
                    }} className="p-5 border border-slate-100 rounded-3xl hover:border-primary-400 cursor-pointer flex justify-between items-center bg-slate-50 hover:bg-white transition-all">
                       <div>
                          <p className="font-bold text-slate-900 text-lg">{item.name}</p>
                          <p className="text-xs text-slate-400 font-bold uppercase">{item.unitPrice} {Currency.RON} / {item.unit}</p>
                       </div>
                       <div className="bg-primary-400 p-2 rounded-xl text-slate-900 shadow-sm"><Plus size={20} /></div>
                    </div>
                 ))}
                 {catalogItems.length === 0 && <div className="text-center p-12 text-slate-300 font-bold">Catalogul este gol. Adaugă produse în setări.</div>}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
