'use client';

import { Film, Play, Camera, Zap } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function HeroSection() {
  const { videoFile, setShowHero } = useAppStore();

  const handleGetStarted = () => {
    // Hide hero and show the step content
    setShowHero(false);
  };

  return (
    <div className="hero min-h-screen relative overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/asset/bg.jpg)',
        }}
      />
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      {/* Background film strip pattern */}
      <div className="absolute inset-0 opacity-5 hero-pattern"></div>

      {/* Floating film elements */}
      <div className="absolute top-20 left-20 w-16 h-12 border-2 border-primary/20 rounded-sm animate-pulse">
        <div className="absolute -left-1 top-1 w-2 h-2 bg-primary/20 rounded-full"></div>
        <div className="absolute -left-1 bottom-1 w-2 h-2 bg-primary/20 rounded-full"></div>
        <div className="absolute -right-1 top-1 w-2 h-2 bg-primary/20 rounded-full"></div>
        <div className="absolute -right-1 bottom-1 w-2 h-2 bg-primary/20 rounded-full"></div>
      </div>
      
      <div className="absolute top-40 right-32 w-16 h-12 border-2 border-secondary/20 rounded-sm animate-pulse delay-700">
        <div className="absolute -left-1 top-1 w-2 h-2 bg-secondary/20 rounded-full"></div>
        <div className="absolute -left-1 bottom-1 w-2 h-2 bg-secondary/20 rounded-full"></div>
        <div className="absolute -right-1 top-1 w-2 h-2 bg-secondary/20 rounded-full"></div>
        <div className="absolute -right-1 bottom-1 w-2 h-2 bg-secondary/20 rounded-full"></div>
      </div>

      <div className="absolute bottom-32 left-1/4 w-16 h-12 border-2 border-accent/20 rounded-sm animate-pulse delay-1000">
        <div className="absolute -left-1 top-1 w-2 h-2 bg-accent/20 rounded-full"></div>
        <div className="absolute -left-1 bottom-1 w-2 h-2 bg-accent/20 rounded-full"></div>
        <div className="absolute -right-1 top-1 w-2 h-2 bg-accent/20 rounded-full"></div>
        <div className="absolute -right-1 bottom-1 w-2 h-2 bg-accent/20 rounded-full"></div>
      </div>

      <div className="hero-content text-center relative z-10">
        <div className="max-w-2xl">
          {/* Main logo/icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-2xl glow-effect">
                <Film size={64} className="text-base-100" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center animate-bounce">
                <Play size={16} className="text-base-100" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl font-bold text-primary mb-4 animate-fade-in">
            Video Contact Sheet
          </h1>
          <h2 className="text-4xl font-bold text-base-content mb-8 animate-fade-in delay-200">
            Generator
          </h2>

          {/* Subtitle */}
          <p className="text-xl text-base-content/80 mb-8 animate-fade-in delay-300">
            Transform your videos into beautiful contact sheets with 
            <span className="text-primary font-semibold"> client-side processing</span>. 
            No uploads, no servers, just pure browser magic.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in delay-500">
            <div className="card bg-base-200/50 backdrop-blur-sm border border-base-300/20 shadow-lg">
              <div className="card-body items-center text-center p-6">
                <Camera className="text-primary w-8 h-8 mb-2" />
                <h3 className="card-title text-lg">Smart Extraction</h3>
                <p className="text-base-content/70 text-sm">
                  Intelligent frame selection with customizable intervals
                </p>
              </div>
            </div>

            <div className="card bg-base-200/50 backdrop-blur-sm border border-base-300/20 shadow-lg">
              <div className="card-body items-center text-center p-6">
                <Zap className="text-secondary w-8 h-8 mb-2" />
                <h3 className="card-title text-lg">Lightning Fast</h3>
                <p className="text-base-content/70 text-sm">
                  Process videos locally with hardware acceleration
                </p>
              </div>
            </div>

            <div className="card bg-base-200/50 backdrop-blur-sm border border-base-300/20 shadow-lg">
              <div className="card-body items-center text-center p-6">
                <Film className="text-accent w-8 h-8 mb-2" />
                <h3 className="card-title text-lg">Cinematic Style</h3>
                <p className="text-base-content/70 text-sm">
                  Professional layouts with customizable styling
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="animate-fade-in delay-700">
            <button 
              onClick={handleGetStarted}
              className="btn btn-primary btn-lg px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
            >
              <Film className="mr-2" size={24} />
              {videoFile ? 'Continue Editing' : 'Get Started'}
            </button>
          </div>

          {/* Security notice */}
          <div className="mt-12 animate-fade-in delay-900">
            <div className="alert alert-info shadow-lg border border-info/20">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="font-semibold">100% Privacy Focused</span>
              </div>
              <div className="text-sm opacity-80">
                All processing happens in your browser. Your videos never leave your device.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
