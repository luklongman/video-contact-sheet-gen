'use client';

import { useCallback, useEffect } from 'react';
import { Hash, Clock, Info } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, Label, TextInput, Button, Alert, Badge, ToggleSwitch } from 'flowbite-react';

export default function FrameSelectionSettings() {
  const { 
    videoMetadata, 
    frameSelection, 
    totalFramesToExtract,
    updateFrameSelection,
    setStepCompleted,
    goToNextStep
  } = useAppStore();

  // Helper function to format seconds to hh:mm:ss:ms
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
  }, []);

  // Helper function to parse hh:mm:ss:ms to seconds
  const parseTime = useCallback((timeStr: string) => {
    const parts = timeStr.split(':');
    if (parts.length !== 4) return 0;
    
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    const ms = parseInt(parts[3]) || 0;
    
    return hours * 3600 + minutes * 60 + seconds + ms / 1000;
  }, []);

  const handleTimeChange = useCallback((field: 'startTime' | 'endTime', value: string) => {
    if (!videoMetadata) return;
    
    const timeInSeconds = parseTime(value);
    const updates: any = { [field]: timeInSeconds };
    
    // Update corresponding frame number
    if (field === 'startTime') {
      updates.startFrame = Math.floor(timeInSeconds * videoMetadata.fps);
    } else {
      updates.endFrame = Math.floor(timeInSeconds * videoMetadata.fps);
    }
    
    updateFrameSelection(updates);
  }, [videoMetadata, updateFrameSelection, parseTime]);

  const handleFrameChange = useCallback((field: 'startFrame' | 'endFrame', value: string) => {
    const frameNumber = parseInt(value);
    if (isNaN(frameNumber) || !videoMetadata) return;
    
    const updates: any = { [field]: frameNumber };
    
    // Update corresponding time
    if (field === 'startFrame') {
      updates.startTime = frameNumber / videoMetadata.fps;
    } else {
      updates.endTime = frameNumber / videoMetadata.fps;
    }
    
    updateFrameSelection(updates);
  }, [videoMetadata, updateFrameSelection]);

  const handleIntervalToggle = useCallback((enabled: boolean) => {
    if (enabled) {
      // Enable interval extraction - set to extract every 30 frames or 1 second
      updateFrameSelection({ 
        intervalMode: 'frames',
        intervalValue: 30
      });
    } else {
      // Disable interval extraction - extract every frame
      updateFrameSelection({ 
        intervalMode: 'frames',
        intervalValue: 1
      });
    }
  }, [updateFrameSelection]);

  const handleIntervalValueChange = useCallback((value: string, mode: 'frames' | 'seconds') => {
    const numValue = mode === 'frames' ? parseInt(value) : parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;
    
    // Update both the mode and value
    updateFrameSelection({ 
      intervalMode: mode,
      intervalValue: numValue 
    });
  }, [updateFrameSelection]);

  const handleFrameLimitToggle = useCallback((enabled: boolean) => {
    updateFrameSelection({ useFrameLimit: enabled });
  }, [updateFrameSelection]);

  const handleFrameLimitChange = useCallback((value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0) return;
    updateFrameSelection({ frameLimit: numValue });
  }, [updateFrameSelection]);

  // Validation function
  const validateFrameSelection = useCallback(() => {
    if (!videoMetadata) return false;
    
    const maxFrames = Math.floor(videoMetadata.duration * videoMetadata.fps);
    const isValidRange = frameSelection.startFrame <= frameSelection.endFrame && 
                        frameSelection.startFrame >= 0 && 
                        frameSelection.endFrame <= maxFrames;
    const isValidInterval = frameSelection.intervalValue > 0;
    const isValidLimit = !frameSelection.useFrameLimit || (frameSelection.frameLimit && frameSelection.frameLimit > 0);
    
    return isValidRange && isValidInterval && isValidLimit;
  }, [videoMetadata, frameSelection]);

  // Update step completion when validation changes
  useEffect(() => {
    const isValid = validateFrameSelection();
    setStepCompleted(2, !!isValid);
  }, [frameSelection, validateFrameSelection, setStepCompleted]);

  if (!videoMetadata) return null;

  const maxFrames = Math.floor(videoMetadata.duration * videoMetadata.fps);
  const endFrame = frameSelection.endFrame || maxFrames;
  const hasValidationError = !validateFrameSelection();
  
  // Determine if interval extraction is enabled
  const useIntervalExtraction = frameSelection.intervalMode === 'frames' ? 
    frameSelection.intervalValue > 1 : 
    frameSelection.intervalValue !== (1 / videoMetadata.fps);

  return (
    <Card className="w-full">
      <div className="space-y-6">
        
        {/* From Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">From</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Frame */}
            <div>
              <Label htmlFor="startFrame" className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4" />
                Start Frame
              </Label>
              <TextInput
                id="startFrame"
                type="number"
                min="0"
                max={maxFrames}
                value={frameSelection.startFrame || ''}
                onChange={(e) => handleFrameChange('startFrame', e.target.value)}
                color={hasValidationError && (frameSelection.startFrame < 0 || frameSelection.startFrame > frameSelection.endFrame) ? 'failure' : 'gray'}
                placeholder="0"
              />
            </div>
            
            {/* Start Time */}
            <div>
              <Label htmlFor="startTime" className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                Start Time
              </Label>
              <TextInput
                id="startTime"
                type="text"
                value={formatTime(frameSelection.startTime)}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                placeholder="00:00:00:000"
              />
              <p className="text-sm text-gray-500 mt-1">Format: hh:mm:ss:ms</p>
            </div>
          </div>
        </Card>

        {/* To Section */}
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">To</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* End Frame */}
            <div>
              <Label htmlFor="endFrame" className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4" />
                End Frame (inclusive)
              </Label>
              <TextInput
                id="endFrame"
                type="number"
                min={frameSelection.startFrame}
                max={maxFrames}
                value={endFrame || ''}
                onChange={(e) => handleFrameChange('endFrame', e.target.value)}
                placeholder={maxFrames.toString()}
              />
            </div>
            
            {/* End Time */}
            <div>
              <Label htmlFor="endTime" className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                End Time
              </Label>
              <TextInput
                id="endTime"
                type="text"
                value={formatTime(frameSelection.endTime || videoMetadata.duration)}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                placeholder={formatTime(videoMetadata.duration)}
              />
              <p className="text-sm text-gray-500 mt-1">Format: hh:mm:ss:ms</p>
            </div>
          </div>
        </Card>

        {/* Interval Toggle */}
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">Extraction Interval</h3>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <ToggleSwitch
              checked={useIntervalExtraction}
              onChange={handleIntervalToggle}
              label={useIntervalExtraction ? 'Extract with interval' : 'Extract every frame'}
            />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {useIntervalExtraction 
                  ? 'Skip frames based on your interval settings' 
                  : 'Extract all frames within the selected range'
                }
              </p>
            </div>
          </div>
          
          {useIntervalExtraction && (
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Frame Interval */}
                <div>
                  <Label htmlFor="frameInterval" className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4" />
                    Every X frames
                  </Label>
                  <TextInput
                    id="frameInterval"
                    type="number"
                    min="1"
                    value={frameSelection.intervalMode === 'frames' ? frameSelection.intervalValue : Math.round(frameSelection.intervalValue * videoMetadata.fps)}
                    onChange={(e) => handleIntervalValueChange(e.target.value, 'frames')}
                    placeholder="1"
                  />
                </div>
                
                {/* Time Interval */}
                <div>
                  <Label htmlFor="timeInterval" className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4" />
                    Every X seconds
                  </Label>
                  <TextInput
                    id="timeInterval"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={frameSelection.intervalMode === 'seconds' ? frameSelection.intervalValue : (frameSelection.intervalValue / videoMetadata.fps).toFixed(1)}
                    onChange={(e) => handleIntervalValueChange(e.target.value, 'seconds')}
                    placeholder="1.0"
                  />
                </div>
              </div>
            </Card>
          )}
        </Card>

        {/* Frame Limit Toggle */}
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300">Frame Limit</h3>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <ToggleSwitch
              checked={frameSelection.useFrameLimit}
              onChange={handleFrameLimitToggle}
              label={frameSelection.useFrameLimit ? 'Limit number of frames' : 'Extract without limit'}
            />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {frameSelection.useFrameLimit 
                  ? 'Set a maximum number of frames to extract' 
                  : 'Extract all frames matching your criteria'
                }
              </p>
            </div>
          </div>
          
          {frameSelection.useFrameLimit && (
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Label htmlFor="frameLimit" className="mb-2">
                Maximum number of frames
              </Label>
              <TextInput
                id="frameLimit"
                type="number"
                min="1"
                value={frameSelection.frameLimit || ''}
                onChange={(e) => handleFrameLimitChange(e.target.value)}
                placeholder="100"
              />
            </Card>
          )}
        </Card>

        {/* Preview Info */}
        <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-800 rounded-full">
              <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Extraction Preview</p>
              <p className="text-gray-600 dark:text-gray-400">
                Estimated frames to extract:{' '}
                <Badge color="info" className="ml-1">
                  {totalFramesToExtract}
                </Badge>
              </p>
            </div>
          </div>
        </Card>

        {/* Validation alert */}
        {hasValidationError && (
          <Alert color="failure" className="mt-4">
            <span className="font-medium">Validation Error!</span>{' '}
            Please check your frame selection settings. Ensure start frame is less than end frame and intervals are positive.
          </Alert>
        )}

        {/* Continue button */}
        <div className="flex justify-end mt-6">
          <Button 
            color="blue"
            size="lg"
            disabled={hasValidationError}
            onClick={() => {
              setStepCompleted(2, true);
              goToNextStep();
            }}
          >
            Continue to Layout
          </Button>
        </div>
      </div>
    </Card>
  );
}
