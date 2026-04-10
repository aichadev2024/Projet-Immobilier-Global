'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Crown, Key, User, Phone } from 'lucide-react';
import Link from 'next/link';

export default function AdminRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    nomUtilisateur: '',
    password: '',
    confirmPassword: '',
    telephone: '',
  });
  const [role, setRole] = useState<'ADMIN'>('ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }


    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          username: formData.nomUtilisateur || formData.email,
          password: formData.password,
          roleType: role,
          telephone: formData.telephone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erreur lors de l\'inscription');
      }

      // Super Admin = validation par OTP (comme premier compte)
      // Tous les admins (ADMIN & SUPER_ADMIN) sont redirigés vers l'OTP pour auto-validation
      if (data.status === 'PENDING_ACTIVATION' || data.status === 'PENDING_OTP_VALIDATION' || data.status === 'PENDING_ADMIN_VALIDATION') {
        setSuccess('Compte créé ! Veuillez vérifier votre email pour le code d\'activation.');
        setTimeout(() => {
          router.push(`/validate-otp?username=${encodeURIComponent(formData.email)}&type=PENDING_ACTIVATION`);
        }, 2000);
        return;
      }


    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden px-4 py-8">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-2xl shadow-purple-500/20 mb-6">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Créer un compte Admin
          </h1>
          <p className="text-slate-400 font-medium">
            Inscription réservée aux administrateurs
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-semibold mb-6 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl text-sm font-semibold mb-6 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Nom
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                  <input
                    type="text"
                    name="nom"
                    placeholder="Doe"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Prénom
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                  <input
                    type="text"
                    name="prenom"
                    placeholder="John"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="admin@entreprise.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type="tel"
                  name="telephone"
                  placeholder="+223 00 00 00 00"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* Nom d'utilisateur */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Nom d&apos;utilisateur (optionnel)
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type="text"
                  name="nomUtilisateur"
                  placeholder="johndoe"
                  value={formData.nomUtilisateur}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-purple-400 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Note sur le rôle */}
            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Accès Administrateur</span>
              </div>
              <p className="text-xs text-slate-500">
                Vous créez un compte administrateur avec un accès complet à la gestion quotidienne et aux rapports.
              </p>
            </div>



            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                'Création...'
              ) : (
                <>
                  Créer le compte
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-8 pt-6 border-t border-slate-700/50 space-y-3">
            <p className="text-center text-sm text-slate-400">
              Déjà un compte ?{' '}
              <Link href="/admin/login" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
                Se connecter
              </Link>
            </p>
            <p className="text-center text-xs text-slate-500">
              <Link href="/login" className="hover:text-slate-400 transition-colors">
                ← Retour au site client
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-8">
          Espace sécurisé - Accès réservé aux administrateurs
        </p>
      </div>
    </div>
  );
}
