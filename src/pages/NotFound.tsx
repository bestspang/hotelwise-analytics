
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container flex flex-col items-center justify-center min-h-[80vh] px-6 py-12 mx-auto">
        <div className="text-center max-w-md mx-auto animate-fade-in">
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-5xl">404</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-medium mb-4">
            Page not found
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          
          <Button 
            onClick={() => navigate('/')} 
            size="lg" 
            className="rounded-full gap-2 px-8"
          >
            <ArrowLeft size={16} /> Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
