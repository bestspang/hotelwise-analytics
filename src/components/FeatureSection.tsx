
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart3, 
  Brain, The 
  Calculator, 
  TrendingUp, 
  LineChart, 
  ZoomIn, 
  FileText, 
  ArrowUpRight 
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <Card className="border border-border/40 transition-all duration-300 hover:shadow-medium hover:border-border/80 overflow-hidden group">
    <CardContent className="p-6">
      <div className="flex flex-col gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-medium group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
);

const FeatureSection: React.FC = () => {
  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "KPI Monitoring",
      description: "Track essential metrics like RevPAR, GOPPAR, and occupancy rates in real-time with visual dashboards.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Trend Analysis",
      description: "Identify patterns and trends to optimize pricing strategies and maximize revenue potential.",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Insights",
      description: "Leverage machine learning to uncover actionable insights and predict future performance trends.",
    },
    {
      icon: <Calculator className="w-6 h-6" />,
      title: "Financial Forecasting",
      description: "Project future revenue and profitability based on historical data and market conditions.",
    },
    {
      icon: <ZoomIn className="w-6 h-6" />,
      title: "Data Extraction",
      description: "Automatically extract and process data from various financial statements and reports.",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Custom Reports",
      description: "Generate comprehensive reports for stakeholders with visual presentations of key metrics.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-secondary/50">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center px-3 py-1 mb-4 bg-primary/5 rounded-full text-sm font-medium text-primary">
            Key Features
          </div>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
            Everything you need for hotel financial management
          </h2>
          <p className="text-lg text-muted-foreground">
            Our platform delivers comprehensive tools to analyze, forecast, and optimize your hotel's financial performance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
