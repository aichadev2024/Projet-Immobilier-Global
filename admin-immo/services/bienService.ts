import { API_BASE_URL, apiFetch } from "@/services/api";
export async function getBiens() {
  try {
    const data = await apiFetch("/api/biens", { 
      cache: "no-store",
      authenticated: false 
    });
    
    // Si data est null ou non défini, retourner tableau vide
    if (!data) return [];
    
    const realBiensRaw = data.biens || (Array.isArray(data) ? data : []);
    
    const realBiens = realBiensRaw.map((bien: any, index: number) => {
      const originalTransaction = bien.typeTransaction || bien.transactionType;
      const normalizedTransaction = normalizeTransaction(originalTransaction);
      
      // Log pour debug visite payante
      if (index < 5) {
        console.log(`Bien ${bien.id} - visitePayante:`, bien.visitePayante, "tarifVisite:", bien.tarifVisite);
      }
      if (index < 3) {
        console.log(`Normalisation bien ${bien.id}:`, originalTransaction, "->", normalizedTransaction);
        console.log(`Données agence pour bien ${bien.id}:`, JSON.stringify(bien.utilisateur, null, 2));
      }
      
      const testBien = {
        ...bien,
        libelleTypeBien: bien.libelleTypeBien || bien.typeBien?.nom || bien.typeBien?.libelle || "Bien",
        typeTransaction: normalizedTransaction,
        ville: bien.ville || bien.adresse || bien.quartier || "Bamako",
        nbChambres: bien.nbChambres || bien.caracteristiques?.nbChambres || 0,
        nbSalles: bien.nbSalles || bien.caracteristiques?.nbSallesDeBain || 0,
        superficie: bien.superficie || bien.caracteristiques?.superficie || 0,
        parking: bien.parking || bien.caracteristiques?.nbParking > 0 || false,
        visitePayante: bien.visitePayante || false,
        tarifVisite: bien.tarifVisite || null,
        isDemo: false,
      };
      
      return testBien;
    });
    
    console.log(`${realBiens.length} biens réels chargés`);
    return realBiens;
  } catch (error) {
    console.error("Erreur lors du chargement des biens:", error);
    return [];
  }
}

// Récupérer tous les biens pour admin (incluant LOUE et VENDU)
export async function getBiensAdmin() {
  try {
    const data = await apiFetch("/api/biens/admin", { cache: "no-store" });
    const biensRaw = data.biens || [];
    
    return biensRaw.map((bien: any) => ({
      ...bien,
      libelleTypeBien: bien.libelleTypeBien || bien.typeBien?.nom || "Bien",
      typeTransaction: normalizeTransaction(bien.typeTransaction || bien.transactionType),
      ville: bien.ville || bien.adresse || "Bamako",
      nbChambres: bien.nbChambres || bien.caracteristiques?.nbChambres || 0,
      superficie: bien.superficie || bien.caracteristiques?.superficie || 0,
      isDemo: false,
    }));
  } catch (error) {
    console.error("Erreur chargement biens admin:", error);
    return getBiens();
  }
}

// Récupérer les biens de l'agence connectée (tous les biens de l'agence)
export async function getBiensAgence() {
  try {
    const data = await apiFetch("/api/biens/agence", { cache: "no-store" });
    const biensRaw = data.biens || [];
    
    return biensRaw.map((bien: any) => ({
      ...bien,
      libelleTypeBien: bien.libelleTypeBien || bien.typeBien?.nom || "Bien",
      typeTransaction: normalizeTransaction(bien.typeTransaction || bien.transactionType),
      ville: bien.ville || bien.adresse || "Bamako",
      nbChambres: bien.nbChambres || bien.caracteristiques?.nbChambres || 0,
      superficie: bien.superficie || bien.caracteristiques?.superficie || 0,
      isDemo: false,
    }));
  } catch (error) {
    console.error("Erreur chargement biens agence:", error);
    return [];
  }
}

// Helper pour normaliser le type de transaction
function normalizeTransaction(transaction: string): string {
  const raw = (transaction || "VENTE")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '');
  if (raw === 'ALOUER' || raw === 'LOCATION') return 'LOCATION';
  if (raw === 'AVENDRE' || raw === 'VENTE') return 'VENTE';
  return raw;
}

