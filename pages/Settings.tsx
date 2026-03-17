import React, { useState, useEffect } from 'react';
import { CompanyProfile, Currency } from '../types';
import { getCompanyProfile, saveCompanyProfile } from '../utils/storage';
import { Save, Camera, ArrowRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: '',
    cui: '',
    regNo: '',
    address: '',
    phone: '',
    email: '',
    iban: '',
    bank: '',
    defaultCurrency: Currency.RON,
    vatPayer: true,
    defaultVatRate: 0.19
  });
  
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const data = getCompanyProfile();
    setProfile(data);
  }, []);

  const handleSave = () => {
    if(!profile.companyName) return alert("Numele companiei este obligatoriu!");
    saveCompanyProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-8">
         <button onClick={() => navigate(-1)}><ChevronLeft /></button>
         <h1 className="text-xl font-bold text-slate-900">Company Profile</h1>
         <button onClick={handleSave} className="text-sm font-bold text-primary-600">Save</button>
      </div>

      <div className="flex flex-col items-center mb-8">
         <div className="w-28 h-28 bg-slate-800 rounded-full flex items-center justify-center relative mb-4 shadow-xl shadow-slate-200">
             <div className="w-16 h-16 bg-[#FACC15] rounded-tl-full rounded-br-full opacity-80"></div>
             <button className="absolute bottom-0 right-0 p-2 bg-primary-400 rounded-full shadow-md border-4 border-[#F8FAFC]">
                <Camera size={18} />
             </button>
         </div>
         <p className="text-slate-400 text-sm font-medium">Tap to upload logo</p>
      </div>

      <div className="space-y-8">
         
         <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Business Details</h2>
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 ml-4 mb-1 block">COMPANY NAME</label>
                  <input 
                     className="w-full bg-white rounded-2xl px-6 py-4 font-semibold text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-primary-200" 
                     value={profile.companyName}
                     onChange={e => setProfile({...profile, companyName: e.target.value})}
                     placeholder="e.g. Acme Corp"
                  />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 ml-4 mb-1 block">REGISTRATION / VAT NUMBER</label>
                  <input 
                     className="w-full bg-white rounded-2xl px-6 py-4 font-semibold text-slate-900 shadow-sm outline-none" 
                     value={profile.cui}
                     onChange={e => setProfile({...profile, cui: e.target.value})}
                     placeholder="Tax ID"
                  />
               </div>
            </div>
         </section>

         <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Contact & Location</h2>
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 ml-4 mb-1 block">STREET ADDRESS</label>
                  <input 
                     className="w-full bg-white rounded-2xl px-6 py-4 font-semibold text-slate-900 shadow-sm outline-none" 
                     value={profile.address}
                     onChange={e => setProfile({...profile, address: e.target.value})}
                     placeholder="123 Innovation Dr."
                  />
               </div>
               <div className="flex gap-4">
                  <div className="flex-1">
                     <label className="text-xs font-bold text-slate-500 ml-4 mb-1 block">EMAIL</label>
                     <input 
                        className="w-full bg-white rounded-2xl px-6 py-4 font-semibold text-slate-900 shadow-sm outline-none" 
                        value={profile.email}
                        onChange={e => setProfile({...profile, email: e.target.value})}
                     />
                  </div>
                  <div className="flex-1">
                     <label className="text-xs font-bold text-slate-500 ml-4 mb-1 block">PHONE</label>
                     <input 
                        className="w-full bg-white rounded-2xl px-6 py-4 font-semibold text-slate-900 shadow-sm outline-none" 
                        value={profile.phone}
                        onChange={e => setProfile({...profile, phone: e.target.value})}
                     />
                  </div>
               </div>
            </div>
         </section>

         <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Preferences</h2>
            <div>
               <label className="text-xs font-bold text-slate-500 ml-4 mb-1 block">DEFAULT CURRENCY</label>
               <select 
                  className="w-full bg-white rounded-2xl px-6 py-4 font-semibold text-slate-900 shadow-sm outline-none appearance-none" 
                  value={profile.defaultCurrency}
                  onChange={e => setProfile({...profile, defaultCurrency: e.target.value as Currency})}
               >
                  <option value={Currency.RON}>RON (lei)</option>
                  <option value={Currency.USD}>USD ($)</option>
                  <option value={Currency.EUR}>EUR (€)</option>
               </select>
            </div>
            <p className="text-xs text-slate-400 mt-2 ml-4">This currency will be applied to all new offers automatically.</p>
         </section>

         <button 
            onClick={handleSave}
            className="w-full bg-primary-400 hover:bg-primary-500 text-slate-900 font-extrabold py-4 rounded-full shadow-lg shadow-primary-200 flex items-center justify-center gap-2 text-lg mt-8"
         >
            Save & Continue <ArrowRight size={20} />
         </button>
      </div>
    </div>
  );
}