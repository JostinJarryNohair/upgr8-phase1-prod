import { PostgrestError } from "@supabase/supabase-js";

export interface AppError {
  message: string;
  code?: string;
  details?: string;
}

export function handleSupabaseError(error: PostgrestError | Error): AppError {
  if ('code' in error && 'message' in error) {
    // Supabase PostgrestError
    const pgError = error as PostgrestError;
    
    switch (pgError.code) {
      case 'PGRST116':
        return {
          message: "Aucun enregistrement trouvé",
          code: pgError.code,
          details: pgError.details || pgError.message
        };
      case '23505':
        return {
          message: "Un enregistrement avec ces informations existe déjà",
          code: pgError.code,
          details: pgError.details || pgError.message
        };
      case '23503':
        return {
          message: "Impossible de supprimer - des éléments liés existent",
          code: pgError.code,
          details: pgError.details || pgError.message
        };
      case '42501':
        return {
          message: "Permissions insuffisantes pour cette opération",
          code: pgError.code,
          details: pgError.details || pgError.message
        };
      default:
        return {
          message: "Une erreur de base de données s'est produite",
          code: pgError.code,
          details: pgError.message
        };
    }
  } else {
    // Generic Error
    return {
      message: error.message || "Une erreur inattendue s'est produite",
      details: error.stack
    };
  }
}

const toastCallback: {
  addToast?: (toast: { title?: string; description?: string; type: "success" | "error" | "info" | "warning" }) => void;
} = {};

export function setToastCallback(callback: typeof toastCallback.addToast) {
  toastCallback.addToast = callback;
}

export function showErrorToast(error: AppError) {
  if (toastCallback.addToast) {
    toastCallback.addToast({
      title: "Erreur",
      description: error.message,
      type: "error"
    });
  } else {
    console.error('Error:', error.message, error.details);
  }
}

export function showSuccessToast(message: string) {
  if (toastCallback.addToast) {
    toastCallback.addToast({
      title: "Succès",
      description: message,
      type: "success"
    });
  } else {
    console.log('Success:', message);
  }
}