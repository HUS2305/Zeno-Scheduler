"use client";

import { useState, useEffect } from "react";

// Color theme options
const colorOptions = [
  { name: "blue", value: "#3B82F6", light: "#DBEAFE", medium: "#93C5FD", dark: "#1E40AF" },
  { name: "red", value: "#EF4444", light: "#FEE2E2", medium: "#FCA5A5", dark: "#B91C1C" },
  { name: "green", value: "#10B981", light: "#D1FAE5", medium: "#6EE7B7", dark: "#047857" },
  { name: "purple", value: "#8B5CF6", light: "#EDE9FE", medium: "#C4B5FD", dark: "#5B21B6" },
  { name: "orange", value: "#F97316", light: "#FED7AA", medium: "#FDBA74", dark: "#C2410C" },
  { name: "pink", value: "#EC4899", light: "#FCE7F3", medium: "#F9A8D4", dark: "#BE185D" },
  { name: "yellow", value: "#EAB308", light: "#FEF3C7", medium: "#FDE047", dark: "#A16207" },
  { name: "teal", value: "#14B8A6", light: "#CCFBF1", medium: "#5EEAD4", dark: "#0F766E" },
  { name: "gray", value: "#6B7280", light: "#F3F4F6", medium: "#D1D5DB", dark: "#374151" },
];

// Helper function to get color value
const getColorValue = (colorName: string): string => {
  const color = colorOptions.find(c => c.name === colorName);
  return color ? color.value : "#3B82F6"; // Default to blue
};

interface Category {
  id: string;
  name: string;
  serviceCount: number;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceSaved: () => void;
  editingService?: {
    id: string;
    name: string;
    duration: number;
    price: number;
    colorTheme: string;
    categoryIds: string[];
  } | null;
}

export default function ServiceModal({
  isOpen,
  onClose,
  onServiceSaved,
  editingService,
}: ServiceModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    duration: 30,
    price: 0,
    categoryIds: [] as string[],
    colorTheme: "blue",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name,
        duration: editingService.duration,
        price: editingService.price,
        categoryIds: editingService.categoryIds,
        colorTheme: editingService.colorTheme,
      });
    } else {
      setFormData({
        name: "",
        duration: 30,
        price: 0,
        categoryIds: [],
        colorTheme: "blue",
      });
    }
    setError("");
  }, [editingService]);

  // Fetch categories on mount
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.dropdown-container')) {
        setShowCategoryDropdown(false);
        setShowColorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error("Failed to fetch categories");
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || formData.duration <= 0) {
      setError("Please fill out all required fields");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      const saveData = {
        ...formData,
        categoryIds: formData.categoryIds,
      };
      
      if (editingService) {
        // Update existing service
        const response = await fetch(`/api/services/${editingService.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(saveData),
        });

        if (response.ok) {
          onServiceSaved();
          onClose();
        } else {
          setError("Failed to update service");
        }
      } else {
        // Create new service
        const response = await fetch("/api/services", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(saveData),
        });

        if (response.ok) {
          onServiceSaved();
          onClose();
        } else {
          setError("Failed to create service");
        }
      }
    } catch (error) {
      console.error("Error saving service:", error);
      setError("Failed to save service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingService) return;

    try {
      setIsLoading(true);
      setError("");
      
      const response = await fetch(`/api/services?id=${editingService.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onServiceSaved();
        onClose();
      } else {
        setError("Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      setError("Failed to delete service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  const getSelectedCategoryNames = () => {
    return formData.categoryIds.map(id => {
      const category = categories.find(cat => cat.id === id);
      return category ? category.name : "";
    }).join(", ");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h2 className="text-base font-semibold text-gray-900">
            {editingService ? "Edit service" : "Create service"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 space-y-3">
          {/* Error message */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          {/* Title */}
          <div className="flex items-center space-x-2">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                const value = e.target.value;
                const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
                setFormData({...formData, name: capitalizedValue});
              }}
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Service title"
            />
            {/* Color Theme Picker */}
            <div className="relative dropdown-container">
              <button
                type="button"
                onClick={() => setShowColorDropdown(!showColorDropdown)}
                className="flex items-center justify-center w-6 h-6 border border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div 
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: getColorValue(formData.colorTheme) }}
                ></div>
              </button>
              
              {showColorDropdown && (
                <div className="absolute top-full right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[120px]">
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => {
                          setFormData({...formData, colorTheme: color.name});
                          setShowColorDropdown(false);
                        }}
                        className="flex items-center justify-center p-1 rounded-md hover:bg-gray-50 transition-all duration-200"
                      >
                        <div 
                          className={`w-3 h-3 rounded-full border-2 transition-all duration-200 flex-shrink-0 ${
                            formData.colorTheme === color.name 
                              ? 'border-gray-400 shadow-md scale-110' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: color.value }}
                        ></div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center space-x-2">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="30"
            />
            <span className="text-xs text-gray-500">mins</span>
          </div>

          {/* Cost */}
          <div className="flex items-center space-x-2">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="0"
            />
          </div>

          {/* Category */}
          <div className="flex items-center space-x-2">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <div className="flex-1 relative dropdown-container">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-full text-xs text-left focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white flex items-center justify-between"
              >
                <span className={getSelectedCategoryNames() ? "text-gray-900" : "text-gray-500"}>
                  {getSelectedCategoryNames() || "Select categories"}
                </span>
                <svg
                  className={`w-3 h-3 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center mr-2">
                          <div className={`h-3 w-3 rounded-sm border border-gray-300 flex items-center justify-center ${
                            formData.categoryIds.includes(category.id) 
                              ? 'bg-black border-black' 
                              : 'bg-white'
                          }`}>
                            {formData.categoryIds.includes(category.id) && (
                              <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-900">{category.name}</span>
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <div className="px-3 py-2 text-xs text-gray-500">
                        No categories found
                      </div>
                    )}
                  </div>
                  {/* Close button for multi-select */}
                  <div className="border-t border-gray-200 p-2">
                    <button
                      onClick={() => setShowCategoryDropdown(false)}
                      className="w-full text-xs text-gray-600 hover:text-gray-800 text-center py-1"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 pb-6">
                     {editingService && (
             <button
               onClick={handleDelete}
               disabled={isLoading}
               className="text-black text-xs font-medium hover:text-gray-700 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
             >
               {isLoading ? "Deleting..." : "Delete"}
             </button>
           )}
          <div className="flex-1"></div>
          <button
            onClick={handleSave}
            disabled={isLoading || !formData.name.trim() || formData.duration <= 0}
            className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-xs font-medium"
          >
            {isLoading ? "Saving..." : (editingService ? "Update" : "Create")}
          </button>
        </div>
      </div>
    </div>
  );
}
