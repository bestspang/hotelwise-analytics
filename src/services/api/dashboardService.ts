
/**
 * Re-exports all dashboard-related services for backward compatibility
 */

// Re-export all types
export type { 
  HotelKpiData,
  TrendDataPoint,
  RevenueSegment
} from './types/dashboardTypes';

// Re-export KPI service
export { fetchKpiData } from './kpiService';

// Re-export trend service
export { fetchTrendData } from './trendService';

// Re-export segment services
export { 
  fetchRevenueSegments,
  fetchAdrBySegment
} from './segmentService';
