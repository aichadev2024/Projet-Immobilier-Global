"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Mail, Lock, User, Phone, Eye, EyeOff, ShieldCheck, 
  ArrowRight, Building2, UserCircle2, CheckCircle2, 
  AlertCircle, ChevronRight, Globe, MapPin, FileCheck,
  Upload, FileText, X
} from "lucide-react";
import BrandMark from "@/components/vitrine/BrandMark";

export default function RegisterPage() {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nomUtilisateur, setNomUtilisateur] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [telephone, setTelephone] = useState("+223 ");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("UTILISATEUR");
  const [loading, setLoading] = useState(false);

  // États pour les champs spécifiques aux agences
  const [nomAgence, setNomAgence] = useState("");
  const [adresseAgence, setAdresseAgence] = useState("");
  const [telephoneAgence, setTelephoneAgence] = useState("+223 ");
  const [ninea, setNinea] = useState("");
  const [descriptionAgence, setDescriptionAgence] = useState("");
  const [visitePayante, setVisitePayante] = useState(false);
  const [tarifVisite, setTarifVisite] = useState("");

  // États pour les documents de l'agence
  const [documents, setDocuments] = useState<{
    registreCommerce: File | null;
    pieceIdentite: File | null;
    licencePro: File | null;
  }>({
    registreCommerce: null,
    pieceIdentite: null,
    licencePro: null,
  });
  const [uploadProgress, setUploadProgress] = useState<{
    registreCommerce: number;
    pieceIdentite: number;
    licencePro: number;
  }>({
    registreCommerce: 0,
    pieceIdentite: 0,
    licencePro: 0,
  });

  const hasMinLength = motDePasse.length >= 8;
  const hasUpperCase = /[A-Z]/.test(motDePasse);
  const hasLowerCase = /[a-z]/.test(motDePasse);
  const hasNumber = /\d/.test(motDePasse);
  const hasSpecialChar = /[@$!%*?&]/.test(motDePasse);
  const passwordsMatch = motDePasse !== "" && motDePasse === confirmPassword;
  
  const hasRequiredFields = nom.trim() !== "" && prenom.trim() !== "" && nomUtilisateur.trim() !== "" && email.trim() !== "" && motDePasse.trim() !== "" && confirmPassword.trim() !== "";
  const hasAgencyRequiredFields = role === "AGENCE" && nomAgence.trim() !== "" && adresseAgence.trim() !== "" && telephoneAgence.trim() !== "" && ninea.trim() !== "";
  const hasValidNINEA = /^\d{9}$/.test(ninea.trim()); // Exactement 9 chiffres requis
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasRequiredDocuments = role !== "AGENCE" || (documents.registreCommerce !== null && documents.pieceIdentite !== null);
  const canSubmit = hasRequiredFields && hasValidEmail && hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && passwordsMatch && (role !== "AGENCE" || (hasAgencyRequiredFields && hasValidNINEA && hasRequiredDocuments)) && !loading;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;
    setLoading(true);

    try {
      // Créer FormData pour envoyer les fichiers
      const formData = new FormData();
      formData.append("username", nomUtilisateur);
      formData.append("email", email);
      formData.append("password", motDePasse);
      formData.append("nom", nom);
      formData.append("prenom", prenom);
      formData.append("telephone", telephone);
      formData.append("roleType", role);

      if (role === "AGENCE") {
        formData.append("nomAgence", nomAgence);
        formData.append("adresseAgence", adresseAgence);
        formData.append("telephoneAgence", telephoneAgence);
        formData.append("ninea", ninea);
        formData.append("descriptionAgence", descriptionAgence);
        formData.append("visitePayante", visitePayante ? "true" : "false");
        if (visitePayante && tarifVisite) {
          formData.append("tarifVisite", tarifVisite);
        }

        // Ajouter les documents
        if (documents.registreCommerce) {
          formData.append("registreCommerce", documents.registreCommerce);
        }
        if (documents.pieceIdentite) {
          formData.append("pieceIdentite", documents.pieceIdentite);
        }
        if (documents.licencePro) {
          formData.append("licencePro", documents.licencePro);
        }
      }

      const res = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur lors de la création du compte.");
      }

      if (role === "AGENCE") {
        alert("Compte créé avec succès ! Vos documents ont été soumis pour vérification. Un administrateur validera votre compte après vérification des documents.");
      } else {
        alert("Compte créé avec succès ! Veuillez valider votre numéro de téléphone.");
      }
      router.push(`/validate-otp?username=${encodeURIComponent(nomUtilisateur)}&type=REGISTRATION`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAgency = role === "AGENCE";
  const accentBg = isAgency ? "bg-emerald-600" : "bg-indigo-600";
  const accentText = isAgency ? "text-emerald-600" : "text-indigo-600";
  const accentRing = isAgency ? "focus:ring-emerald-500/50" : "focus:ring-indigo-500/50";

  // Fonctions de gestion des documents
  const handleDocumentSelect = (type: 'registreCommerce' | 'pieceIdentite' | 'licencePro', file: File | null) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
    if (file) {
      // Simuler la progression du téléchargement
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => ({ ...prev, [type]: progress }));
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 100);
    }
  };

  const handleDocumentRemove = (type: 'registreCommerce' | 'pieceIdentite' | 'licencePro') => {
    setDocuments(prev => ({ ...prev, [type]: null }));
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
  };

  // Composant de téléchargement de document
  const DocumentUploadField = ({
    label,
    description,
    file,
    progress,
    onFileSelect,
    onFileRemove,
    acceptedTypes,
    required = true
  }: {
    label: string;
    description: string;
    file: File | null;
    progress: number;
    onFileSelect: (file: File | null) => void;
    onFileRemove: () => void;
    acceptedTypes: string;
    required?: boolean;
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
      <div className="mb-3 p-3 bg-white rounded-xl border border-emerald-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-900">{label}</span>
              {required && <span className="text-red-500 text-xs">*</span>}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">{description}</p>
          </div>
          <div className="text-[10px] text-slate-400">PDF, JPG, PNG max 5MB</div>
        </div>

        {!file ? (
          <div
            onClick={() => inputRef.current?.click()}
            className="mt-2 p-3 border-2 border-dashed border-emerald-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors flex items-center justify-center gap-2"
          >
            <Upload size={16} className="text-emerald-500" />
            <span className="text-xs text-emerald-700 font-medium">Cliquez pour sélectionner un fichier</span>
            <input
              ref={inputRef}
              type="file"
              accept={acceptedTypes}
              onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>
        ) : (
          <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-emerald-600" />
                <div>
                  <p className="text-xs font-medium text-emerald-900 truncate max-w-[150px]">{file.name}</p>
                  <p className="text-[10px] text-emerald-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onFileRemove}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X size={14} className="text-red-500" />
              </button>
            </div>
            {progress < 100 && (
              <div className="mt-2">
                <div className="h-1 bg-emerald-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-emerald-600 mt-1">{progress}% téléchargé</p>
              </div>
            )}
            {progress === 100 && (
              <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 size={10} /> Prêt à l'envoi
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden px-4 py-8 font-sans">
      <div className={`absolute -top-20 -right-20 w-[400px] h-[400px] ${isAgency ? 'bg-emerald-100/40' : 'bg-indigo-100/40'} rounded-full blur-[100px] transition-colors duration-700 animate-pulse`}></div>

      <div className="w-full max-w-[980px] bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-slate-200/50 flex flex-col md:flex-row overflow-hidden relative z-10 backdrop-blur-sm">

        {/* Left Panel */}
        <div className={`hidden md:flex md:w-[38%] ${isAgency ? 'bg-emerald-600' : 'bg-indigo-600'} p-10 flex-col justify-between relative transition-colors duration-700 overflow-hidden`}>
          <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${isAgency ? 'from-emerald-600 via-emerald-700 to-teal-800' : 'from-indigo-600 via-indigo-700 to-blue-800'} z-0`}></div>
          
          <div className="relative z-10">
            <div className="mb-12 transform hover:scale-105 transition-transform">
              <BrandMark variant="dark" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white leading-none tracking-tight">
                {isAgency ? "Propulsez votre agence." : "Trouvez votre foyer."}
              </h2>
              <p className="text-white/80 text-sm leading-relaxed font-light">
                {isAgency ? "Gérez vos mandats et boostez votre visibilité." : "Meilleures annonces vérifiées et experts à votre écoute."}
              </p>
            </div>

            <div className="mt-10 space-y-4">
              {[ { icon: ShieldCheck, text: "Sécurisé" }, { icon: CheckCircle2, text: "Vérifié" } ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                    <item.icon size={18} className="text-white" />
                  </div>
                  <span className="text-white text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-10">
            <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10">
              <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mb-2">Communauté</p>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-white/20 flex items-center justify-center text-[8px] text-white font-bold opacity-80" />)}
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-white text-indigo-600 flex items-center justify-center text-[8px] font-bold">+2k</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-[62%] p-8 md:p-12 h-full max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <span className={`inline-block px-3 py-1 rounded-full ${isAgency ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'} text-[10px] font-bold uppercase tracking-wider mb-3`}>
                Rejoignez-nous
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Inscription</h1>
              <p className="text-slate-500 font-medium text-sm">Créez votre compte en quelques secondes.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">

              {/* Role Switcher */}
              <div className="p-1 bg-slate-100 rounded-2xl flex gap-1">
                <button type="button" onClick={() => setRole("UTILISATEUR")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all font-bold text-xs ${!isAgency ? "bg-white text-indigo-600 shadow-lg shadow-indigo-100" : "text-slate-500 hover:text-slate-700"}`}>
                  <UserCircle2 size={16} /> Client
                </button>
                <button type="button" onClick={() => setRole("AGENCE")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all font-bold text-xs ${isAgency ? "bg-white text-emerald-600 shadow-lg shadow-emerald-100" : "text-slate-500 hover:text-slate-700"}`}>
                  <Building2 size={16} /> Agence
                </button>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} className={`w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 ${accentRing} focus:border-transparent outline-none font-medium text-sm`} placeholder="Jean" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} className={`w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 ${accentRing} focus:border-transparent outline-none font-medium text-sm`} placeholder="Dupont" required />
                  </div>
                </div>
              </div>

              {/* Username/Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" value={nomUtilisateur} onChange={(e) => setNomUtilisateur(e.target.value.toLowerCase().replace(/\s+/g, ''))} className={`w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 ${accentRing} focus:border-transparent outline-none font-medium text-sm`} placeholder="jean.pro" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tél.</label>
                  <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 ${accentRing} focus:border-transparent outline-none font-medium text-sm`} placeholder="+223 (Tél personnel)" />
                </div>
              </div>

              {/* Agency Fields */}
              {isAgency && (
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3 animate-scale-up">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={16} className="text-emerald-600" />
                    <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Agence</h3>
                  </div>
                  <input type="text" value={nomAgence} onChange={(e) => setNomAgence(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-emerald-100 bg-white text-xs font-bold text-emerald-900 outline-none" placeholder="Nom Commercial" required />
                  <input type="text" value={adresseAgence} onChange={(e) => setAdresseAgence(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-emerald-100 bg-white text-xs font-bold text-emerald-900 outline-none" placeholder="Adresse Siège" required />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="tel" value={telephoneAgence} onChange={(e) => setTelephoneAgence(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-emerald-100 bg-white text-xs font-bold text-emerald-900 outline-none" placeholder="Tél. de l'agence" required />
                    <input type="text" value={ninea} onChange={(e) => setNinea(e.target.value)} className={`w-full px-4 py-2 rounded-xl border ${ninea.length > 0 && !hasValidNINEA ? 'border-orange-400 text-orange-600 focus:border-orange-400/50' : 'border-emerald-100'} bg-white text-xs font-bold text-emerald-900 outline-none`} placeholder="NIF / NINA" required />
                  </div>
                  <textarea value={descriptionAgence} onChange={(e) => setDescriptionAgence(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-emerald-100 bg-white text-xs font-bold text-emerald-900 outline-none resize-none" placeholder="Description courte de l'agence (optionnel)" rows={2} />

                  {/* Visites payantes */}
                  <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900">Visites payantes ?</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setVisitePayante(false)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${!visitePayante ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          Non (Gratuit)
                        </button>
                        <button
                          type="button"
                          onClick={() => setVisitePayante(true)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${visitePayante ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          Oui (Payant)
                        </button>
                      </div>
                    </div>
                    {visitePayante && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-100">
                        <span className="text-xs text-slate-500">Tarif par visite:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tarifVisite}
                            onChange={(e) => setTarifVisite(e.target.value)}
                            className="w-24 px-3 py-1.5 rounded-lg border border-emerald-200 bg-white text-xs font-bold text-emerald-900 outline-none"
                            placeholder="5000"
                            min="0"
                            step="100"
                          />
                          <span className="text-xs text-slate-600 font-medium">FCFA</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Documents de l'agence */}
                  <div className="mt-4 pt-4 border-t border-emerald-200">
                    <div className="flex items-center gap-2 mb-3">
                      <FileCheck size={16} className="text-emerald-600" />
                      <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Documents obligatoires</h3>
                      <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Requis</span>
                    </div>

                    {/* Registre de Commerce / NINEA */}
                    <DocumentUploadField
                      label="Registre de Commerce ou NINEA"
                      description="Document justifiant l'existence légale de l'agence"
                      file={documents.registreCommerce}
                      progress={uploadProgress.registreCommerce}
                      onFileSelect={(file) => handleDocumentSelect('registreCommerce', file)}
                      onFileRemove={() => handleDocumentRemove('registreCommerce')}
                      acceptedTypes=".pdf,.jpg,.jpeg,.png"
                    />

                    {/* Pièce d'identité */}
                    <DocumentUploadField
                      label="Pièce d'identité du responsable"
                      description="CNI, Passeport ou permis de conduire"
                      file={documents.pieceIdentite}
                      progress={uploadProgress.pieceIdentite}
                      onFileSelect={(file) => handleDocumentSelect('pieceIdentite', file)}
                      onFileRemove={() => handleDocumentRemove('pieceIdentite')}
                      acceptedTypes=".pdf,.jpg,.jpeg,.png"
                    />

                    {/* Licence professionnelle (optionnel) */}
                    <DocumentUploadField
                      label="Licence professionnelle (optionnel)"
                      description="Licence d'agence immobilière si applicable"
                      file={documents.licencePro}
                      progress={uploadProgress.licencePro}
                      onFileSelect={(file) => handleDocumentSelect('licencePro', file)}
                      onFileRemove={() => handleDocumentRemove('licencePro')}
                      acceptedTypes=".pdf,.jpg,.jpeg,.png"
                      required={false}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 ${accentRing} focus:border-transparent outline-none font-medium text-sm`} placeholder="adresse@mail.com" required />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type={showPassword ? "text" : "password"} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} className={`w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 ${accentRing} focus:border-transparent outline-none font-medium text-sm`} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirmer</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 ${accentRing} focus:border-transparent outline-none font-medium text-sm`} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Strength matrix mini */}
              <div className="flex gap-1 px-1">
                {[hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].map((v, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${motDePasse ? (v ? 'bg-emerald-500' : 'bg-slate-200') : 'bg-slate-100'}`} />
                ))}
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2 animate-shake">
                  <AlertCircle size={16} /> <p>{error}</p>
                </div>
              )}

              <button type="submit" disabled={!canSubmit} className={`w-full py-3.5 mt-2 rounded-xl ${accentBg} text-white font-black text-sm shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2`}>
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Inscription <ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-400 font-medium text-xs">
                Déjà inscrit ? <button onClick={() => router.push("/login")} className={`${accentText} font-black hover:underline`}>Connectez-vous</button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-scale-up { animation: scale-up 0.3s ease-out forwards; }
        .animate-shake { animation: shake 0.2s ease-in-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
