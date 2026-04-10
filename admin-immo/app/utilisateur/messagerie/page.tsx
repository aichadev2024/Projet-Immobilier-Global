'use client';

import React, { useState, useEffect } from 'react';
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
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

// Helper to safely format dates
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
    
    return date.toLocaleDateString('fr-FR');
  } catch (error) {
    return 'Date invalide';
  }
}

export default function UtilisateurMessagerie() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Filter contacts based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredContacts(contacts);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredContacts(
        contacts.filter(
          (c) =>
            c.nom.toLowerCase().includes(term) ||
            c.lastMessage.toLowerCase().includes(term)
        )
      );
    }
  }, [contacts, searchTerm]);

  const fetchContacts = async () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') ||
          sessionStorage.getItem('accessToken')
        : null;
    if (!token) return;
    try {
      setLoading(true);
      // API endpoint pour récupérer les contacts de l'utilisateur (conversations avec agences)
      const res = await fetch('http://localhost:8080/api/contacts/utilisateur/recus', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.contacts) {
          const mapped: Contact[] = data.contacts.map((c: any) => ({
            id: c.id?.toString() || Math.random().toString(),
            nom: c.agence?.nom || c.utilisateur?.nom || 'Agence',
            prenom: c.agence?.prenom || c.utilisateur?.prenom,
            avatar: c.agence?.nom?.charAt(0).toUpperCase() || 'A',
            lastMessage: c.reponse || c.message || 'Aucun message',
            time:
              c.dateContact && !isNaN(new Date(c.dateContact).getTime())
                ? formatDate(c.dateContact)
                : 'Date inconnue',
            unread: c.statut === 'EN_ATTENTE' ? 1 : 0,
            online: false,
            raw: c,
          }));
          setContacts(mapped);
          if (mapped.length > 0 && !selectedContact) {
            setSelectedContact(mapped[0]);
          }
        }
      }
    } catch (err) {
      console.error('Erreur fetch contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // Poll toutes les 30 secondes
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
          time:
            raw.dateContact && !isNaN(new Date(raw.dateContact).getTime())
              ? new Date(raw.dateContact).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '--:--',
          isMe: false,
          status: 'READ',
        });
      }
      if (raw.reponse) {
        conv.push({
          id: 'rep-' + raw.id,
          text: raw.reponse,
          time:
            raw.dateReponse && !isNaN(new Date(raw.dateReponse).getTime())
              ? new Date(raw.dateReponse).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
          isMe: true,
          status: 'SENT',
        });
      }
      setConversation(conv);

      // Marquer comme lu si non lu
      if (raw.statut === 'EN_ATTENTE') {
        markAsReadAndRefresh(raw.id);
      }
    }
  }, [selectedContact]);

  const markAsReadAndRefresh = async (contactId: string) => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') ||
          sessionStorage.getItem('accessToken')
        : null;
    try {
      await fetch(`http://localhost:8080/api/contacts/${contactId}/marquer-lu`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts((c) =>
        c.map((item) =>
          item.id === contactId.toString() ? { ...item, unread: 0 } : item
        )
      );
    } catch (err) {}
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContact) return;

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') ||
          sessionStorage.getItem('accessToken')
        : null;
    setSending(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/contacts/${selectedContact.id}/repondre`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reponse: messageText }),
        }
      );
      if (res.ok) {
        const newMessage: Message = {
          id: Date.now().toString(),
          text: messageText,
          time: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isMe: true,
          status: 'SENT',
        };
        setConversation([...conversation, newMessage]);
        setMessageText('');
        // Update contact preview
        setContacts((c) =>
          c.map((item) =>
            item.id === selectedContact.id
              ? { ...item, lastMessage: messageText }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Erreur envoi message:', err);
    } finally {
      setSending(false);
    }
  };

  const MessageStatusIcon = ({
    status,
  }: {
    status: 'SENT' | 'DELIVERED' | 'READ';
  }) => {
    switch (status) {
      case 'SENT':
        return <Check className="w-3.5 h-3.5 text-slate-400" />;
      case 'DELIVERED':
        return <CheckCheck className="w-3.5 h-3.5 text-slate-400" />;
      case 'READ':
        return <CheckCheck className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const handleSectionChange = (section: string) => {
    if (section === 'dashboard') router.push('/utilisateur/dashboard');
    else if (section === 'annonces')
      router.push('/utilisateur/dashboard?section=annonces');
    else if (section === 'reservations')
      router.push('/utilisateur/dashboard?section=reservations');
    else if (section === 'notifications')
      router.push('/utilisateur/notifications');
    else if (section === 'parametres')
      router.push('/utilisateur/dashboard?section=parametres');
  };

  return (
    <UserLayout activeSection="messagerie" onSectionChange={handleSectionChange}>
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-6 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
            <MessageSquare className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-300">Communication</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Messagerie</h1>
            <p className="text-white/70 text-sm">
              Échangez avec les agences immobilières
            </p>
          </div>
        </div>
      </motion.div>

      <div className="h-[calc(100vh-14rem)] flex flex-col md:flex-row gap-6">
        {/* Left Pane - Contacts List */}
        <div className="w-full md:w-80 lg:w-96 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full flex-shrink-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              Messagerie
            </h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {contacts.length} conversations
            </span>
          </div>

          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Chargement...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">
                  {searchTerm ? 'Aucun résultat' : 'Aucune conversation'}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {searchTerm
                    ? 'Essayez avec d\'autres termes'
                    : 'Vos messages avec les agences apparaîtront ici'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedContact(contact)}
                    className={`flex items-start gap-3 p-4 cursor-pointer transition-all ${
                      selectedContact?.id === contact.id
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'border-l-4 border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm border ${
                          selectedContact?.id === contact.id
                            ? 'bg-blue-600 text-white border-blue-700'
                            : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        {contact.avatar}
                      </div>
                      {contact.online && (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3
                          className={`font-bold truncate text-sm ${
                            contact.unread > 0 ? 'text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {contact.nom}
                        </h3>
                        <span
                          className={`text-xs font-semibold ${
                            contact.unread > 0 ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        >
                          {contact.time}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${
                          contact.unread > 0
                            ? 'font-semibold text-slate-800'
                            : 'text-slate-500'
                        }`}
                      >
                        {contact.lastMessage}
                      </p>
                    </div>
                    {contact.unread > 0 && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                        {contact.unread}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Chat Window */}
        {selectedContact ? (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-xl border border-blue-200">
                    {selectedContact.avatar}
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedContact.nom}
                  </h2>
                  <p className="text-sm font-medium text-slate-500">
                    Agence immobilière
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200">
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
              <div className="flex justify-center">
                <span className="px-4 py-1.5 bg-white text-slate-500 text-xs font-medium rounded-full border border-slate-200 shadow-sm">
                  {selectedContact?.raw?.bien?.libelle
                    ? `À propos de: ${selectedContact.raw.bien.libelle}`
                    : 'Conversation'}
                </span>
              </div>

              <AnimatePresence>
                {conversation.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] flex flex-col gap-1 ${
                        msg.isMe ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                          msg.isMe
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm border border-blue-400/30'
                            : 'bg-white text-slate-800 rounded-tl-sm border border-slate-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 px-1">
                        <Clock className="h-3 w-3" />
                        {msg.time}
                        {msg.isMe && <MessageStatusIcon status={msg.status} />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {conversation.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">Aucun message</p>
                  <p className="text-xs">Envoyez un message pour commencer</p>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-3 max-w-4xl mx-auto"
              >
                <button
                  type="button"
                  className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all overflow-hidden flex items-center">
                  <input
                    type="text"
                    placeholder="Écrivez un message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full py-3.5 px-4 bg-transparent outline-none text-slate-900 font-medium text-sm sm:text-base placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center min-w-[3rem]"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-slate-400 p-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <MessageSquare className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-1">
              Sélectionnez une conversation
            </h3>
            <p className="text-sm text-slate-400 text-center max-w-sm">
              Choisissez une agence dans la liste pour voir vos messages et continuer la conversation
            </p>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
