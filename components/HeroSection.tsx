'use client';

import { Film, Github, Instagram } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button, Card } from 'flowbite-react';

export default function HeroSection() {
  const { videoFile, setShowHero } = useAppStore();

  const handleGetStarted = () => {
    // Hide hero and show the step content
    setShowHero(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Social links */}
      <div className="absolute top-4 right-4 z-20 flex gap-4">
        <a 
          href="https://github.com/longman/video-contact-sheet-gen" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:text-gray-300 transition-colors"
        >
          <Github size={24} />
        </a>
        <a 
          href="https://www.instagram.com/l.ongman/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:text-gray-300 transition-colors"
        >
          <Instagram size={24} />
        </a>
      </div>
      
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/asset/bg.jpg)',
        }}
      />
      <div className="absolute inset-0 bg-black/70"></div>

      
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-lg mx-auto z-10 bg-gray-900/60 backdrop-blur-md border-gray-700">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full">
              <Film className="text-white" size={36} />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Contact Sheet Generator
          </h1>
          
          <p className="text-gray-300 text-center mb-6">
            Create contact sheets with FFmpeg. Processed locally. No load is required.
          </p>
          
          <div className="flex justify-center">
            <Button 
              color="blue"
              size="lg"
              onClick={handleGetStarted}
              className="font-medium"
            >
              <Film className="mr-2 h-5 w-5" />
              {videoFile ? 'Continue Editing' : 'Get Started'}
            </Button>
          </div>
          
          <div className="mt-4 text-xs text-gray-400 text-center">
            All processing happens in your browser. Your videos never leave your device.
          </div>
        </Card>
      </div>
    </div>
  );
}
