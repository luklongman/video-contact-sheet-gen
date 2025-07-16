'use client';

import { useCallback, useEffect } from 'react';
import { Grid, Monitor, Palette, Type, Square } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function LayoutSettings() {
  const { layout, updateLayout, setStepCompleted, goToNextStep } = useAppStore();

  // Validation function
  const validateLayout = useCallback(() => {
    const isValidColumns = layout.columns > 0;
    const isValidRows = layout.mode === 'dynamic' || (layout.rows && layout.rows > 0);
    const isValidPadding = layout.padding >= 0;
    const isValidBorderThickness = layout.borderThickness >= 0;
    const isValidTimestampSize = layout.timestampFontSize > 0;
    
    const isValid = isValidColumns && isValidRows && isValidPadding && isValidBorderThickness && isValidTimestampSize;
    if (isValid) {
      setStepCompleted(3, true);
    }
    return isValid;
  }, [layout, setStepCompleted]);

  // Validate whenever layout changes
  useEffect(() => {
    validateLayout();
  }, [layout, validateLayout]);

  const handleLayoutModeChange = useCallback((mode: 'dynamic' | 'fixed') => {
    updateLayout({ mode });
  }, [updateLayout]);

  const handleNumberInput = useCallback((field: keyof typeof layout, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0) return;
    updateLayout({ [field]: numValue });
  }, [updateLayout]);

  const handleColorChange = useCallback((field: keyof typeof layout, value: string) => {
    updateLayout({ [field]: value });
  }, [updateLayout]);

  const handleToggle = useCallback((field: keyof typeof layout, value: boolean) => {
    updateLayout({ [field]: value });
  }, [updateLayout]);

  const handleSelectChange = useCallback((field: keyof typeof layout, value: string) => {
    updateLayout({ [field]: value });
  }, [updateLayout]);

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        
        {/* Layout Mode */}
        <fieldset className="fieldset bg-base-200/30 rounded-lg p-4">
          <legend className="fieldset-legend text-lg font-semibold text-primary">
            <Grid className="w-5 h-5 inline mr-2" />
            Layout Mode
          </legend>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <label className="label cursor-pointer p-4 bg-base-100 rounded-lg border border-base-300 hover:border-primary transition-colors">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="layout-mode"
                  className="radio radio-primary"
                  checked={layout.mode === 'dynamic'}
                  onChange={() => handleLayoutModeChange('dynamic')}
                />
                <div>
                  <span className="label-text font-medium">Dynamic Canvas</span>
                  <p className="text-xs text-base-content/70">Auto-adjusts based on content</p>
                </div>
              </div>
            </label>
            
            <label className="label cursor-pointer p-4 bg-base-100 rounded-lg border border-base-300 hover:border-primary transition-colors">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="layout-mode"
                  className="radio radio-primary"
                  checked={layout.mode === 'fixed'}
                  onChange={() => handleLayoutModeChange('fixed')}
                />
                <div>
                  <span className="label-text font-medium">Fixed Canvas</span>
                  <p className="text-xs text-base-content/70">Fixed dimensions</p>
                </div>
              </div>
            </label>
          </div>
        </fieldset>

        {/* Grid Settings */}
        <fieldset className="fieldset bg-base-200/30 rounded-lg p-4 mt-6">
          <legend className="fieldset-legend text-lg font-semibold text-secondary">
            <Monitor className="w-5 h-5 inline mr-2" />
            Grid Configuration
          </legend>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Columns</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={layout.columns}
                onChange={(e) => handleNumberInput('columns', e.target.value)}
                className="input input-bordered w-full focus:input-secondary"
              />
            </div>
            
            {layout.mode === 'fixed' && (
              <div>
                <label className="label">
                  <span className="label-text font-medium">Rows</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={layout.rows || 5}
                  onChange={(e) => handleNumberInput('rows', e.target.value)}
                  className="input input-bordered w-full focus:input-secondary"
                />
              </div>
            )}
          </div>
        </fieldset>

        {/* Canvas/Thumbnail Size */}
        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text font-medium">
              {layout.mode === 'dynamic' ? 'Thumbnail Size' : 'Canvas Size'}
            </span>
          </label>
          
          {layout.mode === 'dynamic' ? (
            <div>
              <label className="label">
                <span className="label-text text-sm">Thumbnail Width (px)</span>
              </label>
              <input
                type="number"
                min="50"
                max="1000"
                value={layout.thumbnailWidth || 300}
                onChange={(e) => handleNumberInput('thumbnailWidth', e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text text-sm">Width (px)</span>
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={layout.canvasWidth || 1920}
                  onChange={(e) => handleNumberInput('canvasWidth', e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text text-sm">Height (px)</span>
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={layout.canvasHeight || 1080}
                  onChange={(e) => handleNumberInput('canvasHeight', e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Spacing */}
        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text font-medium">Spacing</span>
          </label>
          
          <div>
            <label className="label">
              <span className="label-text text-sm">Padding (px)</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={layout.padding}
              onChange={(e) => handleNumberInput('padding', e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        {/* Border Settings */}
        <div className="form-control mt-4">
          <label className="label cursor-pointer">
            <span className="label-text font-medium">Border</span>
            <input
              type="checkbox"
              checked={layout.showBorder}
              onChange={(e) => handleToggle('showBorder', e.target.checked)}
              className="checkbox checkbox-primary"
            />
          </label>
          
          {layout.showBorder && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="label">
                  <span className="label-text text-sm">Thickness (px)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={layout.borderThickness}
                  onChange={(e) => handleNumberInput('borderThickness', e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text text-sm">Color</span>
                </label>
                <input
                  type="color"
                  value={layout.borderColor}
                  onChange={(e) => handleColorChange('borderColor', e.target.value)}
                  className="input input-bordered w-full h-12"
                />
              </div>
            </div>
          )}
        </div>

        {/* Background Color */}
        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text font-medium">Background Color</span>
          </label>
          <input
            type="color"
            value={layout.backgroundColor}
            onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
            className="input input-bordered w-full h-12"
          />
        </div>

        {/* Timestamp Overlay */}
        <div className="form-control mt-4">
          <label className="label cursor-pointer">
            <span className="label-text font-medium">Timestamp Overlay</span>
            <input
              type="checkbox"
              checked={layout.showTimestamp}
              onChange={(e) => handleToggle('showTimestamp', e.target.checked)}
              className="checkbox checkbox-primary"
            />
          </label>
          
          {layout.showTimestamp && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="label">
                  <span className="label-text text-sm">Font Size (px)</span>
                </label>
                <input
                  type="number"
                  min="8"
                  max="32"
                  value={layout.timestampFontSize}
                  onChange={(e) => handleNumberInput('timestampFontSize', e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text text-sm">Color</span>
                </label>
                <input
                  type="color"
                  value={layout.timestampColor}
                  onChange={(e) => handleColorChange('timestampColor', e.target.value)}
                  className="input input-bordered w-full h-12"
                />
              </div>
              <div className="col-span-2">
                <label className="label">
                  <span className="label-text text-sm">Position</span>
                </label>
                <select
                  value={layout.timestampPosition}
                  onChange={(e) => handleSelectChange('timestampPosition', e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-center">Bottom Center</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Validation alert */}
        {!validateLayout() && (
          <div className="alert alert-error mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Please check your layout settings. Ensure all values are positive.</span>
          </div>
        )}

        {/* Continue button */}
        <div className="card-actions justify-end mt-6">
          <button 
            className="btn btn-primary"
            disabled={!validateLayout()}
            onClick={() => {
              setStepCompleted(3, true);
              goToNextStep();
            }}
          >
            Continue to Format
          </button>
        </div>
      </div>
    </div>
  );
}
