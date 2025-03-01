
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, ListFilter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';

interface DataPreviewDialogProps {
  file: any;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DataPreviewDialog: React.FC<DataPreviewDialogProps> = ({ file, open, onClose, onDelete }) => {
  const [activeTab, setActiveTab] = useState('summary');
  
  const downloadJson = () => {
    const dataStr = JSON.stringify(file.extracted_data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.filename.replace('.pdf', '')}_data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderSummaryContent = () => {
    if (!file.extracted_data) {
      return (
        <div className="p-4 bg-yellow-50 rounded-md">
          <p className="text-yellow-800">No extracted data available for this file.</p>
        </div>
      );
    }

    const { documentType, confidence, processingDate } = file.extracted_data;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Document Type</h3>
            <p className="mt-1 text-lg font-semibold">{documentType}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Confidence Score</h3>
            <p className="mt-1 text-lg font-semibold">{confidence}%</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Processed On</h3>
            <p className="mt-1 text-lg font-semibold">{new Date(processingDate).toLocaleString()}</p>
          </div>
        </div>

        {renderDocumentSpecificData()}
      </div>
    );
  };

  const renderDocumentSpecificData = () => {
    if (!file.extracted_data) return null;
    
    const data = file.extracted_data;
    const documentType = data.documentType;

    switch (documentType) {
      case 'Expense Voucher':
        return (
          <div className="border rounded-md overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 font-medium">Expense Details</div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Expense Type</p>
                  <p className="font-medium">{data.expenseType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expense Date</p>
                  <p className="font-medium">{new Date(data.expenseDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expense Amount</p>
                  <p className="font-medium">{formatCurrency(data.expenseAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Taxes Included</p>
                  <p className="font-medium">{formatCurrency(data.taxesIncluded)}</p>
                </div>
              </div>
              {data.remarks && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Remarks</p>
                  <p className="font-medium">{data.remarks}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'Occupancy Report':
        return (
          <div className="border rounded-md overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 font-medium">Occupancy Details</div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Report Date</p>
                  <p className="font-medium">{new Date(data.reportDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Occupancy Rate</p>
                  <p className="font-medium">{data.occupancyRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Rate</p>
                  <p className="font-medium">{formatCurrency(data.averageRate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">RevPAR</p>
                  <p className="font-medium">{formatCurrency(data.revPAR)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Rooms</p>
                  <p className="font-medium">{data.totalRooms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Occupied Rooms</p>
                  <p className="font-medium">{data.occupiedRooms}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Monthly Statistics':
        return (
          <div className="border rounded-md overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 font-medium">Monthly Statistics</div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Report Month</p>
                  <p className="font-medium">
                    {new Date(data.reportMonth + '-01').toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Occupancy Rate</p>
                  <p className="font-medium">{data.occupancyRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Daily Rate</p>
                  <p className="font-medium">{formatCurrency(data.averageDailyRate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">RevPAR</p>
                  <p className="font-medium">{formatCurrency(data.revPAR)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="font-medium">{formatCurrency(data.totalRevenue)}</p>
                </div>
              </div>
              
              {data.revenueBreakdown && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Revenue Breakdown</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 p-2 rounded-md text-center">
                      <p className="text-xs text-gray-500">Rooms</p>
                      <p className="font-medium">{(data.revenueBreakdown.rooms * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded-md text-center">
                      <p className="text-xs text-gray-500">F&B</p>
                      <p className="font-medium">{(data.revenueBreakdown.foodAndBeverage * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded-md text-center">
                      <p className="text-xs text-gray-500">Other</p>
                      <p className="font-medium">{(data.revenueBreakdown.other * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      // Add other document types as needed
      
      default:
        return (
          <div className="border rounded-md p-4">
            <p className="text-sm text-gray-500 mb-2">Raw Extracted Data</p>
            <pre className="bg-gray-50 p-3 rounded-md overflow-auto max-h-60 text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {file.filename}
            {file.document_type && (
              <Badge className="ml-2">{file.document_type}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <ListFilter className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Raw Data
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="max-h-[60vh] overflow-y-auto">
            {renderSummaryContent()}
          </TabsContent>
          
          <TabsContent value="raw" className="max-h-[60vh] overflow-y-auto">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Raw File Data</h3>
              <pre className="bg-gray-100 p-3 rounded-md overflow-auto max-h-96 text-xs">
                {JSON.stringify(file, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between gap-2 pt-4">
          <Button variant="destructive" onClick={onDelete} className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={downloadJson} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Data
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataPreviewDialog;
