
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 py-4",
      isScrolled ? "glass shadow-soft" : "bg-transparent"
    )}>
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-medium tracking-tight">
          HotelWise
          <span className="text-blue-500">.</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" active={location.pathname === "/"}>Home</NavLink>
          <NavLink to="/dashboard" active={location.pathname === "/dashboard"}>Dashboard</NavLink>
          <NavLink to="/analytics" active={location.pathname === "/analytics"}>Analytics</NavLink>
          <NavLink to="/reports" active={location.pathname === "/reports"}>Reports</NavLink>
          <Button variant="default" size="sm" className="ml-4 rounded-full px-6 shadow-soft">
            Get Started
          </Button>
        </nav>
        
        {/* Mobile Menu Button */}
        <Button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          variant="ghost" 
          size="icon"
          className="md:hidden"
        >
          {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </Button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-background animate-fade-in">
          <nav className="flex flex-col items-center justify-center h-full space-y-8 p-8">
            <MobileNavLink to="/" active={location.pathname === "/"}>Home</MobileNavLink>
            <MobileNavLink to="/dashboard" active={location.pathname === "/dashboard"}>Dashboard</MobileNavLink>
            <MobileNavLink to="/analytics" active={location.pathname === "/analytics"}>Analytics</MobileNavLink>
            <MobileNavLink to="/reports" active={location.pathname === "/reports"}>Reports</MobileNavLink>
            <Button variant="default" size="lg" className="mt-8 w-full rounded-full shadow-soft">
              Get Started
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

// Desktop NavLink component
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

// Mobile NavLink component
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
