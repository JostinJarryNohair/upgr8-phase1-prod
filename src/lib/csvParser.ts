export interface CSVParseResult {
  headers: string[];
  data: Record<string, string>[];
  errors: string[];
}

export function parseCSV(csvText: string): CSVParseResult {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    return { headers: [], data: [], errors: ['Le fichier CSV est vide'] };
  }

  const errors: string[] = [];
  
  // Parse headers (first line)
  const headers = parseCSVLine(lines[0]);
  
  if (headers.length === 0) {
    return { headers: [], data: [], errors: ['Aucun en-tête trouvé dans le fichier CSV'] };
  }

  // Parse data lines
      const data: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    
    if (values.length !== headers.length) {
      errors.push(`Ligne ${i + 1}: Nombre de colonnes incorrect (${values.length} au lieu de ${headers.length})`);
      continue;
    }
    
    // Create object from headers and values
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    
    data.push(row);
  }

  return { headers, data, errors };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }

    i++;
  }

  // Add the last field
  result.push(current);

  return result;
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Erreur lors de la lecture du fichier'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
} 