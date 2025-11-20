import { Button } from "@/components/ui/button";
import { Github, Zap } from "lucide-react";
import TypingEffect from "./TypingEffect";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Content */}
      <div className="relative container mx-auto max-w-4xl text-center space-y-8">
        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight animate-fade-in">
          AI-Powered PR Reviews
          <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            with <TypingEffect words={["Gemini", "Lyzr", "Kimi"]} />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in">
          Instant logic, security & performance reviews • 1M token context • 40× cheaper than Claude
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in">
          <Button variant="glow" size="xl" className="gap-2 group">
            <Github className="w-5 h-5" />
            Connect GitHub
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary-glow/30 to-primary/0 opacity-0 group-hover:opacity-100 animate-glow" />
          </Button>
          
          <Button variant="premium" size="xl" className="gap-2">
            <Zap className="w-5 h-5" />
            View Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-primary-glow">1M</div>
            <div className="text-sm text-muted-foreground">Token Context</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-primary-glow">40×</div>
            <div className="text-sm text-muted-foreground">Cheaper</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-primary-glow">&lt;15s</div>
            <div className="text-sm text-muted-foreground">Review Time</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
