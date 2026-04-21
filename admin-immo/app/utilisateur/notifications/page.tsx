'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserLayout } from '../UserLayout'
import { 
  Bell, 
  CheckCircle, 
  Building, 
  Calendar, 
  Mail, 
  Trash2, 
  CheckCheck,
  Clock,
  ArrowLeft,
  Filter,
  Search,
  MoreVertical,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Home,
  MapPin,
  ChevronRight,
  X,
  Inbox
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: number
  type: string
  titre: string
  message: string
  isRead: boolean
  date?: string | number[]
  dateCreation?: string | number[]
  data?: any
  lien?: string
  entityId?: number
}

type FilterType = 'all' | 'unread' | 'read'
type TypeFilter = 'all' | 'reservation' | 'bien' | 'contact'

// Helper to safely format dates - handles multiple formats including Java LocalDateTime
function formatDate(dateValue: string | number[] | undefined | null): string {
  if (!dateValue) return 'Date inconnue';
  
  try {
    let date: Date;
    
    // Handle Java LocalDateTime array format: [2024, 1, 15, 10, 30, 0]
    if (Array.isArray(dateValue)) {
      if (dateValue.length < 3) return 'Date incomplète';
      const [year, month, day, hour = 0, minute = 0, second = 0, nanosecond = 0] = dateValue;
      // Validate components
      if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
        return 'Date invalide';
      }
      date = new Date(year, month - 1, day, hour, minute, second);
    } 
      // Handle ISO string format
    else if (typeof dateValue === 'string') {
      // Try parsing as ISO string
      date = new Date(dateValue);
      // If invalid, try alternative formats
      if (isNaN(date.getTime())) {
        // Try DD/MM/YYYY format
        const parts = dateValue.split(/[/\-\.]/);
        if (parts.length === 3) {
          const [d, m, y] = parts.map(Number);
          date = new Date(y, m - 1, d);
        } else {
          // It's likely already formatted by the backend (e.g. "14 avr 2026, 11:09")
          return dateValue;
        }
      }
    } else {
      return 'Format non supporté';
    }
    
    if (isNaN(date.getTime())) {
      // Last resort fallback
      return typeof dateValue === 'string' ? dateValue : 'Date invalide';
    }
    
    // Check if date is in the future (more than 1 day ahead)
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (date.getTime() > now.getTime() + oneDayMs) {
      // Date might be from a different timezone, still display it
      console.warn('Future date detected:', dateValue);
    }
    
    return date.toLocaleString('fr-FR', { 
      dateStyle: 'medium', 
      timeStyle: 'short'
    });
  } catch (error) {
    console.error('Date parsing error:', dateValue, error);
    return 'Erreur date';
  }
}

