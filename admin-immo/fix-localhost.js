const fs = require('fs');
const path = require('path');
const targetDir = 'c:/dev/Projet Immo Global/admin-immo/app/agence';

const filesToProcess = [
  'biens/page.tsx',
  'profil/page.tsx',
  'medias/page.tsx',
  'mes-biens/page.tsx',
  'agents/page.tsx',
  'annonces/page.tsx',
  'messages/page.tsx',
  'notifications/page.tsx',
  'rendez-vous/page.tsx',
  'verifications/page.tsx',
  'clients/page.tsx',
  'statistiques/page.tsx'
];

filesToProcess.forEach(file => {
  const filePath = path.join(targetDir, file);
  if (!fs.existsSync(filePath)) {
    console.log('Skip (not found):', file);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Remplacer fetch('http://localhost:8080...') par fetch(`${API_BASE_URL}...`)
  content = content.replace(/fetch\('http:\/\/localhost:8080(\/[^']*)'([^)]*)\)/g, 'fetch(`${API_BASE_URL}$1"$2)`);
  
  // Remplacer les template literals aussi: fetch(`http://localhost:8080...`)
  content = content.replace(/fetch\(\`http:\/\/localhost:8080([^\`]*)\`([^)]*)\)/g, 'fetch(`${API_BASE_URL}$1"$2)`);
  
  if (content !== original) {
    // Ajouter import API_BASE_URL si pas présent
    if (!content.includes('API_BASE_URL') && !content.includes('from "@/services/api"')) {
      content = content.replace(
        /import \{ useRouter \} from "next\/navigation";/,
        'import { useRouter } from "next/navigation";\nimport { API_BASE_URL } from "@/services/api";'
      );
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', file);
  } else {
    console.log('No change:', file);
  }
});

console.log('Done!');