// Fonction pour la vitrine - inclut les biens démo
export async function getBiensWithDemo() {
  try {
    const realBiens = await getBiens();
    const demoBiens = getDemoBiens();
    
    const allBiens = [...realBiens, ...demoBiens];
    
    console.log(`${realBiens.length} biens réels + ${demoBiens.length} démo = ${allBiens.length} total (vitrine)`);
    return allBiens;
  } catch (error) {
    console.error("Erreur lors du chargement des biens:", error);
    return getDemoBiens();
  }
}

// Données de démonstration
function getDemoBiens() {
  const defaultImage = "/images/hero-default.jpg";
  const localHeroImages = [
    "/images/maison bamako.webp",
    "/images/Villa à Yirimadjo Zerny.jpg",
    "/images/Faso canu.webp",
    "/images/Duplexe à Baco Djicoroni Aci.webp",
    "/images/Appartement a sotuba.jpg",
  ];
  function getLocalImage(index: number) {
    return localHeroImages[index % localHeroImages.length] || defaultImage;
  }
  return [
    {
      id: 1001,
      libelle: "Villa de Luxe avec Piscine",
      description: "Magnifique villa 4 chambres avec piscine privée, jardin et terrasse.",
      prixCalculer: 85000000,
      ville: "Bamako",
      superficie: 350,
      libelleTypeBien: "Villa",
      typeTransaction: "VENTE",
      images: [getLocalImage(0)],
      nbChambres: 4,
      nbSalles: 2,
      isDemo: true,
      utilisateur: {
        nom: "Agence Prestige",
        telephone: "+22320202020",
        agence: {
          visitePayante: true,
          tarifVisite: 5000
        }
      }
    },
    {
      id: 1002,
      libelle: "Appartement T2 Centre-Ville",
      description: "Appartement lumineux en plein centre de Bamako.",
      prixCalculer: 180000,
      ville: "Bamako",
      superficie: 55,
      libelleTypeBien: "Appartement",
      typeTransaction: "LOCATION",
      images: [getLocalImage(1)],
      nbChambres: 2,
      nbSalles: 1,
      isDemo: true,
      utilisateur: {
        nom: "Immo City",
        telephone: "+22320202021",
        agence: {
          visitePayante: false,
          tarifVisite: 0
        }
      }
    },
    {
      id: 1003,
      libelle: "Studio Meublé Étudiant",
      description: "Studio confortable et meublé, idéal pour étudiant.",
      prixCalculer: 85000,
      ville: "Bamako",
      superficie: 28,
      libelleTypeBien: "Studio",
      typeTransaction: "LOCATION",
      images: [getLocalImage(2)],
      nbChambres: 1,
      nbSalles: 1,
      isDemo: true,
      utilisateur: {
        nom: "Student Housing",
        telephone: "+22320202022",
        agence: {
          visitePayante: false,
          tarifVisite: 0
        }
      }
    },
    {
      id: 1004,
      libelle: "Maison Traditionnelle Rénovée",
      description: "Belle maison traditionnelle malienne rénovée.",
      prixCalculer: 42000000,
      ville: "Sikasso",
      superficie: 220,
      libelleTypeBien: "Maison",
      typeTransaction: "VENTE",
      images: [getLocalImage(3)],
      nbChambres: 5,
      nbSalles: 2,
      isDemo: true,
      utilisateur: {
        nom: "Habitat Mali",
        telephone: "+22320202023",
        agence: {
          visitePayante: true,
          tarifVisite: 7500
        }
      }
    },
    {
      id: 1005,
      libelle: "Bureau Commercial Prestigieux",
      description: "Espace bureau moderne en centre d'affaires.",
      prixCalculer: 35000000,
      ville: "Bamako",
      superficie: 150,
      libelleTypeBien: "Bureau",
      typeTransaction: "VENTE",
      images: [getLocalImage(4)],
      nbSalles: 3,
      isDemo: true,
      utilisateur: {
        nom: "Business Properties",
        telephone: "+22320202024",
        agence: {
          visitePayante: false,
          tarifVisite: 0
        }
      }
    }
  ];
}