export async function getAnnonces() {
  try {
    const res = await fetch("http://localhost:8080/api/annonces", {
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        console.warn("Aucune annonce trouvée, utilisation des données de démonstration");
        return getDemoAnnonces();
      }
      throw new Error(`Erreur HTTP: ${res.status} - ${res.statusText}`);
    }

    const data = await res.json();
    const realAnnonces = Array.isArray(data) ? data : [];
    
    // Ajouter les annonces de démonstration en plus des annonces réelles
    // pour enrichir la vitrine
    const demoAnnonces = getDemoAnnonces();
    const combinedAnnonces = [...realAnnonces, ...demoAnnonces];
    
    console.log(`Annonces réelles: ${realAnnonces.length}, Annonces démo: ${demoAnnonces.length}, Total: ${combinedAnnonces.length}`);
    
    return combinedAnnonces;
  } catch (error) {
    console.error("Erreur lors du chargement des annonces:", error);
    // En cas d'erreur, retourner uniquement les données de démonstration
    return getDemoAnnonces();
  }
}

// Données de démonstration pour les annonces
// Ces annonces s'ajoutent aux annonces réelles pour enrichir l'affichage
function getDemoAnnonces() {
  return [
    {
      id: 2001,
      titre: " VILLA DE LUXE - PROMOTION SPÉCIALE -30%",
      description: "Magnifique villa 4 chambres avec piscine privée, jardin et terrasse. Prix exceptionnel pour une durée limitée!",
      datePublication: "2024-01-15",
      typeAnnonce: "PROMOTION",
      reduction: 30,
      prixOriginal: 120000000,
      prixPromo: 85000000
    },
    {
      id: 2002,
      titre: " NOUVEAUX APPARTEMENTS T2 ET T3 EN CENTRE-VILLE",
      description: "Découvrez notre nouvelle résidence avec appartements modernes, proches commerces et transports. Livraison immédiate!",
      datePublication: "2024-01-10",
      typeAnnonce: "NOUVEAUTE",
      nouveaute: true,
      quartier: "Centre-Ville"
    },
    {
      id: 2003,
      titre: " OFFRE SPÉCIALE LOCATION ÉTUDIANTE",
      description: "Studios et chambres meublés à prix étudiant. WiFi inclus, cuisine équipée, proximité universités.",
      datePublication: "2024-01-08",
      typeAnnonce: "OFFRE",
      cible: "Étudiants",
      avantages: ["WiFi inclus", "Cuisine équipée", "Proche universités", "Prix étudiant"]
    }
  ];
}