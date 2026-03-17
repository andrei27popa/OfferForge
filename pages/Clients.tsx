
import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { getClients, saveClient, deleteClient } from '../utils/storage';
import { Plus, Search, Trash2, Edit2, X, User, Phone, Mail, MapPin } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});

  useEffect(() => {
    setClients(getClients());
  }, []);

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({ ...client });
    } else {
      setEditingClient(null);
      setFormData({ name: '', company: '', email: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return alert("Numele clientului este obligatoriu!");
    const newClient: Client = {
      id: editingClient ? editingClient.id : crypto.randomUUID(),
      name: formData.name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      address: formData.address
    };
    saveClient(newClient);
    setClients(getClients());
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Ești sigur că vrei să ștergi acest client? Această acțiune nu poate fi anulată.")) {
      deleteClient(id);
      setClients(getClients());
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-black text-slate-900">Bază Clienți</h1>
           <p className="text-slate-400 text-sm font-medium">Gestionează relațiile comerciale</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary-400 p-4 rounded-2xl shadow-lg shadow-primary-200 hover:bg-primary-500 transition-all transform active:scale-95"
        >
          <Plus size={24} className="text-slate-900" />
        </button>
      </div>

      <div className="relative">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
         <input 
            type="text" 
            placeholder="Caută după nume sau companie..." 
            className="w-full bg-white rounded-3xl py-5 pl-16 pr-6 shadow-sm border border-slate-50 font-semibold outline-none focus:ring-2 focus:ring-primary-200"
            value={search}
            onChange={e => setSearch(e.target.value)}
         />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredClients.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                {/* Fix: Using UsersIcon helper instead of missing Users from lucide-react */}
                <UsersIcon size={32} />
             </div>
             <p className="text-slate-400 font-bold">Nu există clienți în listă.</p>
          </div>
        ) : (
          filteredClients.map(client => (
            <div key={client.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center font-black text-xl">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">{client.name}</h3>
                    <p className="text-primary-600 text-xs font-bold uppercase tracking-wider">{client.company || 'Persoană Fizică'}</p>
                    <div className="flex flex-wrap gap-4 mt-2">
                       {client.email && (
                         <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                            <Mail size={12} /> {client.email}
                         </div>
                       )}
                       {client.phone && (
                         <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                            <Phone size={12} /> {client.phone}
                         </div>
                       )}
                    </div>
                  </div>
               </div>
               
               <div className="flex gap-2">
                  <button onClick={() => openModal(client)} className="flex-1 md:flex-none p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors">
                     <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="flex-1 md:flex-none p-3 bg-slate-50 text-red-400 rounded-2xl hover:bg-red-50 transition-colors">
                     <Trash2 size={18} />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-slide-up">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-slate-900">{editingClient ? 'Editează Client' : 'Client Nou'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 rounded-full"><X size={20} /></button>
             </div>

             <div className="space-y-4">
               <div className="grid grid-cols-1 gap-4">
                 <input 
                    placeholder="Nume Complet / Contact Principal *"
                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-primary-200"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                 />
                 <input 
                    placeholder="Companie / Entitate Juridică"
                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-primary-200"
                    value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
                 />
                 <input 
                    placeholder="Email"
                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-primary-200"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                 />
                 <input 
                    placeholder="Telefon"
                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-primary-200"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                 />
                 <textarea 
                    placeholder="Adresă Sediu / Livrare"
                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-primary-200 h-24 resize-none"
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                 />
               </div>
             </div>

             <button 
               onClick={handleSave}
               className="w-full bg-primary-400 hover:bg-primary-500 text-slate-900 font-black py-5 rounded-[2rem] shadow-xl shadow-primary-200 mt-10"
             >
               Salvează Client
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

const UsersIcon = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
