'use client';

import { useAppStore } from '@/lib/store';
import { Eye, Grid, Info } from 'lucide-react';

export default function SkeletonPreview() {
  const { layout, totalFramesToExtract, videoMetadata } = useAppStore();

  // Calculate grid dimensions
  const columns = layout.columns;
  const rows = layout.rows || Math.ceil(totalFramesToExtract / columns);

  // Calculate thumbnail dimensions for preview
  const containerWidth = 800; // Container width for the preview area
  const thumbnailWidth = layout.thumbnailWidth || 300;
  const thumbnailHeight = layout.thumbnailHeight || (videoMetadata ? Math.round(thumbnailWidth / (videoMetadata.width / videoMetadata.height)) : Math.round(thumbnailWidth / (16/9)));
  
  // Scale down for preview display
  const previewScale = Math.min(containerWidth / ((thumbnailWidth * columns) + (layout.filmSpacing * (columns - 1)) + (layout.borderSpacing * 2)), 1);
  const previewThumbnailWidth = thumbnailWidth * previewScale;
  const previewThumbnailHeight = thumbnailHeight * previewScale;
  const previewFilmSpacing = layout.filmSpacing * previewScale;
  const previewBorderSpacing = layout.borderSpacing * previewScale;
  
  const previewWidth = (previewThumbnailWidth * columns) + (previewFilmSpacing * (columns - 1)) + (previewBorderSpacing * 2);
  const previewHeight = (previewThumbnailHeight * rows) + (previewFilmSpacing * (rows - 1)) + (previewBorderSpacing * 2);

  const renderGrid = () => {
    const items = [];
    const totalItems = Math.min(totalFramesToExtract, columns * rows);
    
    for (let i = 0; i < totalItems; i++) {
      const row = Math.floor(i / columns);
      const col = i % columns;
      
      const x = col * (previewThumbnailWidth + previewFilmSpacing) + previewBorderSpacing;
      const y = row * (previewThumbnailHeight + previewFilmSpacing) + previewBorderSpacing;
      
      items.push(
        <div
          key={i}
          className="bg-gray-200 rounded animate-pulse relative overflow-hidden"
          style={{
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            width: `${previewThumbnailWidth}px`,
            height: `${previewThumbnailHeight}px`,
            border: layout.showBorder ? `${layout.borderThickness * previewScale}px solid ${layout.borderColor}` : 'none',
          }}
        >
          {/* Placeholder content */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-gray-400 rounded opacity-30"></div>
          </div>
          
          {/* Timestamp placeholder */}
          {layout.showTimestamp && (
            <div 
              className="absolute bg-black/70 rounded px-1 py-0.5"
              style={{
                fontSize: `${Math.max(8, layout.timestampFontSize * previewScale)}px`,
                color: layout.timestampColor,
                ...(layout.timestampPosition === 'top-left' && { top: '2px', left: '2px' }),
                ...(layout.timestampPosition === 'top-right' && { top: '2px', right: '2px' }),
                ...(layout.timestampPosition === 'bottom-left' && { bottom: '2px', left: '2px' }),
                ...(layout.timestampPosition === 'bottom-right' && { bottom: '2px', right: '2px' }),
                ...(layout.timestampPosition === 'bottom-center' && { bottom: '2px', left: '50%', transform: 'translateX(-50%)' }),
              }}
            >
              00:00
            </div>
          )}
        </div>
      );
    }
    return items;
  };

  if (totalFramesToExtract === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-gray-200">
        <Grid className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500 text-center font-medium">
          Load and configure your video to see the preview
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-800">Layout Preview</h3>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-blue-50 rounded-full px-3 py-1">
            <span className="text-xs font-medium text-blue-700">
              Grid: {columns} × {rows}
            </span>
          </div>
          <div className="bg-green-50 rounded-full px-3 py-1">
            <span className="text-xs font-medium text-green-700">
              Frames: {totalFramesToExtract}
            </span>
          </div>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-auto bg-gray-50">
        <div
          className="relative mx-auto"
          style={{
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
            backgroundColor: layout.backgroundColor,
            maxWidth: '100%',
          }}
        >
          {renderGrid()}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-3 p-2 bg-blue-50 rounded-lg">
        <Info className="w-4 h-4 text-blue-600" />
        <span className="text-xs text-blue-700">
          Preview is scaled down for display. Final output will be full size.
        </span>
      </div>
    </div>
  );
}
