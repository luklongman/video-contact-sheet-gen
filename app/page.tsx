'use client';

import { useAppStore } from '@/lib/store';
import HeroSection from '@/components/HeroSection';
import FilmFrameNavigation from '@/components/FilmFrameNavigation';
import StepContent from '@/components/StepContent';

export default function Home() {
  const { showHero } = useAppStore();

  return (
    <div className="min-h-screen bg-base-100">
      {showHero ? (
        <HeroSection />
      ) : (
        <>
          <FilmFrameNavigation />
          <StepContent />
        </>
      )}
    </div>
  );
}
