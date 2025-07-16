'use client';

import { Clock, Film, Monitor, Code, Info } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, Badge } from 'flowbite-react';

export default function VideoMetadata() {
  const { videoMetadata } = useAppStore();

  if (!videoMetadata) return null;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatResolution = (width: number, height: number) => {
    // Add common resolution names
    const resolutionName = () => {
      if (width === 1920 && height === 1080) return 'Full HD';
      if (width === 1280 && height === 720) return 'HD';
      if (width === 3840 && height === 2160) return '4K';
      if (width === 2560 && height === 1440) return '2K';
      return '';
    };
    
    const name = resolutionName();
    return name ? `${width} × ${height} (${name})` : `${width} × ${height}`;
  };

  return (
    <Card className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Info className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold">Video Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="p-3 bg-blue-100 rounded-full">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Duration</p>
            <p className="font-semibold text-lg text-gray-900">{formatDuration(videoMetadata.duration)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="p-3 bg-purple-100 rounded-full">
            <Film className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Frame Rate</p>
            <p className="font-semibold text-lg text-gray-900">{videoMetadata.fps} FPS</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="p-3 bg-pink-100 rounded-full">
            <Monitor className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Resolution</p>
            <p className="font-semibold text-lg text-gray-900">{formatResolution(videoMetadata.width, videoMetadata.height)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="p-3 bg-gray-100 rounded-full">
            <Code className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Codec</p>
            <p className="font-semibold text-lg text-gray-900 uppercase">{videoMetadata.codec}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700 font-medium">Ready for processing</span>
        </div>
      </div>
    </Card>
  );
}
