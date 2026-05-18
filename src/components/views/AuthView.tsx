import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, TrendingUp, Chrome, ArrowLeft, AlertCircle } from 'lucide-react';
import { GROUPS_CONFIG, UserProfile } from '../../types';
import { auth, db, googleProvider } from '../../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface Props {
  onBack: () => void;
  onLogin: (profile: UserProfile) => void;
}

export function AuthView({ onBack, onLogin }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = (email: string) => email === 'guilhermfroes@auredigital.com.br';

  const saveUserProfile = async (uid: string, email: string, name: string, group: string) => {
    const role = isAdmin(email) ? 'admin' : 'client';
    const profile: UserProfile = { uid, email, name, role, groupId: group || undefined };
    await setDoc(doc(db, 'users', uid), profile);
    return profile;
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if profile exists
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        onLogin(docSnap.data() as UserProfile);
      } else {
        // Only allow first login if admin or if they choose a group (in a real app we might want more flow here)
        const profile = await saveUserProfile(user.uid, user.email!, user.displayName || 'Usuário', '');
        onLogin(profile);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const docRef = doc(db, 'users', result.user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          onLogin(docSnap.data() as UserProfile);
        } else {
          // Fallback if profile missing
          const profile = await saveUserProfile(result.user.uid, email, email.split('@')[0], '');
          onLogin(profile);
        }
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        const profile = await saveUserProfile(result.user.uid, email, name, groupId);
        onLogin(profile);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="bg-brand-medium border border-brand-light p-8 md:p-10 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-purple/20 border border-brand-purple/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-brand-purple" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Set-up Operação</h2>
          </div>

          <div className="flex gap-4 p-1 bg-brand-dark rounded-xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${isLogin ? 'bg-brand-light text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${!isLogin ? 'bg-brand-light text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Cadastro
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Ex: João Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-brand-dark border border-brand-light rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-purple/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Sua Operação</label>
                  <select 
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="w-full bg-brand-dark border border-brand-light rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-purple/50 transition-colors appearance-none"
                    required
                  >
                    <option value="" disabled>Selecione seu grupo</option>
                    {GROUPS_CONFIG.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-light rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-purple/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-light rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-purple/50 transition-colors"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all transform active:scale-[0.98] mt-4 disabled:opacity-50"
            >
              {loading ? 'Processando...' : (isLogin ? 'Entrar no Painel' : 'Criar minha Conta')}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-light/30"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-gray-500">
              <span className="bg-brand-medium px-4 font-bold">Ou continue com</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-gray-100 text-black rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50"
          >
            <Chrome className="w-5 h-5" /> Google Sync
          </button>
        </div>
      </motion.div>
    </div>
  );
}
