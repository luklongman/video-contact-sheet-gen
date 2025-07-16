'use client';

import { useCallback } from 'react';
import { Upload, FileVideo, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, Button, Badge, Progress, Alert } from 'flowbite-react';
import { videoAnalyzer } from '@/lib/videoAnalysis';

export default function VideoUpload() {
  const { 
    videoFile, 
    isAnalyzing, 
    analysisError, 
    isUploading,
    uploadProgress,
    uploadStatus,
    setVideoFile, 
    setAnalyzing, 
    setAnalysisError,
    setUploading,
    setUploadProgress,
    setUploadStatus,
    resetState,
    setStepCompleted,
    goToNextStep,
    setVideoMetadata
  } = useAppStore();

  const handleFileSelect = useCallback(async (file: File) => {
    // Basic validation
    if (!file.type.startsWith('video/')) {
      setAnalysisError('Please select a valid video file');
      return;
    }

    // File size check (1GB limit for demo)
    if (file.size > 1024 * 1024 * 1024) {
      setAnalysisError('File size must be less than 1GB');
      return;
    }

    setVideoFile(file);
    setAnalysisError(null);
    setAnalyzing(true);
    
    try {
      // Step 1: Get basic metadata quickly using HTML5 video element
      const basicMetadata = await videoAnalyzer.getBasicMetadata(file);
      setVideoMetadata(basicMetadata);
      setStepCompleted(1, true);
      setAnalyzing(false);
      
      // Move to next step immediately
      goToNextStep();
      
      // Step 2: Start background processing for detailed metadata
      setUploading(true);
      setUploadProgress(0);
      setUploadStatus('Loading FFmpeg library...');
      
      // Run detailed analysis in background
      const detailedMetadata = await videoAnalyzer.updateMetadataWithDetails(file, basicMetadata, (progress) => {
        setUploadProgress(Math.round(progress * 100));
        setUploadStatus(progress === 0 ? 'Loading FFmpeg library...' : 'Analyzing video details...');
      });
      
      // Update with detailed metadata
      setVideoMetadata(detailedMetadata);
      setUploadStatus('Video analysis complete');
      
    } catch (error) {
      console.error('Video analysis failed:', error);
      if (isAnalyzing) {
        // If we failed during basic analysis, show error and don't proceed
        setAnalysisError('Failed to analyze video. Please try a different file.');
      } else {
        // If we failed during detailed analysis, just log it - user can still proceed
        console.warn('Detailed video analysis failed, using basic metadata');
        setUploadStatus('Using basic video information');
      }
    } finally {
      setAnalyzing(false);
      setUploading(false);
      setUploadProgress(0);
    }
  }, [setVideoFile, setAnalyzing, setAnalysisError, setUploading, setUploadProgress, setUploadStatus, setVideoMetadata, setStepCompleted, goToNextStep]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    resetState();
  }, [resetState]);

  if (videoFile) {
    return (
      <Card className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileVideo className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{videoFile.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge color="gray" size="sm">
                  {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                </Badge>
                <Badge color="info" size="sm">
                  {videoFile.type.split('/')[1].toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          <Button 
            color="failure"
            size="sm"
            onClick={handleRemoveFile}
            disabled={isAnalyzing || isUploading}
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {isAnalyzing && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium text-blue-600">
                Getting video information...
              </span>
            </div>
            <Progress 
              progress={50} 
              color="blue" 
              size="sm"
            />
            <p className="text-xs text-gray-600 mt-2">
              Reading video metadata...
            </p>
          </div>
        )}
        
        {isUploading && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span className="text-sm font-medium text-green-600">
                {uploadStatus}
              </span>
            </div>
            <Progress 
              progress={uploadProgress} 
              color="green" 
              size="sm"
            />
            <p className="text-xs text-gray-600 mt-2">
              Processing in background - you can continue to the next step
            </p>
          </div>
        )}
        
        {analysisError && (
          <Alert color="failure" className="mt-4">
            <span>{analysisError}</span>
          </Alert>
        )}
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Upload className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold">Upload Video</h2>
      </div>
      
      <div 
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer group
          ${analysisError ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className={`
          p-4 rounded-full w-fit mx-auto mb-4 transition-colors
          ${analysisError ? 'bg-red-100' : 'bg-gray-100 group-hover:bg-blue-100'}
        `}>
          <Upload className={`
            w-12 h-12 transition-colors
            ${analysisError ? 'text-red-500' : 'text-gray-400 group-hover:text-blue-600'}
          `} />
        </div>
        <p className="text-lg font-semibold mb-2 text-gray-900">
          Drop your video file here or click to browse
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Supports MP4, WebM, MOV and other common formats
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge color="gray" size="sm">
            Max 1GB
          </Badge>
          <Badge color="info" size="sm">
            Client-side processing
          </Badge>
        </div>
      </div>
      
      <input
        id="file-input"
        type="file"
        accept="video/*"
        onChange={handleFileInput}
        className="hidden"
      />
      
      {analysisError && (
        <Alert color="failure" className="mt-4">
          <span>{analysisError}</span>
        </Alert>
      )}
    </Card>
  );
}
