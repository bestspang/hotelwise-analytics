
/**
 * Common dashboard data types used across services
 */

export interface HotelKpiData {
  revPAR: number | null;
  gopPAR: number | null;
  tRevPAR: number | null;
  adr: number | null;
  occupancyRate: number | null;
  cpor: number | null;
  alos: number | null;
  previousRevPAR?: number | null;
  previousGopPAR?: number | null;
  previousTRevPAR?: number | null;
  previousADR?: number | null;
  previousOccupancyRate?: number | null;
  previousCPOR?: number | null;
  previousALOS?: number | null;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface RevenueSegment {
  segment: string;
  value: number;
  percentage: number;
}
