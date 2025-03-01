
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative overflow-hidden py-24 md:py-32 px-6">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-100 rounded-full filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-100 rounded-full filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center px-3 py-1 mb-8 bg-blue-50 rounded-full text-sm font-medium text-blue-600 animate-fade-in">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Introducing HotelWise Analytics
          </div>
          
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Strategic Financial Insights for Hotel Management
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            Elevate your hotel's financial performance with data-driven insights. Monitor key metrics, identify growth opportunities, and make informed decisions with our powerful analytics platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              className="rounded-full px-8 gap-2 shadow-soft"
              onClick={() => navigate('/dashboard')}
            >
              Explore Dashboard <ArrowRight size={16} />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full px-8"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
