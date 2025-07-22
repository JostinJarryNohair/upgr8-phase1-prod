import { PlayerFormData } from "@/types/player";

export interface FieldMapping {
  csvField: string;
  playerField: keyof PlayerFormData | null;
  confidence: number; // 0-1, how confident we are in the mapping
}

export interface MappingResult {
  mappings: FieldMapping[];
  unmappedFields: string[];
  requiredMissing: string[];
}

// Field variations for auto-detection
const fieldVariations: Record<keyof PlayerFormData, string[]> = {
  first_name: [
    'first_name', 'firstname', 'first name', 'prénom', 'prenom', 
    'firstName', 'First Name', 'Prénom', 'PRÉNOM', 'nom_de_famille',
    'given_name', 'givenname'
  ],
  last_name: [
    'last_name', 'lastname', 'last name', 'nom', 'nom_famille',
    'lastName', 'Last Name', 'Nom', 'NOM', 'family_name',
    'surname', 'familyname'
  ],
  email: [
    'email', 'courriel', 'e-mail', 'email_address', 'emailaddress',
    'Email', 'Courriel', 'E-mail', 'EMAIL', 'mail'
  ],
  phone: [
    'phone', 'telephone', 'téléphone', 'tel', 'phone_number',
    'Phone', 'Telephone', 'Téléphone', 'Tel', 'TELEPHONE',
    'mobile', 'cellulaire', 'cell'
  ],
  birth_date: [
    'birth_date', 'birthdate', 'birth date', 'date_naissance', 
    'date_de_naissance', 'birthday', 'dob', 'Born', 'Né le',
    'Birth Date', 'Date de naissance', 'DATE_NAISSANCE'
  ],
  position: [
    'position', 'pos', 'poste', 'playing_position',
    'Position', 'Pos', 'Poste', 'POSITION'
  ],
  jersey_number: [
    'jersey_number', 'jerseynumber', 'jersey number', 'numero',
    'numéro', 'number', 'num', '#', 'Jersey Number',
    'Numéro', 'NUMERO', 'jersey_num'
  ],
  parent_name: [
    'parent_name', 'parentname', 'parent name', 'nom_parent',
    'Parent Name', 'Nom parent', 'NOM_PARENT', 'guardian_name',
    'tuteur', 'responsable'
  ],
  parent_phone: [
    'parent_phone', 'parentphone', 'parent phone', 'telephone_parent',
    'téléphone_parent', 'Parent Phone', 'Téléphone parent',
    'guardian_phone', 'contact_parent'
  ],
  parent_email: [
    'parent_email', 'parentemail', 'parent email', 'courriel_parent',
    'Parent Email', 'Courriel parent', 'guardian_email'
  ],
  emergency_contact: [
    'emergency_contact', 'emergencycontact', 'emergency contact',
    'contact_urgence', 'Emergency Contact', 'Contact d\'urgence',
    'urgence', 'emergency', 'contact_emergency'
  ],
  medical_notes: [
    'medical_notes', 'medicalnotes', 'medical notes', 'notes_medicales',
    'Medical Notes', 'Notes médicales', 'medical', 'health_notes',
    'allergies', 'conditions', 'medical_info'
  ],
  is_active: [
    'is_active', 'active', 'actif', 'status', 'statut',
    'Active', 'Actif', 'STATUS', 'enabled'
  ]
};

// Required fields that must be mapped
const requiredFields: (keyof PlayerFormData)[] = ['first_name', 'last_name'];

export function autoMapFields(csvHeaders: string[]): MappingResult {
  const mappings: FieldMapping[] = [];
  const unmappedFields: string[] = [];
  const mappedPlayerFields = new Set<keyof PlayerFormData>();

  // For each CSV header, try to find the best match
  csvHeaders.forEach(header => {
    const trimmedHeader = header.trim();
    let bestMatch: { field: keyof PlayerFormData; confidence: number } | null = null;

    // Check each player field for matches
    for (const [playerFieldKey, variations] of Object.entries(fieldVariations)) {
      const playerField = playerFieldKey as keyof PlayerFormData;
      
      // Skip if this field is already mapped
      if (mappedPlayerFields.has(playerField)) continue;

      const confidence = calculateConfidence(trimmedHeader, variations);
      
      if (confidence > 0.5 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { field: playerField, confidence };
      }
    }

    if (bestMatch) {
      mappings.push({
        csvField: trimmedHeader,
        playerField: bestMatch.field,
        confidence: bestMatch.confidence
      });
      mappedPlayerFields.add(bestMatch.field);
    } else {
      unmappedFields.push(trimmedHeader);
    }
  });

  // Check for missing required fields
  const requiredMissing = requiredFields.filter(field => !mappedPlayerFields.has(field));

  return {
    mappings,
    unmappedFields,
    requiredMissing
  };
}

function calculateConfidence(header: string, variations: string[]): number {
  const lowerHeader = header.toLowerCase();
  
  // Exact match
  for (const variation of variations) {
    if (lowerHeader === variation.toLowerCase()) {
      return 1.0;
    }
  }
  
  // Partial match
  for (const variation of variations) {
    const lowerVariation = variation.toLowerCase();
    if (lowerHeader.includes(lowerVariation) || lowerVariation.includes(lowerHeader)) {
      return 0.8;
    }
  }
  
  // Fuzzy match (common patterns)
  for (const variation of variations) {
    const similarity = calculateSimilarity(lowerHeader, variation.toLowerCase());
    if (similarity > 0.7) {
      return similarity * 0.7; // Reduce confidence for fuzzy matches
    }
  }
  
  return 0;
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

export function applyMapping(csvData: any[], mappings: FieldMapping[]): PlayerFormData[] {
  return csvData.map(row => {
    const playerData: Partial<PlayerFormData> = {};
    
    mappings.forEach(mapping => {
      if (mapping.playerField && row[mapping.csvField] !== undefined) {
        const value = row[mapping.csvField]?.toString().trim();
        
        if (value) {
          // Special handling for different field types
          switch (mapping.playerField) {
            case 'is_active':
              playerData[mapping.playerField] = ['true', '1', 'yes', 'oui', 'actif', 'active'].includes(value.toLowerCase());
              break;
            case 'jersey_number':
              const num = parseInt(value);
              if (!isNaN(num) && num >= 0 && num <= 99) {
                playerData[mapping.playerField] = num;
              }
              break;
            case 'position':
              const position = value.toLowerCase();
              if (['forward', 'attaquant', 'f'].includes(position)) {
                playerData[mapping.playerField] = 'forward';
              } else if (['defense', 'défenseur', 'defenseur', 'd'].includes(position)) {
                playerData[mapping.playerField] = 'defense';
              } else if (['goalie', 'gardien', 'g'].includes(position)) {
                playerData[mapping.playerField] = 'goalie';
              }
              break;
            default:
              (playerData as any)[mapping.playerField] = value;
          }
        }
      }
    });

    // Set default values for required fields if missing
    return {
      first_name: playerData.first_name || '',
      last_name: playerData.last_name || '',
      email: playerData.email || undefined,
      phone: playerData.phone || undefined,
      birth_date: playerData.birth_date || undefined,
      position: playerData.position || undefined,
      jersey_number: playerData.jersey_number || undefined,
      parent_name: playerData.parent_name || undefined,
      parent_phone: playerData.parent_phone || undefined,
      parent_email: playerData.parent_email || undefined,
      emergency_contact: playerData.emergency_contact || undefined,
      medical_notes: playerData.medical_notes || undefined,
      is_active: playerData.is_active !== undefined ? playerData.is_active : true
    };
  });
} 