'use client';

import { useCallback, useEffect } from 'react';
import { Image, Settings, Download } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, Label, Radio, RangeSlider, Button, Alert, Progress } from 'flowbite-react';

export default function OutputSettings() {
  const { 
    output, 
    isProcessing, 
    processingProgress, 
    processingStatus, 
    processingError,
    contactSheetDataUrl,
    videoFile,
    videoMetadata,
    updateOutput,
    setProcessing,
    setProcessingProgress,
    setProcessingStatus,
    setProcessingError,
    setContactSheetDataUrl,
    setStepCompleted,
    goToNextStep
  } = useAppStore();

  // Validation function
  const validateOutput = useCallback(() => {
    const isValidFormat = output.format === 'jpeg' || output.format === 'png';
    const isValidQuality = output.quality >= 1 && output.quality <= 100;
    
    const isValid = isValidFormat && isValidQuality;
    if (isValid) {
      setStepCompleted(4, true);
    }
    return isValid;
  }, [output, setStepCompleted]);

  // Validate whenever output changes
  useEffect(() => {
    validateOutput();
  }, [output, validateOutput]);

  const handleFormatChange = useCallback((format: 'jpeg' | 'png') => {
    updateOutput({ format });
  }, [updateOutput]);

  const handleQualityChange = useCallback((quality: string) => {
    const numValue = parseInt(quality);
    if (isNaN(numValue) || numValue < 1 || numValue > 100) return;
    updateOutput({ quality: numValue });
  }, [updateOutput]);

  const handleGenerate = useCallback(async () => {
    if (!videoFile || !videoMetadata) return;
    
    setProcessing(true);
    setProcessingProgress(0);
    setProcessingStatus('Initializing...');
    setProcessingError(null);
    
    try {
      // TODO: Implement actual FFmpeg.js processing
      // For now, simulate the process
      
      // Simulate progress
      const progressSteps = [
        { progress: 10, status: 'Loading video file...' },
        { progress: 30, status: 'Extracting frames...' },
        { progress: 60, status: 'Compositing contact sheet...' },
        { progress: 90, status: 'Generating final image...' },
        { progress: 100, status: 'Complete!' }
      ];
      
      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProcessingProgress(step.progress);
        setProcessingStatus(step.status);
      }
      
      // Create a mock contact sheet (placeholder)
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Fill background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw placeholder text
        ctx.fillStyle = '#333';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Contact Sheet Preview', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px Arial';
        ctx.fillText('(Actual processing will be implemented with FFmpeg.js)', canvas.width / 2, canvas.height / 2 + 40);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL(`image/${output.format}`, output.quality / 100);
        setContactSheetDataUrl(dataUrl);
      }
      
    } catch (error) {
      setProcessingError(error instanceof Error ? error.message : 'Processing failed');
    } finally {
      setProcessing(false);
    }
  }, [videoFile, videoMetadata, output, setProcessing, setProcessingProgress, setProcessingStatus, setProcessingError, setContactSheetDataUrl]);

  const handleDownload = useCallback(() => {
    if (!contactSheetDataUrl || !videoFile) return;
    
    const link = document.createElement('a');
    link.href = contactSheetDataUrl;
    link.download = `${videoFile.name.replace(/\.[^/.]+$/, '')}_contact_sheet.${output.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [contactSheetDataUrl, videoFile, output.format]);

  const canGenerate = videoFile && videoMetadata && !isProcessing;

  return (
    <Card className="w-full">
      {/* Format Selection */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Image Format</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Label className="cursor-pointer p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
            <div className="flex items-center gap-3">
              <Radio
                id="jpeg"
                name="format"
                value="jpeg"
                checked={output.format === 'jpeg'}
                onChange={() => handleFormatChange('jpeg')}
              />
              <div>
                <span className="font-medium">JPEG</span>
                <p className="text-xs text-gray-600">Smaller file size</p>
              </div>
            </div>
          </Label>
          <Label className="cursor-pointer p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
            <div className="flex items-center gap-3">
              <Radio
                id="png"
                name="format"
                value="png"
                checked={output.format === 'png'}
                onChange={() => handleFormatChange('png')}
              />
              <div>
                <span className="font-medium">PNG</span>
                <p className="text-xs text-gray-600">Better quality</p>
              </div>
            </div>
          </Label>
        </div>
      </div>

      {/* Quality Slider (JPEG only) */}
      {output.format === 'jpeg' && (
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">JPEG Quality</span>
            <span className="text-xs font-semibold text-blue-600">{output.quality}%</span>
          </div>
          <RangeSlider
            min={1}
            max={100}
            value={output.quality}
            onChange={(e) => handleQualityChange(e.target.value)}
            className="w-full"
          />
          <div className="w-full flex justify-between text-xs px-2 mt-1 text-gray-500">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end mt-6">
        <Button
          color="blue"
          disabled={!validateOutput()}
          onClick={() => {
            setStepCompleted(4, true);
            goToNextStep();
          }}
        >
          Continue to Generate
        </Button>
      </div>

      {/* Validation alert */}
      {!validateOutput() && (
        <Alert color="failure" className="mt-4">
          Please check your output settings. Quality must be between 1 and 100.
        </Alert>
      )}

      {/* Generate Button */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Generate Contact Sheet</h3>
        </div>
        <Button
          color="blue"
          size="lg"
          className="w-full"
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          {isProcessing ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Processing...
            </>
          ) : (
            <>
              <Settings className="w-5 h-5 mr-2" />
              Generate Contact Sheet
            </>
          )}
        </Button>
        {!videoFile && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Upload a video to get started
          </p>
        )}
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between text-sm mb-3">
            <span className="font-medium text-blue-600">{processingStatus}</span>
            <span className="text-blue-600">{processingProgress}%</span>
          </div>
          <Progress progress={processingProgress} color="blue" className="w-full h-3" />
        </div>
      )}

      {/* Error Display */}
      {processingError && (
        <Alert color="failure" className="mt-6">
          {processingError}
        </Alert>
      )}

      {/* Download Section */}
      {contactSheetDataUrl && (
        <div className="mt-6 p-6 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-full">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-green-700">Contact Sheet Ready!</h4>
          </div>
          <div className="flex flex-col items-center gap-4">
            <img
              src={contactSheetDataUrl}
              alt="Contact Sheet Preview"
              className="max-w-full max-h-64 rounded-lg shadow-lg border border-gray-200"
            />
            <Button color="success" size="lg" onClick={handleDownload}>
              <Download className="w-5 h-5 mr-2" />
              Download Contact Sheet
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