// Format relative time (e.g., "il y a 5 minutes")
function formatRelativeTime(dateValue: string | number[] | undefined | null): string {
  if (!dateValue) return '';
  
  try {
    let date: Date;
    
    if (Array.isArray(dateValue)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
      date = new Date(year, month - 1, day, hour, minute, second);
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        // If it's a backend formatted string, we can't easily compute relative time, so return empty
        return '';
      }
    } else {
      return '';
    }
    
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'À l\'instant';
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHour < 24) return `Il y a ${diffHour}h`;
    if (diffDay < 7) return `Il y a ${diffDay} j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'NEW_BIEN':
    case 'NOUVEAU_BIEN':
      return { icon: Building, color: 'text-emerald-600', bg: 'bg-emerald-100' }
    case 'RESERVATION_VALIDATED':
      return { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' }
    case 'RESERVATION_CREATED':
      return { icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-100' }
    case 'RESERVATION_CANCELLED':
      return { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' }
    case 'CONTACT_RESPONSE':
      return { icon: Mail, color: 'text-purple-600', bg: 'bg-purple-100' }
    default:
      return { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-100' }
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([])

  const fetchNotifications = async () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (err) {
      console.error('Erreur notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [router])

  const markAsRead = async (notificationId: number) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/marquer-lu`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchNotifications()
    } catch (err) {
      console.error('Erreur marquage lu:', err)
    }
  }

  const markAllAsRead = async () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    try {
      await Promise.all(
        notifications.filter(n => !n.isRead).map(n =>
          fetch(`${API_BASE_URL}/api/notifications/${n.id}/marquer-lu`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        )
      )
      fetchNotifications()
    } catch (err) {
      console.error('Erreur marquage lu:', err)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchNotifications()
    } catch (err) {
      console.error('Erreur suppression:', err)
    }
  }

  const filteredNotifications = notifications.filter(n => {
    // Status filter
    if (filter === 'unread' && n.isRead) return false
    if (filter === 'read' && !n.isRead) return false
    
    // Type filter
    if (typeFilter === 'reservation' && !n.type.includes('RESERVATION')) return false
    if (typeFilter === 'bien' && n.type !== 'NEW_BIEN' && n.type !== 'NOUVEAU_BIEN') return false
    if (typeFilter === 'contact' && !n.type.includes('CONTACT')) return false
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return n.titre.toLowerCase().includes(query) || n.message.toLowerCase().includes(query)
    }
    
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    read: notifications.length - unreadCount,
    reservations: notifications.filter(n => n.type.includes('RESERVATION')).length,
    biens: notifications.filter(n => n.type === 'NEW_BIEN' || n.type === 'NOUVEAU_BIEN').length
  }

  const handleSectionChange = (section: string) => {
    if (section === 'dashboard') router.push('/utilisateur/tableau-de-bord')
    else if (section === 'annonces') router.push('/utilisateur/tableau-de-bord?section=annonces')
    else if (section === 'reservations') router.push('/utilisateur/tableau-de-bord?section=reservations')
    else if (section === 'messagerie') router.push('/utilisateur/messagerie')
    else if (section === 'parametres') router.push('/utilisateur/tableau-de-bord?section=parametres')
  }

  // Extract bien ID from notification and navigate to detail
  const handleViewDetail = (notification: Notification) => {
    // Mark as read first
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    // Try to extract bien ID from various sources
    let bienId = notification.entityId;
    
    // Check data property
    if (!bienId && notification.data?.bienId) {
      bienId = notification.data.bienId
    } else if (!bienId && notification.data?.idBien) {
      bienId = notification.data.idBien
    }
    
    // Check lien property
    if (!bienId && notification.lien && notification.lien.includes('bien')) {
      const match = notification.lien.match(/bien[=\/](\d+)/)
      if (match) bienId = parseInt(match[1])
    }
    
    // Navigate to property detail or annonces with filter
    if (bienId) {
      router.push(`/utilisateur/tableau-de-bord?section=annonces&bien=${bienId}`)
    } else if (notification.lien) {
      // go to specific link if present
      const isExternal = notification.lien.startsWith('http');
      if (isExternal) {
          window.open(notification.lien, '_blank');
      } else {
          router.push(notification.lien)
      }
    } else {
      // Fallback
      router.push('/utilisateur/tableau-de-bord?section=annonces')
    }
  }

  return (
    <UserLayout activeSection="notifications" onSectionChange={handleSectionChange}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Premium Header with Glassmorphism - Harmonized with Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0c112b] via-[#1a1f4d] to-[#251b4d] p-8 text-white shadow-2xl"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                <Bell className="h-8 w-8 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-slate-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Centre de notifications</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight">Vos Notifications</h1>
                <p className="text-slate-400 mt-1">
                  {unreadCount > 0 ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      {unreadCount} notification{unreadCount > 1 ? 's' : ''} en attente
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      Vous êtes à jour !
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={fetchNotifications}
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-6 py-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  className="bg-white text-slate-900 hover:bg-slate-100 font-black uppercase tracking-widest text-[10px] px-6 py-6 rounded-xl shadow-lg transition-all active:scale-95"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Tout marquer lu
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Premium Stats Cards with Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total', value: stats.total, icon: Bell, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
            { label: 'Non lues', value: stats.unread, icon: Bell, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', highlight: stats.unread > 0 },
            { label: 'Nouveaux biens', value: stats.biens, icon: Building, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
            { label: 'Réservations', value: stats.reservations, icon: Calendar, gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300 group ${stat.highlight ? 'ring-2 ring-amber-400' : ''}`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity`} />
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 text-transparent bg-clip-text bg-gradient-to-br ${stat.gradient}`} style={{ color: 'inherit' }} />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Premium Filters & Search with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Premium Search */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Search className="h-5 w-5 text-white" />
              </div>
              <input
                type="text"
                placeholder="Rechercher dans vos notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>
            
            {/* Premium Status Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statut:</span>
              {[
                { id: 'all', label: 'Toutes', count: stats.total, color: 'blue' },
                { id: 'unread', label: 'Non lues', count: stats.unread, color: 'amber' },
                { id: 'read', label: 'Lues', count: stats.read, color: 'slate' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as FilterType)}
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden ${
                    filter === f.id
                      ? `bg-gradient-to-r from-${f.color}-500 to-${f.color}-600 text-white shadow-lg shadow-${f.color}-500/25 scale-105`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="relative z-10">{f.label}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === f.id ? 'bg-white/30' : 'bg-slate-300/50'}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Premium Type Pills */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200/60 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type:</span>
            {[
              { id: 'all', label: 'Tous', icon: Bell, color: 'slate' },
              { id: 'reservation', label: 'Réservations', icon: Calendar, color: 'purple' },
              { id: 'bien', label: 'Nouveaux biens', icon: Building, color: 'emerald' },
              { id: 'contact', label: 'Messages', icon: Mail, color: 'blue' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id as TypeFilter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  typeFilter === t.id
                    ? `bg-gradient-to-r from-${t.color}-500 to-${t.color}-600 text-white shadow-lg shadow-${t.color}-500/20`
                    : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Premium Notifications List */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl" />
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-300/50"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  {searchQuery ? (
                    <Search className="h-12 w-12 text-slate-400" />
                  ) : (
                    <Inbox className="h-12 w-12 text-slate-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {searchQuery ? 'Aucun résultat trouvé' : 'Aucune notification'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  {searchQuery 
                    ? 'Essayez avec d\'autres termes de recherche ou réinitialisez les filtres'
                    : 'Vous n\'avez pas encore de notifications. Elles apparaîtront ici lorsque vous recevrez des mises à jour sur vos biens et réservations.'
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setFilter('all'); setTypeFilter('all'); }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Réinitialiser la recherche
                  </button>
                )}
              </motion.div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const { icon: Icon, color, bg } = getNotificationIcon(notification.type)
                const isNewBien = notification.type === 'NEW_BIEN' || notification.type === 'NOUVEAU_BIEN'
                const isReservation = notification.type.includes('RESERVATION')
                const dateValue = notification.dateCreation || notification.date;

                
                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                    transition={{ delay: index * 0.03, type: "spring", stiffness: 300 }}
                    className={`group relative overflow-hidden rounded-2xl bg-white border-2 transition-all duration-300 hover:shadow-2xl ${
                      !notification.isRead 
                        ? 'border-l-[6px] border-l-blue-500 border-slate-200 shadow-lg shadow-blue-500/5' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Unread indicator line */}
                    {!notification.isRead && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                    )}
                    
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start gap-5">
                        {/* Premium Icon with gradient */}
                        <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`h-7 w-7 ${color}`} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-bold text-slate-900 ${!notification.isRead ? 'text-lg' : 'text-base'}`}>
                                  {notification.titre}
                                </h4>
                                {!notification.isRead && (
                                  <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full animate-pulse">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-600 leading-relaxed">
                                {notification.message}
                              </p>
                            </div>
                            
                            {/* Actions Menu */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-xl"
                                  title="Marquer comme lu"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-xl"
                                title="Supprimer"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Premium Footer with Date */}
                          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-600">
                                {formatDate(dateValue)}
                              </span>
                              {formatRelativeTime(dateValue) && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full">
                                  {formatRelativeTime(dateValue)}
                                </span>
                              )}
                            </div>
                            
                            {/* Primary Action Button - View Detail */}
                            {(isNewBien || isReservation || notification.lien) && (
                              <button
                                onClick={() => handleViewDetail(notification)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:scale-105 transition-all"
                              >
                                <ExternalLink className="h-4 w-4" />
                                {isNewBien ? 'Voir le bien' : isReservation ? 'Voir la réservation' : 'Voir le détail'}
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            )}
                            
                            {/* Secondary Action - Navigate to annonces */}
                            {!notification.lien && !isNewBien && !isReservation && (
                              <button
                                onClick={() => router.push('/annonces')}
                                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                <Home className="h-4 w-4" />
                                Explorer les biens
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </motion.div>

        {/* Load More / Pagination hint */}
        {filteredNotifications.length > 0 && filteredNotifications.length >= 20 && (
          <div className="text-center py-4">
            <Button variant="outline" className="border-slate-200">
              Charger plus de notifications
            </Button>
          </div>
        )}
      </div>
    </UserLayout>
  )
}
