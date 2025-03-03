
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getProcessedData } from '@/services/api/pdf';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Skeleton from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, AlertTriangle } from 'lucide-react';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';

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

  if (!fileId) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Extracted Data</CardTitle>
          <CardDescription>Select a file to view its extracted data</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-gray-500">
          No file selected. Click on a file in the list above to view its data.
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>
            <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded"></div>
          </CardTitle>
          <CardDescription>
            <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-red-500">Error Loading Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Extracted Data</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-gray-500">
          No data available for this file.
        </CardContent>
      </Card>
    );
  }

  if (data.notProcessed) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{data.filename}</CardTitle>
          <CardDescription>File not processed yet</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              This file has not been processed by AI yet. Click the "Extract Data" button to analyze it.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.processing) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{data.filename}</CardTitle>
          <CardDescription>Processing in progress</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">
              AI is currently processing this file. This may take a few moments.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.extractedData?.error) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-red-500">{data.filename} - Processing Error</CardTitle>
          <CardDescription>Failed to extract data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Processing failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  {data.extractedData.message || 'An unknown error occurred during processing.'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Successfully processed data
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{data.filename}</CardTitle>
            <CardDescription>
              {data.documentType || 'Document'} | Processed with {data.extractedData.processedBy || 'AI'}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download JSON
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="formatted">Formatted</TabsTrigger>
            <TabsTrigger value="raw">Raw JSON</TabsTrigger>
          </TabsList>
          
          <TabsContent value="formatted" className="p-0">
            <div className="border rounded-md p-4 bg-gray-50 h-80 overflow-auto">
              {Object.entries(data.extractedData).map(([key, value]: [string, any]) => {
                // Skip processing metadata
                if (['processedBy', 'processedAt', 'documentType'].includes(key)) {
                  return null;
                }
                
                return (
                  <div key={key} className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h3>
                    <div className="text-gray-700">
                      {typeof value === 'object' ? (
                        <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <span>{value}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="raw" className="p-0">
            <div className="h-80 overflow-auto">
              <JSONPretty id="json-pretty" data={data.extractedData}></JSONPretty>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        {data.extractedData.processedAt 
          ? `Processed at: ${new Date(data.extractedData.processedAt).toLocaleString()}`
          : 'Processing timestamp not available'
        }
      </CardFooter>
    </Card>
  );
};

export default ExtractedDataViewer;
