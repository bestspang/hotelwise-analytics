
import { useState, useCallback } from 'react';
import { UploadState } from '../types/statusTypes';

export const useUploadState = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    currentFileIndex: 0,
    processingStage: 'idle'
  });

  const initializeUpload = useCallback(() => {
    setUploadState({
      isUploading: true,
      progress: 0,
      currentFileIndex: 0,
      processingStage: 'uploading'
    });
  }, []);

  const updateUploadProgress = useCallback((index: number, total: number, stage: 'uploading' | 'processing' = 'uploading') => {
    setUploadState(prev => ({
      ...prev,
      currentFileIndex: index,
      progress: index === total ? 100 : ((index + (stage === 'processing' ? 0.5 : 0)) / total) * 100,
      processingStage: stage
    }));
  }, []);

  const completeUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 100,
      currentFileIndex: 0,
      processingStage: 'complete'
    });
  }, []);

  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      currentFileIndex: 0,
      processingStage: 'idle'
    });
  }, []);

  return {
    uploadState,
    initializeUpload,
    updateUploadProgress,
    completeUpload,
    resetUpload
  };
};
