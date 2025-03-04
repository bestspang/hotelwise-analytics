
// Re-export all functions from sub-services to maintain compatibility with existing code
export { uploadPdfFile } from './api/fileUploadService';
export { getUploadedFiles } from './api/fileServices/fetchService';
export { deleteUploadedFile } from './api/fileServices/deleteService';
export { downloadExtractedData, reprocessFile } from './api/dataExtractionService';
export { resolveDataDiscrepancies, resolveDataOverlaps } from './api/dataResolutionService';
export { getExistingMappings, saveDataMappings } from './api/dataMappingService';
export { resetStuckProcessingFiles, syncFilesWithStorage } from './api/fileServices/maintenanceService';
export { getOpenAIResponse } from './api/openaiService';
