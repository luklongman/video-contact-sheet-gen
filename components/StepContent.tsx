'use client';

import { useAppStore } from '@/lib/store';
import VideoUpload from './VideoUpload';
import VideoMetadata from './VideoMetadata';
import FrameSelectionSettings from './FrameSelectionSettings';
import LayoutSettings from './LayoutSettings';
import OutputSettings from './OutputSettings';
import SkeletonPreview from './SkeletonPreview';
import { Settings, Download } from 'lucide-react';

export default function StepContent() {
  const { 
    currentStep, 
    videoMetadata, 
    frameSelection, 
    layout, 
    output, 
    contactSheetDataUrl,
    isProcessing,
    processingProgress,
    processingStatus,
    processingError,
    videoFile,
    setProcessing,
    setProcessingProgress,
    setProcessingStatus,
    setProcessingError,
    setContactSheetDataUrl
  } = useAppStore();

  const handleGenerate = async () => {
    if (!videoFile || !videoMetadata) return;

    setProcessing(true);
    setProcessingProgress(0);
    setProcessingStatus('Initializing...');
    setProcessingError(null);

    try {
      // Simulate processing
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProcessingProgress(i);
        setProcessingStatus(`Processing... ${i}%`);
      }

      // Mock result
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = layout.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText('Contact Sheet Preview', 50, 50);
        setContactSheetDataUrl(canvas.toDataURL('image/jpeg', output.quality / 100));
      }

      setProcessingStatus('Complete!');
    } catch (error) {
      setProcessingError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!contactSheetDataUrl) return;

    const link = document.createElement('a');
    link.download = `contact-sheet.${output.format}`;
    link.href = contactSheetDataUrl;
    link.click();
  };

  const generateSummary = () => {
    const canGenerate = videoFile && videoMetadata && !isProcessing;
    
    return (
      <div className="space-y-6">
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-2xl mb-4">Generation Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">Video Info</h4>
                <div className="space-y-1 text-sm">
                  <div>Duration: {videoMetadata ? Math.round(videoMetadata.duration) : 0}s</div>
                  <div>Resolution: {videoMetadata ? `${videoMetadata.width}x${videoMetadata.height}` : 'Unknown'}</div>
                  <div>Frame Rate: {videoMetadata ? videoMetadata.fps.toFixed(2) : 0} fps</div>
                  <div>Codec: {videoMetadata?.codec || 'Unknown'}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Frame Selection</h4>
                <div className="space-y-1 text-sm">
                  <div>Mode: {frameSelection.intervalMode}</div>
                  <div>Interval: {frameSelection.intervalValue} {frameSelection.intervalMode}</div>
                  <div>Range: {frameSelection.startTime}s - {frameSelection.endTime}s</div>
                  <div>Frame Limit: {frameSelection.useFrameLimit ? frameSelection.frameLimit : 'None'}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Layout</h4>
                <div className="space-y-1 text-sm">
                  <div>Mode: {layout.mode}</div>
                  <div>Columns: {layout.columns}</div>
                  {layout.rows && <div>Rows: {layout.rows}</div>}
                  <div>Padding: {layout.padding}px</div>
                  <div>Timestamps: {layout.showTimestamp ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Output</h4>
                <div className="space-y-1 text-sm">
                  <div>Format: {output.format.toUpperCase()}</div>
                  <div>Quality: {output.quality}%</div>
                  <div>Border: {layout.showBorder ? 'Yes' : 'No'}</div>
                  <div>Background: {layout.backgroundColor}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <h4 className="card-title text-xl mb-4">
              <Settings className="w-6 h-6" />
              Generate Contact Sheet
            </h4>
            
            <button
              className="btn btn-primary btn-lg w-full"
              onClick={handleGenerate}
              disabled={!canGenerate}
            >
              {isProcessing ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </>
              ) : (
                <>
                  <Settings className="w-5 h-5" />
                  Generate Contact Sheet
                </>
              )}
            </button>
            
            {!videoFile && (
              <p className="text-sm text-base-content/70 mt-2 text-center">
                Upload a video to get started
              </p>
            )}
          </div>
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium text-primary">{processingStatus}</span>
                <span className="text-primary">{processingProgress}%</span>
              </div>
              <progress 
                className="progress progress-primary w-full h-3" 
                value={processingProgress} 
                max="100"
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {processingError && (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{processingError}</span>
          </div>
        )}

        {/* Result */}
        {contactSheetDataUrl && (
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h4 className="card-title text-xl mb-4">Generated Contact Sheet</h4>
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={contactSheetDataUrl}
                  alt="Contact Sheet Preview"
                  className="max-w-full max-h-64 rounded-lg shadow-lg border border-base-300"
                />
                
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleDownload}
                >
                  <Download className="w-5 h-5" />
                  Download Contact Sheet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-slide-in-right">
            <VideoUpload />
            {videoMetadata && <VideoMetadata />}
          </div>
        );
      case 2:
        return (
          <div className="animate-slide-in-right">
            <FrameSelectionSettings />
          </div>
        );
      case 3:
        return (
          <div className="animate-slide-in-right">
            <LayoutSettings />
          </div>
        );
      case 4:
        return (
          <div className="animate-slide-in-right">
            <OutputSettings />
          </div>
        );
      case 5:
        return (
          <div className="animate-slide-in-right">
            {generateSummary()}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="xl:col-span-2">
          {renderStepContent()}
        </div>

        {/* Preview panel */}
        <div className="xl:col-span-1">
          <div className="sticky top-24">
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">Preview</h3>
                <SkeletonPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
