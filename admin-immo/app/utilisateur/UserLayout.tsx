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
  date?: string | number[]
  dateCreation?: string | number[]
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
      if (dateValue.length < 3) return 'Format invalide';
      const year = dateValue[0];
      const month = dateValue[1];
      const day = dateValue[2];
      const hour = dateValue[3] || 0;
      const minute = dateValue[4] || 0;
      const second = dateValue[5] || 0;
      
      date = new Date(year, month - 1, day, hour, minute, second);
    } else if (typeof dateValue === 'string') {
      // Handle ISO string format or formatted string from backend
      date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return dateValue;
      }
    } else {
      return 'Date invalide';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return typeof dateValue === 'string' ? dateValue : 'Date invalide';
    }
    
    return date.toLocaleString('fr-FR', { 
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', dateValue, error);
    return 'Date invalide';
  }
}

// Helper to get notification icon based on type
function getNotificationIcon(type: string) {
  switch (type) {
    case 'NEW_BIEN':
    case 'NOUVEAU_BIEN':
      return { icon: Building, bg: 'bg-emerald-100', color: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-600' }
    case 'RESERVATION_VALIDATED':
      return { icon: CheckCircle, bg: 'bg-blue-100', color: 'text-blue-600', gradient: 'from-blue-500 to-indigo-600' }
    case 'RESERVATION_CREATED':
      return { icon: Calendar, bg: 'bg-amber-100', color: 'text-amber-600', gradient: 'from-amber-500 to-orange-600' }
    case 'RESERVATION_CANCELLED':
      return { icon: Calendar, bg: 'bg-rose-100', color: 'text-rose-600', gradient: 'from-rose-500 to-red-600' }
    case 'CONTACT_RESPONSE':
      return { icon: Mail, bg: 'bg-purple-100', color: 'text-purple-600', gradient: 'from-purple-500 to-indigo-600' }
    default:
      return { icon: Bell, bg: 'bg-slate-100', color: 'text-slate-600', gradient: 'from-slate-500 to-slate-700' }
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
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'annonces', label: 'Annonces', icon: Search },
    { id: 'reservations', label: 'Mes Réservations', icon: Calendar },
    { id: 'messagerie', label: 'Messagerie', icon: MessageSquare, href: '/utilisateur/messagerie' },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount, href: '/utilisateur/notifications' },
    { id: 'parametres', label: 'Paramètres', icon: Settings },
  ]

  // Handle navigation - external pages use router.push, internal sections use onSectionChange
  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.href) {
      router.push(item.href)
    } else {
      onSectionChange(item.id as any)
      // Special case: if on dashboard section and sidebar item is clicked, ensure we are on dashboard page
      const pathname = window.location.pathname;
      if (!pathname.includes('tableau-de-bord') && !item.href) {
        router.push('/utilisateur/tableau-de-bord')
      }
    }
  }

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id)
    setShowNotifications(false)
    router.push('/utilisateur/notifications')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex font-sans">
      {/* Sidebar Premium avec Glassmorphism amélioré */}
      <aside 
        className={`bg-white/90 backdrop-blur-3xl border-r border-indigo-100 transition-all duration-500 flex flex-col shadow-[0_0_40px_-15px_rgba(0,0,0,0.1)] z-40 relative ${
          sidebarOpen ? 'w-80' : 'w-24'
        }`}
      >
        {/* Decorative background for sidebar */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        {/* Logo Premium avec effet raffiné */}
        <div className="h-28 flex items-center justify-between px-6 border-b border-indigo-50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          
          {sidebarOpen ? (
            <div className="flex items-center gap-4 relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30 ring-4 ring-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <Home className="h-7 w-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-900 text-2xl tracking-tighter leading-none mb-1">BamakoHome</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest bg-blue-50/80 px-1.5 py-0.5 rounded-md">Espace Client</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-14 h-14 mx-auto bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30 ring-4 ring-white relative group">
               <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
               <Home className="h-7 w-7 text-white" />
            </div>
          )}
          {sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2.5 bg-slate-50 hover:bg-white border border-slate-100 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-90"
            >
              <X size={18} className="text-slate-500" />
            </button>
          )}
        </div>

        {/* Navigation Premium - Chic Style */}
        <nav className="flex-1 p-5 space-y-2 mt-4">
          {!sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="w-14 h-14 mx-auto flex items-center justify-center p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-2xl transition-all shadow-sm mb-8"
            >
              <Menu size={20} />
            </button>
          )}
          
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item)}
                whileHover={{ x: sidebarOpen ? 5 : 0 }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-600/25' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50'
                } ${sidebarOpen ? '' : 'justify-center py-5'}`}
              >
                {/* Active glow effect */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                )}
                
                <div className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20 group-hover:scale-110' 
                    : 'bg-slate-50 group-hover:bg-blue-50 group-hover:text-blue-600'
                }`}>
                  <Icon size={sidebarOpen ? 20 : 24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                {sidebarOpen && (
                  <div className="flex-1 text-left">
                    <span className={`font-black text-sm tracking-tight ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-900 transition-colors'}`}>
                      {item.label}
                    </span>
                  </div>
                )}
                
                {isActive && sidebarOpen && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="w-1.5 h-6 rounded-full bg-white/40 backdrop-blur-md"
                  />
                )}
                
                {item.badge && item.badge > 0 && sidebarOpen && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-lg shadow-lg shadow-red-500/40 animate-pulse border border-white/20">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </motion.button>
            )
          })}
        </nav>

        {/* User Card Modernized */}
        {user && (
          <div className="p-5 border-t border-indigo-50 relative group">
            <div className={`flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 transition-all hover:shadow-xl hover:translate-y-[-2px] ${sidebarOpen ? '' : 'flex-col p-1 border-0 bg-transparent'}`}>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20 ring-2 ring-white group-hover:rotate-6 transition-transform">
                  {user.prenom?.[0]}{user.nom?.[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
              </div>
              
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">{user.prenom} {user.nom}</p>
                  <p className="text-[10px] text-slate-500 truncate font-black uppercase tracking-widest opacity-70">Client Certifié</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button 
                onClick={handleLogout}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-red-100/50 active:scale-95"
              >
                <LogOut size={14} />
                Déconnexion
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Decorative background for main content */}
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-blue-100/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-purple-100/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Header Premium - Glass Style */}
        <header className="h-24 bg-white/60 backdrop-blur-2xl border-b border-indigo-50 flex items-center justify-between px-10 sticky top-0 z-30 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-600/30 ring-2 ring-blue-50">
              {(() => {
                const Icon = navItems.find(n => n.id === activeSection)?.icon || Home
                return <Icon className="h-6 w-6 text-white" />
              })()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-500/70 mb-1">Navigation</span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {navItems.find(n => n.id === activeSection)?.label}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Quick Actions / Notifications */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 shadow-inner">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-3 rounded-xl transition-all relative ${
                    showNotifications ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <Bell className="h-5 w-5" strokeWidth={2.5} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
                  )}
                </button>

                {/* Dropdown Notifications - Redesigned to be Premium */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-[-20px] top-[calc(100%+20px)] w-[24rem] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-indigo-50 z-50 overflow-hidden ring-1 ring-slate-200/50"
                    >
                      <div className="p-6 border-b border-indigo-50 bg-gradient-to-br from-blue-50/50 to-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Bell className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900 leading-none">Notifications</h3>
                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">{unreadCount} non lues</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => router.push('/utilisateur/notifications')}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors group"
                        >
                          <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                        </button>
                      </div>
                      
                      <div className="max-h-[30rem] overflow-y-auto p-2 custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="py-16 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                              <Bell className="h-10 w-10 text-slate-200" />
                            </div>
                            <p className="font-bold text-slate-900">Tout est calme ici</p>
                            <p className="text-sm text-slate-400 mt-1">Vos notifications apparaîtront ici</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {notifications.slice(0, 5).map((notif) => {
                              const config = getNotificationIcon(notif.type)
                              const Icon = config.icon
                              return (
                                <button 
                                  key={notif.id}
                                  onClick={() => handleNotificationClick(notif)}
                                  className={`w-full p-4 rounded-2xl flex items-start gap-4 transition-all relative group ${
                                    !notif.isRead ? 'bg-blue-50/70 hover:bg-blue-100/70' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 ${config.bg}`}>
                                    <Icon className={`h-6 w-6 ${config.color}`} />
                                  </div>
                                  <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                       <p className={`font-bold text-sm truncate ${!notif.isRead ? 'text-slate-900' : 'text-slate-600'}`}>{notif.titre}</p>
                                       {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2 font-medium">{notif.message}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                      <Clock className="w-3 h-3" />
                                      {formatDate(notif.dateCreation || notif.date)}
                                    </div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 bg-slate-50 border-t border-indigo-50">
                        <button 
                          onClick={() => { setShowNotifications(false); router.push('/utilisateur/notifications'); }}
                          className="w-full py-4 bg-white hover:bg-blue-600 hover:text-white transition-all rounded-2xl text-slate-900 font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:shadow-xl hover:shadow-blue-600/20 active:scale-95 border border-slate-200"
                        >
                          Voir tout le centre de notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="w-px h-6 bg-slate-200 mx-1" />
              
              <button 
                onClick={() => onSectionChange('parametres' as any)}
                className="p-3 text-slate-500 hover:bg-white hover:text-slate-900 rounded-xl transition-all group"
              >
                <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform" strokeWidth={2.5} />
              </button>
            </div>

            {/* User Profile Summary Header */}
            <div className="flex items-center gap-3 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
                {user?.prenom?.[0]}
              </div>
              <div className="pr-2 hidden sm:block">
                <p className="text-xs font-black text-slate-900 truncate max-w-[100px] uppercase tracking-tight">{user?.prenom}</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[8px] text-emerald-600 font-black uppercase tracking-widest">Actif</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Wrapper with Animation */}
        <main className="flex-1 p-10 overflow-auto custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
