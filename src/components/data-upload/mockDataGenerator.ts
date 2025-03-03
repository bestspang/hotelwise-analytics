import { ExtractedData } from './types/ExtractedData';

export const generateMockData = (filename: string): ExtractedData => {
  const isOccupancy = filename.toLowerCase().includes('occupancy');
  const isFinancial = filename.toLowerCase().includes('financial') || filename.toLowerCase().includes('expense');
  
  if (isOccupancy) {
    return {
      fileType: 'Occupancy Report',
      date: new Date().toISOString().split('T')[0],
      hotelName: 'Grand Luxury Hotel',
      records: Array(5).fill(0).map((_, i) => ({
        _selected: true,
        date: new Date(2023, 0, i + 1).toISOString().split('T')[0],
        available: 120,
        occupied: 85 + Math.floor(Math.random() * 20),
        rate: (70.8 + Math.random() * 5).toFixed(1)
      })),
      metrics: {
        occupancyRate: { value: '78.3%', selected: true },
        averageDailyRate: { value: '$189.50', selected: true },
        revPAR: { value: '$148.37', selected: true },
        averageLOS: { value: '2.4 nights', selected: true }
      }
    };
  } else if (isFinancial) {
    return {
      fileType: 'Financial Report',
      date: new Date().toISOString().split('T')[0],
      hotelName: 'Grand Luxury Hotel',
      records: Array(5).fill(0).map((_, i) => ({
        _selected: true,
        category: ['Room Revenue', 'F&B Revenue', 'Other Revenue', 'Staff Expenses', 'Operating Expenses'][i],
        amount: (10000 + Math.random() * 50000).toFixed(2),
        percentage: (5 + Math.random() * 30).toFixed(1) + '%'
      })),
      metrics: {
        totalRevenue: { value: '$245,867.00', selected: true },
        roomRevenue: { value: '$175,432.00', selected: true },
        fnbRevenue: { value: '$42,785.00', selected: true },
        otherRevenue: { value: '$27,650.00', selected: true },
        operationalExpenses: { value: '$138,945.00', selected: true },
        netProfit: { value: '$106,922.00', selected: true }
      }
    };
  } else {
    return {
      fileType: 'Unrecognized Document',
      date: new Date().toISOString().split('T')[0],
      records: [],
      metrics: {}
    };
  }
};
