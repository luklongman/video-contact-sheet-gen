'use client';

import { useAppStore } from '@/lib/store';
import HeroSection from '@/components/HeroSection';
import FilmFrameNavigation from '@/components/FilmFrameNavigation';
import StepContent from '@/components/StepContent';

export default function Home() {
  const { showHero } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {showHero ? (
        <HeroSection />
      ) : (
        <>
          <div className="bg-white border-b shadow-sm">
            <div className="container mx-auto px-4 py-3">
              <FilmFrameNavigation />
            </div>
          </div>
          <StepContent />
        </>
      )}
    </div>
  );
}
