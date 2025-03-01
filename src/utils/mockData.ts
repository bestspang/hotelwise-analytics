
// Hotel performance KPI data
export interface HotelKpiData {
  revPAR: number;
  gopPAR: number;
  tRevPAR: number;
  adr: number;
  occupancyRate: number;
  cpor: number;
  alos: number;
  previousRevPAR?: number;
  previousGopPAR?: number;
  previousTRevPAR?: number;
  previousADR?: number;
  previousOccupancyRate?: number;
  previousCPOR?: number;
  previousALOS?: number;
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

// Dashboard data
export const dashboardData: HotelKpiData = {
  revPAR: 178.5,
  gopPAR: 82.3,
  tRevPAR: 215.7,
  adr: 245.9,
  occupancyRate: 72.6,
  cpor: 42.5,
  alos: 2.8,
  previousRevPAR: 165.2,
  previousGopPAR: 76.1,
  previousTRevPAR: 198.3,
  previousADR: 232.5,
  previousOccupancyRate: 71.1,
  previousCPOR: 44.8,
  previousALOS: 2.6
};

// RevPAR Trend data for the past 12 months
export const revParTrend: TrendDataPoint[] = [
  { date: "Jan", value: 152.3 },
  { date: "Feb", value: 158.7 },
  { date: "Mar", value: 165.2 },
  { date: "Apr", value: 172.8 },
  { date: "May", value: 175.4 },
  { date: "Jun", value: 185.6 },
  { date: "Jul", value: 195.2 },
  { date: "Aug", value: 192.8 },
  { date: "Sep", value: 183.5 },
  { date: "Oct", value: 178.3 },
  { date: "Nov", value: 175.8 },
  { date: "Dec", value: 178.5 }
];

// GOPPAR Trend data
export const gopparTrend: TrendDataPoint[] = [
  { date: "Jan", value: 65.8 },
  { date: "Feb", value: 68.2 },
  { date: "Mar", value: 72.5 },
  { date: "Apr", value: 74.9 },
  { date: "May", value: 76.1 },
  { date: "Jun", value: 79.3 },
  { date: "Jul", value: 84.7 },
  { date: "Aug", value: 83.5 },
  { date: "Sep", value: 81.2 },
  { date: "Oct", value: 78.6 },
  { date: "Nov", value: 79.5 },
  { date: "Dec", value: 82.3 }
];

// Occupancy Rate Trend data
export const occupancyTrend: TrendDataPoint[] = [
  { date: "Jan", value: 62.5 },
  { date: "Feb", value: 65.7 },
  { date: "Mar", value: 68.2 },
  { date: "Apr", value: 70.1 },
  { date: "May", value: 71.1 },
  { date: "Jun", value: 76.3 },
  { date: "Jul", value: 82.5 },
  { date: "Aug", value: 79.8 },
  { date: "Sep", value: 75.2 },
  { date: "Oct", value: 72.5 },
  { date: "Nov", value: 70.8 },
  { date: "Dec", value: 72.6 }
];

// Revenue segments
export const revenueSegments: RevenueSegment[] = [
  { segment: "Direct Bookings", value: 425600, percentage: 42 },
  { segment: "OTA", value: 345800, percentage: 34 },
  { segment: "Corporate", value: 152000, percentage: 15 },
  { segment: "Groups", value: 91200, percentage: 9 }
];

// ADR by market segment
export const adrBySegment: RevenueSegment[] = [
  { segment: "Leisure", value: 278.5, percentage: 42 },
  { segment: "Business", value: 245.3, percentage: 34 },
  { segment: "Group", value: 215.8, percentage: 15 },
  { segment: "Extended Stay", value: 198.5, percentage: 9 }
];
