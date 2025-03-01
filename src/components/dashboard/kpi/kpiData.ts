
// KPI information map for tooltips
export const kpiInfoMap = {
  revPAR: "Revenue Per Available Room (RevPAR) - A core financial metric combining occupancy and rate. It is calculated as: Occupancy Rate × ADR, or Total Room Revenue ÷ Total Available Rooms.",
  adr: "Average Daily Rate (ADR) - The average room revenue earned per sold room. It is calculated as: Total Rooms Revenue ÷ Number of Rooms Sold.",
  occupancyRate: "Occupancy Rate - The percentage of available rooms occupied during a period. It is calculated as: (Occupied Rooms ÷ Available Rooms) × 100.",
  gopPAR: "Gross Operating Profit Per Available Room (GOPPAR) - Links operational profitability to room supply. It is calculated as: Gross Operating Profit ÷ Total Available Room-Nights.",
  tRevPAR: "Total Revenue Per Available Room (TRevPAR) - Expands the RevPAR concept to all revenue streams. It is calculated as: Total Revenue (rooms, F&B, spa, etc.) ÷ Available Rooms.",
  cpor: "Cost Per Occupied Room (CPOR) - Measures the average direct cost to service one occupied room. It is calculated as: Total Room-Operating Costs ÷ Number of Rooms Sold.",
  alos: "Average Length of Stay (ALOS) - The average number of nights per booking. It is calculated as: Total Occupied Room Nights ÷ Number of Bookings."
};

export type KpiKey = keyof typeof kpiInfoMap;
