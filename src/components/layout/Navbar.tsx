import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuIcon, X, Hotel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard') || 
                      location.pathname.includes('/analytics') || 
                      location.pathname.includes('/reports') ||
                      location.pathname.includes('/tools') ||
                      location.pathname.includes('/settings');
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 py-4",
      isDashboard 
        ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm" 
        : (isScrolled ? "glass shadow-soft" : "bg-transparent")
    )}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex flex-col items-start">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-medium tracking-tight">
            <div className="w-9 h-9 bg-blue-600 flex items-center justify-center text-white rounded-lg shadow-md">
              <Hotel className="w-5 h-5" />
            </div>
            <span className="font-semibold">
              Hotel<span className="text-blue-600">Wise</span>
            </span>
          </Link>
          {isDashboard && (
            <div className="text-sm font-medium text-muted-foreground mt-1 ml-10">
              Dashboard
            </div>
          )}
        </div>
        
        {!isDashboard && (
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" active={location.pathname === "/"}>Home</NavLink>
            <NavLink to="/dashboard" active={location.pathname === "/dashboard"}>Dashboard</NavLink>
            <NavLink to="/analytics" active={location.pathname === "/analytics"}>Analytics</NavLink>
            <NavLink to="/reports" active={location.pathname === "/reports"}>Reports</NavLink>
            <Button variant="default" size="sm" className="ml-4 rounded-full px-6 shadow-soft bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </nav>
        )}
        
        {!isDashboard && (
          <Button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            variant="ghost" 
            size="icon"
            className="md:hidden"
          >
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </Button>
        )}
      </div>
      
      {isMenuOpen && !isDashboard && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-background animate-fade-in">
          <nav className="flex flex-col items-center justify-center h-full space-y-8 p-8">
            <MobileNavLink to="/" active={location.pathname === "/"}>Home</MobileNavLink>
            <MobileNavLink to="/dashboard" active={location.pathname === "/dashboard"}>Dashboard</MobileNavLink>
            <MobileNavLink to="/analytics" active={location.pathname === "/analytics"}>Analytics</MobileNavLink>
            <MobileNavLink to="/reports" active={location.pathname === "/reports"}>Reports</MobileNavLink>
            <Button variant="default" size="lg" className="mt-8 w-full rounded-full shadow-soft bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => (
  <Link
    to={to}
    className={cn(
      "text-sm font-medium transition-colors hover:text-primary relative",
      active ? "text-primary" : "text-muted-foreground"
    )}
  >
    {children}
    {active && (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full mt-0.5" />
    )}
  </Link>
);

const MobileNavLink: React.FC<NavLinkProps> = ({ to, active, children }) => (
  <Link
    to={to}
    className={cn(
      "text-2xl font-medium transition-colors",
      active ? "text-primary" : "text-muted-foreground"
    )}
  >
    {children}
  </Link>
);

export default Navbar;
