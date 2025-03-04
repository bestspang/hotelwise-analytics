
import { FileText, CreditCard, BarChart3, Database, Calendar, Moon, X } from 'lucide-react';

/**
 * Determines document type based on filename pattern matching
 */
export const determineDocumentType = (filename: string): string => {
  filename = filename.toLowerCase();
  
  if (filename.includes('expense') || filename.includes('voucher')) {
    return 'Expense Voucher';
  } else if (filename.includes('statistics') || filename.includes('stats')) {
    return 'Monthly Statistics';
  } else if (filename.includes('occupancy')) {
    return 'Occupancy Report';
  } else if (filename.includes('ledger') || filename.includes('city')) {
    return 'City Ledger';
  } else if (filename.includes('audit') || filename.includes('night')) {
    return 'Night Audit';
  } else if (filename.includes('no-show') || filename.includes('noshow')) {
    return 'No-show Report';
  }
  
  // Default document type
  return 'Expense Voucher';
};

/**
 * Maps document types to their corresponding icons
 */
export const DocumentDataIcon: Record<string, React.FC<any>> = {
  'Expense Voucher': CreditCard,
  'Monthly Statistics': BarChart3,
  'Occupancy Report': Calendar,
  'City Ledger': Database,
  'Night Audit': Moon,
  'No-show Report': X,
  // Default icon for unknown document types
  'default': FileText
};
