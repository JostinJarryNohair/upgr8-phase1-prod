"use client";

import { useState, useCallback } from "react";
import { Player, PlayerFormData } from "@/types/player";
import { Camp } from "@/types/camp";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  X, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  FileText,
  Users
} from "lucide-react";
import { parseCSV, readFileAsText, CSVParseResult } from "@/lib/csvParser";
import { autoMapFields, applyMapping, FieldMapping, MappingResult } from "@/lib/fieldMapping";
import { supabase } from "@/lib/supabase/client";
import { toDatabaseFormat, fromDatabaseFormat } from "@/lib/mappers/playerMapper";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (importedPlayers: Player[]) => void;
  camps: Camp[];
}

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'results';

interface ImportState {
  step: ImportStep;
  file: File | null;
  csvData: CSVParseResult | null;
  mappingResult: MappingResult | null;
  mappedPlayers: PlayerFormData[];
  selectedCamps: string[];
  errors: string[];
  importResults: {
    created: number;
    skipped: number;
    errors: { player: string; error: string }[];
  } | null;
}

export function BulkImportModal({
  isOpen,
  onClose,
  onImportComplete,
  camps
}: BulkImportModalProps) {
  const [state, setState] = useState<ImportState>({
    step: 'upload',
    file: null,
    csvData: null,
    mappingResult: null,
    mappedPlayers: [],
    selectedCamps: [],
    errors: [],
    importResults: null
  });

  const [dragActive, setDragActive] = useState(false);

  const resetState = () => {
    setState({
      step: 'upload',
      file: null,
      csvData: null,
      mappingResult: null,
      mappedPlayers: [],
      selectedCamps: [],
      errors: [],
      importResults: null
    });
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // File upload handlers
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setState(prev => ({ ...prev, file, errors: [] }));
      
      const csvText = await readFileAsText(file);
      const csvData = parseCSV(csvText);
      
      if (csvData.errors.length > 0) {
        setState(prev => ({ ...prev, errors: csvData.errors }));
        return;
      }

      const mappingResult = autoMapFields(csvData.headers);
      const mappedPlayers = applyMapping(csvData.data, mappingResult.mappings);

      setState(prev => ({
        ...prev,
        csvData,
        mappingResult,
        mappedPlayers,
        step: 'mapping'
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: [`Erreur lors de la lecture du fichier: ${error instanceof Error ? error.message : 'Erreur inconnue'}`]
      }));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      handleFileSelect(csvFile);
    } else {
      setState(prev => ({
        ...prev,
        errors: ['Veuillez sélectionner un fichier CSV']
      }));
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  // CSV template download
  const downloadTemplate = () => {
    const headers = [
      'first_name',
      'last_name',
      'email',
      'phone',
      'birth_date',
      'position',
      'jersey_number',
      'parent_name',
      'parent_phone',
      'parent_email',
      'emergency_contact',
      'medical_notes'
    ];

    const sampleData = [
      'Jean,Tremblay,jean@email.com,514-555-0123,2010-05-15,forward,99,Pierre Tremblay,514-555-0124,pierre@email.com,Marie Tremblay 514-555-0125,Aucune allergie'
    ];

    const csvContent = [headers.join(','), ...sampleData].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_joueurs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleMappingConfirm = () => {
    if (state.mappingResult?.requiredMissing.length) {
      setState(prev => ({
        ...prev,
        errors: [`Champs requis manquants: ${state.mappingResult?.requiredMissing.join(', ')}`]
      }));
      return;
    }

    setState(prev => ({ ...prev, step: 'preview', errors: [] }));
  };

  const handleImport = async () => {
    setState(prev => ({ ...prev, step: 'importing' }));
    
    const results = {
      created: 0,
      skipped: 0,
      errors: [] as { player: string; error: string }[]
    };

    const createdPlayers: Player[] = [];

    try {
      // Process players in batches to avoid overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < state.mappedPlayers.length; i += batchSize) {
        const batch = state.mappedPlayers.slice(i, i + batchSize);
        
        for (const playerData of batch) {
          try {
            // Check for existing player by email (if provided) or name combination
            let existingPlayer = null;
            if (playerData.email) {
              const { data: emailCheck } = await supabase
                .from('players')
                .select('*')
                .eq('email', playerData.email)
                .single();
              existingPlayer = emailCheck;
            }

            // If no email match, check by name combination
            if (!existingPlayer) {
              const { data: nameCheck } = await supabase
                .from('players')
                .select('*')
                .eq('first_name', playerData.first_name)
                .eq('last_name', playerData.last_name)
                .single();
              existingPlayer = nameCheck;
            }

            if (existingPlayer) {
              // Player already exists, skip
              results.skipped++;
              continue;
            }

            // Convert to database format and insert
            const dbPlayerData = toDatabaseFormat(playerData);
            const { data: insertedPlayer, error } = await supabase
              .from('players')
              .insert(dbPlayerData)
              .select()
              .single();

            if (error) {
              results.errors.push({
                player: `${playerData.first_name} ${playerData.last_name}`,
                error: error.message
              });
            } else if (insertedPlayer) {
              // Convert back to frontend format
              const player = fromDatabaseFormat(insertedPlayer);
              createdPlayers.push(player);
              results.created++;
            }
          } catch (playerError) {
            results.errors.push({
              player: `${playerData.first_name} ${playerData.last_name}`,
              error: playerError instanceof Error ? playerError.message : 'Erreur inconnue'
            });
          }
        }
      }

      // Update state with results
      setState(prev => ({
        ...prev,
        step: 'results',
        importResults: results
      }));

      // Notify parent component of successful imports
      if (createdPlayers.length > 0) {
        onImportComplete(createdPlayers);
      }

    } catch (error) {
      // Handle general import failure
      setState(prev => ({
        ...prev,
        step: 'results',
        importResults: {
          created: results.created,
          skipped: results.skipped,
          errors: [
            ...results.errors,
            {
              player: 'Import général',
              error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'import'
            }
          ]
        }
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Importer des joueurs (CSV)
          </h2>
          <Button
            variant="ghost"
            size="lg"
            onClick={handleClose}
            className="h-12 w-12"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {['upload', 'mapping', 'preview', 'importing', 'results'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  state.step === step 
                    ? 'bg-red-600 text-white' 
                    : index < ['upload', 'mapping', 'preview', 'importing', 'results'].indexOf(state.step)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 4 && <div className="w-8 h-0.5 bg-gray-300 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Display */}
          {state.errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-1">Erreurs détectées</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {state.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          {state.step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Télécharger le fichier CSV
                </h3>
                <p className="text-gray-600 mb-6">
                  Glissez-déposez votre fichier CSV ou cliquez pour le sélectionner
                </p>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Glissez votre fichier CSV ici
                  </p>
                  <p className="text-gray-600">ou</p>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('csv-file-input')?.click()}
                  >
                    Choisir un fichier
                  </Button>
                  <input
                    id="csv-file-input"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              </div>

              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">
                      Besoin d&apos;un modèle ?
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Téléchargez notre modèle CSV avec les colonnes recommandées et un exemple de données.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger le modèle
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {state.step === 'mapping' && state.mappingResult && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Mappage des champs
                </h3>
                <p className="text-gray-600">
                  Vérifiez que les colonnes de votre CSV sont correctement associées
                </p>
              </div>

              {/* Mapping Results */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Champs détectés automatiquement</h4>
                {state.mappingResult.mappings.map((mapping, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-medium text-gray-900">{mapping.csvField}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">→</span>
                      <span className="text-green-700 font-medium">{mapping.playerField}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({Math.round(mapping.confidence * 100)}% confiance)
                      </span>
                    </div>
                  </div>
                ))}

                {state.mappingResult.unmappedFields.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Champs non mappés</h4>
                    {state.mappingResult.unmappedFields.map((field, index) => (
                      <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-2">
                        <span className="text-gray-900">{field}</span>
                        <span className="text-yellow-700 ml-2 text-sm">(sera ignoré)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setState(prev => ({ ...prev, step: 'upload' }))}>
                  Retour
                </Button>
                <Button onClick={handleMappingConfirm} className="bg-red-600 hover:bg-red-700">
                  Continuer
                </Button>
              </div>
            </div>
          )}

          {state.step === 'preview' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aperçu des données
                </h3>
                <p className="text-gray-600">
                  {state.mappedPlayers.length} joueur(s) seront importés
                </p>
              </div>

              {/* Preview Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {state.mappedPlayers.slice(0, 10).map((player, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{player.first_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{player.last_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{player.email || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{player.position || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{player.jersey_number || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {state.mappedPlayers.length > 10 && (
                  <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500 text-center">
                    ... et {state.mappedPlayers.length - 10} autres joueurs
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setState(prev => ({ ...prev, step: 'mapping' }))}>
                  Retour
                </Button>
                <Button onClick={handleImport} className="bg-red-600 hover:bg-red-700">
                  <Users className="w-4 h-4 mr-2" />
                  Importer {state.mappedPlayers.length} joueur(s)
                </Button>
              </div>
            </div>
          )}

          {state.step === 'importing' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Import en cours...
              </h3>
              <p className="text-gray-600">
                Veuillez patienter pendant que nous importons vos joueurs
              </p>
            </div>
          )}

          {state.step === 'results' && state.importResults && (
            <div className="space-y-6">
              <div className="text-center">
                {state.importResults.errors.length === 0 ? (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                ) : state.importResults.created > 0 ? (
                  <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                )}
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {state.importResults.errors.length === 0 
                    ? "Import terminé !"
                    : state.importResults.created > 0
                    ? "Import partiellement réussi"
                    : "Import échoué"
                  }
                </h3>
                <p className="text-gray-600">
                  {state.importResults.created > 0 
                    ? `${state.importResults.created} joueur(s) ont été importés avec succès`
                    : "Aucun joueur n'a pu être importé"
                  }
                  {state.importResults.skipped > 0 && 
                    `, ${state.importResults.skipped} doublons ignorés`
                  }
                  {state.importResults.errors.length > 0 && 
                    `, ${state.importResults.errors.length} erreurs`
                  }
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Résumé de l&apos;import</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• {state.importResults.created} joueurs créés</li>
                  <li>• {state.importResults.skipped} joueurs ignorés (doublons)</li>
                  <li>• {state.importResults.errors.length} erreurs</li>
                </ul>
              </div>

              {/* Error Details */}
              {state.importResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Détails des erreurs</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {state.importResults.errors.map((error, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-red-900">{error.player}:</span>
                        <span className="text-red-700 ml-2">{error.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleClose} className="bg-red-600 hover:bg-red-700">
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 