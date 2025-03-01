
import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Calendar, DollarSign, BarChart3, PieChart, Building, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { formatCurrency } from '@/utils/formatters';

interface ExtractedDataCardProps {
  file: any;
  onViewRawData: () => void;
}

const ExtractedDataCard: React.FC<ExtractedDataCardProps> = ({ file, onViewRawData }) => {
  if (!file.extracted_data) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-500" />
            {file.filename}
          </CardTitle>
          <CardDescription className="flex items-center">
            <AlertTriangle className="mr-1 h-4 w-4 text-yellow-500" />
            No extracted data available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This file has not been processed or no data could be extracted.</p>
        </CardContent>
      </Card>
    );
  }

  // Destructure relevant data
  const { documentType, confidence, processingDate } = file.extracted_data;
  
  // Document type color mapping
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Expense Voucher': return 'bg-red-100 text-red-800';
      case 'Monthly Statistics': return 'bg-blue-100 text-blue-800';
      case 'Occupancy Report': return 'bg-green-100 text-green-800';
      case 'City Ledger': return 'bg-purple-100 text-purple-800';
      case 'Night Audit': return 'bg-orange-100 text-orange-800';
      case 'No-show Report': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Document type icon mapping
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Expense Voucher': return <DollarSign className="h-4 w-4" />;
      case 'Monthly Statistics': return <BarChart3 className="h-4 w-4" />;
      case 'Occupancy Report': return <Building className="h-4 w-4" />;
      case 'City Ledger': return <PieChart className="h-4 w-4" />;
      case 'Night Audit': return <Calendar className="h-4 w-4" />;
      case 'No-show Report': return <UserCheck className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Function to render key metrics based on document type
  const renderKeyMetrics = () => {
    const data = file.extracted_data;
    
    switch (documentType) {
      case 'Expense Voucher':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Expense Amount</p>
              <p className="text-lg font-semibold">{formatCurrency(data.expenseAmount)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Expense Type</p>
              <p className="text-lg font-semibold">{data.expenseType}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Expense Date</p>
              <p className="text-lg font-semibold">{new Date(data.expenseDate).toLocaleDateString()}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Taxes Included</p>
              <p className="text-lg font-semibold">{formatCurrency(data.taxesIncluded)}</p>
            </div>
          </div>
        );
        
      case 'Occupancy Report':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Occupancy Rate</p>
              <p className="text-lg font-semibold">{data.occupancyRate}%</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Average Rate</p>
              <p className="text-lg font-semibold">{formatCurrency(data.averageRate)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">RevPAR</p>
              <p className="text-lg font-semibold">{formatCurrency(data.revPAR)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Total Rooms</p>
              <p className="text-lg font-semibold">{data.totalRooms}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Occupied Rooms</p>
              <p className="text-lg font-semibold">{data.occupiedRooms}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Report Date</p>
              <p className="text-lg font-semibold">{new Date(data.reportDate).toLocaleDateString()}</p>
            </div>
          </div>
        );
        
      case 'City Ledger':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Account Name</p>
              <p className="text-lg font-semibold">{data.accountName}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Reference Number</p>
              <p className="text-lg font-semibold">{data.referenceNumber}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Opening Balance</p>
              <p className="text-lg font-semibold">{formatCurrency(data.openingBalance)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Closing Balance</p>
              <p className="text-lg font-semibold">{formatCurrency(data.closingBalance)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Charges</p>
              <p className="text-lg font-semibold">{formatCurrency(data.charges)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Payments</p>
              <p className="text-lg font-semibold">{formatCurrency(data.payments)}</p>
            </div>
          </div>
        );
        
      case 'Night Audit':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-lg font-semibold">{formatCurrency(data.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Room Revenue</p>
              <p className="text-lg font-semibold">{formatCurrency(data.roomRevenue)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">F&B Revenue</p>
              <p className="text-lg font-semibold">{formatCurrency(data.fbRevenue)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Occupancy</p>
              <p className="text-lg font-semibold">{data.occupancyPercent}%</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">ADR</p>
              <p className="text-lg font-semibold">{formatCurrency(data.adr)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Audit Date</p>
              <p className="text-lg font-semibold">{new Date(data.auditDate).toLocaleDateString()}</p>
            </div>
          </div>
        );
        
      case 'No-show Report':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">No-shows</p>
              <p className="text-lg font-semibold">{data.numberOfNoShows}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Revenue Loss</p>
              <p className="text-lg font-semibold">{formatCurrency(data.potentialRevenueLoss)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Report Date</p>
              <p className="text-lg font-semibold">{new Date(data.reportDate).toLocaleDateString()}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Booking Sources</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.bookingSources?.map((source: string, idx: number) => (
                  <Badge key={idx} variant="outline">{source}</Badge>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'Monthly Statistics':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Month</p>
              <p className="text-lg font-semibold">{new Date(data.reportMonth + '-01').toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Occupancy Rate</p>
              <p className="text-lg font-semibold">{data.occupancyRate}%</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">ADR</p>
              <p className="text-lg font-semibold">{formatCurrency(data.averageDailyRate)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">RevPAR</p>
              <p className="text-lg font-semibold">{formatCurrency(data.revPAR)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-lg font-semibold">{formatCurrency(data.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Revenue Breakdown</p>
              <div className="mt-1 text-sm">
                <div className="flex justify-between">
                  <span>Rooms:</span>
                  <span>{(data.revenueBreakdown.rooms * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>F&B:</span>
                  <span>{(data.revenueBreakdown.foodAndBeverage * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Other:</span>
                  <span>{(data.revenueBreakdown.other * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-3 bg-gray-50 rounded-md mb-4">
            <p className="text-sm text-gray-500">Generic Data</p>
            <pre className="text-sm mt-2 overflow-auto">
              {JSON.stringify(data.genericData || data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-500" />
            {file.filename}
          </CardTitle>
          <Badge className={`${getTypeColor(documentType)} flex items-center gap-1`}>
            {getTypeIcon(documentType)}
            {documentType}
          </Badge>
        </div>
        <CardDescription className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
            Processed on {new Date(processingDate).toLocaleString()}
          </div>
          <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">
            Confidence: {confidence}%
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderKeyMetrics()}
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger>Additional Details</AccordionTrigger>
            <AccordionContent>
              <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto max-h-60">
                {JSON.stringify(file.extracted_data, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={onViewRawData}>
          View Raw Data
        </Button>
        <Badge variant="outline" className="ml-auto">
          ID: {file.extracted_data.dbRecordId || "N/A"}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default ExtractedDataCard;
