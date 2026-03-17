
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { saveUserSession } from '../utils/storage';

export default function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login/signup
    if (email && password) {
      // Fix: saveUserSession requires id and role property
      saveUserSession({
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
        role: 'ADMIN',
        isLoggedIn: true
      });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <div className="bg-primary-300 p-4 rounded-[2rem] mb-8 shadow-lg shadow-primary-200">
        <Rocket size={48} className="text-slate-900" />
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
        {isSignUp ? 'Creează Cont' : 'Bine ai revenit'}
      </h1>
      <p className="text-slate-500 font-medium mb-8 text-center max-w-xs">
        {isSignUp 
          ? 'Începe să trimiți oferte profesionale în câteva secunde.' 
          : 'Loghează-te pentru a accesa ofertele tale.'}
      </p>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="text-xs font-bold text-slate-500 ml-4 mb-2 block">EMAIL ADDRESS</label>
            <input 
              type="email"
              required
              placeholder="name@business.com"
              className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-primary-300 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
             <label className="text-xs font-bold text-slate-500 ml-4 mb-2 block">PASSWORD</label>
             <div className="relative">
               <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-primary-300 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
               />
               <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
               >
                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
             </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary-400 hover:bg-primary-500 text-slate-900 font-extrabold py-4 rounded-full shadow-lg shadow-primary-200 flex items-center justify-center gap-2 text-lg transform transition-transform active:scale-95"
          >
             {isSignUp ? 'Sign Up' : 'Log In'} <ArrowRight size={20} />
          </button>

        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium text-sm">
            {isSignUp ? 'Ai deja un cont?' : 'Nu ai un cont?'}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-600 font-bold ml-1 hover:underline"
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
