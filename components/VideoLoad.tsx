'use client';

import { useCallback } from 'react';
import { Upload, FileVideo, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, Button, Badge, Progress, Alert } from 'flowbite-react';
import { videoAnalyzer } from '@/lib/videoAnalysis';

export default function VideoLoad() {
  const { 
    videoFile, 
    isAnalyzing, 
    analysisError, 
    videoMetadata,
    setVideoFile, 
    setAnalyzing, 
    setAnalysisError,
    setStepCompleted,
    setVideoMetadata,
    resetState
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

    // Check for common video formats
    const supportedFormats = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm4v', 'flv', 'wmv', 'ogv', '3gp', 'ts', 'mts', 'mxf'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      setAnalysisError(`Unsupported file format: ${fileExtension}. Please try MP4, WebM, MOV, AVI, MKV or other common video formats.`);
      return;
    }

    setVideoFile(file);
    setAnalysisError(null);
    setAnalyzing(true);
    
    try {
      // Get metadata using FFmpeg.wasm for better compatibility
      const metadata = await videoAnalyzer.getBasicMetadata(file, (progress) => {
        // Progress callback could be used to update UI if needed
        console.log('Analysis progress:', Math.round(progress * 100) + '%');
      });
      
      setVideoMetadata(metadata);
      setStepCompleted(1, true);
      
    } catch (error) {
      console.error('Video analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Provide helpful error messages based on common issues
      if (errorMessage.includes('Failed to initialize FFmpeg')) {
        setAnalysisError('Failed to load video processor. Please check your internet connection and try again.');
      } else if (errorMessage.includes('corrupted or in an unsupported format')) {
        setAnalysisError('This video file appears to be corrupted or in an unsupported format. Please try a different file.');
      } else if (errorMessage.includes('Invalid video metadata')) {
        setAnalysisError('Could not extract video information. The file may be corrupted.');
      } else if (errorMessage.includes('No such file')) {
        setAnalysisError('Video file could not be processed. Please try a different file.');
      } else {
        setAnalysisError('Failed to analyze video. Please try a different file or check if the video is corrupted.');
      }
    } finally {
      setAnalyzing(false);
    }
  }, [setVideoFile, setAnalyzing, setAnalysisError, setVideoMetadata, setStepCompleted]);

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
            disabled={isAnalyzing}
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
        
        {videoMetadata && !isAnalyzing && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-3">Video Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Duration:</div>
              <div className="font-medium">{formatDuration(videoMetadata.duration)}</div>
              
              <div className="text-gray-600">Resolution:</div>
              <div className="font-medium">{videoMetadata.width} × {videoMetadata.height}</div>
              
              <div className="text-gray-600">Codec:</div>
              <div className="font-medium">{videoMetadata.codec}</div>
              
              <div className="text-gray-600">Frame Rate:</div>
              <div className="font-medium">{videoMetadata.fps.toFixed(2)} fps</div>
            </div>
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
        <h2 className="text-xl font-semibold">Load Video</h2>
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
          Supports MP4, WebM, MOV, AVI, MKV, FLV, WMV and other common formats
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

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
