
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';

interface ExtractedDataTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  extractedData: any;
}

const ExtractedDataTabs: React.FC<ExtractedDataTabsProps> = ({ 
  activeTab, 
  onTabChange, 
  extractedData
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="formatted">Formatted</TabsTrigger>
        <TabsTrigger value="raw">Raw JSON</TabsTrigger>
      </TabsList>
      
      <TabsContent value="formatted" className="p-0">
        <div className="border rounded-md p-4 bg-gray-50 h-80 overflow-auto">
          {extractedData.processedBy && (
            <div className="mb-4 p-2 bg-blue-50 border-l-4 border-blue-400 text-blue-700 text-sm">
              <p className="font-medium">Processed by: {extractedData.processedBy}</p>
              <p>Using: {extractedData.processedBy.includes('Vision') ? 'Image-based extraction' : 'Text-based extraction'}</p>
            </div>
          )}
          
          {Object.entries(extractedData).map(([key, value]: [string, any]) => {
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
          <JSONPretty id="json-pretty" data={extractedData}></JSONPretty>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ExtractedDataTabs;
