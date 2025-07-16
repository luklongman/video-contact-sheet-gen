'use client';

import { useAppStore } from '@/lib/store';
import { Eye, Grid, Info } from 'lucide-react';

export default function SkeletonPreview() {
  const { layout, totalFramesToExtract } = useAppStore();

  // Calculate grid dimensions
  const columns = layout.columns;
  const rows = layout.mode === 'fixed' 
    ? layout.rows || 5 
    : Math.ceil(totalFramesToExtract / columns);

  // Calculate thumbnail dimensions for preview
  const containerWidth = 400; // Fixed container width for preview
  const thumbnailWidth = (containerWidth - (columns + 1) * layout.padding) / columns;
  const thumbnailHeight = thumbnailWidth * (9/16); // Assume 16:9 aspect ratio for preview

  const previewHeight = rows * thumbnailHeight + (rows + 1) * layout.padding;

  const renderGrid = () => {
    const items = [];
    const totalItems = Math.min(totalFramesToExtract, columns * rows);
    
    for (let i = 0; i < totalItems; i++) {
      const row = Math.floor(i / columns);
      const col = i % columns;
      
      const x = col * (thumbnailWidth + layout.padding) + layout.padding;
      const y = row * (thumbnailHeight + layout.padding) + layout.padding;
      
      items.push(
        <div
          key={i}
          className="bg-base-300 rounded animate-pulse relative overflow-hidden"
          style={{
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            width: `${thumbnailWidth}px`,
            height: `${thumbnailHeight}px`,
            border: layout.showBorder ? `${layout.borderThickness}px solid ${layout.borderColor}` : 'none',
          }}
        >
          {/* Placeholder content */}
          <div className="absolute inset-0 bg-gradient-to-br from-base-300 to-base-200"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-base-content/10 rounded"></div>
          </div>
          
          {/* Timestamp placeholder */}
          {layout.showTimestamp && (
            <div 
              className="absolute bg-base-content/20 rounded px-1 py-0.5"
              style={{
                fontSize: `${Math.max(8, layout.timestampFontSize * 0.6)}px`,
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
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-info/10 rounded-lg">
              <Eye className="w-5 h-5 text-info" />
            </div>
            <h3 className="card-title text-lg">Layout Preview</h3>
          </div>
          
          <div className="flex flex-col items-center justify-center h-48 bg-base-200 rounded-lg border border-base-300">
            <Grid className="w-12 h-12 text-base-content/30 mb-3" />
            <p className="text-base-content/50 text-center">
              Upload and configure your video to see the preview
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-info/10 rounded-lg">
            <Eye className="w-5 h-5 text-info" />
          </div>
          <h3 className="card-title text-lg">Layout Preview</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="stat bg-base-200/50 rounded-lg p-3">
            <div className="stat-title text-xs">Grid</div>
            <div className="stat-value text-lg">{columns} × {rows}</div>
          </div>
          <div className="stat bg-base-200/50 rounded-lg p-3">
            <div className="stat-title text-xs">Frames</div>
            <div className="stat-value text-lg text-primary">{totalFramesToExtract}</div>
          </div>
        </div>
        
        <div className="border border-base-300 rounded-lg overflow-hidden bg-base-200">
          <div
            className="relative mx-auto"
            style={{
              width: `${containerWidth}px`,
              height: `${previewHeight}px`,
              backgroundColor: layout.backgroundColor,
            }}
          >
            {renderGrid()}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3 p-2 bg-info/10 rounded-lg">
          <Info className="w-4 h-4 text-info" />
          <span className="text-xs text-info">
            Preview is scaled down for display
          </span>
        </div>
      </div>
    </div>
  );
}
