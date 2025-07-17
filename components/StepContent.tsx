'use client';

import { useAppStore } from '@/lib/store';
import { videoAnalyzer } from '@/lib/videoAnalysis';
import { ContactSheetOptions } from '@/lib/videoAnalysis';
import VideoLoad from './VideoLoad';
import FrameSelectionSettings from './FrameSelectionSettings';
import LayoutSettings from './LayoutSettings';
import OutputSettings from './OutputSettings';
import SkeletonPreview from './SkeletonPreview';
import { Film, Download } from 'lucide-react';

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
    setProcessingStatus('Initializing FFmpeg...');
    setProcessingError(null);

    try {
      // Calculate frame count based on selection
      const duration = frameSelection.endTime - frameSelection.startTime;
      const frameCount = Math.min(frameSelection.frameLimit, layout.columns * layout.rows);
      
      // Build contact sheet options
      const contactSheetOptions: ContactSheetOptions = {
        startTime: frameSelection.startTime,
        endTime: frameSelection.endTime,
        frameCount,
        gridCols: layout.columns,
        gridRows: layout.rows,
        thumbnailWidth: layout.thumbnailWidth,
        thumbnailHeight: layout.thumbnailHeight,
        showTimestamps: layout.showTimestamp,
        backgroundColor: layout.backgroundColor,
        textColor: layout.timestampColor,
        fontSize: layout.timestampFontSize,
        padding: layout.borderSpacing
      };

      setProcessingStatus('Generating contact sheet...');
      
      // Generate contact sheet using FFmpeg
      const contactSheetBlob = await videoAnalyzer.generateContactSheet(
        videoFile,
        contactSheetOptions,
        (progress) => {
          setProcessingProgress(progress * 100);
          setProcessingStatus(`Processing... ${Math.round(progress * 100)}%`);
        }
      );

      // Convert blob to data URL
      const reader = new FileReader();
      reader.onload = () => {
        setContactSheetDataUrl(reader.result as string);
        setProcessingStatus('Complete!');
      };
      reader.readAsDataURL(contactSheetBlob);

    } catch (error) {
      console.error('Contact sheet generation failed:', error);
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <VideoLoad />
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <FrameSelectionSettings />
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in">
            <LayoutSettings />
          </div>
        );
      case 4:
        return (
          <div className="animate-fade-in space-y-6">
            <OutputSettings />
            
            {/* Generate Button */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h4 className="card-title text-xl mb-4">
                  <Film className="w-6 h-6" />
                  Generate Contact Sheet
                </h4>
                
                <button
                  className="btn btn-primary btn-lg w-full"
                  onClick={handleGenerate}
                  disabled={!videoFile || !videoMetadata || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Film className="w-5 h-5" />
                      Generate Contact Sheet
                    </>
                  )}
                </button>
                
                {!videoFile && (
                  <p className="text-sm text-base-content/70 mt-2 text-center">
                    Load a video to get started
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
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="xl:col-span-1">
          <div className="sticky top-24 space-y-6">
            {renderStepContent()}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6">
              <SkeletonPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
