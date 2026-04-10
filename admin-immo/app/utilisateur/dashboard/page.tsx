'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getBiens } from '@/services/bienService'
import { UserLayout } from '../UserLayout'
import { 
  Home, Search, CheckCircle, MapPin, Calendar,
  TrendingUp, Star, ArrowRight, Building, X, Loader2,
  Settings, Lock, Eye, EyeOff, Shield, User, Phone, MessageCircle, Square,
  Sparkles, Heart, Zap, Clock, Filter, ChevronRight, Bell,
  Wallet, ArrowUpRight, LayoutGrid, List, Mail
} from 'lucide-react'
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

// Section Parametres
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Paramètres
        </h2>
        <p className="text-blue-100 mt-1">Gérez votre compte</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Informations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm text-gray-500">Prénom</label><p className="font-medium">{user?.prenom}</p></div>
            <div><label className="text-sm text-gray-500">Nom</label><p className="font-medium">{user?.nom}</p></div>
            <div><label className="text-sm text-gray-500">Email</label><p className="font-medium">{user?.email}</p></div>
            <div><label className="text-sm text-gray-500">Téléphone</label><p className="font-medium">{user?.telephone || 'Non renseigné'}</p></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Changer mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`p-4 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Lock className="mr-2" size={18} />}
              {loading ? 'Modification...' : 'Changer'}
            </Button>
          </form>
        </CardContent>
      </Card>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Section Hero avec dégradé animé */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span className="text-blue-100 text-sm font-medium">Espace Client</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Bonjour, <span className="text-yellow-300">{user?.prenom}</span> !
                </h1>
                <p className="text-blue-100 text-lg max-w-md">
                  Découvrez les meilleures opportunités immobilières sélectionnées pour vous
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setActiveSection('annonces')} 
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg font-semibold px-6"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Explorer
                </Button>
              </div>
            </div>
          </div>

          {/* Cartes de statistiques modernes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <CardHeader className="pb-2 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-blue-100">Annonces</CardTitle>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Building className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold">{stats?.totalAnnonces || 0}</div>
                  <p className="text-blue-200 text-xs mt-1 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> Disponibles
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <CardHeader className="pb-2 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-rose-100">Favoris</CardTitle>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Heart className="h-4 w-4 text-white fill-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold">{stats?.annoncesFavorites || 0}</div>
                  <p className="text-rose-200 text-xs mt-1">Sauvegardés</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <CardHeader className="pb-2 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-emerald-100">Réservations</CardTitle>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold">{reservations.length}</div>
                  <p className="text-emerald-200 text-xs mt-1">Actives</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <CardHeader className="pb-2 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-violet-100">Visites</CardTitle>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold">{stats?.visitesConfirmees || 0}</div>
                  <p className="text-violet-200 text-xs mt-1">Confirmées</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Grille de contenu */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Actions rapides */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl bg-white h-full">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-amber-500" />
                    Actions rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <button 
                    onClick={() => setActiveSection('annonces')} 
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all group text-left"
                  >
                    <div className="p-3 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                      <Search className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Parcourir les annonces</p>
                      <p className="text-sm text-gray-500">Trouvez votre bien idéal</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </button>
                  
                  <button 
                    onClick={() => setActiveSection('reservations')} 
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all group text-left"
                  >
                    <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Mes réservations</p>
                      <p className="text-sm text-gray-500">Gérez vos demandes</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  </button>

                  <button 
                    onClick={() => setActiveSection('parametres')} 
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 transition-all group text-left"
                  >
                    <div className="p-3 bg-slate-600 rounded-xl text-white shadow-lg shadow-slate-500/30 group-hover:scale-110 transition-transform">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Paramètres</p>
                      <p className="text-sm text-gray-500">Configurez votre compte</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-slate-500 transition-colors" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Réservations récentes */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-white h-full">
                <CardHeader className="border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Réservations récentes
                  </CardTitle>
                  {reservations.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveSection('reservations')}
                      className="text-blue-600"
                    >
                      Voir tout
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  {reservations.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">Aucune réservation</p>
                      <p className="text-sm text-gray-400 mt-1">Commencez à explorer les annonces</p>
                      <Button 
                        onClick={() => setActiveSection('annonces')} 
                        variant="outline" 
                        className="mt-4"
                      >
                        Parcourir
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {reservations.slice(0, 4).map((r, i) => (
                        <motion.div 
                          key={r.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 cursor-pointer group"
                          onClick={() => r.bien?.id && router.push(`/annonces?bien=${r.bien.id}`)}
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                            <Building className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{r.bien?.libelle || 'Bien #' + r.id}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(r.dateVisite).toLocaleDateString('fr-FR')} à {new Date(r.dateVisite).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(r.statut)}`}>
                            {getStatusLabel(r.statut)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}
      {activeSection === 'annonces' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex gap-2">
              {["TOUS", "VENTE", "LOCATION"].map((t) => (
                <button key={t} onClick={() => setTypeTransaction(t as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${typeTransaction === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBiens.map((bien, i) => (
              <motion.div 
                key={bien.id} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.5, delay: i * 0.05 }} 
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl hover:shadow-blue-900/10 transition-all cursor-pointer relative"
                onClick={() => router.push(`/annonces?bien=${bien.id}`)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={bien.images?.[0] ? (bien.images[0].startsWith("http") ? bien.images[0] : `http://localhost:8080${bien.images[0]}`) : "/images/maison bamako.webp"} 
                    alt={bien.libelle} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md ${bien.typeTransaction === "LOCATION" ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                      {bien.typeTransaction === "LOCATION" ? 'À Louer' : 'À Vendre'}
                    </span>
                  </div>
                  
                  {/* Overlay au survol */}
                  <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-blue-600 px-4 py-2 rounded-xl font-black text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      Voir Détails
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{bien.libelleTypeBien || "Bien"}</p>
                    <div className="flex items-center gap-1 text-slate-900 font-bold text-sm">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 4.8
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">{bien.libelle}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                    {bien.ville || "Bamako"}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-4 py-3 border-y border-gray-50 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                    {bien.nbChambres > 0 && <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> {bien.nbChambres} Ch</span>}
                    {bien.superficie > 0 && <span className="flex items-center gap-1.5"><Square className="w-3.5 h-3.5" /> {bien.superficie} m²</span>}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xl font-black text-slate-900">
                      {new Intl.NumberFormat("fr-FR").format(bien.prixCalculer || 0)} 
                      <span className="text-[10px] text-slate-400 ml-1 uppercase">FCFA</span>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedBien(bien); setShowContactModal(true) }} 
                        className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Contacter"
                      >
                        <MessageCircle size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedBien(bien); setShowReservationModal(true) }} 
                        className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        title="Réserver"
                      >
                        <Calendar size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {filteredBiens.length === 0 && <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300"><p className="text-gray-500">Aucun bien trouvé</p></div>}
        </div>
      )}
      {activeSection === 'reservations' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Mes Réservations</h2>
          {reservations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Aucune réservation</p>
              <Button onClick={() => setActiveSection('annonces')} className="mt-4" variant="outline">Parcourir les annonces</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {reservations.map((r) => (
                <Card 
                  key={r.id} 
                  className="hover:shadow-lg transition-all cursor-pointer border-gray-100 group"
                  onClick={() => r.bien?.id && router.push(`/annonces?bien=${r.bien.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                        {/* Essayer la structure plate d'abord, puis la structure imbriquée */}
                        {(r.idBien || r.bien?.id) ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                            <Building className="h-8 w-8 text-blue-400" />
                          </div>
                        ) : (
                          <Building className="h-8 w-8 m-8 text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="text-blue-600" size={20} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{r.libelleBien || r.bien?.libelle || 'Bien #' + r.id}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1 font-medium italic">
                          <MapPin className="h-3 w-3 text-blue-500" />
                          {r.adresseBien || r.bien?.ville || 'Localisation non précisée'}
                        </p>
                        <p className="text-lg font-black text-blue-600 mt-2">
                          {/* Prix non inclus dans ReservationResponse */}
                          <span className="text-[10px] text-gray-400">Visite programmée</span>
                        </p>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(r.statut)}`}>
                            {getStatusLabel(r.statut)}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                            Le {new Date(r.dateVisite).toLocaleDateString('fr-FR')} à {new Date(r.dateVisite).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      {activeSection === 'parametres' && <ParametresSection user={user} />}
      {/* Modal de contact WhatsApp */}
      {showContactModal && selectedBien && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl overflow-hidden relative">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-green-50 rounded-full blur-2xl opacity-60 pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <MessageCircle className="text-green-500" size={24} />
                Contacter
              </h3>
              <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 p-2 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-gray-100 relative">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Agence Immobilière</h4>
              <p className="text-base font-bold text-slate-900 mb-1">{selectedBien.utilisateur?.nom || "Agence Immobilière"}</p>
              {selectedBien.utilisateur?.adresse && (
                <div className="flex items-start gap-2 text-slate-500 text-xs">
                  <MapPin size={14} className="mt-0.5 text-slate-400 flex-shrink-0" />
                  <span>{selectedBien.utilisateur.adresse}</span>
                </div>
              )}
            </div>
            
            <div className="mb-4 px-1 relative">
              <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-1">Concerne le bien :</p>
              <p className="text-sm font-semibold text-gray-700 leading-tight">{selectedBien.libelle}</p>
            </div>

            <div className="space-y-3 relative">
              <a 
                href={`tel:${selectedBien.utilisateur?.telephone || selectedBien.telephone || '+22300000000'}`}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-50 border border-gray-100 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
              >
                <Phone size={18} className="text-blue-600" />
                Appeler l'agence
              </a>
              {selectedBien.utilisateur?.email && (
                <a 
                  href={`mailto:${selectedBien.utilisateur.email}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-50 border border-gray-100 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                >
                  <Mail size={18} className="text-blue-600" />
                  Email de l'agence
                </a>
              )}
              <a 
                href={`https://wa.me/${(selectedBien.utilisateur?.telephone || selectedBien.telephone || '+22300000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par le bien "${selectedBien.libelle}".`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold transition-transform active:scale-95 shadow-md shadow-green-500/20"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
      {showReservationModal && selectedBien && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">Réserver {selectedBien.libelle}</h3><button onClick={() => setShowReservationModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); handleReservationSubmit(fd.get('dateVisite') as string) }}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Date et heure de visite souhaitée</label>
                <input type="datetime-local" name="dateVisite" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowReservationModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
                <button type="submit" disabled={reservationLoading} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all hover:bg-blue-700">{reservationLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Confirmer la visite'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  )
}
