
import { useCallback } from 'react';
import { FileState } from '../types/fileTypes';

export const useProcessingTimeCalculation = () => {
  const calculateProcessingTimes = useCallback((files: any[]) => {
    return files.map(file => {
      if (file.processing) {
        // Use created_at as the fallback if updated_at doesn't exist yet
        const processingStartTime = new Date(file.created_at);
        const currentTime = new Date();
        const processingTimeMs = currentTime.getTime() - processingStartTime.getTime();
        const processingTimeSec = Math.floor(processingTimeMs / 1000);
        
        // Format for display
        let timeDisplay;
        if (processingTimeSec < 60) {
          timeDisplay = `${processingTimeSec}s`;
        } else {
          const minutes = Math.floor(processingTimeSec / 60);
          const seconds = processingTimeSec % 60;
          timeDisplay = `${minutes}m ${seconds}s`;
        }
        
        return {
          ...file,
          processingTime: processingTimeSec,
          processingTimeDisplay: timeDisplay
        };
      }
      return file;
    });
  }, []);

  const updateProcessingTimes = useCallback((files: FileState[]) => {
    return files.map(file => {
      if (file.processing && file.processingTime) {
        const newTime = file.processingTime + 1;
        
        // Format for display
        let timeDisplay;
        if (newTime < 60) {
          timeDisplay = `${newTime}s`;
        } else {
          const minutes = Math.floor(newTime / 60);
          const seconds = newTime % 60;
          timeDisplay = `${minutes}m ${seconds}s`;
        }
        
        return {
          ...file,
          processingTime: newTime,
          processingTimeDisplay: timeDisplay
        };
      }
      return file;
    });
  }, []);

  return {
    calculateProcessingTimes,
    updateProcessingTimes
  };
};
