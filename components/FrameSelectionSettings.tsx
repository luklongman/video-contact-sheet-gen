'use client';

import { useCallback, useEffect, useState } from 'react';
import { Hash, Info, ArrowRightFromLine, ArrowLeftFromLine, Film } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, Label, TextInput, Button, Alert, ToggleSwitch } from 'flowbite-react';
import DualRangeSlider from './DualRangeSlider';

export default function FrameSelectionSettings() {
  const { 
    videoMetadata, 
    frameSelection, 
    totalFramesToExtract,
    updateFrameSelection,
    setStepCompleted,
    goToNextStep
  } = useAppStore();

  const [useTimeFormat, setUseTimeFormat] = useState(false);

  // Helper function to format seconds to HH:MM:SS.ms
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }, []);

  // Helper function to parse HH:MM:SS.ms to seconds
  const parseTime = useCallback((timeStr: string) => {
    const parts = timeStr.split(':');
    if (parts.length !== 3) return 0;
    
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const secondsParts = parts[2].split('.');
    const seconds = parseInt(secondsParts[0]) || 0;
    const ms = parseInt(secondsParts[1]) || 0;
    
    return hours * 3600 + minutes * 60 + seconds + ms / 1000;
  }, []);

  // Convert frame to time
  const frameToTime = useCallback((frame: number) => {
    if (!videoMetadata) return 0;
    return frame / videoMetadata.fps;
  }, [videoMetadata]);

  // Convert time to frame
  const timeToFrame = useCallback((time: number) => {
    if (!videoMetadata) return 0;
    return Math.floor(time * videoMetadata.fps);
  }, [videoMetadata]);

  // Set default values when video metadata is loaded
  useEffect(() => {
    if (videoMetadata && frameSelection.endFrame === 0) {
      const maxFrames = Math.floor(videoMetadata.duration * videoMetadata.fps);
      const defaultFrameLimit = Math.min(100, maxFrames);
      
      updateFrameSelection({
        startFrame: 0,
        endFrame: maxFrames,
        startTime: 0,
        endTime: videoMetadata.duration,
        frameLimit: defaultFrameLimit
      });
    }
  }, [videoMetadata, frameSelection.endFrame, updateFrameSelection]);

  const handleTimeChange = useCallback((field: 'startTime' | 'endTime', value: string) => {
    if (!videoMetadata) return;
    
    const timeInSeconds = parseTime(value);
    const maxTime = videoMetadata.duration;
    const clampedTime = Math.max(0, Math.min(timeInSeconds, maxTime));
    
    const updates: any = { [field]: clampedTime };
    
    // Update corresponding frame number
    if (field === 'startTime') {
      updates.startFrame = timeToFrame(clampedTime);
    } else {
      updates.endFrame = timeToFrame(clampedTime);
    }
    
    updateFrameSelection(updates);
  }, [videoMetadata, updateFrameSelection, parseTime, timeToFrame]);

  const handleFrameChange = useCallback((field: 'startFrame' | 'endFrame', value: string) => {
    const frameNumber = parseInt(value);
    if (isNaN(frameNumber) || !videoMetadata) return;
    
    const maxFrames = Math.floor(videoMetadata.duration * videoMetadata.fps);
    const clampedFrame = Math.max(0, Math.min(frameNumber, maxFrames));
    
    const updates: any = { [field]: clampedFrame };
    
    // Update corresponding time
    if (field === 'startFrame') {
      updates.startTime = frameToTime(clampedFrame);
    } else {
      updates.endTime = frameToTime(clampedFrame);
    }
    
    updateFrameSelection(updates);
  }, [videoMetadata, updateFrameSelection, frameToTime]);

  const handleIntervalValueChange = useCallback((value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0) return;
    
    updateFrameSelection({ intervalValue: numValue });
  }, [updateFrameSelection]);

  const handleFrameLimitChange = useCallback((value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0 || !videoMetadata) return;
    
    const maxFrames = Math.floor(videoMetadata.duration * videoMetadata.fps);
    const clampedLimit = Math.max(1, Math.min(numValue, maxFrames));
    
    updateFrameSelection({ frameLimit: clampedLimit });
  }, [updateFrameSelection, videoMetadata]);

  // Validation function
  const validateFrameSelection = useCallback(() => {
    if (!videoMetadata) return false;
    
    const maxFrames = Math.floor(videoMetadata.duration * videoMetadata.fps);
    const isValidRange = frameSelection.startFrame <= frameSelection.endFrame && 
                        frameSelection.startFrame >= 0 && 
                        frameSelection.endFrame <= maxFrames;
    const isValidInterval = frameSelection.intervalValue > 0;
    const isValidLimit = frameSelection.frameLimit > 0 && frameSelection.frameLimit <= maxFrames;
    
    return isValidRange && isValidInterval && isValidLimit;
  }, [videoMetadata, frameSelection]);

  // Auto-complete step when valid
  useEffect(() => {
    const isValid = validateFrameSelection();
    setStepCompleted(2, !!isValid);
  }, [frameSelection, validateFrameSelection, setStepCompleted]);

  const handleContinue = useCallback(() => {
    if (validateFrameSelection()) {
      goToNextStep();
    }
  }, [validateFrameSelection, goToNextStep]);

  if (!videoMetadata) {
    return (
      <Card className="w-full">
        <Alert color="warning" icon={Info}>
          <span className="font-medium">No video loaded!</span> Please load a video first.
        </Alert>
      </Card>
    );
  }

  const maxFrames = Math.floor(videoMetadata.duration * videoMetadata.fps);
  const endFrame = frameSelection.endFrame || maxFrames;
  const hasValidationError = !validateFrameSelection();
  const framesToExtractCalculated = Math.ceil((endFrame - frameSelection.startFrame + 1) / frameSelection.intervalValue);
  const isLimitActive = frameSelection.frameLimit < maxFrames;

  return (
    <Card className="w-full">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Film className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Select frames</h2>
          </div>
        </div>

        {/* Time/Frame Range Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Frame</span>
              <ToggleSwitch 
                checked={useTimeFormat} 
                onChange={setUseTimeFormat}
              />
              <span className="text-xs text-gray-500">Time</span>
            </div>
          </div>

          {/* Dual Range Slider */}
          

          {/* Start/End Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start" className="flex items-center gap-2 mb-2">
                <ArrowRightFromLine className="w-4 h-4" />
                Start {useTimeFormat ? 'Time' : 'Frame'}
              </Label>
              {useTimeFormat ? (
                <div>
                  <TextInput
                    id="start"
                    type="text"
                    value={formatTime(frameSelection.startTime)}
                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                    placeholder="00:00:00.000"
                    color={frameSelection.startTime > frameSelection.endTime ? 'failure' : 'gray'}
                  />
                </div>
                ) : (
                <div>
                  <TextInput
                  id="start"
                  type="number"
                  min="0"
                  max={maxFrames}
                  value={frameSelection.startFrame}
                  onChange={(e) => handleFrameChange('startFrame', e.target.value)}
                  placeholder="0"
                  color={frameSelection.startFrame > frameSelection.endFrame ? 'failure' : 'gray'}
                  />
                </div>
                )}
              </div>

            <div>
                <Label htmlFor="end" className="flex items-center gap-2 mb-2 justify-end text-right">
                End {useTimeFormat ? 'Time' : 'Frame'}
                <ArrowLeftFromLine className="w-4 h-4" />
                </Label>
                {useTimeFormat ? (
                <div>
                  <TextInput
                  id="end"
                  type="text"
                  value={formatTime(frameSelection.endTime)}
                  onChange={(e) => handleTimeChange('endTime', e.target.value)}
                  placeholder={formatTime(videoMetadata.duration)}
                  color={frameSelection.endTime < frameSelection.startTime ? 'failure' : 'gray'}
                    />
                </div>
                ) : (
                <div>
                  <TextInput
                  id="end"
                  type="number"
                  min="0"
                  max={maxFrames}
                  value={endFrame}
                  onChange={(e) => handleFrameChange('endFrame', e.target.value)}
                  placeholder={maxFrames.toString()}
                  color={frameSelection.endFrame < frameSelection.startFrame ? 'failure' : 'gray'}
                  />
                </div>
                )}
  
            </div>
          </div>
        </div>
        <DualRangeSlider
            min={0}
            max={useTimeFormat ? videoMetadata.duration : maxFrames}
            step={useTimeFormat ? 0.001 : 1}
            value={useTimeFormat ? [frameSelection.startTime, frameSelection.endTime] : [frameSelection.startFrame, frameSelection.endFrame]}
            onChange={(value) => {
              if (useTimeFormat) {
                updateFrameSelection({
                  startTime: value[0],
                  endTime: value[1],
                  startFrame: timeToFrame(value[0]),
                  endFrame: timeToFrame(value[1])
                });
              } else {
                updateFrameSelection({
                  startFrame: value[0],
                  endFrame: value[1],
                  startTime: frameToTime(value[0]),
                  endTime: frameToTime(value[1])
                });
              }
            }}
            formatValue={useTimeFormat ? formatTime : (val) => val.toString()}
            parseValue={useTimeFormat ? parseTime : (val) => parseInt(val) || 0}
            color="blue"
            showValues={true}
          />
        {/* Extraction Interval */}
        <div className="space-y-4">          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Extract every</span>
            <TextInput
              type="number"
              min="1"
              value={frameSelection.intervalValue}
              onChange={(e) => handleIntervalValueChange(e.target.value)}
              sizing="sm"
              style={{ width: '80px' }}
              color={frameSelection.intervalValue <= 0 ? 'failure' : 'gray'}
            />
            <span className="text-sm text-gray-600">frames</span>
          </div>
          
          {frameSelection.intervalValue <= 0 && (
            <Alert color="failure" className="mt-2">
              <span className="font-medium">Invalid interval!</span> Must be greater than 0.
            </Alert>
          )}
        </div>

        {/* Frame Limit */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Up to</span>
            <TextInput
              type="number"
              min="1"
              max={maxFrames}
              value={frameSelection.frameLimit}
              onChange={(e) => handleFrameLimitChange(e.target.value)}
              sizing="sm"
              style={{ width: '80px' }}
              color={frameSelection.frameLimit <= 0 || frameSelection.frameLimit > maxFrames ? 'failure' : 'gray'}
            />
            <span className="text-sm text-gray-600">frames (max: {maxFrames})</span>
          </div>

          {frameSelection.frameLimit <= 0 && (
            <Alert color="failure" className="mt-2">
              <span className="font-medium">Invalid limit!</span> Must be greater than 0.
            </Alert>
          )}
          
          {frameSelection.frameLimit > maxFrames && (
            <Alert color="failure" className="mt-2">
              <span className="font-medium">Limit too high!</span> Maximum is {maxFrames} frames.
            </Alert>
          )}
        </div>

        {/* Total Frames Display */}
        <div className="bg-blue-50 p-4 rounded-lg">

          <div className="text-2xl font-bold text-blue-600">
            {isLimitActive ? `${Math.min(framesToExtractCalculated, frameSelection.frameLimit)}` : framesToExtractCalculated}
            {isLimitActive && <span className="text-sm text-gray-500">/{framesToExtractCalculated} Frames to be extracted</span>}
          </div>
        </div>

        {/* Validation Error */}
        {hasValidationError && (
          <Alert color="failure">
            <span className="font-medium">Invalid settings!</span> Please check your frame selection settings.
          </Alert>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={hasValidationError}
          className="w-full"
          size="lg"
        >
          Edit Layout
        </Button>
      </div>
    </Card>
  );
}
