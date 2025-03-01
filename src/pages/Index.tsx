
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        <HeroSection />
        <FeatureSection />
        
        {/* Testimonials Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center px-3 py-1 mb-4 bg-primary/5 rounded-full text-sm font-medium text-primary">
                Testimonials
              </div>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                Trusted by hoteliers worldwide
              </h2>
              <p className="text-lg text-muted-foreground">
                Hear from hotel managers who have transformed their financial operations with our platform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "The dashboard gives me all the KPIs I need at a glance. It's transformed how we make pricing decisions.",
                  author: "Sarah Chen",
                  role: "General Manager, Solaris Hotels"
                },
                {
                  quote: "We've increased our RevPAR by 15% since implementing this platform. The forecasting tools are exceptionally accurate.",
                  author: "Michael Rodriguez",
                  role: "Director of Revenue, Azura Resorts"
                },
                {
                  quote: "The data extraction saved my team hours of manual work every week. Now we can focus on strategy instead of data entry.",
                  author: "Emma Thompson",
                  role: "Finance Director, Grand Hotel Group"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-card p-8 rounded-xl border shadow-soft">
                  <div className="flex flex-col h-full">
                    <div className="text-xl font-medium mb-6 text-primary">❝</div>
                    <p className="flex-grow text-lg italic mb-6">{testimonial.quote}</p>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-6 bg-primary text-primary-foreground">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-8 md:mb-0 md:max-w-xl">
                <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                  Ready to transform your hotel's financial management?
                </h2>
                <p className="text-lg opacity-90 mb-6">
                  Get started today and access powerful insights for your properties.
                </p>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="rounded-full px-8 gap-2 shadow-soft"
                >
                  Start Free Trial <ArrowRight size={16} />
                </Button>
              </div>
              
              <div className="bg-primary-foreground/10 p-8 rounded-xl backdrop-blur-sm">
                <ul className="space-y-4">
                  {[
                    "14-day free trial with full access",
                    "No credit card required",
                    "Dedicated onboarding support",
                    "Import your hotel data instantly"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary-foreground flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="py-12 px-6 bg-background border-t">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <div className="text-2xl font-medium tracking-tight">
                  HotelWise<span className="text-blue-500">.</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  Strategic Hotel Financial Analytics
                </p>
              </div>
              
              <div className="flex space-x-8">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} HotelWise Analytics. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
