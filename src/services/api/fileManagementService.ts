
import { supabase } from '@/integrations/supabase/client';
import { getUploadedFiles, checkFileExists } from './fileServices/fetchService';

// Re-export functions
export { getUploadedFiles, checkFileExists };

// Legacy exports to maintain compatibility
export { 
  downloadExtractedData, 
  reprocessFile 
} from './dataExtractionService';

export { 
  resolveDataDiscrepancies, 
  resolveDataOverlaps 
} from './dataResolutionService';

export { 
  getExistingMappings, 
  saveDataMappings 
} from './dataMappingService';

export { 
  resetStuckProcessingFiles, 
  syncFilesWithStorage
} from './fileServices/maintenanceService';

export { 
  deleteUploadedFile 
} from './fileServices/deleteService';
