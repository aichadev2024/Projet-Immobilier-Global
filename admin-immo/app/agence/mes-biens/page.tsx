'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Square, 
  Bed, 
  Bath,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Building,
  FileText,
  Upload,
  X,
  Download,
  Loader2
} from 'lucide-react'

interface Bien {
  id: number
  titre: string
  description: string
  categorie: string
  typeBien: string
  prix: number
  devise: string
  adresse: string
  ville: string
  pays: string
  superficie: number
  nbChambres: number
  nbSallesDeBain: number
  meuble: boolean
  garage: boolean
  piscine: boolean
  climatisation: boolean
  statutBien: string
  dateCreation: string
}

interface DocumentBien {
  id: string
  type: string
  statut: string
  nomFichier: string
  dateSoumission: string
  commentaires?: string
}

export default function MesBiensPage() {
  const router = useRouter()
  const [biens, setBiens] = useState<Bien[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('TOUS')
  
  // États pour la gestion des documents
  const [selectedBien, setSelectedBien] = useState<Bien | null>(null)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [documents, setDocuments] = useState<DocumentBien[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState<string | null>(null)

  useEffect(() => {
    fetchBiens()
  }, [])

  const fetchBiens = async () => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
      
      const response = await fetch(`${API_BASE_URL}/api/biens/agence/mes-biens`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setBiens(data.biens)
      } else {
        setError(data.message || 'Erreur lors du chargement des biens')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'PUBLIE': return 'bg-green-100 text-green-800 border-green-200'
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'VENDU': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'REJETE': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'PUBLIE': return <CheckCircle className="h-4 w-4" />
      case 'EN_ATTENTE': return <Clock className="h-4 w-4" />
      case 'VENDU': return <CheckCircle className="h-4 w-4" />
      case 'REJETE': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatutText = (statut: string) => {
    switch (statut) {
      case 'PUBLIE': return 'Publié'
      case 'EN_ATTENTE': return 'En attente'
      case 'VENDU': return 'Vendu/Loué'
      case 'REJETE': return 'Rejeté'
      default: return statut
    }
  }

  // Fonctions pour la gestion des documents
  const fetchDocuments = async (bienId: number) => {
    try {
      setDocumentsLoading(true)
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
      
      const response = await fetch(`${API_BASE_URL}/api/documents-bien/bien/${bienId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des documents:', err)
    } finally {
      setDocumentsLoading(false)
    }
  }

  const handleUploadDocument = async (bienId: number, file: File, type: string) => {
    try {
      setUploadingFile(type)
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      
      const response = await fetch(`${API_BASE_URL}/api/documents-bien/upload/${bienId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (response.ok) {
        alert('Document uploadé avec succès ! En attente de vérification.')
        fetchDocuments(bienId)
      } else {
        const error = await response.text()
        alert('Erreur lors de l\'upload: ' + error)
      }
    } catch (err) {
      alert('Erreur lors de l\'upload du document')
    } finally {
      setUploadingFile(null)
    }
  }

  const handleDownloadDocument = async (documentId: string) => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
      
      const response = await fetch(`${API_BASE_URL}/api/documents-bien/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `document.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      alert('Erreur lors du téléchargement')
    }
  }

  const openDocumentModal = (bien: Bien) => {
    setSelectedBien(bien)
    setShowDocumentModal(true)
    fetchDocuments(bien.id)
  }

  const documentTypes = [
    { key: 'TITRE_PROPRIETE', label: 'Titre de propriété', required: true },
    { key: 'TITRE_FONCIER', label: 'Titre foncier', required: true },
    { key: 'PLAN_CADASTRAL', label: 'Plan cadastral', required: false },
    { key: 'CERTIFICAT_CONFORMITE', label: 'Certificat de conformité', required: false },
    { key: 'DIAGNOSTIC_ENERGETIQUE', label: 'Diagnostic énergétique', required: false },
    { key: 'TAXE_FONCIERE', label: 'Taxe foncière', required: false }
  ]

  const getStatutBadgeClass = (statut: string) => {
    switch (statut) {
      case 'VERIFIE': return 'bg-green-100 text-green-800'
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800'
      case 'REFUSE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredBiens = biens.filter(bien => {
    if (filter === 'TOUS') return true
    return bien.statutBien === filter
  })

  const stats = {
    total: biens.length,
    publies: biens.filter(b => b.statutBien === 'PUBLIE').length,
    enAttente: biens.filter(b => b.statutBien === 'EN_ATTENTE').length,
    vendus: biens.filter(b => b.statutBien === 'VENDU').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Chargement de vos biens</h2>
          <p className="text-gray-600">Récupération de vos annonces...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 sm:py-0 sm:h-16">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Building className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mes biens</h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium hidden sm:block">Gestion de vos annonces immobilières</p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/agence/ajouter-bien')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg w-full sm:w-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Ajouter un bien</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Total</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Publiés</p>
                  <p className="text-3xl font-bold text-green-600">{stats.publies}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">En attente</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.enAttente}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Vendus</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.vendus}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Filtrer par statut:</span>
                <div className="flex gap-2">
                  {['TOUS', 'PUBLIE', 'EN_ATTENTE', 'VENDU'].map((statut) => (
                    <Button
                      key={statut}
                      variant={filter === statut ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(statut)}
                      className={filter === statut ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:bg-gray-50'}
                    >
                      {statut === 'TOUS' ? 'Tous' : 
                       statut === 'PUBLIE' ? 'Publiés' :
                       statut === 'EN_ATTENTE' ? 'En attente' : 'Vendus'}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {filteredBiens.length} bien{filteredBiens.length > 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50 mb-8">
            <CardContent className="p-4">
              <p className="text-red-700 font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Biens Grid */}
        {filteredBiens.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-12 text-center">
              <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'TOUS' ? 'Aucun bien pour le moment' : `Aucun bien ${filter.toLowerCase()}`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'TOUS' 
                  ? 'Commencez par ajouter votre première annonce immobilière.' 
                  : `Vous n'avez aucun bien ${filter.toLowerCase()}.`}
              </p>
              {filter === 'TOUS' && (
                <Button 
                  onClick={() => router.push('/agence/ajouter-bien')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter un bien
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBiens.map((bien) => (
              <Card key={bien.id} className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {bien.titre}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatutColor(bien.statutBien)}>
                          <div className="flex items-center gap-1">
                            {getStatutIcon(bien.statutBien)}
                            {getStatutText(bien.statutBien)}
                          </div>
                        </Badge>
                        <Badge variant="outline" className="border-gray-300">
                          {bien.categorie === 'A_VENDRE' ? 'À vendre' : 'À louer'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold text-green-600">
                    {bien.prix.toLocaleString()} {bien.devise}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {bien.adresse}, {bien.ville}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Square className="h-4 w-4 mr-2 text-gray-400" />
                      {bien.superficie} m²
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Bed className="h-4 w-4 mr-2 text-gray-400" />
                      {bien.nbChambres} chambre{bien.nbChambres > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Bath className="h-4 w-4 mr-2 text-gray-400" />
                      {bien.nbSallesDeBain} salle{bien.nbSallesDeBain > 1 ? 's' : ''} de bain
                    </div>
                  </div>

                  {bien.statutBien === 'EN_ATTENTE' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⏳ En attente de validation par l'administrateur
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-gray-300 hover:bg-gray-50"
                      onClick={() => router.push(`/biens/${bien.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-gray-300 hover:bg-gray-50"
                      onClick={() => router.push(`/agence/biens/${bien.id}/modifier`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-blue-300 hover:bg-blue-50 text-blue-600"
                      onClick={() => openDocumentModal(bien)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Docs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modal de gestion des documents */}
      {showDocumentModal && selectedBien && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Documents administratifs</h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedBien.titre}</p>
                </div>
                <button 
                  onClick={() => setShowDocumentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {documentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Les documents marqués <span className="text-red-500">*</span> sont obligatoires pour la validation du bien.
                  </p>

                  {documentTypes.map((docType) => {
                    const existingDoc = documents.find(d => d.type === docType.key)
                    return (
                      <div key={docType.key} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{docType.label}</span>
                              {docType.required && <span className="text-red-500">*</span>}
                              {existingDoc && (
                                <Badge className={getStatutBadgeClass(existingDoc.statut)}>
                                  {existingDoc.statut === 'VERIFIE' ? 'Vérifié' : 
                                   existingDoc.statut === 'EN_ATTENTE' ? 'En attente' : 'Refusé'}
                                </Badge>
                              )}
                            </div>
                            {existingDoc && (
                              <p className="text-xs text-gray-500 mt-1">
                                Soumis le {new Date(existingDoc.dateSoumission).toLocaleDateString('fr-FR')}
                                {existingDoc.commentaires && ` - ${existingDoc.commentaires}`}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {existingDoc ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadDocument(existingDoc.id)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Télécharger
                                </Button>
                                {existingDoc.statut === 'REFUSE' && (
                                  <div className="text-xs text-red-600 max-w-[150px]">
                                    À soumettre à nouveau
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="relative">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleUploadDocument(selectedBien.id, file, docType.key)
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  disabled={uploadingFile === docType.key}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={uploadingFile === docType.key}
                                >
                                  {uploadingFile === docType.key ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <Upload className="h-4 w-4 mr-1" />
                                  )}
                                  {uploadingFile === docType.key ? 'Upload...' : 'Uploader'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                <FileText className="h-4 w-4" />
                <span>Les documents sont vérifiés par l'administration sous 24-48h</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
