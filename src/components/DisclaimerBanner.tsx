import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DISCLAIMER_KEY = "noteverse-disclaimer-seen";

export function DisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(DISCLAIMER_KEY);
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISCLAIMER_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
      <div className="glass-card rounded-xl p-4 border border-accent/30 bg-card/95 backdrop-blur-xl shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">Educational Platform Disclaimer</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This platform is student-driven. Content is user-generated and accuracy is not guaranteed. 
              For educational support only.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Link to="/disclaimer">
                <Button variant="outline" size="sm" className="text-xs h-7">
                  Read Full Disclaimer
                </Button>
              </Link>
              <Button 
                size="sm" 
                onClick={handleDismiss}
                className="text-xs h-7 bg-accent text-accent-foreground"
              >
                I Understand
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground p-1 rounded-md"
            aria-label="Dismiss disclaimer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
