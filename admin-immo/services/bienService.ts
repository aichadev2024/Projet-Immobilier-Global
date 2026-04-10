export async function getBiens() {
  try {
    console.log("Appel API: http://localhost:8080/api/biens");
    const res = await fetch("http://localhost:8080/api/biens", {
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("Réponse API:", res.status, res.statusText);

    if (!res.ok) {
      console.error("Erreur HTTP:", res.status, res.statusText);
      if (res.status === 404) {
        console.log("Aucun bien trouvé (404), retour tableau vide");
        return [];
      }
      throw new Error(`Erreur HTTP: ${res.status} - ${res.statusText}`);
    }

    const data = await res.json();
    console.log("Données reçues:", data);
    
    const realBiensRaw = data.biens || (Array.isArray(data) ? data : []);
    
    const realBiens = realBiensRaw.map((bien: any, index: number) => {
      const originalTransaction = bien.typeTransaction || bien.transactionType;
      const normalizedTransaction = normalizeTransaction(originalTransaction);
      
      if (index < 3) {
        console.log(`Normalisation bien ${bien.id}:`, originalTransaction, "->", normalizedTransaction);
      }
      
      return {
        ...bien,
        libelleTypeBien: bien.libelleTypeBien || bien.typeBien?.nom || bien.typeBien?.libelle || "Bien",
        typeTransaction: normalizedTransaction,
        ville: bien.ville || bien.adresse || bien.quartier || "Bamako",
        nbChambres: bien.nbChambres || bien.caracteristiques?.nbChambres || 0,
        nbSalles: bien.nbSalles || bien.caracteristiques?.nbSallesDeBain || 0,
        superficie: bien.superficie || bien.caracteristiques?.superficie || 0,
        parking: bien.parking || bien.caracteristiques?.nbParking > 0 || false,
        isDemo: false,
      };
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
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    console.log("Appel API Admin: http://localhost:8080/api/biens/admin");
    const res = await fetch("http://localhost:8080/api/biens/admin", {
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!res.ok) {
      console.error("Erreur HTTP admin:", res.status, res.statusText);
      if (res.status === 403) {
        console.log("Accès refusé - fallback vers endpoint public");
        return getBiens();
      }
      throw new Error(`Erreur HTTP: ${res.status}`);
    }

    const data = await res.json();
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
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    console.log("Appel API Agence: http://localhost:8080/api/biens/agence");
    const res = await fetch("http://localhost:8080/api/biens/agence", {
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!res.ok) {
      console.error("Erreur HTTP agence:", res.status, res.statusText);
      throw new Error(`Erreur HTTP: ${res.status}`);
    }

    const data = await res.json();
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
      isDemo: true
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
      isDemo: true
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
      isDemo: true
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
      isDemo: true
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
      isDemo: true
    }
  ];
}