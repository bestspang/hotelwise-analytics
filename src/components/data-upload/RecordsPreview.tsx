
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface RecordsPreviewProps {
  data: any;
}

const RecordsPreview: React.FC<RecordsPreviewProps> = ({ data }) => {
  if (!data || !data.records || data.records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No detailed records found in this file
      </div>
    );
  }

  // In a real implementation, we would implement the toggle functionality
  const onToggleRow = (index: number) => {
    console.log('Toggle row:', index);
    // This would update the state in a real implementation
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Detailed Records</h3>
        <p className="text-sm text-muted-foreground">
          Select records to import
        </p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            {Object.keys(data.records[0])
              .filter(key => key !== '_selected')
              .map(key => (
                <TableHead key={key} className="capitalize">
                  {key}
                </TableHead>
              ))
            }
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.records.map((record: any, index: number) => (
            <TableRow key={index}>
              <TableCell>
                <Checkbox
                  checked={record._selected}
                  onCheckedChange={() => onToggleRow(index)}
                />
              </TableCell>
              {Object.entries(record)
                .filter(([key]) => key !== '_selected')
                .map(([key, value]) => (
                  <TableCell key={key}>{value}</TableCell>
                ))
              }
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecordsPreview;
