
import React from 'react';

export const OccupancyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Find payload items
    const actualOccupancy = payload.find((p: any) => p.dataKey === 'actual');
    const forecastOccupancy = payload.find((p: any) => p.dataKey === 'forecast');
    const ciUpper = payload.find((p: any) => p.dataKey === 'ci_upper');
    const ciLower = payload.find((p: any) => p.dataKey === 'ci_lower');

    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <div className="mt-2">
          {actualOccupancy && actualOccupancy.value !== null && (
            <p className="text-sm text-blue-600 dark:text-blue-400">
              <span className="font-medium">Actual: </span>
              {actualOccupancy.value}%
            </p>
          )}
          {forecastOccupancy && forecastOccupancy.value !== null && (
            <p className="text-sm text-purple-600 dark:text-purple-400">
              <span className="font-medium">Forecast: </span>
              {forecastOccupancy.value}%
            </p>
          )}
          {forecastOccupancy && forecastOccupancy.value !== null && ciLower && ciUpper && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Confidence Range: </span>
              {ciLower.value}% - {ciUpper.value}%
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const RevenueTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Find payload items
    const actualRevenue = payload.find((p: any) => p.dataKey === 'actual');
    const forecastRevenue = payload.find((p: any) => p.dataKey === 'forecast');
    const ciUpper = payload.find((p: any) => p.dataKey === 'ci_upper');
    const ciLower = payload.find((p: any) => p.dataKey === 'ci_lower');

    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <div className="mt-2">
          {actualRevenue && actualRevenue.value !== null && (
            <p className="text-sm text-green-600 dark:text-green-400">
              <span className="font-medium">Actual: </span>
              ${actualRevenue.value.toLocaleString()}
            </p>
          )}
          {forecastRevenue && forecastRevenue.value !== null && (
            <p className="text-sm text-indigo-600 dark:text-indigo-400">
              <span className="font-medium">Forecast: </span>
              ${forecastRevenue.value.toLocaleString()}
            </p>
          )}
          {forecastRevenue && forecastRevenue.value !== null && ciLower && ciUpper && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Confidence Range: </span>
              ${ciLower.value.toLocaleString()} - ${ciUpper.value.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const ExpenseTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Find payload items
    const actualExpense = payload.find((p: any) => p.dataKey === 'actual');
    const forecastExpense = payload.find((p: any) => p.dataKey === 'forecast');
    const ciUpper = payload.find((p: any) => p.dataKey === 'ci_upper');
    const ciLower = payload.find((p: any) => p.dataKey === 'ci_lower');

    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <div className="mt-2">
          {actualExpense && actualExpense.value !== null && (
            <p className="text-sm text-red-600 dark:text-red-400">
              <span className="font-medium">Actual: </span>
              ${actualExpense.value.toLocaleString()}
            </p>
          )}
          {forecastExpense && forecastExpense.value !== null && (
            <p className="text-sm text-orange-600 dark:text-orange-400">
              <span className="font-medium">Forecast: </span>
              ${forecastExpense.value.toLocaleString()}
            </p>
          )}
          {forecastExpense && forecastExpense.value !== null && ciLower && ciUpper && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Confidence Range: </span>
              ${ciLower.value.toLocaleString()} - ${ciUpper.value.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};
