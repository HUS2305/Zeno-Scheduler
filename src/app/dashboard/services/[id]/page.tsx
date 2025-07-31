"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Upload, Edit, Info, Search, User } from "lucide-react";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  icon?: string;
  isActive?: boolean;
  categoryId?: string;
  colorTheme?: string;
}

interface Category {
  id: string;
  name: string;
  serviceCount: number;
}

interface TeamMember {
  id: string;
  name: string;
  email?: string;
}

// Color theme options
const colorOptions = [
  { name: "blue", value: "#3B82F6" },
  { name: "red", value: "#EF4444" },
  { name: "green", value: "#10B981" },
  { name: "purple", value: "#8B5CF6" },
  { name: "orange", value: "#F97316" },
  { name: "pink", value: "#EC4899" },
  { name: "yellow", value: "#EAB308" },
  { name: "teal", value: "#14B8A6" },
  { name: "gray", value: "#6B7280" },
];

// Helper function to get color value
const getColorValue = (colorName: string): string => {
  const color = colorOptions.find(c => c.name === colorName);
  return color ? color.value : "#3B82F6"; // Default to blue
};

export default function ServiceEditPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  const isNewService = serviceId === "new";

  const [service, setService] = useState<Service | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBufferTimeTooltip, setShowBufferTimeTooltip] = useState(false);
  const [showHiddenTooltip, setShowHiddenTooltip] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [originalFormData, setOriginalFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    bufferTime: 0,
    price: 0,
    location: "",
    categoryIds: [] as string[],
    colorTheme: "blue",
    isHidden: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    bufferTime: 0,
    price: 0,
    location: "",
    categoryIds: [] as string[],
    colorTheme: "blue",
    isHidden: false,
  });

  // Check if form has been modified
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown]);

  useEffect(() => {
    if (serviceId && !isNewService) {
      fetchService();
      fetchTeamMembers();
      fetchCategories();
    } else if (isNewService) {
      fetchTeamMembers();
      fetchCategories();
      setIsLoading(false);
    }
  }, [serviceId, isNewService]);

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}`);
      if (response.ok) {
        const serviceData = await response.json();
        setService(serviceData);
        
        // Extract categoryIds from the new categoryLinks structure
        const categoryIds = serviceData.categoryLinks?.map((link: any) => link.categoryId) || [];
        
        const initialFormData = {
          name: serviceData.name || "",
          description: serviceData.description || "",
          duration: serviceData.duration || 30,
          bufferTime: 0,
          price: serviceData.price || 0,
          location: "",
          categoryIds: categoryIds,
          colorTheme: serviceData.colorTheme || "blue",
          isHidden: false,
        };
        setFormData(initialFormData);
        setOriginalFormData(initialFormData);
      } else {
        setError("Service not found");
      }
    } catch (error) {
      console.error("Error fetching service:", error);
      setError("Failed to fetch service");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/team");
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

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
      setError("Please fill out all fields marked with a *");
      return;
    }

    try {
      setIsSaving(true);
      
      // Send categoryIds array directly to backend
      const saveData = {
        ...formData,
        categoryIds: formData.categoryIds, // Send the full array
      };
      
      if (isNewService) {
        const response = await fetch("/api/services", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(saveData),
        });

        if (response.ok) {
          const newService = await response.json();
          router.push("/dashboard/services");
        } else {
          setError("Failed to create service");
        }
      } else {
        const response = await fetch(`/api/services/${serviceId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(saveData),
        });

        if (response.ok) {
          const updatedService = await response.json();
          setService(updatedService);
          setOriginalFormData(formData);
          router.push("/dashboard/services");
        } else {
          setError("Failed to update service");
        }
      }
    } catch (error) {
      console.error("Error saving service:", error);
      setError("Failed to save service");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/services");
      } else {
        setError("Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      setError("Failed to delete service");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleTeamMemberToggle = (memberId: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleBackClick = () => {
    if (hasChanges()) {
      setShowUnsavedChangesModal(true);
    } else {
      router.push("/dashboard/services");
    }
  };

  const handleSaveAndGoBack = async () => {
    setShowUnsavedChangesModal(false);
    await handleSave();
  };

  const handleDiscardAndGoBack = () => {
    setShowUnsavedChangesModal(false);
    router.push("/dashboard/services");
  };

  const handleCloseModal = () => {
    setShowUnsavedChangesModal(false);
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
    // Don't close dropdown for multi-select
  };

  const getSelectedCategoryNames = () => {
    return formData.categoryIds.map(id => {
      const category = categories.find(cat => cat.id === id);
      return category ? category.name : "";
    }).join(", ");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading service...</div>
        </div>
      </div>
    );
  }

  if (error && !service && !isNewService) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard/services")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackClick}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
          >
            <ArrowLeft className="h-3 w-3" />
          </button>
          <h1 className="text-base font-bold text-gray-900">
            {isNewService ? "Create service" : "Edit service"}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {!isNewService && (
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-2 py-1 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 text-xs"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-xs">Please fill out all fields marked with a *</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Service Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Service details</h2>
            
            {/* Service Image */}
            <div className="mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
                  <span className="text-lg">🌳</span>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Service image
                  </label>
                  <p className="text-xs text-gray-500 mb-1">Up to 5 MB in size</p>
                  <div className="flex space-x-2">
                    <button className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700">
                      <Edit className="h-3 w-3 inline mr-1" />
                      Edit
                    </button>
                    <button className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700">
                      <Trash2 className="h-3 w-3 inline mr-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Title and Color Theme */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Title *
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
                    setFormData({...formData, name: capitalizedValue});
                  }}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900 text-xs"
                  placeholder="Service title"
                />
                                 <div className="relative">
                   <button
                     type="button"
                     onClick={() => setShowColorDropdown(!showColorDropdown)}
                     className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                   >
                     <div 
                       className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
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
                                 className={`w-4 h-4 rounded-full border-2 transition-all duration-200 flex-shrink-0 ${
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
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
                             <textarea
                 value={formData.description}
                 onChange={(e) => {
                   const value = e.target.value;
                   const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
                   setFormData({...formData, description: capitalizedValue});
                 }}
                 rows={2}
                 className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900 text-xs"
                 placeholder="Describe your service to Booking Page visitors"
               />
            </div>

            {/* Duration and Buffer Time */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Duration *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900 text-xs"
                />
                <p className="text-xs text-gray-500 mt-0.5">mins</p>
              </div>
              <div>
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                    Buffer time
                    <div
                      onMouseEnter={() => setShowBufferTimeTooltip(true)}
                      onMouseLeave={() => setShowBufferTimeTooltip(false)}
                      className="ml-1 p-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help"
                    >
                      <Info className="h-3 w-3" />
                    </div>
                  </label>
                  {showBufferTimeTooltip && (
                    <div className="absolute top-6 left-0 z-10 bg-black text-white text-xs rounded-md px-2 py-1.5 max-w-xs shadow-lg">
                      Add time to prep in between two consecutive appointments.
                      <div className="absolute -top-1 left-3 w-2 h-2 bg-black rotate-45"></div>
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  value={formData.bufferTime}
                  onChange={(e) => setFormData({...formData, bufferTime: parseInt(e.target.value)})}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900 text-xs"
                />
                <p className="text-xs text-gray-500 mt-0.5">mins</p>
              </div>
            </div>

            {/* Cost */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cost
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900 text-xs"
                placeholder="0"
              />
            </div>

            {/* Location */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-gray-900 text-xs"
              >
                <option value="">Select location</option>
                <option value="online">Online</option>
                <option value="office">Office</option>
                <option value="client-location">Client Location</option>
              </select>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category
              </label>
              <div className="relative category-dropdown">
                <div
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-transparent text-gray-900 text-xs cursor-pointer flex items-center justify-between bg-white"
                >
                  <span className={getSelectedCategoryNames() ? "text-gray-900" : "text-gray-500"}>
                    {getSelectedCategoryNames() || "Select one or more categories"}
                  </span>
                  <svg
                    className={`w-3 h-3 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="max-h-48 overflow-y-auto">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          onClick={() => handleCategorySelect(category.id)}
                          className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                                                     <div className="flex items-center mr-2">
                             <div className={`h-4 w-4 rounded-sm border border-gray-300 flex items-center justify-center ${
                               formData.categoryIds.includes(category.id) 
                                 ? 'bg-black border-black' 
                                 : 'bg-white'
                             }`}>
                               {formData.categoryIds.includes(category.id) && (
                                 <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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

            {/* Hidden Toggle */}
            <div className="flex items-center justify-between">
              <div className="relative">
                <div className="flex items-center">
                  <label className="block text-xs font-medium text-gray-700 mr-2">
                    Set to hidden
                  </label>
                  <div
                    onMouseEnter={() => setShowHiddenTooltip(true)}
                    onMouseLeave={() => setShowHiddenTooltip(false)}
                    className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help"
                  >
                    <Info className="h-3 w-3" />
                  </div>
                </div>
                {showHiddenTooltip && (
                  <div className="absolute top-6 left-0 z-10 bg-black text-white text-xs rounded-md px-2 py-1.5 max-w-xs shadow-lg">
                    When set to hidden, a service is not visible on your Booking Page.
                    <div className="absolute -top-1 left-3 w-2 h-2 bg-black rotate-45"></div>
                  </div>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isHidden}
                  onChange={(e) => setFormData({...formData, isHidden: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Team Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Team *</h3>
            <p className="text-xs text-gray-600 mb-3">Who will provide this service?</p>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900 text-xs"
              />
            </div>

            {/* Team Members List */}
            <div className="space-y-1.5">
              {teamMembers
                .filter(member => 
                  member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  member.email?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((member) => (
                  <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTeamMembers.includes(member.id)}
                      onChange={() => handleTeamMemberToggle(member.id)}
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-600" />
                      </div>
                      <span className="text-xs text-gray-900">{member.name}</span>
                    </div>
                  </label>
                ))}
            </div>

            {teamMembers.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-3">
                No team members found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      {showUnsavedChangesModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-black hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 mt-0">
                Unsaved Changes
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                You have unsaved changes. Do you want to save your changes before going back?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleDiscardAndGoBack}
                  className="px-2 py-1 text-gray-600 hover:text-gray-800 transition-colors text-xs font-medium"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveAndGoBack}
                  className="px-2 py-1 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-xs font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 relative">
            <button
              onClick={handleCancelDelete}
              className="absolute top-3 right-3 text-black hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 mt-0">
                Delete Service
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                Are you sure you want to delete this service? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancelDelete}
                  className="px-2 py-1 text-gray-600 hover:text-gray-800 transition-colors text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-2 py-1 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-xs font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}