'use client';

import { useCallback, useEffect, useState } from 'react';
import { Grid, Monitor, Palette, Type, Square, Lock, Unlock, Space } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, Label, TextInput, Button, Alert, ToggleSwitch, Select } from 'flowbite-react';

export default function LayoutSettings() {
  const { layout, videoMetadata, updateLayout, setStepCompleted, goToNextStep } = useAppStore();
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);

  // Calculate video aspect ratio
  const videoAspectRatio = videoMetadata ? videoMetadata.width / videoMetadata.height : 16 / 9;

  // Calculate canvas dimensions
  const calculateCanvasDimensions = useCallback(() => {
    const thumbnailWidth = layout.thumbnailWidth || 300;
    const thumbnailHeight = layout.thumbnailHeight || Math.round(thumbnailWidth / videoAspectRatio);
    const borderSpacing = typeof layout.borderSpacing === 'number' ? layout.borderSpacing : 10;
    const filmSpacing = typeof layout.filmSpacing === 'number' ? layout.filmSpacing : 0;
    
    const totalWidth = (layout.columns * thumbnailWidth) + ((layout.columns - 1) * filmSpacing) + (2 * borderSpacing);
    const totalHeight = ((layout.rows || 1) * thumbnailHeight) + (((layout.rows || 1) - 1) * filmSpacing) + (2 * borderSpacing);
    
    return { width: totalWidth, height: totalHeight };
  }, [layout.columns, layout.rows, layout.thumbnailWidth, layout.thumbnailHeight, layout.borderSpacing, layout.filmSpacing, videoAspectRatio]);

  // Validation function
  const validateLayout = useCallback(() => {
    const isValidColumns = layout.columns >= 1;
    const isValidRows = (layout.rows || 1) >= 1;
    const isValidThumbnailWidth = (layout.thumbnailWidth || 300) > 0;
    const isValidThumbnailHeight = (layout.thumbnailHeight || Math.round((layout.thumbnailWidth || 300) / videoAspectRatio)) > 0;
    const isValidBorderSpacing = typeof layout.borderSpacing === 'number' && layout.borderSpacing >= 0;
    const isValidFilmSpacing = typeof layout.filmSpacing === 'number' && layout.filmSpacing >= 0;
    const isValidBorderThickness = layout.borderThickness >= 0;
    const isValidTimestampSize = layout.timestampFontSize > 0;
    
    return isValidColumns && isValidRows && isValidThumbnailWidth && isValidThumbnailHeight && 
           isValidBorderSpacing && isValidFilmSpacing && isValidBorderThickness && isValidTimestampSize;
  }, [layout, videoAspectRatio]);

  // Validate whenever layout changes
  useEffect(() => {
    const isValid = validateLayout();
    setStepCompleted(3, !!isValid);
  }, [layout, validateLayout, setStepCompleted]);

  // Initialize thumbnail dimensions based on aspect ratio
  useEffect(() => {
    const updates: any = {};
    
    // Ensure thumbnailWidth has a value
    if (!layout.thumbnailWidth) {
      updates.thumbnailWidth = 300;
    }
    
    // Ensure thumbnailHeight has a value and matches aspect ratio if locked
    if (!layout.thumbnailHeight) {
      updates.thumbnailHeight = Math.round((layout.thumbnailWidth || 300) / videoAspectRatio);
    }
    
    // Ensure borderSpacing has a value
    if (typeof layout.borderSpacing !== 'number') {
      updates.borderSpacing = 10;
    }
    
    // Ensure filmSpacing has a value
    if (typeof layout.filmSpacing !== 'number') {
      updates.filmSpacing = 0;
    }
    
    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      updateLayout(updates);
    }
  }, [layout.thumbnailWidth, layout.thumbnailHeight, layout.borderSpacing, layout.filmSpacing, videoAspectRatio, updateLayout, aspectRatioLocked]);

  const handleNumberInput = useCallback((field: keyof typeof layout, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    if (field === 'columns' || field === 'rows') {
      if (numValue < 1) return;
    }
    
    updateLayout({ [field]: numValue });
  }, [updateLayout]);

  const handleThumbnailWidthChange = useCallback((value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0) return;
    
    const updates: any = { thumbnailWidth: numValue };
    
    if (aspectRatioLocked) {
      // When width changes, adjust height to maintain aspect ratio
      updates.thumbnailHeight = Math.round(numValue / videoAspectRatio);
    }
    
    updateLayout(updates);
  }, [aspectRatioLocked, videoAspectRatio, updateLayout]);

  const handleThumbnailHeightChange = useCallback((value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0) return;
    
    const updates: any = { thumbnailHeight: numValue };
    
    if (aspectRatioLocked) {
      // When height changes, adjust width to maintain aspect ratio
      updates.thumbnailWidth = Math.round(numValue * videoAspectRatio);
    }
    
    updateLayout(updates);
  }, [aspectRatioLocked, videoAspectRatio, updateLayout]);

  const handleAspectRatioToggle = useCallback((locked: boolean) => {
    setAspectRatioLocked(locked);
    
    if (locked) {
      // When locking, adjust height to follow width
      const width = layout.thumbnailWidth || 300;
      const height = Math.round(width / videoAspectRatio);
      
      // Only update if the height is different to avoid unnecessary rerenders
      if (layout.thumbnailHeight !== height) {
        updateLayout({ thumbnailHeight: height });
      }
    }
  }, [layout.thumbnailWidth, layout.thumbnailHeight, videoAspectRatio, updateLayout]);

  const handleColorChange = useCallback((field: keyof typeof layout, value: string) => {
    updateLayout({ [field]: value });
  }, [updateLayout]);

  const handleToggle = useCallback((field: keyof typeof layout, value: boolean) => {
    updateLayout({ [field]: value });
  }, [updateLayout]);

  const handleSelectChange = useCallback((field: keyof typeof layout, value: string) => {
    updateLayout({ [field]: value });
  }, [updateLayout]);

  const canvasDimensions = calculateCanvasDimensions();

  return (
    <Card className="w-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Grid className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Layout</h2>
          </div>
        </div>

        {/* Grid Configuration */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Square className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Grid Configuration</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="columns" className="block mb-2">
                <span className="font-medium">Columns</span>
              </Label>
              <TextInput
                id="columns"
                type="number"
                min="1"
                max="20"
                value={layout.columns.toString()}
                onChange={(e) => handleNumberInput('columns', e.target.value)}
                color={layout.columns < 1 ? 'failure' : 'gray'}
              />
            </div>
            
            <div>
              <Label htmlFor="rows" className="block mb-2">
                <span className="font-medium">Rows</span>
              </Label>
              <TextInput
                id="rows"
                type="number"
                min="1"
                max="20"
                value={(layout.rows || 1).toString()}
                onChange={(e) => handleNumberInput('rows', e.target.value)}
                color={!layout.rows || layout.rows < 1 ? 'failure' : 'gray'}
              />
            </div>
          </div>
        </div>

        {/* Thumbnail Size */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Thumbnail Size</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAspectRatioToggle(!aspectRatioLocked)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
              >
                {aspectRatioLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                {aspectRatioLocked ? 'Locked' : 'Unlocked'}
              </button>
            </div>
          </div>
          
          {videoMetadata && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Video aspect ratio: {videoMetadata.width}:{videoMetadata.height} 
                ({(videoMetadata.width / videoMetadata.height).toFixed(2)}:1)
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="thumbnailWidth" className="block mb-2">
                <span className="font-medium">Width (px)</span>
              </Label>
              <TextInput
                id="thumbnailWidth"
                type="number"
                min="50"
                max="1000"
                value={(layout.thumbnailWidth || 300).toString()}
                onChange={(e) => handleThumbnailWidthChange(e.target.value)}
                color={(layout.thumbnailWidth || 300) <= 0 ? 'failure' : 'gray'}
              />
            </div>
            <div>
              <Label htmlFor="thumbnailHeight" className="block mb-2">
                <span className="font-medium">Height (px)</span>
              </Label>
              <TextInput
                id="thumbnailHeight"
                type="number"
                min="50"
                max="1000"
                value={(layout.thumbnailHeight || Math.round((layout.thumbnailWidth || 300) / videoAspectRatio)).toString()}
                onChange={(e) => handleThumbnailHeightChange(e.target.value)}
                disabled={aspectRatioLocked}
                className={aspectRatioLocked ? 'bg-gray-100' : ''}
                color={(layout.thumbnailHeight || Math.round((layout.thumbnailWidth || 300) / videoAspectRatio)) <= 0 ? 'failure' : 'gray'}
              />
            </div>
          </div>
        </div>

        {/* Spacing */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Space className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Spacing</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="borderSpacing" className="block mb-2">
                <span className="font-medium">Border Spacing (px)</span>
              </Label>
              <TextInput
                id="borderSpacing"
                type="number"
                min="0"
                max="100"
                value={(typeof layout.borderSpacing === 'number' ? layout.borderSpacing : 10).toString()}
                onChange={(e) => handleNumberInput('borderSpacing', e.target.value)}
                color={(typeof layout.borderSpacing === 'number' && layout.borderSpacing < 0) ? 'failure' : 'gray'}
              />
            </div>
            
            <div>
              <Label htmlFor="filmSpacing" className="block mb-2">
                <span className="font-medium">Film Spacing (px)</span>
              </Label>
              <TextInput
                id="filmSpacing"
                type="number"
                min="0"
                max="100"
                value={(typeof layout.filmSpacing === 'number' ? layout.filmSpacing : 0).toString()}
                onChange={(e) => handleNumberInput('filmSpacing', e.target.value)}
                color={(typeof layout.filmSpacing === 'number' && layout.filmSpacing < 0) ? 'failure' : 'gray'}
              />
            </div>
          </div>
        </div>

        {/* Canvas Dimensions (Read-only) */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Canvas Dimensions</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block mb-2">
                <span className="font-medium text-blue-700">Width</span>
              </Label>
              <div className="px-3 py-2 bg-blue-100 rounded-lg text-blue-800 font-medium">
                {canvasDimensions.width}px
              </div>
            </div>
            <div>
              <Label className="block mb-2">
                <span className="font-medium text-blue-700">Height</span>
              </Label>
              <div className="px-3 py-2 bg-blue-100 rounded-lg text-blue-800 font-medium">
                {canvasDimensions.height}px
              </div>
            </div>
          </div>
        </div>

        {/* Border Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Square className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Border</h3>
            </div>
            <ToggleSwitch
              checked={layout.showBorder}
              onChange={(checked) => handleToggle('showBorder', checked)}
            />
          </div>
          
          {layout.showBorder && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="borderThickness" className="block mb-2">
                  <span className="font-medium">Thickness (px)</span>
                </Label>
                <TextInput
                  id="borderThickness"
                  type="number"
                  min="1"
                  max="10"
                  value={layout.borderThickness.toString()}
                  onChange={(e) => handleNumberInput('borderThickness', e.target.value)}
                  color={layout.borderThickness <= 0 ? 'failure' : 'gray'}
                />
              </div>
              <div>
                <Label htmlFor="borderColor" className="block mb-2">
                  <span className="font-medium">Color</span>
                </Label>
                <input
                  id="borderColor"
                  type="color"
                  value={layout.borderColor}
                  onChange={(e) => handleColorChange('borderColor', e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Background Color */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Background</h3>
          </div>
          
          <div>
            <Label htmlFor="backgroundColor" className="block mb-2">
              <span className="font-medium">Background Color</span>
            </Label>
            <input
              id="backgroundColor"
              type="color"
              value={layout.backgroundColor}
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>
        </div>

        {/* Timestamp Overlay */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Timestamp Overlay</h3>
            </div>
            <ToggleSwitch
              checked={layout.showTimestamp}
              onChange={(checked) => handleToggle('showTimestamp', checked)}
            />
          </div>
          
          {layout.showTimestamp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timestampFontSize" className="block mb-2">
                    <span className="font-medium">Font Size (px)</span>
                  </Label>
                  <TextInput
                    id="timestampFontSize"
                    type="number"
                    min="8"
                    max="32"
                    value={layout.timestampFontSize.toString()}
                    onChange={(e) => handleNumberInput('timestampFontSize', e.target.value)}
                    color={layout.timestampFontSize <= 0 ? 'failure' : 'gray'}
                  />
                </div>
                <div>
                  <Label htmlFor="timestampColor" className="block mb-2">
                    <span className="font-medium">Color</span>
                  </Label>
                  <input
                    id="timestampColor"
                    type="color"
                    value={layout.timestampColor}
                    onChange={(e) => handleColorChange('timestampColor', e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="timestampPosition" className="block mb-2">
                  <span className="font-medium">Position</span>
                </Label>
                <Select
                  id="timestampPosition"
                  value={layout.timestampPosition}
                  onChange={(e) => handleSelectChange('timestampPosition', e.target.value)}
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-center">Bottom Center</option>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Validation alert */}
        {!validateLayout() && (
          <Alert color="failure">
            <span className="font-medium">Invalid settings!</span> Please check your layout settings. Ensure all values are positive.
          </Alert>
        )}

        {/* Continue button */}
        <div className="flex justify-end">
          <Button
            color="blue"
            disabled={!validateLayout()}
            onClick={() => {
              setStepCompleted(3, true);
              goToNextStep();
            }}
          >
            Continue to Output
          </Button>
        </div>
      </div>
    </Card>
  );
}
