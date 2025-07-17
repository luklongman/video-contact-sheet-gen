'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Label, TextInput } from 'flowbite-react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  label?: string;
  formatValue?: (value: number) => string;
  parseValue?: (value: string) => number;
  className?: string;
  disabled?: boolean;
  showValues?: boolean;
  color?: 'blue' | 'gray' | 'red' | 'green' | 'yellow' | 'indigo' | 'purple' | 'pink';
}

export default function DualRangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (val) => val.toString(),
  parseValue = (val) => parseFloat(val) || 0,
  className = '',
  disabled = false,
  showValues = true,
  color = 'blue'
}: DualRangeSliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const [tempValue, setTempValue] = useState<[number, number]>(value);
  const [inputValues, setInputValues] = useState<[string, string]>([
    formatValue(value[0]),
    formatValue(value[1])
  ]);
  const sliderRef = useRef<HTMLDivElement>(null);

  const colorClasses = {
    blue: {
      track: 'bg-blue-600',
      thumb: 'bg-blue-600 border-blue-600 hover:bg-blue-700 focus:ring-blue-300',
      rail: 'bg-gray-200 dark:bg-gray-700'
    },
    gray: {
      track: 'bg-gray-600',
      thumb: 'bg-gray-600 border-gray-600 hover:bg-gray-700 focus:ring-gray-300',
      rail: 'bg-gray-200 dark:bg-gray-700'
    },
    red: {
      track: 'bg-red-600',
      thumb: 'bg-red-600 border-red-600 hover:bg-red-700 focus:ring-red-300',
      rail: 'bg-gray-200 dark:bg-gray-700'
    },
    green: {
      track: 'bg-green-600',
      thumb: 'bg-green-600 border-green-600 hover:bg-green-700 focus:ring-green-300',
      rail: 'bg-gray-200 dark:bg-gray-700'
    },
    yellow: {
      track: 'bg-yellow-600',
      thumb: 'bg-yellow-600 border-yellow-600 hover:bg-yellow-700 focus:ring-yellow-300',
      rail: 'bg-gray-200 dark:bg-gray-700'
    },
    indigo: {
      track: 'bg-indigo-600',
      thumb: 'bg-indigo-600 border-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300',
      rail: 'bg-gray-200 dark:bg-gray-700'
    },
    purple: {
      track: 'bg-purple-600',
      thumb: 'bg-purple-600 border-purple-600 hover:bg-purple-700 focus:ring-purple-300',
      rail: 'bg-gray-200 dark:bg-gray-700'
    },
    pink: {
      track: 'bg-pink-600',
      thumb: 'bg-pink-600 border-pink-600 hover:bg-pink-700 focus:ring-pink-300',
      rail: 'bg-gray-200 dark:bg-gray-700'
    }
  };

  const colors = colorClasses[color];

  // Update tempValue when value prop changes
  useEffect(() => {
    if (!isDragging) {
      setTempValue(value);
      setInputValues([formatValue(value[0]), formatValue(value[1])]);
    }
  }, [value, isDragging, formatValue]);

  const getValueFromPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) return min;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = min + percentage * (max - min);
    
    // Round to nearest step
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step]);

  const handleMouseDown = useCallback((type: 'min' | 'max') => (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragging(type);
    
    const handleMouseMove = (e: MouseEvent) => {
      const newValue = getValueFromPosition(e.clientX);
      const [currentMin, currentMax] = tempValue;
      
      if (type === 'min') {
        const newMin = Math.min(newValue, currentMax);
        setTempValue([newMin, currentMax]);
      } else {
        const newMax = Math.max(newValue, currentMin);
        setTempValue([currentMin, newMax]);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(null);
      onChange(tempValue);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disabled, tempValue, getValueFromPosition, onChange]);

  const handleTouchStart = useCallback((type: 'min' | 'max') => (e: React.TouchEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragging(type);
    
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const newValue = getValueFromPosition(touch.clientX);
      const [currentMin, currentMax] = tempValue;
      
      if (type === 'min') {
        const newMin = Math.min(newValue, currentMax);
        setTempValue([newMin, currentMax]);
      } else {
        const newMax = Math.max(newValue, currentMin);
        setTempValue([currentMin, newMax]);
      }
    };
    
    const handleTouchEnd = () => {
      setIsDragging(null);
      onChange(tempValue);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [disabled, tempValue, getValueFromPosition, onChange]);

  const handleKeyDown = useCallback((type: 'min' | 'max') => (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    const [currentMin, currentMax] = tempValue;
    let newValue: number;
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = (type === 'min' ? currentMin : currentMax) - step;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = (type === 'min' ? currentMin : currentMax) + step;
        break;
      case 'Home':
        e.preventDefault();
        newValue = min;
        break;
      case 'End':
        e.preventDefault();
        newValue = max;
        break;
      default:
        return;
    }
    
    newValue = Math.max(min, Math.min(max, newValue));
    
    if (type === 'min') {
      const newMin = Math.min(newValue, currentMax);
      const newTempValue: [number, number] = [newMin, currentMax];
      setTempValue(newTempValue);
      onChange(newTempValue);
    } else {
      const newMax = Math.max(newValue, currentMin);
      const newTempValue: [number, number] = [currentMin, newMax];
      setTempValue(newTempValue);
      onChange(newTempValue);
    }
  }, [disabled, tempValue, step, min, max, onChange]);

  // Handle input field changes
  const handleInputChange = useCallback((type: 'min' | 'max', inputValue: string) => {
    const index = type === 'min' ? 0 : 1;
    const newInputValues: [string, string] = [...inputValues];
    newInputValues[index] = inputValue;
    setInputValues(newInputValues);
  }, [inputValues]);

  const handleInputBlur = useCallback((type: 'min' | 'max', inputValue: string) => {
    const parsedValue = parseValue(inputValue);
    const clampedValue = Math.max(min, Math.min(max, parsedValue));
    const [currentMin, currentMax] = tempValue;
    
    if (type === 'min') {
      const newMin = Math.min(clampedValue, currentMax);
      const newTempValue: [number, number] = [newMin, currentMax];
      setTempValue(newTempValue);
      setInputValues([formatValue(newMin), formatValue(currentMax)]);
      onChange(newTempValue);
    } else {
      const newMax = Math.max(clampedValue, currentMin);
      const newTempValue: [number, number] = [currentMin, newMax];
      setTempValue(newTempValue);
      setInputValues([formatValue(currentMin), formatValue(newMax)]);
      onChange(newTempValue);
    }
  }, [tempValue, parseValue, min, max, formatValue, onChange]);

  const handleInputKeyDown = useCallback((type: 'min' | 'max', e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const inputValue = (e.target as HTMLInputElement).value;
      handleInputBlur(type, inputValue);
      (e.target as HTMLInputElement).blur();
    }
  }, [handleInputBlur]);

  const getPercentage = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  const minPercentage = getPercentage(tempValue[0]);
  const maxPercentage = getPercentage(tempValue[1]);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative mb-4">
        {/* Slider track */}
        <div
          ref={sliderRef}
          className={`relative h-2 rounded-lg ${colors.rail} ${disabled ? 'opacity-50' : ''}`}
        >
          {/* Active track */}
          <div
            className={`absolute h-full rounded-lg ${colors.track}`}
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />
          
          {/* Min thumb */}
          <div
            className={`absolute w-5 h-5 rounded-full border-2 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 top-1/2 ${colors.thumb} ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${isDragging === 'min' ? 'ring-4 ring-opacity-30' : ''}`}
            style={{ left: `${minPercentage}%` }}
            onMouseDown={handleMouseDown('min')}
            onTouchStart={handleTouchStart('min')}
            onKeyDown={handleKeyDown('min')}
            tabIndex={disabled ? -1 : 0}
            role="slider"
            aria-label="Minimum value"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={tempValue[0]}
            aria-valuetext={formatValue(tempValue[0])}
          />
          
          {/* Max thumb */}
          <div
            className={`absolute w-5 h-5 rounded-full border-2 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 top-1/2 ${colors.thumb} ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${isDragging === 'max' ? 'ring-4 ring-opacity-30' : ''}`}
            style={{ left: `${maxPercentage}%` }}
            onMouseDown={handleMouseDown('max')}
            onTouchStart={handleTouchStart('max')}
            onKeyDown={handleKeyDown('max')}
            tabIndex={disabled ? -1 : 0}
            role="slider"
            aria-label="Maximum value"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={tempValue[1]}
            aria-valuetext={formatValue(tempValue[1])}
          />
        </div>
        
        {/* Value labels */}
        {showValues && (
          <div className="flex justify-between mt-2 gap-2">
            <div className="flex-1">
              <TextInput
                type="text"
                value={inputValues[0]}
                onChange={(e) => handleInputChange('min', e.target.value)}
                onBlur={(e) => handleInputBlur('min', e.target.value)}
                onKeyDown={(e) => handleInputKeyDown('min', e)}
                disabled={disabled}
                sizing="sm"
                className="text-center"
                color={tempValue[0] > tempValue[1] ? 'failure' : 'gray'}
              />
            </div>
            <div className="flex-1">
              <TextInput
                type="text"
                value={inputValues[1]}
                onChange={(e) => handleInputChange('max', e.target.value)}
                onBlur={(e) => handleInputBlur('max', e.target.value)}
                onKeyDown={(e) => handleInputKeyDown('max', e)}
                disabled={disabled}
                sizing="sm"
                className="text-center"
                color={tempValue[1] < tempValue[0] ? 'failure' : 'gray'}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
