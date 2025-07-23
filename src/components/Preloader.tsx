import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader = ({ onComplete }: PreloaderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    "Connecting to Telegram...",
    "Loading user profile...",
    "Fetching user data...",
    "Syncing with database...",
    "Almost ready..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        
        // Update step based on progress
        const stepIndex = Math.floor((newProgress / 100) * steps.length);
        setCurrentStep(Math.min(stepIndex, steps.length - 1));
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete, steps.length]);

  return (
    <div className="min-h-screen bg-gradient-subtle font-inter text-foreground flex items-center justify-center">
      <div className="max-w-md mx-auto px-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/10 p-8 text-center space-y-6 animate-slide-up">
          {/* Water Drops Loading */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center mb-6">
            {/* Center droplet */}
            <div className="absolute w-4 h-4 bg-primary rounded-full opacity-80"></div>
            
            {/* Animated water drops */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-primary/60 rounded-full animate-pulse"
                style={{
                  transform: `rotate(${i * 60}deg) translateY(-24px)`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.2s'
                }}
              />
            ))}
            
            {/* Ripple effect */}
            <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-ping"></div>
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">TONIX</h1>
            <p className="text-muted-foreground text-sm">Preparing your experience</p>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {progress < 100 ? steps[currentStep] : "Ready!"}
            </p>
          </div>
          
          {/* Loading dots */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};