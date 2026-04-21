'use client';
import { API_BASE_URL } from "@/services/api";


import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UserLayout } from '../UserLayout';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  MoreVertical,
  Phone,
  Building,
  ArrowLeft,
  Loader2,
  Inbox,
  Clock,
  Sparkles,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  Heart,
  LayoutGrid,
  Wallet,
  Key,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface Contact {
  id: string;
  nom: string;
  prenom?: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  raw?: any;
}

interface Message {
  id: string;
  text: string;
  time: string;
  isMe: boolean;
  status: 'SENT' | 'DELIVERED' | 'READ';
}

// Robust Helper to safely format dates - handles Java LocalDateTime array format
function formatDate(dateValue: string | number[] | undefined | null): string {
  if (!dateValue) return 'Date inconnue';
  
  try {
    let date: Date;
    
    if (Array.isArray(dateValue)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
      date = new Date(year, month - 1, day, hour, minute, second);
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else {
      return 'Date invalide';
    }
    
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    return 'Date invalide';
  }
}

// Relative time helper
function formatTime(dateValue: string | number[] | undefined | null): string {
    if (!dateValue) return '--:--';
    try {
        let date: Date;
        if (Array.isArray(dateValue)) {
            const [year, month, day, hour = 0, minute = 0] = dateValue;
            date = new Date(year, month - 1, day, hour, minute);
        } else {
            date = new Date(dateValue as string);
        }
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return '--:--'; }
}

export default function UtilisateurMessagerie() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const term = searchTerm.toLowerCase();
    return contacts.filter(c => 
      c.nom.toLowerCase().includes(term) || 
      c.lastMessage.toLowerCase().includes(term)
    );
  }, [contacts, searchTerm]);

  const fetchContacts = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') : null;
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/contacts/utilisateur/recus`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.contacts) {
          const mapped: Contact[] = data.contacts.map((c: any) => ({
            id: c.id?.toString() || Math.random().toString(),
            nom: c.agence?.nom || c.utilisateur?.nom || 'Agence Exclusive',
            avatar: (c.agence?.nom || c.utilisateur?.nom || 'A').charAt(0).toUpperCase(),
            lastMessage: c.reponse || c.message || 'Début de discussion',
            time: formatDate(c.dateContact),
            unread: c.statut === 'EN_ATTENTE' ? 1 : 0,
            online: Math.random() > 0.5,
            raw: c,
          }));
          setContacts(mapped);
        }
      }
    } catch (err) {
      console.error('Erreur contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedContact && selectedContact.raw) {
      const raw = selectedContact.raw;
      const conv: Message[] = [];
      if (raw.message) {
        conv.push({
          id: 'msg-' + raw.id,
          text: raw.message,
          time: formatTime(raw.dateContact),
          isMe: false,
          status: 'READ',
        });
      }
      if (raw.reponse) {
        conv.push({
          id: 'rep-' + raw.id,
          text: raw.reponse,
          time: formatTime(raw.dateReponse),
          isMe: true,
          status: 'SENT',
        });
      }
      setConversation(conv);
      if (raw.statut === 'EN_ATTENTE') {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        fetch(`${API_BASE_URL}/api/contacts/${raw.id}/marquer-lu`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
        });
      }
    }
  }, [selectedContact]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContact) return;

    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contacts/${selectedContact.id}/repondre`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reponse: messageText }),
      });
      if (res.ok) {
        const newMessage: Message = {
          id: Date.now().toString(),
          text: messageText,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
          status: 'SENT',
        };
        setConversation([...conversation, newMessage]);
        setMessageText('');
        setContacts(c => c.map(item => item.id === selectedContact.id ? { ...item, lastMessage: messageText } : item));
      }
    } catch (err) {
      console.error('Erreur message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSectionChange = (section: string) => {
    if (section === 'dashboard') router.push('/utilisateur/tableau-de-bord');
    else if (section === 'annonces')
      router.push('/utilisateur/tableau-de-bord?section=annonces');
    else if (section === 'reservations')
      router.push('/utilisateur/tableau-de-bord?section=reservations');
    else if (section === 'notifications')
      router.push('/utilisateur/notifications');
    else if (section === 'parametres')
      router.push('/utilisateur/tableau-de-bord?section=parametres');
  };

  return (
    <UserLayout activeSection="messagerie" onSectionChange={handleSectionChange}>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header Premium */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0c112b] via-[#1a1f4d] to-[#251b4d] p-8 text-white shadow-2xl"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                        <MessageSquare className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-4 w-4 text-amber-300" />
                            <span className="text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">Conciergerie Immobilière</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter">Messagerie Privée</h1>
                        <p className="text-blue-100/60 text-sm font-medium">Échangez en toute confidentialité avec vos conseillers.</p>
                    </div>
                </div>
            </div>
        </motion.div>

        <div className="flex-1 flex gap-8 min-h-0">
          {/* Contacts Sidebar - Premium Glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex w-96 bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 flex-col overflow-hidden"
          >
            <div className="p-8 pb-4">
               <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                    <Search className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <input
                    type="text"
                    placeholder="Chercher une discussion..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none placeholder:text-slate-400"
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 custom-scrollbar">
               {loading ? (
                  <div className="py-20 flex flex-col items-center gap-4">
                     <Loader2 className="animate-spin text-blue-500" size={32} />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initialisation...</p>
                  </div>
               ) : filteredContacts.length === 0 ? (
                  <div className="py-20 text-center px-8">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Inbox className="w-8 h-8 text-slate-300" />
                     </div>
                     <p className="text-slate-900 font-black text-sm uppercase mb-1">Aucun message</p>
                     <p className="text-slate-400 text-xs font-medium italic">Vos échanges avec les agences apparaîtront ici.</p>
                  </div>
               ) : (
                  filteredContacts.map((contact) => (
                    <motion.div
                      key={contact.id}
                      whileHover={{ x: 4 }}
                      onClick={() => setSelectedContact(contact)}
                      className={`flex items-center gap-4 p-5 rounded-3xl cursor-pointer transition-all ${
                        selectedContact?.id === contact.id
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30'
                          : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center font-black text-xl shadow-sm border ${
                            selectedContact?.id === contact.id ? 'from-white/20 to-white/10 border-white/20' : 'from-slate-100 to-white border-slate-100 text-blue-600'
                        }`}>
                          {contact.avatar}
                        </div>
                        {contact.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-lg" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-black truncate text-sm uppercase tracking-tight">
                            {contact.nom}
                          </h3>
                        </div>
                        <p className={`text-xs truncate font-medium ${selectedContact?.id === contact.id ? 'text-blue-100' : 'text-slate-500'}`}>
                          {contact.lastMessage}
                        </p>
                      </div>
                      {contact.unread > 0 && selectedContact?.id !== contact.id && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                          {contact.unread}
                        </div>
                      )}
                    </motion.div>
                  ))
               )}
            </div>
          </motion.div>

          {/* Chat Pane */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 bg-white/70 backdrop-blur-xl rounded-[3.5rem] border border-white shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden relative"
          >
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50">
                  <div className="flex items-center gap-5">
                    <button onClick={() => setSelectedContact(null)} className="md:hidden p-3 bg-slate-50 text-slate-500 rounded-2xl">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-500/20">
                      {selectedContact.avatar}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{selectedContact.nom}</h4>
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Conseiller en ligne</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-slate-100">
                        <Phone size={20} strokeWidth={3} />
                     </button>
                     <button className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all border border-slate-100">
                        <MoreVertical size={20} strokeWidth={3} />
                     </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-slate-50/30 custom-scrollbar">
                   {selectedContact.raw?.bien && (
                      <div className="flex justify-center mb-10">
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl flex items-center gap-4 max-w-sm"
                        >
                           <div className="w-16 h-16 bg-blue-50 rounded-2xl flex-shrink-0 overflow-hidden border border-blue-50">
                              <img 
                                src={selectedContact.raw.bien.images?.[0] ? (selectedContact.raw.bien.images[0].startsWith("http") ? selectedContact.raw.bien.images[0] : `${API_BASE_URL}${selectedContact.raw.bien.images[0]}`) : "/images/maison bamako.webp"} 
                                className="w-full h-full object-cover" 
                                alt="Bien" 
                              />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-blue-500 uppercase">Objet de la demande</p>
                              <p className="font-black text-slate-900 truncate tracking-tight">{selectedContact.raw.bien.libelle}</p>
                              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                                 <MapPin size={10} /> {selectedContact.raw.bien.ville}
                              </div>
                           </div>
                        </motion.div>
                      </div>
                   )}

                  <AnimatePresence>
                    {conversation.map((msg, idx) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] space-y-2 ${msg.isMe ? 'items-end' : 'items-start'}`}>
                           <div className={`p-6 rounded-[2rem] text-sm font-medium shadow-sm transition-all ${
                              msg.isMe 
                                ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/20' 
                                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-slate-200/50'
                           }`}>
                              {msg.text}
                           </div>
                           <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                              <Clock size={10} /> {msg.time}
                              {msg.isMe && (
                                 <span className="text-blue-500">
                                    <CheckCheck size={12} strokeWidth={3} />
                                 </span>
                              )}
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Input Area */}
                <div className="p-8 bg-white border-t border-slate-100">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-4xl mx-auto">
                    <button type="button" className="p-5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-[1.5rem] transition-all">
                       <Paperclip size={24} />
                    </button>
                    <div className="flex-1 relative">
                       <input
                        type="text"
                        placeholder="Qu'aimeriez-vous savoir d'autre ?"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="w-full pl-6 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none placeholder:text-slate-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!messageText.trim() || sending}
                      className="p-5 bg-blue-600 text-white rounded-[2rem] shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="animate-spin w-6 h-6" /> : <Send size={24} strokeWidth={2.5} />}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                 <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="w-32 h-32 bg-white rounded-[3rem] border border-slate-50 flex items-center justify-center shadow-2xl relative z-10">
                       <MessageSquare className="w-14 h-14 text-blue-500/40" strokeWidth={1} />
                    </div>
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">Sélectionnez un expert</h3>
                 <p className="text-slate-400 font-medium italic max-w-sm mb-10">Démarrez une conversation exclusive avec nos agences immobilières partenaires.</p>
                 <Button onClick={() => router.push('/annonces')} className="bg-slate-900 text-white px-10 py-7 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all">
                    Explorer le catalogue
                 </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </UserLayout>
  );
}
