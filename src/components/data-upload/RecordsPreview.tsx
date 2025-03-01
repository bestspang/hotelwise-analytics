
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ExtractedData } from './FileList';

interface RecordsPreviewProps {
  records: ExtractedData['records'];
  onToggleRow: (index: number) => void;
}

const RecordsPreview: React.FC<RecordsPreviewProps> = ({ records, onToggleRow }) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No detailed records found in this file
      </div>
    );
  }

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
            {Object.keys(records[0])
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
          {records.map((record, index) => (
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
