"use client";

import React, { useState } from "react";
import {
  MessageSquare, Search, Phone, Video,
  MoreVertical, Send, Paperclip, Check, CheckCheck
} from "lucide-react";

interface Contact {
  id: string;
  nom: string;
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
  status: "SENT" | "DELIVERED" | "READ";
}

// Les mocks sont remplacés par des appels API

export default function AgenceMessages() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter contacts based on search term
  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredContacts(contacts);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredContacts(contacts.filter(c => 
        c.nom.toLowerCase().includes(term) || 
        c.lastMessage.toLowerCase().includes(term)
      ));
    }
  }, [contacts, searchTerm]);

  const fetchContacts = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") : null;
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8080/api/contacts/agence/recus", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.contacts) {
          const mapped: Contact[] = data.contacts.map((c: any) => ({
            id: c.id.toString(),
            nom: c.client ? `${c.client.prenom} ${c.client.nom}` : "Client Inconnu",
            avatar: c.client ? c.client.prenom.charAt(0).toUpperCase() : "U",
            lastMessage: c.reponse || c.message || "Aucun message",
            time: c.dateContact && !isNaN(new Date(c.dateContact).getTime()) 
              ? new Date(c.dateContact).toLocaleDateString('fr-FR') 
              : "Date inconnue",
            unread: c.statut === 'EN_ATTENTE' ? 1 : 0,
            online: false,
            raw: c
          }));
          setContacts(mapped);
          if (mapped.length > 0 && !selectedContact) {
            setSelectedContact(mapped[0]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchContacts();
  }, []);

  React.useEffect(() => {
    if (selectedContact && selectedContact.raw) {
      const raw = selectedContact.raw;
      const conv: Message[] = [];
      if (raw.message) {
        conv.push({
          id: "msg-" + raw.id,
          text: raw.message,
          time: raw.dateContact && !isNaN(new Date(raw.dateContact).getTime())
            ? new Date(raw.dateContact).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : "--:--",
          isMe: false,
          status: "READ"
        });
      }
      if (raw.reponse) {
        conv.push({
          id: "rep-" + raw.id,
          text: raw.reponse,
          time: raw.dateReponse && !isNaN(new Date(raw.dateReponse).getTime())
            ? new Date(raw.dateReponse).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
          status: "SENT"
        });
      }
      setConversation(conv);

      if (raw.statut === 'EN_ATTENTE') {
        markAsReadAndRefresh(raw.id);
      }
    }
  }, [selectedContact]);

  const markAsReadAndRefresh = async (contactId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") : null;
    try {
      await fetch(`http://localhost:8080/api/contacts/${contactId}/marquer-lu`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setContacts(c => c.map(item => item.id === contactId.toString() ? { ...item, unread: 0 } : item));
    } catch (err) { }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContact) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") : null;
    try {
      const res = await fetch(`http://localhost:8080/api/contacts/${selectedContact.id}/repondre`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reponse: messageText })
      });
      if (res.ok) {
        const newMessage: Message = {
          id: Date.now().toString(),
          text: messageText,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
          status: "SENT"
        };
        setConversation([...conversation, newMessage]);
        setMessageText("");
        // Update contact list preview text
        setContacts(c => c.map(item => item.id === selectedContact.id ? { ...item, lastMessage: messageText } : item));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const MessageStatusIcon = ({ status }: { status: "SENT" | "DELIVERED" | "READ" }) => {
    switch (status) {
      case "SENT": return <Check className="w-3.5 h-3.5 text-slate-400" />;
      case "DELIVERED": return <CheckCheck className="w-3.5 h-3.5 text-slate-400" />;
      case "READ": return <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">

      {/* Left Pane - Contacts List */}
      <div className="w-full md:w-80 lg:w-96 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full flex-shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-500" />
            Messagerie
          </h2>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Chargement...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              {searchTerm ? "Aucun résultat trouvé" : "Aucune conversation"}
            </div>
          ) : filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-l-4 ${selectedContact?.id === contact.id ? 'bg-indigo-50/50 border-indigo-500' : 'border-transparent hover:bg-slate-50'}`}
            >
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm border ${selectedContact?.id === contact.id ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  {contact.avatar}
                </div>
                {contact.online && (
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full z-10" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-bold truncate text-sm ${contact.unread > 0 ? 'text-slate-900' : 'text-slate-700'}`}>{contact.nom}</h3>
                  <span className={`text-xs font-semibold ${contact.unread > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>{contact.time}</span>
                </div>
                <p className={`text-sm truncate ${contact.unread > 0 ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                  {contact.lastMessage}
                </p>
              </div>
              {contact.unread > 0 && (
                <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md shadow-indigo-500/20 translate-y-2">
                  {contact.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane - Chat Window */}
      {selectedContact ? (
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl border border-indigo-200 shadow-inner">
                  {selectedContact.avatar}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedContact.nom}</h2>
                {selectedContact.online && (
                  <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    En ligne
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-slate-100">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-slate-100">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 sm:p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors ml-2">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full border border-slate-200 shadow-sm">
                Début de la conversation - {selectedContact?.raw?.bien?.libelle ? `A propos de: ${selectedContact.raw.bien.libelle}` : ""}
              </span>
            </div>
            {conversation.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[70%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`p-4 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed ${msg.isMe
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-sm border border-indigo-400/30'
                    : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'
                    }`}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 px-1">
                    {msg.time}
                    {msg.isMe && <MessageStatusIcon status={msg.status} />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
              <button type="button" className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-inner focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden flex items-center">
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
                disabled={!messageText.trim()}
                className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center min-w-[3rem]"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400">
          Sélectionnez une conversation pour l'afficher ici.
        </div>
      )}
    </div>
  );
}
