import { useState } from "react";
import TopBar from "@/components/TopBar";
import HeroSection from "@/components/HeroSection";
import PRReviewForm from "@/components/PRReviewForm";
import ReviewResults from "@/components/ReviewResults";
import StatsBar from "@/components/StatsBar";
import GridScan from "@/components/GridScan";

interface ReviewResult {
  prUrl: string;
  owner: string;
  repo: string;
  prNumber: number;
  issues: Array<{
    file: string;
    line: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'security' | 'logic' | 'readability';
    title: string;
    description: string;
    suggestion: string;
  }>;
  reviewedAt: string;
}

const Index = () => {
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);

  return (
    <div className="min-h-screen bg-background relative">
      {/* GridScan Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#392e4e"
          gridScale={0.1}
          scanColor="#FF9FFC"
          scanOpacity={0.4}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <TopBar />
        <main className="pt-16">
          <HeroSection />
          <section className="py-12 px-4">
            <PRReviewForm onReviewComplete={setReviewResult} />
          </section>
          {reviewResult && (
            <section className="py-12 px-4">
              <ReviewResults result={reviewResult} />
            </section>
          )}
        </main>
        <StatsBar />
      </div>
    </div>
  );
};

export default Index;
