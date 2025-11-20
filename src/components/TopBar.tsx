import { Github } from "lucide-react";

const TopBar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <Github className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">PR Sentinel</h1>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
