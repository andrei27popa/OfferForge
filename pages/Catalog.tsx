import React, { useState, useEffect } from 'react';
import { CatalogItem, ItemType, VatMode } from '../types';
import { getCatalog, saveCatalogItem, deleteCatalogItem, getCompanyProfile } from '../utils/storage';
import { Plus, Trash2, Edit2, X, Search } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

export default function Catalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | ItemType>('ALL');
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [formData, setFormData] = useState<Partial<CatalogItem>>({});

  useEffect(() => {
    setItems(getCatalog());
  }, []);

  const openModal = (item?: CatalogItem) => {
    const profile = getCompanyProfile();
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        type: ItemType.SERVICE,
        name: '',
        unit: 'buc',
        unitPrice: 0,
        vatMode: profile.vatPayer ? VatMode.EXCLUSIVE : VatMode.EXEMPT,
        vatRate: profile.defaultVatRate
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || formData.unitPrice === undefined) return;
    const newItem: CatalogItem = {
      id: editingItem ? editingItem.id : crypto.randomUUID(),
      type: formData.type || ItemType.SERVICE,
      name: formData.name,
      description: formData.description,
      unit: formData.unit || 'buc',
      unitPrice: Number(formData.unitPrice),
      vatMode: formData.vatMode || VatMode.EXCLUSIVE,
      vatRate: Number(formData.vatRate) || 0.19
    };
    saveCatalogItem(newItem);
    setItems(getCatalog());
    setIsModalOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this item?")) {
      deleteCatalogItem(id);
      setItems(getCatalog());
    }
  };

  const filteredItems = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'ALL' ? true : i.type === activeTab;
    return matchSearch && matchTab;
  });

  return (
    <div className="pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Catalog</h1>
        <button className="p-2 bg-white rounded-full shadow-sm">
           <MoreVerticalIcon size={20} className="text-slate-400" />
        </button>
      </div>

      <div className="relative mb-6">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
         <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full bg-white border-none rounded-[1.5rem] py-3.5 pl-12 pr-4 shadow-sm text-slate-700 font-medium outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
         />
      </div>

      <div className="bg-slate-200 p-1 rounded-2xl flex mb-6">
         {['ALL', ItemType.PRODUCT, ItemType.SERVICE].map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab as any)}
             className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
               activeTab === tab 
               ? 'bg-primary-400 text-slate-900 shadow-sm' 
               : 'text-slate-500 hover:text-slate-800'
             }`}
           >
             {tab === 'ALL' ? 'All' : tab === ItemType.PRODUCT ? 'Products' : 'Services'}
           </button>
         ))}
      </div>

      <div className="space-y-4">
        {filteredItems.map(item => (
          <div key={item.id} onClick={() => openModal(item)} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 relative group cursor-pointer hover:scale-[1.01] transition-transform">
             <div className="flex justify-between items-start">
               <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{item.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 max-w-[200px] leading-relaxed">
                     {item.description || 'No description available.'}
                  </p>
                  <div className="flex gap-2 mt-3">
                     <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${item.type === ItemType.SERVICE ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.type}
                     </span>
                     <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500">
                        {item.vatRate * 100}% VAT
                     </span>
                  </div>
               </div>
               <div className="text-right">
                  <span className="block text-xl font-extrabold text-slate-900">{formatCurrency(item.unitPrice, 'RON')}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{item.unit}</span>
               </div>
             </div>
             
             {/* Delete Reveal */}
             <div className="absolute top-0 bottom-0 right-0 w-20 bg-red-500 rounded-r-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => handleDelete(e, item.id)} className="text-white p-2"><Trash2 /></button>
             </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button 
        onClick={() => openModal()}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary-400 text-slate-900 rounded-full shadow-xl shadow-primary-200 flex items-center justify-center hover:scale-110 transition-transform z-20"
      >
        <Plus size={32} />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center md:p-4">
          <div className="bg-white w-full md:max-w-md md:rounded-[2.5rem] rounded-t-[2.5rem] p-6 shadow-2xl animate-slide-up">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-extrabold text-slate-900">{editingItem ? 'Edit Item' : 'New Item'}</h3>
               <button onClick={() => setIsModalOpen(false)}><X /></button>
             </div>

             <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 ml-2 mb-1 block">ITEM NAME</label>
                  <input 
                     className="w-full bg-slate-50 rounded-2xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-primary-200" 
                     placeholder="e.g. Logo Design"
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                  />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 ml-2 mb-1 block">DESCRIPTION</label>
                  <textarea 
                     className="w-full bg-slate-50 rounded-2xl px-4 py-3 font-medium text-slate-700 outline-none h-24 resize-none" 
                     placeholder="Describe the item..."
                     value={formData.description || ''}
                     onChange={e => setFormData({...formData, description: e.target.value})}
                  />
               </div>
               <div className="flex gap-4">
                  <div className="flex-1">
                     <label className="text-xs font-bold text-slate-500 ml-2 mb-1 block">PRICE</label>
                     <input 
                        type="number"
                        className="w-full bg-slate-50 rounded-2xl px-4 py-3 font-semibold text-slate-900 outline-none" 
                        placeholder="0.00"
                        value={formData.unitPrice}
                        onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})}
                     />
                  </div>
                  <div className="w-1/3">
                      <label className="text-xs font-bold text-slate-500 ml-2 mb-1 block">UNIT</label>
                      <input 
                        className="w-full bg-slate-50 rounded-2xl px-4 py-3 font-semibold text-slate-900 outline-none" 
                        value={formData.unit}
                        onChange={e => setFormData({...formData, unit: e.target.value})}
                      />
                  </div>
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 ml-2 mb-1 block">TYPE</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl">
                     <button 
                        onClick={() => setFormData({...formData, type: ItemType.PRODUCT})}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold ${formData.type === ItemType.PRODUCT ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                     >Product</button>
                     <button 
                        onClick={() => setFormData({...formData, type: ItemType.SERVICE})}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold ${formData.type === ItemType.SERVICE ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                     >Service</button>
                  </div>
               </div>
             </div>

             <button 
               onClick={handleSave}
               className="w-full bg-primary-400 hover:bg-primary-500 text-slate-900 font-extrabold py-4 rounded-full shadow-lg shadow-primary-200 mt-8"
             >
               Save Item
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

const MoreVerticalIcon = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
);