
import React, { useState, useEffect } from 'react';
import { getProcessedData } from '@/services/api/openaiService';
import NoFileSelected from './extracted-data/NoFileSelected';
import LoadingState from './extracted-data/LoadingState';
import ErrorDisplay from './extracted-data/ErrorDisplay';
import ProcessingState from './extracted-data/ProcessingState';
import NotProcessedState from './extracted-data/NotProcessedState';
import ProcessedDataCard from './extracted-data/ProcessedDataCard';

interface ExtractedDataViewerProps {
  fileId: string | null;
  refreshTrigger: number;
}

const ExtractedDataViewer: React.FC<ExtractedDataViewerProps> = ({ 
  fileId, 
  refreshTrigger 
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('formatted');

  useEffect(() => {
    const fetchData = async () => {
      if (!fileId) {
        setData(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getProcessedData(fileId);
        setData(result);
        
        if (!result) {
          setError('Failed to retrieve data');
        }
      } catch (err) {
        console.error('Error fetching extracted data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fileId, refreshTrigger]);

  const handleDownload = () => {
    if (!data?.extractedData) return;
    
    const blob = new Blob([JSON.stringify(data.extractedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.filename.replace(/\.[^/.]+$/, '')}_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Conditional rendering based on state
  if (!fileId) {
    return <NoFileSelected />;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorDisplay errorMessage={error} />;
  }

  if (!data) {
    return <ErrorDisplay title="Extracted Data" errorMessage="No data available" />;
  }

  if (data.notProcessed) {
    return <NotProcessedState filename={data.filename} />;
  }

  if (data.processing) {
    return <ProcessingState filename={data.filename} />;
  }

  if (data.extractedData?.error) {
    return (
      <ErrorDisplay 
        title={`${data.filename} - Processing Error`} 
        errorMessage={data.extractedData.message || 'An unknown error occurred during processing.'}
      />
    );
  }

  // Successfully processed data
  return (
    <ProcessedDataCard
      filename={data.filename}
      documentType={data.documentType}
      extractedData={data.extractedData}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onDownload={handleDownload}
    />
  );
};

export default ExtractedDataViewer;
