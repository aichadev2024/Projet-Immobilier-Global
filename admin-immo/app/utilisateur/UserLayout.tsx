'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Home, 
  Search, 
  Calendar, 
  Bell, 
  LogOut, 
  Menu,
  X, 
  User,
  Settings,
  Building,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: number
  type: 'NEW_BIEN' | 'RESERVATION_VALIDATED' | 'CONTACT_RESPONSE' | 'RESERVATION_CREATED' | 'RESERVATION_CANCELLED'
  titre: string
  message: string
  isRead: boolean
  date: string | number[]
  data?: any
}

interface UserLayoutProps {
  children: React.ReactNode
  activeSection: 'dashboard' | 'annonces' | 'reservations' | 'messagerie' | 'notifications' | 'parametres'
  onSectionChange: (section: 'dashboard' | 'annonces' | 'reservations' | 'messagerie' | 'notifications' | 'parametres') => void
}

// Helper to safely format dates - handles Java LocalDateTime array format [2024, 1, 15, 10, 30, 0]
function formatDate(dateValue: string | number[] | undefined | null): string {
  if (!dateValue) return 'Date inconnue';
  
  try {
    let date: Date;
    
    // Handle Java LocalDateTime array format: [2024, 1, 15, 10, 30, 0]
    if (Array.isArray(dateValue)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
      date = new Date(year, month - 1, day, hour, minute, second);
    } else if (typeof dateValue === 'string') {
      // Handle ISO string format
      date = new Date(dateValue);
    } else {
      return 'Date invalide';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    return date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  } catch (error) {
    console.error('Error formatting date:', dateValue, error);
    return 'Date invalide';
  }
}

// Helper to get notification icon based on type
function getNotificationIcon(type: string) {
  switch (type) {
    case 'NEW_BIEN':
      return { icon: Building, bg: 'bg-emerald-100', color: 'text-emerald-600' }
    case 'RESERVATION_VALIDATED':
      return { icon: CheckCircle, bg: 'bg-blue-100', color: 'text-blue-600' }
    case 'RESERVATION_CREATED':
    case 'RESERVATION_CANCELLED':
      return { icon: Calendar, bg: 'bg-amber-100', color: 'text-amber-600' }
    case 'CONTACT_RESPONSE':
      return { icon: Mail, bg: 'bg-purple-100', color: 'text-purple-600' }
    default:
      return { icon: Bell, bg: 'bg-slate-100', color: 'text-slate-600' }
  }
}

export function UserLayout({ children, activeSection, onSectionChange }: UserLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  // Navigation items - external pages have href property
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'annonces', label: 'Annonces', icon: Search },
    { id: 'reservations', label: 'Mes Réservations', icon: Calendar },
    { id: 'messagerie', label: 'Messagerie', icon: MessageSquare, href: '/utilisateur/messagerie' },
    { id: 'notifications', label: 'Notifications', icon: Mail, badge: unreadCount, href: '/utilisateur/notifications' },
    { id: 'parametres', label: 'Paramètres', icon: Settings },
  ]

  // Handle navigation - external pages use router.push, internal sections use onSectionChange
  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.href) {
      router.push(item.href)
    } else {
      onSectionChange(item.id as any)
    }
  }

  // Fetch user and notifications
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token || token === "null" || token === "undefined") {
      router.push('/login')
      return
    }

    // Fetch user
    fetch('http://localhost:8080/api/utilisateurs/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : null)
    .then(data => setUser(data))

    // Fetch notifications
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [router])

  const fetchNotifications = async () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) return

    try {
      const res = await fetch('http://localhost:8080/api/notifications/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
      }
    } catch (err) {
      console.error('Erreur notifications:', err)
    }
  }

  const markAsRead = async (notificationId: number) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    try {
      await fetch(`http://localhost:8080/api/notifications/${notificationId}/marquer-lu`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchNotifications()
    } catch (err) {
      console.error('Erreur marquage lu:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    sessionStorage.removeItem('accessToken')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex">
      {/* Sidebar Premium avec Glassmorphism */}
      <aside 
        className={`bg-white/80 backdrop-blur-2xl border-r border-white/50 transition-all duration-500 flex flex-col shadow-2xl z-20 ${
          sidebarOpen ? 'w-72' : 'w-24'
        }`}
      >
        {/* Logo Premium avec effet lumineux */}
        <div className="h-24 flex items-center justify-between px-5 border-b border-white/60 bg-gradient-to-b from-white/50 to-transparent">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40 ring-4 ring-blue-100/50">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-black text-slate-900 text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">ImmoGlobal</span>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Espace Client</p>
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40 ring-4 ring-blue-100/50">
              <Home className="h-6 w-6 text-white" />
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2.5 bg-white/60 hover:bg-white rounded-xl transition-all shadow-sm"
          >
            {sidebarOpen ? <X size={18} className="text-slate-600" /> : <Menu size={18} className="text-slate-600" />}
          </button>
        </div>

        {/* Navigation Premium */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-600/30' 
                    : 'text-slate-600 hover:bg-white/80 hover:shadow-lg hover:text-slate-900 bg-white/40'
                } ${sidebarOpen ? '' : 'justify-center'}`}
              >
                {/* Active glow effect */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                )}
                
                <div className={`relative p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'} transition-colors`}>
                  <Icon size={20} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                </div>
                
                {sidebarOpen && (
                  <span className="font-bold relative z-10">{item.label}</span>
                )}
                
                {isActive && sidebarOpen && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 rounded-full bg-white shadow-lg"
                  />
                )}
                
                {item.badge && item.badge > 0 && sidebarOpen && (
                  <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/30 animate-pulse">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </motion.button>
            )
          })}
        </nav>

        {/* User info bottom Premium */}
        {user && (
          <div className="p-4 border-t border-white/60 bg-gradient-to-t from-white/80 to-transparent">
            <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'flex-col'}`}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30 ring-2 ring-white">
                {user.prenom?.[0]}{user.nom?.[0]}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{user.prenom} {user.nom}</p>
                  <p className="text-xs text-slate-500 truncate font-medium">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Premium */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
        {/* Header Premium avec Glassmorphism */}
        <header className="h-20 bg-white/70 backdrop-blur-2xl border-b border-white/60 flex items-center justify-between px-8 sticky top-0 z-50 shadow-lg shadow-slate-200/50">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-600/30">
              {(() => {
                const Icon = navItems.find(n => n.id === activeSection)?.icon || Home
                return <Icon className="h-5 w-5 text-white" />
              })()}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">
                {navItems.find(n => n.id === activeSection)?.label}
              </h1>
              <p className="text-xs text-slate-500 font-medium">Espace Client Premium</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications Premium */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 bg-white/80 hover:bg-white rounded-2xl transition-all shadow-sm hover:shadow-md border border-white/60"
              >
                <Bell className="h-5 w-5 text-slate-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-lg shadow-red-500/30 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Notifications Premium */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-4 w-96 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-slate-400/30 border border-white/60 z-50 overflow-hidden"
                  >
                    <div className="p-5 border-b border-slate-100/60 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-white">
                      <h3 className="font-black text-slate-900 flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <Bell className="h-4 w-4 text-blue-600" />
                        </div>
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => notifications.filter(n => !n.isRead).forEach(n => markAsRead(n.id))}
                          className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Tout marquer lu
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-[28rem] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <Bell className="h-10 w-10 text-slate-400" />
                          </div>
                          <p className="font-bold text-slate-900 text-lg">Aucune notification</p>
                          <p className="text-sm text-slate-500 mt-1">Vous êtes à jour !</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100/60">
                          {notifications.map((notif) => (
                            <motion.div 
                              key={notif.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              onClick={() => markAsRead(notif.id)}
                              className={`p-4 hover:bg-blue-50/30 cursor-pointer transition-all ${
                                !notif.isRead ? 'bg-gradient-to-r from-blue-50/50 to-white border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {(() => {
                                  const { icon: Icon, bg, color } = getNotificationIcon(notif.type)
                                  return (
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${bg}`}>
                                      <Icon className={`h-6 w-6 ${color}`} />
                                    </div>
                                  )
                                })()}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-slate-900">{notif.titre}</p>
                                  <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(notif.date)}
                                  </p>
                                </div>
                                {!notif.isRead && (
                                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Déconnexion Premium */}
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/80 hover:bg-red-50 border border-white/60 hover:border-red-200 rounded-xl text-slate-600 hover:text-red-600 transition-all shadow-sm hover:shadow-md"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-semibold text-sm">Déconnexion</span>
            </motion.button>
          </div>
        </header>

        {/* Page Content Premium */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
