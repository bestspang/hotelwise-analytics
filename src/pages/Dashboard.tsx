
import React from 'react';
import { Button } from '@/components/ui/button';
import KpiCard from '@/components/ui/KpiCard';
import TrendChart from '@/components/charts/TrendChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Calendar, Download, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  dashboardData, 
  revParTrend, 
  gopparTrend, 
  occupancyTrend,
  revenueSegments,
  adrBySegment
} from '@/utils/mockData';

const Dashboard: React.FC = () => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  const formatPercentage = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  };
  
  // Colors for pie charts
  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'];
  
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-semibold mb-2">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of key performance indicators and financial metrics
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4 animate-slide-down">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Calendar size={16} />
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter size={16} />
              Filter
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download size={16} />
              Export
            </Button>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <KpiCard
              title="RevPAR"
              value={dashboardData.revPAR}
              prefix="$"
              previousValue={dashboardData.previousRevPAR}
              formatter={formatCurrency}
            />
          </div>
          
          <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <KpiCard
              title="GOPPAR"
              value={dashboardData.gopPAR}
              prefix="$"
              previousValue={dashboardData.previousGopPAR}
              formatter={formatCurrency}
            />
          </div>
          
          <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <KpiCard
              title="Occupancy Rate"
              value={dashboardData.occupancyRate}
              suffix="%"
              previousValue={dashboardData.previousOccupancyRate}
              formatter={formatPercentage}
            />
          </div>
          
          <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <KpiCard
              title="ADR"
              value={dashboardData.adr}
              prefix="$"
              previousValue={dashboardData.previousADR}
              formatter={formatCurrency}
            />
          </div>
        </div>
        
        {/* Secondary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="animate-scale-in" style={{ animationDelay: '0.5s' }}>
            <KpiCard
              title="TRevPAR"
              value={dashboardData.tRevPAR}
              prefix="$"
              previousValue={dashboardData.previousTRevPAR}
              formatter={formatCurrency}
            />
          </div>
          
          <div className="animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <KpiCard
              title="Cost Per Occupied Room"
              value={dashboardData.cpor}
              prefix="$"
              previousValue={dashboardData.previousCPOR}
              formatter={formatCurrency}
              trendColor={false}
            />
          </div>
          
          <div className="animate-scale-in" style={{ animationDelay: '0.7s' }}>
            <KpiCard
              title="Average Length of Stay"
              value={dashboardData.alos}
              suffix=" days"
              previousValue={dashboardData.previousALOS}
              formatter={(val) => val.toFixed(1)}
            />
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <TrendChart
              title="RevPAR Trend (12 Months)"
              data={revParTrend}
              prefix="$"
              color="#3b82f6"
              gradientFrom="rgba(59, 130, 246, 0.2)"
              gradientTo="rgba(59, 130, 246, 0)"
            />
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <TrendChart
              title="GOPPAR Trend (12 Months)"
              data={gopparTrend}
              prefix="$"
              color="#8b5cf6"
              gradientFrom="rgba(139, 92, 246, 0.2)"
              gradientTo="rgba(139, 92, 246, 0)"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="animate-slide-up lg:col-span-1" style={{ animationDelay: '0.5s' }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Occupancy Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <TrendChart
                      title=""
                      data={occupancyTrend}
                      suffix="%"
                      color="#10b981"
                      gradientFrom="rgba(16, 185, 129, 0.2)"
                      gradientTo="rgba(16, 185, 129, 0)"
                    />
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="animate-slide-up lg:col-span-1" style={{ animationDelay: '0.6s' }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Revenue by Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueSegments}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {revenueSegments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => {
                          // Ensure value is treated as a number before formatting
                          return [`$${typeof value === 'number' ? value.toLocaleString() : value}`, 'Revenue'];
                        }}
                        contentStyle={{
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                          border: 'none',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="animate-slide-up lg:col-span-1" style={{ animationDelay: '0.7s' }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">ADR by Market Segment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={adrBySegment}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {adrBySegment.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => {
                          // Ensure value is treated as a number before formatting
                          return [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'ADR'];
                        }}
                        contentStyle={{
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                          border: 'none',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
