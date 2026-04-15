'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getBiens } from '@/services/bienService'
import { UserLayout } from '../UserLayout'
import { 
  Building, Home, Search, Filter, Star, Heart, Calendar, 
  MapPin, Phone, Mail, MessageSquare, Bell, Settings, 
  ChevronRight, ArrowRight, Shield, User, LayoutGrid, Wallet, Key,
  AlertCircle, CheckCircle, CheckCircle2, Sparkles, Clock, Zap, Eye 
} from "lucide-react";
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

interface UserStats {
  totalAnnonces: number
  annoncesFavorites: number
  visitesConfirmees: number
}

interface Reservation {
  id: number
  dateVisite: string
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE'
  // Structure plate depuis la réponse API ReservationResponse
  idBien?: number
  libelleBien?: string
  adresseBien?: string
  // Structure imbriquée legacy en fallback
  bien?: { id: number; libelle: string; ville: string; prixCalculer: number; images: string[] }
}

// Helper to safely format dates - handles Java LocalDateTime array format [2024, 1, 15, 10, 30, 0]
function formatDate(dateValue: string | number[] | undefined | null): string {
  if (!dateValue) return 'Date inconnue';
  
  try {
    let date: Date;
    
    // Handle Java LocalDateTime array format: [2024, 1, 15, 10, 30, 0]
    if (Array.isArray(dateValue)) {
      if (dateValue.length < 3) return 'Format invalide';
      const year = dateValue[0];
      const month = dateValue[1];
      const day = dateValue[2];
      const hour = dateValue[3] || 0;
      const minute = dateValue[4] || 0;
      const second = dateValue[5] || 0;
      
      date = new Date(year, month - 1, day, hour, minute, second);
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else {
      return 'Date invalide';
    }
    
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    return date.toLocaleString('fr-FR', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', dateValue, error);
    return 'Date invalide';
  }
}
// Section Parametres - Redesigned to be Premium
function ParametresSection({ user }: { user: any }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      return
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Minimum 6 caractères' })
      return
    }
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token || token === "null" || token === "undefined") return
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/utilisateurs/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      if (response.ok) {
        setMessage({ type: 'success', text: 'Mot de passe modifié !' })
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.message || 'Erreur' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur serveur' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <Shield className="h-6 w-6 text-blue-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-300/80">Sécurité du compte</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">
            Vos Paramètres
          </h2>
          <p className="text-blue-200/70 mt-2 font-medium">Gérez vos informations personnelles et votre sécurité</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-0 shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 flex flex-col items-center py-8">
             <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-500/30 mb-4 ring-4 ring-white">
                {user?.prenom?.[0]}{user?.nom?.[0]}
             </div>
             <CardTitle className="text-xl font-black text-slate-900">{user?.prenom} {user?.nom}</CardTitle>
             <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1">Client BamakoHome</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-colors">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                <p className="font-bold text-slate-700 truncate">{user?.email}</p>
              </div>
              <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-colors">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Téléphone</label>
                <p className="font-bold text-slate-700">{user?.telephone || 'Non renseigné'}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-all">
              Modifier le profil
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-0 shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl rounded-[2rem]">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900 tracking-tight">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              Changer mon mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {message && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-2xl mb-6 flex items-center gap-3 ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                }`}
              >
                {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                <p className="font-bold text-sm">{message.text}</p>
              </motion.div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mot de passe actuel</label>
                  <div className="relative">
                    <input 
                      type={showCurrent ? 'text' : 'password'} 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      className="w-full px-6 py-4 pr-14 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300" 
                      placeholder="••••••••"
                      required 
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                      {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nouveau mot de passe</label>
                  <div className="relative">
                    <input 
                      type={showNew ? 'text' : 'password'} 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      className="w-full px-6 py-4 pr-14 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300" 
                      placeholder="••••••••"
                      required 
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                      {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirmer nouveau</label>
                  <div className="relative">
                    <input 
                      type={showConfirm ? 'text' : 'password'} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      className="w-full px-6 py-4 pr-14 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300" 
                      placeholder="••••••••"
                      required 
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                      {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Shield className="h-4 w-4 text-blue-500" />
                Le mot de passe doit contenir au moins 6 caractères
              </div>

              <Button type="submit" disabled={loading} className="w-full py-7 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/25 transition-all active:scale-95 flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" size={24} /> : <div className="p-1.5 bg-white/20 rounded-lg"><Lock size={20} /></div>}
                {loading ? 'Mise à jour...' : 'Modifier mon mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function UserDashboardPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<'dashboard' | 'annonces' | 'reservations' | 'parametres' | 'messagerie' | 'notifications'>('dashboard')
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [biens, setBiens] = useState<any[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeTransaction, setTypeTransaction] = useState<"TOUS" | "LOCATION" | "VENTE">("TOUS")
  const [selectedBien, setSelectedBien] = useState<any>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [contactLoading, setContactLoading] = useState(false)
  const [reservationLoading, setReservationLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token || token === "null" || token === "undefined") { router.push('/login'); return }
    const fetchData = async () => {
      try {
        const [resUser, resStats, biensData, resReservations] = await Promise.all([
          fetch('http://localhost:8080/api/utilisateurs/me', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:8080/api/stats/utilisateur', { headers: { 'Authorization': `Bearer ${token}` } }),
          getBiens(),
          fetch('http://localhost:8080/api/reservations/utilisateur', { headers: { 'Authorization': `Bearer ${token}` } })
        ])
        if (!resUser.ok) throw new Error('Non autorisé')
        setUser(await resUser.json())
        if (resStats.ok) setStats({ ...(await resStats.json()), derniereVisite: "Aujourd'hui", scoreProfil: 100 })
        setBiens(biensData || [])
        if (resReservations.ok) setReservations((await resReservations.json()) || [])
      } catch { router.push('/login') } 
      finally { setLoading(false) }
    }
    fetchData()
  }, [router])

  const filteredBiens = useMemo(() => biens.filter((b) => {
    const matchSearch = !search || (b.libelle?.toLowerCase().includes(search.toLowerCase()) || b.ville?.toLowerCase().includes(search.toLowerCase()))
    const matchTrans = typeTransaction === "TOUS" || b.typeTransaction?.toUpperCase() === typeTransaction
    return matchSearch && matchTrans
  }), [biens, search, typeTransaction])

  const handleReservationSubmit = async (dateVisite: string) => {
    if (!selectedBien) return
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    try {
      setReservationLoading(true)
      const res = await fetch('http://localhost:8080/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ idBien: selectedBien.id, dateVisite: new Date(dateVisite).toISOString() })
      })
      if (!res.ok) throw new Error('Erreur')
      setShowReservationModal(false)
      alert('Demande de visite effectuée avec succès !')
      const resRes = await fetch('http://localhost:8080/api/reservations/utilisateur', { headers: { 'Authorization': `Bearer ${token}` } })
      if (resRes.ok) setReservations(await resRes.json())
    } catch { alert('Erreur réservation') }
    finally { setReservationLoading(false) }
  }

  const handleContactSubmit = async (message: string) => {
    if (!selectedBien) return
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    try {
      setContactLoading(true)
      const res = await fetch('http://localhost:8080/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ idBien: selectedBien.id, message })
      })
      if (!res.ok) throw new Error('Erreur')
      setShowContactModal(false)
      alert('Message envoyé !')
    } catch { alert('Erreur envoi') }
    finally { setContactLoading(false) }
  }

  const getStatusColor = (s: string) => ({ CONFIRMEE: 'bg-green-100 text-green-700', EN_ATTENTE: 'bg-yellow-100 text-yellow-700', ANNULEE: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100')
  const getStatusLabel = (s: string) => ({ CONFIRMEE: 'Confirmée', EN_ATTENTE: 'En attente', ANNULEE: 'Annulée' }[s] || s)

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>

  return (
    <UserLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {activeSection === 'dashboard' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-10 pb-10"
        >
          {/* Hero Section Redesigned - Ultra Premium & Compact */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0c112b] via-[#1a1f4d] to-[#251b4d] p-6 text-white shadow-2xl">
            {/* Animated background effects */}
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[20rem] h-[20rem] bg-purple-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl text-center lg:text-left">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 justify-center lg:justify-start"
                >
                  <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md border border-white/20">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                  </div>
                  <span className="text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">Votre univers immobilier</span>
                </motion.div>
                
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter leading-tight">
                  Bienvenue, <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300">
                    {user?.prenom} {user?.nom}
                  </span>
                  <span className="text-blue-500">.</span>
                </h1>
                
                <p className="text-blue-100/60 text-base font-medium max-w-md leading-relaxed">
                  Votre espace personnel dédié à la recherche et à la gestion de vos biens immobiliers d'exception.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-2 justify-center lg:justify-start">
                  <Button 
                    onClick={() => setActiveSection('annonces')} 
                    className="bg-white text-slate-900 hover:bg-blue-50 shadow-[0_10px_40px_-10px_rgba(255,255,255,0.3)] font-black uppercase tracking-widest text-[10px] px-6 py-4 rounded-xl transition-all active:scale-95"
                  >
                    <Search className="h-4 w-4 mr-2" strokeWidth={3} />
                    Catalogue
                  </Button>
                </div>
              </div>

              {/* Stats Mini Grid inside Hero */}
              <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                <div className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center space-y-1">
                   <div className="w-6 h-6 bg-amber-500/20 rounded-md flex items-center justify-center">
                      <Star className="h-3 w-3 text-amber-400" fill="currentColor" />
                   </div>
                   <p className="text-lg font-black tracking-tight">{stats?.annoncesFavorites || 0}</p>
                   <p className="text-[9px] text-blue-200 font-bold uppercase tracking-widest">Favoris</p>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center space-y-1">
                   <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">
                      <Clock className="h-3 w-3 text-blue-400" />
                   </div>
                   <p className="text-lg font-black tracking-tight">{reservations.length}</p>
                   <p className="text-[9px] text-blue-200 font-bold uppercase tracking-widest">Réservez</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section Redesigned */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Annonces Total', value: stats?.totalAnnonces || 0, icon: Building, color: 'blue', gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
              { label: 'Visites Confirmées', value: stats?.visitesConfirmees || 0, icon: CheckCircle, color: 'emerald', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
              { label: 'Score Profil', value: "100%", icon: Zap, color: 'purple', gradient: 'from-purple-500 to-indigo-700', bg: 'bg-purple-50' }
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] transition-all p-6 flex flex-col items-center text-center space-y-3 group overflow-hidden relative"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2 transition-all duration-500`} />
                <div className={`w-14 h-14 ${stat.bg} rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 ring-2 ring-white`}>
                  <stat.icon className={`h-7 w-7 text-transparent bg-clip-text bg-gradient-to-br ${stat.gradient}`} style={{ color: stat.color === 'blue' ? '#2563eb' : stat.color === 'emerald' ? '#10b981' : '#a855f7' }} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Quick Actions Side */}
            <div className="xl:col-span-1 space-y-8">
              <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col">
                <div className="p-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-3">
                    <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                    Actions rapides
                  </h3>
                </div>
                <CardContent className="p-6 space-y-3 flex-1">
                  {[
                    { id: 'annonces', label: 'Rechercher mon bien', desc: 'Découvrez les nouveautés', icon: Search, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
                    { id: 'reservations', label: 'Gérer mes rendez-vous', desc: 'Suivi de vos visites', icon: Calendar, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
                    { id: 'parametres', label: 'Sécurité & Compte', desc: 'Mettre à jour mot de passe', icon: Shield, gradient: 'from-slate-600 to-slate-800', bg: 'bg-slate-100' }
                  ].map((action, i) => (
                    <motion.button 
                      key={action.id}
                      onClick={() => setActiveSection(action.id as any)}
                      whileHover={{ x: 8 }}
                      className="w-full flex items-center gap-5 p-5 rounded-2xl border-2 border-transparent hover:border-slate-100 hover:bg-white hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                      <div className={`w-14 h-14 ${action.bg} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-white`}>
                        <action.icon className="h-7 w-7 text-slate-700" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-black text-slate-900 text-sm uppercase tracking-tight mb-0.5">{action.label}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest opacity-80">{action.desc}</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ChevronRight className="h-4 w-4" strokeWidth={3} />
                      </div>
                    </motion.button>
                  ))}
                </CardContent>
              </Card>

              {/* Premium Promo Card - Compact */}
              <div className="p-5 bg-gradient-to-br from-[#0c112b] to-[#1a1f4d] rounded-2xl text-white shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-xl" />
                 <Star className="h-6 w-6 text-yellow-400 mb-2 animate-bounce" />
                 <h4 className="text-base font-black tracking-tight mb-1 uppercase tracking-wide">Devenez VIP</h4>
                 <p className="text-blue-200/70 text-[10px] leading-relaxed mb-3 font-medium italic">Accès anticipé aux meilleures annonces de Bamako.</p>
                 <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black text-[9px] uppercase tracking-widest rounded-xl py-4">
                   En savoir plus
                 </Button>
              </div>
            </div>

            {/* Reservations Grid Main Part */}
            <div className="xl:col-span-2 space-y-8">
              <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-3">
                    <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                    Mes visites programmées
                  </h3>
                  {reservations.length > 0 && (
                    <Button 
                      variant="ghost" 
                      onClick={() => setActiveSection('reservations')}
                      className="text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-50 px-4 py-2 rounded-xl"
                    >
                      Voir tout
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
                <CardContent className="p-0">
                  {reservations.length === 0 ? (
                    <div className="text-center py-24 px-8">
                      <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Calendar className="h-10 w-10 text-slate-300" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Aucune visite pour l'instant</h4>
                      <p className="text-slate-400 font-medium max-w-xs mx-auto mb-8">
                        Vous n'avez pas encore réservé de visite. Parcourez nos annonces d'exception.
                      </p>
                      <Button 
                        onClick={() => setActiveSection('annonces')} 
                        className="bg-slate-900 text-white hover:bg-blue-600 px-8 py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:shadow-blue-500/20"
                      >
                        Trouver un bien
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {reservations.slice(0, 5).map((r, i) => (
                        <motion.div 
                          key={r.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-6 hover:bg-blue-50/30 transition-all flex items-center gap-4 cursor-pointer group"
                          onClick={() => r.bien?.id && router.push(`/annonces?bien=${r.bien.id}`)}
                        >
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 via-indigo-50 to-white border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-500 shadow-sm">
                            <Building className="h-8 w-8 text-blue-500/60" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                               <p className="font-black text-slate-900 text-lg truncate group-hover:text-blue-600 transition-colors tracking-tight">
                                 {r.libelleBien || r.bien?.libelle || 'Propriété Privée'}
                               </p>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="flex items-center gap-1.5 text-slate-400">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span className="text-xs font-black uppercase tracking-widest truncate">{r.adresseBien || r.bien?.ville || 'Bamako'}</span>
                               </div>
                               <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                               <div className="flex items-center gap-1.5 text-blue-600">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">{formatDate(r.dateVisite)}</span>
                               </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-4 py-2 rounded-2xl text-[10px] uppercase tracking-[0.1em] ${getStatusColor(r.statut)}`}>
                              {getStatusLabel(r.statut)}
                            </span>
                            <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white group-hover:shadow-md text-slate-300 group-hover:text-blue-600 transition-all">
                               <Eye size={18} />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      )}
      {activeSection === 'annonces' && (
        <div className="space-y-8 pb-12">
          {/* Annonces Search Bar - Redesigned to be Premium */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-white flex flex-col md:flex-row gap-4 items-center"
          >
            <div className="relative flex-1 w-full">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Search className="h-5 w-5 text-white" strokeWidth={3} />
              </div>
              <input 
                type="text" 
                placeholder="Ville, quartier, type de bien..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-16 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none placeholder:text-slate-400" 
              />
            </div>
            
            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-full md:w-auto">
              {[
                { label: "Tous", value: "TOUS", icon: LayoutGrid },
                { label: "Vente", value: "VENTE", icon: Wallet },
                { label: "Location", value: "LOCATION", icon: Key }
              ].map((t) => (
                <button 
                  key={t.value} 
                  onClick={() => setTypeTransaction(t.value as any)} 
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    typeTransaction === t.value 
                      ? "bg-white text-slate-900 shadow-md scale-105" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredBiens.map((bien, i) => (
                <motion.div 
                  key={bien.id} 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  layout
                  transition={{ duration: 0.4, delay: i * 0.05 }} 
                  className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all cursor-pointer relative flex flex-col h-full"
                  onClick={() => router.push(`/annonces?bien=${bien.id}`)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden m-4 rounded-[2rem]">
                    <img 
                      src={bien.images?.[0] ? (bien.images[0].startsWith("http") ? bien.images[0] : `http://localhost:8080${bien.images[0]}`) : "/images/maison bamako.webp"} 
                      alt={bien.libelle} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    
                    {/* Floating Badge */}
                    <div className="absolute top-4 left-4 flex gap-2">
                       <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-2xl backdrop-blur-md border border-white/20 ${bien.typeTransaction === "LOCATION" ? 'bg-emerald-600/80' : 'bg-blue-600/80'}`}>
                          {bien.typeTransaction === "LOCATION" ? 'À Louer' : 'À Vendre'}
                       </div>
                    </div>

                    <button 
                      className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white hover:text-rose-500 transition-all border border-white/30 z-10"
                      onClick={(e) => { e.stopPropagation(); /* Add to favorites logic if exists */ }}
                    >
                       <Heart className="w-5 h-5" />
                    </button>
                    
                    {/* Info Overlay on Hover */}
                    <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center translate-y-full group-hover:translate-y-0">
                      <div className="px-6 py-3 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                        Voir les détails d'exception
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-7 pb-7 pt-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-blue-500/80 uppercase tracking-[0.2em]">{bien.libelleTypeBien || "Résidence"}</span>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg font-black text-[10px] border border-amber-100">
                        <Star className="w-3 h-3 fill-amber-500" /> 4.9
                      </div>
                    </div>
                    
                    <h3 className="font-black text-slate-900 text-xl tracking-tight leading-tight line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                      {bien.libelle}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs mb-6">
                      <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <MapPin size={14} />
                      </div>
                      <span className="truncate">{bien.ville || "Bamako"}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-auto mb-6">
                       <div className="bg-slate-50 rounded-2xl p-3 border border-slate-50 flex flex-col items-center gap-1 hover:bg-white hover:border-blue-100 transition-all">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">S. Habitable</span>
                          <p className="text-sm font-black text-slate-700">{bien.superficie || 0} m²</p>
                       </div>
                       <div className="bg-slate-50 rounded-2xl p-3 border border-slate-50 flex flex-col items-center gap-1 hover:bg-white hover:border-blue-100 transition-all">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pièces</span>
                          <p className="text-sm font-black text-slate-700">{bien.nbChambres || 0} Ch</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Montant global</span>
                         <div className="text-2xl font-black text-slate-900 tracking-tighter">
                          {new Intl.NumberFormat("fr-FR").format(bien.prixCalculer || 0)} 
                          <span className="text-[10px] text-blue-500 ml-1">FCFA</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedBien(bien); setShowReservationModal(true) }} 
                          className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-90"
                          title="Réserver une visite"
                        >
                          <Calendar size={20} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Indicateur visite payante/gratuite */}
                    <div className="mt-3">
                      {bien.utilisateur?.agence?.visitePayante ? (
                        <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                          <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-amber-800">Visite payante</span>
                            <span className="text-[10px] text-amber-700 ml-1">
                              {bien.utilisateur.agence.tarifVisite?.toLocaleString()} FCFA
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-emerald-800">Visite gratuite</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {filteredBiens.length === 0 && (
            <div className="text-center py-32 bg-white/60 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                <Search className="h-10 w-10 text-slate-300" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">Aucun résultat trouvé</h4>
              <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">
                Essayez d'ajuster vos filtres pour trouver le bien de vos rêves.
              </p>
              <Button 
                onClick={() => {setSearch(""); setTypeTransaction("TOUS")}} 
                variant="outline" 
                className="mt-8 rounded-xl px-10 py-6 border-slate-200 font-black text-[10px] uppercase tracking-widest"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      )}
      
      {activeSection === 'reservations' && (
        <div className="space-y-8 pb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600/80">Gestion du planning</span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter text-slate-900">Vos Réservations</h2>
              <p className="text-slate-400 font-medium mt-1">Consultez et suivez l'état de vos demandes de visite</p>
            </div>
            <div className="bg-white p-2 rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex gap-1">
               <button className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-slate-900/20 transition-all">Toutes</button>
               <button className="px-6 py-3 text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">En attente</button>
               <button className="px-6 py-3 text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Confirmées</button>
            </div>
          </motion.div>

          {reservations.length === 0 ? (
            <div className="text-center py-32 bg-white/60 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-slate-200">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Calendar className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Aucun rdv pour le moment</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8 uppercase tracking-widest text-[10px]">
                Prenez rendez-vous pour visiter les biens d'exception du catalogue
              </p>
              <Button onClick={() => setActiveSection('annonces')} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 active:scale-95">Explorer les annonces</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {reservations.map((r, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={r.id}
                  className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all cursor-pointer group border border-slate-50 border-transparent hover:border-slate-100"
                  onClick={() => r.bien?.id && router.push(`/annonces?bien=${r.bien.id}`)}
                >
                  <div className="flex flex-col sm:flex-row gap-8">
                    <div className="w-full sm:w-40 h-40 bg-gradient-to-br from-slate-50 to-white rounded-[2rem] flex-shrink-0 overflow-hidden relative border border-slate-100 shadow-inner group-hover:scale-105 transition-all duration-500">
                        {r.bien?.images?.[0] ? (
                           <img 
                             src={r.bien.images[0].startsWith("http") ? r.bien.images[0] : `http://localhost:8080${r.bien.images[0]}`} 
                             className="w-full h-full object-cover" 
                             alt="Propriété" 
                           />
                        ) : (
                          <Building className="h-12 w-12 m-auto text-blue-200" />
                        )}
                        <div className="absolute inset-0 bg-blue-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <Eye className="text-white" size={32} strokeWidth={3} />
                        </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between py-2">
                       <div>
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] ${getStatusColor(r.statut)}`}>
                              {getStatusLabel(r.statut)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                              #{r.id}
                            </span>
                          </div>
                          
                          <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tighter leading-tight mb-2">
                            {r.libelleBien || r.bien?.libelle || 'Bien Sans Libellé'}
                          </h3>
                          <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                             <MapPin size={14} className="text-blue-500" />
                             <span className="truncate max-w-[200px]">{r.adresseBien || r.bien?.ville || 'Localisation Premium'}</span>
                          </div>
                       </div>
                       
                       <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-50 pt-6">
                           <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date de la visite</span>
                              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 w-fit">
                                 <Calendar size={14} strokeWidth={3} />
                                 <span className="text-[11px] font-black tracking-tight">{formatDate(r.dateVisite)}</span>
                              </div>
                           </div>
                           <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                              <ChevronRight className="h-6 w-6" strokeWidth={3} />
                           </Button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeSection === 'parametres' && <ParametresSection user={user} />}
      
      {/* Contact Modal - Redesigned to be Premium */}
      <AnimatePresence>
        {showContactModal && selectedBien && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactModal(false)}
              className="absolute inset-0 bg-[#0c112b]/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] max-w-lg w-full overflow-hidden shadow-2xl relative z-10 border border-white/20"
            >
              <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex items-center justify-between">
                 <h3 className="text-2xl font-black text-white tracking-tighter">Contacter l'agence</h3>
                 <button onClick={() => setShowContactModal(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all">
                   <X size={20} />
                 </button>
              </div>
              
              <div className="p-10 space-y-8">
                 <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl">
                       {selectedBien.utilisateur?.nom?.[0] || 'A'}
                    </div>
                    <div>
                       {selectedBien.createdByNom ? (
                           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Publié par : {selectedBien.createdByPrenom} {selectedBien.createdByNom}</p>
                       ) : (
                           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Partenaire vérifié</p>
                       )}
                       <h4 className="text-xl font-black text-slate-900 leading-none">{selectedBien.utilisateur?.nom || "Agence Bamako"}</h4>
                    </div>
                 </div>

                 <div className="space-y-4">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Options de contact direct</p>
                   <div className="grid grid-cols-1 gap-3">
                      <a href={`tel:${selectedBien.utilisateur?.telephone || '+22300000000'}`} className="flex items-center gap-4 p-5 bg-slate-50 hover:bg-white hover:shadow-xl border border-transparent hover:border-blue-100 rounded-2xl transition-all group">
                         <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Phone size={20} strokeWidth={3} />
                         </div>
                         <span className="font-bold text-slate-700">Appeler l'expert</span>
                      </a>
                      <a href={`https://wa.me/${(selectedBien.utilisateur?.telephone || '').replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-5 bg-emerald-50 hover:bg-white hover:shadow-xl border border-transparent hover:border-emerald-100 rounded-2xl transition-all group">
                         <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                            <MessageCircle size={20} strokeWidth={3} />
                         </div>
                         <span className="font-bold text-slate-700">WhatsApp Business</span>
                      </a>
                   </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Reservation Modal - Redesigned to be Premium */}
        {showReservationModal && selectedBien && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReservationModal(false)}
              className="absolute inset-0 bg-[#0c112b]/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] max-w-md w-full overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Visite Privée</p>
                       <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Réserver un créneau</h3>
                    </div>
                    <button onClick={() => setShowReservationModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                       <X size={20} />
                    </button>
                 </div>

                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 mb-1">BIEN SÉLECTIONNÉ</p>
                    <p className="font-black text-slate-800 line-clamp-1">{selectedBien.libelle}</p>
                    {selectedBien.utilisateur?.agence?.visitePayante && (
                       <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                           <p className="text-amber-800 text-[11px] leading-tight font-bold">
                               ⚠️ Cette agence applique des frais de visite de <span className="font-black text-amber-900">{selectedBien.utilisateur.agence.tarifVisite} FCFA</span>, généralement à prévoir sur place.
                           </p>
                       </div>
                    )}
                 </div>

                 <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); handleReservationSubmit(fd.get('dateVisite') as string) }} className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Date et heure souhaitée</label>
                      <input 
                        type="datetime-local" 
                        name="dateVisite" 
                        required 
                        className="w-full p-6 bg-slate-900 text-white rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-blue-500/20 transition-all border-none"
                      />
                   </div>

                   <Button 
                    type="submit" 
                    disabled={reservationLoading} 
                    className="w-full py-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
                   >
                     {reservationLoading ? <Loader2 className="animate-spin" size={24} /> : 'Confirmer la réservation'}
                   </Button>
                 </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </UserLayout>
  )
}
