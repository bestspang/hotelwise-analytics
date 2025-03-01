
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, TrendingUp, Brain, FileSpreadsheet, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ToolCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  comingSoon?: boolean;
}> = ({ title, description, icon, route, comingSoon = false }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="h-full transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          {comingSoon && (
            <div className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-medium">
              Coming Soon
            </div>
          )}
        </div>
        <CardTitle className="text-xl mt-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {comingSoon ? 
          "This feature is currently in development and will be available soon." : 
          "Click below to access this tool and explore its features."}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full flex items-center justify-between" 
          variant={comingSoon ? "outline" : "default"}
          onClick={() => !comingSoon && navigate(route)}
          disabled={comingSoon}
        >
          <span>Open Tool</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

const Tools: React.FC = () => {
  return (
    <MainLayout title="Hotel Analysis Tools" subtitle="Powerful tools for hotel financial analysis">
      <div className="animate-fade-in space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Hotel Analysis Tools</h2>
          <p className="text-muted-foreground mt-1">
            Leverage our suite of analytical tools designed specifically for hotel operations and finance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolCard
            title="Custom Graph Builder"
            description="Create personalized visualizations by combining different metrics and dimensions."
            icon={<BarChart className="h-6 w-6" />}
            route="/tools/graph-builder"
          />
          
          <ToolCard
            title="Forecasting Tool"
            description="Predict future performance using advanced statistical and machine learning algorithms."
            icon={<TrendingUp className="h-6 w-6" />}
            route="/tools/forecasting"
          />
          
          <ToolCard
            title="AI Recommendations"
            description="Get AI-powered insights and strategic recommendations based on your hotel data."
            icon={<Brain className="h-6 w-6" />}
            route="/tools/ai-recommendations"
          />
          
          <ToolCard
            title="Performance Benchmark"
            description="Compare your property performance against industry standards and competitors."
            icon={<Award className="h-6 w-6" />}
            route="/tools/benchmarks"
            comingSoon
          />
          
          <ToolCard
            title="Financial Report Builder"
            description="Generate custom financial reports and export them in various formats."
            icon={<FileSpreadsheet className="h-6 w-6" />}
            route="/tools/report-builder"
            comingSoon
          />
        </div>
        
        <div className="bg-muted/50 rounded-lg p-6 border">
          <h3 className="text-lg font-medium mb-2">Strategic Decision Support</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our analytical tools are designed to provide actionable insights for hotel owners and managers. 
            From revenue optimization to cost control, these tools help you make data-driven decisions 
            that improve your bottom line.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-background rounded p-3 border">
              <div className="font-medium mb-1">Revenue Strategy</div>
              <p className="text-muted-foreground text-xs">Optimize pricing and distribution channels</p>
            </div>
            <div className="bg-background rounded p-3 border">
              <div className="font-medium mb-1">Cost Management</div>
              <p className="text-muted-foreground text-xs">Identify operational efficiencies and savings</p>
            </div>
            <div className="bg-background rounded p-3 border">
              <div className="font-medium mb-1">Growth Planning</div>
              <p className="text-muted-foreground text-xs">Model scenarios for expansion and investment</p>
            </div>
            <div className="bg-background rounded p-3 border">
              <div className="font-medium mb-1">Performance Tracking</div>
              <p className="text-muted-foreground text-xs">Monitor KPIs against targets and forecasts</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Tools;
