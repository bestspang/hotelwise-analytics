
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Download, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { extractPdfText } from '@/services/api/pdfService';

interface PdfContentPreviewProps {
  fileId: string;
  filePath: string;
  fileName: string;
}

const PdfContentPreview: React.FC<PdfContentPreviewProps> = ({ fileId, filePath, fileName }) => {
  const [pdfContent, setPdfContent] = useState<string | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdfContent = async () => {
      if (!filePath) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get public URL for preview
        const { data: urlData } = await supabase.storage
          .from('pdf_files')
          .createSignedUrl(filePath, 3600); // 1 hour expiry
        
        if (urlData?.signedUrl) {
          setPdfPreviewUrl(urlData.signedUrl);
        }
        
        // Extract text content
        const extractedText = await extractPdfText(fileId);
        setPdfContent(extractedText);
      } catch (err) {
        console.error('Error fetching PDF content:', err);
        setError('Failed to extract PDF content');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPdfContent();
  }, [fileId, filePath]);

  const openPdfInNewTab = () => {
    if (pdfPreviewUrl) {
      window.open(pdfPreviewUrl, '_blank');
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-500" />
            PDF Content Preview
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openPdfInNewTab}
              disabled={!pdfPreviewUrl}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Extracting PDF content...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-md text-center">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              We were unable to extract text from this PDF. It may be an image-based or scanned document.
            </p>
          </div>
        ) : !pdfContent || pdfContent.trim() === '' ? (
          <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-md text-center">
            <p className="text-amber-500 dark:text-amber-400">No readable text detected</p>
            <p className="text-sm text-muted-foreground mt-2">
              This appears to be an image-based PDF. AI vision processing will be used for analysis.
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
            <pre className="whitespace-pre-wrap text-sm font-mono">{pdfContent}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfContentPreview;
