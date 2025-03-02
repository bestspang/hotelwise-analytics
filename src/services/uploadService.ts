
// Re-export all functions from sub-services to maintain compatibility with existing code
export { uploadPdfFile } from './api/fileUploadService';
export { getUploadedFiles, deleteUploadedFile } from './api/fileManagementService';
export { downloadExtractedData, reprocessFile } from './api/dataExtractionService';
export { resolveDataDiscrepancies, resolveDataOverlaps } from './api/dataResolutionService';
