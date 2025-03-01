
import React from 'react';

// Enhanced data with more months for forecasting
export const historicalOccupancyData = [
  { month: 'Jan', actual: 72, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Feb', actual: 78, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Mar', actual: 82, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Apr', actual: 85, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'May', actual: 88, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Jun', actual: 92, forecast: null, ci_lower: null, ci_upper: null },
];

export const forecastOccupancyData = [
  ...historicalOccupancyData,
  { month: 'Jul', actual: null, forecast: 88, ci_lower: 84, ci_upper: 93 },
  { month: 'Aug', actual: null, forecast: 86, ci_lower: 81, ci_upper: 92 },
  { month: 'Sep', actual: null, forecast: 83, ci_lower: 77, ci_upper: 89 },
  { month: 'Oct', actual: null, forecast: 79, ci_lower: 73, ci_upper: 85 },
  { month: 'Nov', actual: null, forecast: 75, ci_lower: 69, ci_upper: 81 },
  { month: 'Dec', actual: null, forecast: 73, ci_lower: 67, ci_upper: 79 },
];

export const historicalRevenueData = [
  { month: 'Jan', actual: 2100, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Feb', actual: 2300, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Mar', actual: 2500, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Apr', actual: 2700, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'May', actual: 2800, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Jun', actual: 3000, forecast: null, ci_lower: null, ci_upper: null },
];

export const forecastRevenueData = [
  ...historicalRevenueData,
  { month: 'Jul', actual: null, forecast: 3200, ci_lower: 3000, ci_upper: 3400 },
  { month: 'Aug', actual: null, forecast: 3300, ci_lower: 3050, ci_upper: 3550 },
  { month: 'Sep', actual: null, forecast: 3100, ci_lower: 2850, ci_upper: 3350 },
  { month: 'Oct', actual: null, forecast: 2900, ci_lower: 2650, ci_upper: 3150 },
  { month: 'Nov', actual: null, forecast: 2700, ci_lower: 2450, ci_upper: 2950 },
  { month: 'Dec', actual: null, forecast: 2500, ci_lower: 2250, ci_upper: 2750 },
];

export const forecastExpenseData = [
  { month: 'Jan', actual: 1500, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Feb', actual: 1550, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Mar', actual: 1620, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Apr', actual: 1700, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'May', actual: 1750, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Jun', actual: 1800, forecast: null, ci_lower: null, ci_upper: null },
  { month: 'Jul', actual: null, forecast: 1900, ci_lower: 1750, ci_upper: 2050 },
  { month: 'Aug', actual: null, forecast: 1950, ci_lower: 1800, ci_upper: 2100 },
  { month: 'Sep', actual: null, forecast: 1880, ci_lower: 1730, ci_upper: 2030 },
  { month: 'Oct', actual: null, forecast: 1820, ci_lower: 1670, ci_upper: 1970 },
  { month: 'Nov', actual: null, forecast: 1780, ci_lower: 1630, ci_upper: 1930 },
  { month: 'Dec', actual: null, forecast: 1750, ci_lower: 1600, ci_upper: 1900 },
];

// Revenue breakdown by department for forecast
export const departmentRevenueData = [
  { month: 'Jul', rooms: 2200, food: 600, spa: 250, other: 150 },
  { month: 'Aug', rooms: 2300, food: 650, spa: 200, other: 150 },
  { month: 'Sep', rooms: 2150, food: 600, spa: 200, other: 150 },
  { month: 'Oct', rooms: 2000, food: 550, spa: 200, other: 150 },
  { month: 'Nov', rooms: 1850, food: 500, spa: 200, other: 150 },
  { month: 'Dec', rooms: 1700, food: 450, spa: 200, other: 150 },
];
