
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueItem } from '@/hooks/use-daily-summary-data';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils/formatters';

interface RevenueBreakdownProps {
  isLoading: boolean;
  revenueData: RevenueItem[];
}

const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({
  isLoading,
  revenueData
}) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  // Sort rooms by total spend (highest first)
  const sortedRevenue = [...revenueData].sort((a, b) => b.totalSpend - a.totalSpend);
  
  // Calculate totals
  const totalRoomRevenue = revenueData.reduce((sum, item) => sum + item.roomRate, 0);
  const totalAdditionalRevenue = revenueData.reduce((sum, item) => {
    return sum + item.additionalServices.reduce((serviceSum, service) => serviceSum + service.amount, 0);
  }, 0);
  const totalRevenue = totalRoomRevenue + totalAdditionalRevenue;
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Revenue Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <span className="font-medium">Room Revenue</span>
            <span className="font-semibold">{formatCurrency(totalRoomRevenue)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
            <span className="font-medium">Additional Services</span>
            <span className="font-semibold">{formatCurrency(totalAdditionalRevenue)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <span className="font-medium">Total Revenue</span>
            <span className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</span>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Top Revenue Rooms</h3>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
              {sortedRevenue.map((item, index) => (
                <div 
                  key={item.roomNumber}
                  className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <span className="font-medium">Room {item.roomNumber}</span>
                      {index < 3 && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full dark:bg-amber-900/50 dark:text-amber-300">
                          Top {index + 1}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold">{formatCurrency(item.totalSpend)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                    <span>Room: {formatCurrency(item.roomRate)}</span>
                    <span>Services: {formatCurrency(item.totalSpend - item.roomRate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueBreakdown;
