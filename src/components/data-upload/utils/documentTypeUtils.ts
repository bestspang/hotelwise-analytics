
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
