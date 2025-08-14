'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  onConfirm: (color: string) => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export default function ColorPicker({ isOpen, onClose, currentColor, onConfirm, triggerRef }: ColorPickerProps) {
  const [color, setColor] = useState(currentColor);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [lightness, setLightness] = useState(0);
  const [format, setFormat] = useState<'HEX' | 'RGB' | 'HSL'>('HEX');
  const [showDropdown, setShowDropdown] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const formatOptions = [
    { value: 'HEX', label: 'HEX' },
    { value: 'RGB', label: 'RGB' },
    { value: 'HSL', label: 'HSL' }
  ];

  // Convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  };

  // Convert Hex to HSL
  const hexToHsl = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Initialize from current color
  useEffect(() => {
    if (currentColor.startsWith('#')) {
      const hsl = hexToHsl(currentColor);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
      setColor(currentColor); // Ensure color state matches
    }
  }, [currentColor]);

  // Update color when HSL changes
  useEffect(() => {
    const newColor = hslToHex(hue, saturation, lightness);
    setColor(newColor);
  }, [hue, saturation, lightness]);

  // Position the picker below the trigger
  useEffect(() => {
    if (isOpen && pickerRef.current && triggerRef?.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const picker = pickerRef.current;
      
      picker.style.position = 'fixed';
      picker.style.top = `${triggerRect.bottom + 8}px`;
      picker.style.left = `${triggerRect.left}px`;
      picker.style.zIndex = '1000';
    }
  }, [isOpen, triggerRef]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate saturation (0-100%) from left to right
    const newSaturation = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    // Calculate lightness (0-100%) from bottom to top
    const newLightness = Math.max(0, Math.min(100, (1 - y / rect.height) * 100));
    
    setSaturation(newSaturation);
    setLightness(newLightness);
  };

  const handleHueSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Calculate hue (0-360) from left to right
    const newHue = Math.max(0, Math.min(360, (x / rect.width) * 360));
    
    setHue(newHue);
  };

  const handleConfirm = () => {
    onConfirm(color);
    onClose();
  };

  const handleFormatChange = (newFormat: 'HEX' | 'RGB' | 'HSL') => {
    setFormat(newFormat);
    
    // Convert current HSL values to the new format
    let newColorValue = '';
    
    if (newFormat === 'HEX') {
      newColorValue = hslToHex(hue, saturation, lightness);
    } else if (newFormat === 'RGB') {
      // Convert HSL to RGB
      const s = saturation / 100;
      const l = lightness / 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;

      if (0 <= hue && hue < 60) {
        r = c; g = x; b = 0;
      } else if (60 <= hue && hue < 120) {
        r = x; g = c; b = 0;
      } else if (120 <= hue && hue < 180) {
        r = 0; g = c; b = x;
      } else if (180 <= hue && hue < 240) {
        r = 0; g = x; b = c;
      } else if (240 <= hue && hue < 300) {
        r = x; g = 0; b = c;
      } else if (300 <= hue && hue < 360) {
        r = c; g = 0; b = x;
      }

      const rValue = Math.round((r + m) * 255);
      const gValue = Math.round((g + m) * 255);
      const bValue = Math.round((b + m) * 255);
      
      newColorValue = `${rValue}, ${gValue}, ${bValue}`;
    } else if (newFormat === 'HSL') {
      newColorValue = `${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%`;
    }
    
    setColor(newColorValue);
  };

  // Handle HEX input changes and update HSL values
  const handleHexChange = (hexValue: string) => {
    const cleanHex = hexValue.replace(/[^0-9a-f]/gi, '');
    if (cleanHex.length === 6) {
      const fullHex = '#' + cleanHex;
      setColor(fullHex);
      const hsl = hexToHsl(fullHex);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
    } else {
      setColor('#' + cleanHex);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-64"
    >
      {/* Color Selection Area */}
      <div 
        className="w-full h-36 rounded-lg mb-3 relative cursor-crosshair"
        style={{
          background: `linear-gradient(to top, #000, hsl(${hue}, 100%, 50%)), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`
        }}
        onClick={handleColorAreaClick}
      >
        {/* Selection indicator */}
        <div
          className="absolute w-3 h-3 border-2 border-white rounded-full shadow-lg pointer-events-none"
          style={{
            left: `${saturation}%`,
            top: `${100 - lightness}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>

      {/* Hue Slider */}
      <div 
        className="w-full h-5 rounded-lg mb-4 relative cursor-pointer"
        style={{
          background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
        }}
        onClick={handleHueSliderClick}
      >
        {/* Hue indicator */}
        <div
          className="absolute w-3 h-3 border-2 border-white rounded-full shadow-lg pointer-events-none"
          style={{
            left: `${(hue / 360) * 100}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>

      {/* Color Input */}
      <div className="mb-4">
        {/* Format Dropdown */}
        <div className="relative mb-2">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-900 bg-white focus:ring-1 focus:ring-black focus:border-transparent flex items-center justify-between"
          >
            {format}
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-16 bg-white border border-gray-300 rounded-md shadow-lg z-10">
              {formatOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    handleFormatChange(option.value as 'HEX' | 'RGB' | 'HSL');
                    setShowDropdown(false);
                  }}
                  className={`w-full px-2 py-1 text-xs text-left hover:bg-black hover:text-white transition-colors first:rounded-t-md last:rounded-b-md ${
                    format === option.value ? 'bg-black text-white' : 'text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {format === 'HEX' && (
          <div className="flex items-center space-x-1">
            <span className="text-gray-900 font-medium text-sm">#</span>
            <input
              type="text"
              value={color.replace('#', '')}
              onChange={(e) => handleHexChange(e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-900 bg-white focus:ring-1 focus:ring-black focus:border-transparent"
              placeholder="000000"
              maxLength={6}
            />
          </div>
        )}
        
        {format === 'RGB' && (
          <div className="grid grid-cols-3 gap-1">
            <div>
              <label className="block text-xs text-gray-600 mb-1">R</label>
              <input
                type="number"
                value={Math.round((() => {
                  const s = saturation / 100;
                  const l = lightness / 100;
                  const c = (1 - Math.abs(2 * l - 1)) * s;
                  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
                  const m = l - c / 2;
                  let r = 0;
                  if (0 <= hue && hue < 60) r = c;
                  else if (60 <= hue && hue < 120) r = x;
                  else if (120 <= hue && hue < 180) r = 0;
                  else if (180 <= hue && hue < 240) r = 0;
                  else if (240 <= hue && hue < 300) r = x;
                  else if (300 <= hue && hue < 360) r = c;
                  return (r + m) * 255;
                })())}
                onChange={(e) => {
                  const r = parseInt(e.target.value) || 0;
                  // Convert RGB back to HSL and update
                  const newHsl = rgbToHsl(r, 
                    Math.round((() => {
                      const s = saturation / 100;
                      const l = lightness / 100;
                      const c = (1 - Math.abs(2 * l - 1)) * s;
                      const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
                      const m = l - c / 2;
                      let g = 0;
                      if (0 <= hue && hue < 60) g = x;
                      else if (60 <= hue && hue < 120) g = c;
                      else if (120 <= hue && hue < 180) g = c;
                      else if (180 <= hue && hue < 240) g = x;
                      else if (240 <= hue && hue < 300) g = 0;
                      else if (300 <= hue && hue < 360) g = 0;
                      return (g + m) * 255;
                    })()),
                    Math.round((() => {
                      const s = saturation / 100;
                      const l = lightness / 100;
                      const c = (1 - Math.abs(2 * l - 1)) * s;
                      const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
                      const m = l - c / 2;
                      let b = 0;
                      if (0 <= hue && hue < 60) b = 0;
                      else if (60 <= hue && hue < 120) b = 0;
                      else if (120 <= hue && hue < 180) b = x;
                      else if (180 <= hue && hue < 240) b = c;
                      else if (240 <= hue && hue < 300) b = c;
                      else if (300 <= hue && hue < 360) b = x;
                      return (b + m) * 255;
                    })())
                  );
                  setHue(newHsl.h);
                  setSaturation(newHsl.s);
                  setLightness(newHsl.l);
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-900 bg-white focus:ring-1 focus:ring-black focus:border-transparent"
                min="0"
                max="255"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">G</label>
              <input
                type="number"
                value={Math.round((() => {
                  const s = saturation / 100;
                  const l = lightness / 100;
                  const c = (1 - Math.abs(2 * l - 1)) * s;
                  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
                  const m = l - c / 2;
                  let g = 0;
                  if (0 <= hue && hue < 60) g = x;
                  else if (60 <= hue && hue < 120) g = c;
                  else if (120 <= hue && hue < 180) g = c;
                  else if (180 <= hue && hue < 240) g = x;
                  else if (240 <= hue && hue < 300) g = 0;
                  else if (300 <= hue && hue < 360) g = 0;
                  return (g + m) * 255;
                })())}
                onChange={(e) => {
                  const g = parseInt(e.target.value) || 0;
                  // Convert RGB back to HSL and update
                  const newHsl = rgbToHsl(
                    Math.round((() => {
                      const s = saturation / 100;
                      const l = lightness / 100;
                      const c = (1 - Math.abs(2 * l - 1)) * s;
                      const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
                      const m = l - c / 2;
                      let r = 0;
                      if (0 <= hue && hue < 60) r = c;
                      else if (60 <= hue && hue < 120) r = x;
                      else if (120 <= hue && hue < 180) r = 0;
                      else if (180 <= hue && hue < 240) r = 0;
                      else if (240 <= hue && hue < 300) r = x;
                      else if (300 <= hue && hue < 360) r = c;
                      return (r + m) * 255;
                    })()),
                    g,
                    Math.round((() => {
                      const s = saturation / 100;
                      const l = lightness / 100;
                      const c = (1 - Math.abs(2 * l - 1)) * s;
                      const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
                      const m = l - c / 2;
                      let b = 0;
                      if (0 <= hue && hue < 60) b = 0;
                      else if (60 <= hue && hue < 120) b = 0;
                      else if (120 <= hue && hue < 180) b = x;
                      else if (180 <= hue && hue < 240) b = c;
                      else if (240 <= hue && hue < 300) b = c;
                      else if (300 <= hue && hue < 360) b = x;
                      return (b + m) * 255;
                    })())
                  );
                  setHue(newHsl.h);
                  setSaturation(newHsl.s);
                  setLightness(newHsl.l);
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-900 bg-white focus:ring-1 focus:ring-black focus:border-transparent"
                min="0"
                max="255"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">B</label>
              <input
                type="number"
                value={Math.round((() => {
                  const s = saturation / 100;
                  const l = lightness / 100;
                  const c = (1 - Math.abs(2 * l - 1)) * s;
                  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
                  const m = l - c / 2;
                  let b = 0;
                  if (0 <= hue && hue < 60) b = 0;
                  else if (60 <= hue && hue < 120) b = 0;
                  else if (120 <= hue && hue < 180) b = x;
                  else if (180 <= hue && hue < 240) b = c;
                  else if (240 <= hue && hue < 300) b = c;
                  else if (300 <= hue && hue < 360) b = x;
                  return (b + m) * 255;
                })())}
                onChange={(e) => {
                  const b = parseInt(e.target.value) || 0;
                  // Convert RGB back to HSL and update
                  const newHsl = rgbToHsl(
                    Math.round((() => {
                      const s = saturation / 100;
                      const l = lightness / 100;
                      const c = (1 - Math.abs(2 * l - 1)) * s;
                      const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
                      const m = l - c / 2;
                      let r = 0;
                      if (0 <= hue && hue < 60) r = c;
                      else if (60 <= hue && hue < 120) r = x;
                      else if (120 <= hue && hue < 180) r = 0;
                      else if (180 <= hue && hue < 240) r = 0;
                      else if (240 <= hue && hue < 300) r = x;
                      else if (300 <= hue && hue < 360) r = c;
                      return (r + m) * 255;
                    })()),
                    Math.round((() => {
                      const s = saturation / 100;
                      const l = lightness / 100;
                      const c = (1 - Math.abs(2 * l - 1)) * s;
                      const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
                      const m = l - c / 2;
                      let g = 0;
                      if (0 <= hue && hue < 60) g = x;
                      else if (60 <= hue && hue < 120) g = c;
                      else if (120 <= hue && hue < 180) g = c;
                      else if (180 <= hue && hue < 240) g = x;
                      else if (240 <= hue && hue < 300) g = 0;
                      else if (300 <= hue && hue < 360) g = 0;
                      return (g + m) * 255;
                    })()),
                    b
                  );
                  setHue(newHsl.h);
                  setSaturation(newHsl.s);
                  setLightness(newHsl.l);
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-900 bg-white focus:ring-1 focus:ring-black focus:border-transparent"
                min="0"
                max="255"
              />
            </div>
          </div>
        )}
        
        {format === 'HSL' && (
          <div className="grid grid-cols-3 gap-1">
            <div>
              <label className="block text-xs text-gray-600 mb-1">H</label>
              <input
                type="number"
                value={Math.round(hue)}
                onChange={(e) => setHue(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-900 bg-white focus:ring-1 focus:ring-black focus:border-transparent"
                min="0"
                max="360"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">S</label>
              <input
                type="number"
                value={Math.round(saturation)}
                onChange={(e) => setSaturation(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-900 bg-white focus:ring-1 focus:ring-black focus:border-transparent"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">L</label>
              <input
                type="number"
                value={Math.round(lightness)}
                onChange={(e) => setLightness(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-900 bg-white focus:ring-1 focus:ring-black focus:border-transparent"
                min="0"
                max="100"
              />
            </div>
          </div>
        )}
      </div>

      {/* Select Color Button */}
      <button
        onClick={handleConfirm}
        className="w-full py-2 px-4 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Select color
      </button>
    </div>
  );
}
