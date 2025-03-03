
import { useMemo, useCallback } from 'react';
import { toast } from 'sonner';

export const useUploadControllers = () => {
  const uploadControllers = useMemo(() => new Map<string, AbortController>(), []);

  // Add controller for tracking and potential cancellation
  const addController = useCallback((id: string, controller: AbortController) => {
    uploadControllers.set(id, controller);
  }, [uploadControllers]);

  // Remove controller after completion
  const removeController = useCallback((id: string) => {
    uploadControllers.delete(id);
  }, [uploadControllers]);

  // Cancel all ongoing uploads
  const cancelAllUploads = useCallback(() => {
    // Abort all ongoing uploads
    uploadControllers.forEach(controller => {
      controller.abort();
    });
    
    // Clear the controllers
    uploadControllers.clear();
    
    toast.info('File uploads cancelled');
  }, [uploadControllers]);

  return {
    addController,
    removeController,
    cancelAllUploads
  };
};
