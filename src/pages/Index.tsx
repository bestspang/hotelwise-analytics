
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Hotel Financial Analysis</h1>
          <div className="space-x-4">
            {user ? (
              <Link to="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <main>
        <HeroSection />
        <FeatureSection />
      </main>
      
      <footer className="bg-gray-100 dark:bg-gray-800 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
          <p>© 2023 Hotel Financial Analysis. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
