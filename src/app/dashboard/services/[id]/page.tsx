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
  const [originalFormData, setOriginalFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    bufferTime: 0,
    price: 0,
    location: "",
    categoryId: "",
    isHidden: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    bufferTime: 0,
    price: 0,
    location: "",
    categoryId: "",
    isHidden: false,
  });

  // Check if form has been modified
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

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
        const initialFormData = {
          name: serviceData.name || "",
          description: serviceData.description || "",
          duration: serviceData.duration || 30,
          bufferTime: 0, // Not in current schema, but can be added
          price: serviceData.price || 0,
          location: "",
          categoryId: serviceData.categoryId || "",
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
        // Fallback to mock data
        const mockCategories: Category[] = [
          { id: "1", name: "Consultations", serviceCount: 2 },
          { id: "2", name: "Meetings", serviceCount: 1 },
          { id: "3", name: "Training", serviceCount: 0 },
        ];
        setCategories(mockCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to mock data
      const mockCategories: Category[] = [
        { id: "1", name: "Consultations", serviceCount: 2 },
        { id: "2", name: "Meetings", serviceCount: 1 },
        { id: "3", name: "Training", serviceCount: 0 },
      ];
      setCategories(mockCategories);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name.trim() || formData.duration <= 0) {
      setError("Please fill out all fields marked with a *");
      return;
    }

    try {
      setIsSaving(true);
      
      if (isNewService) {
        // Create new service
        const response = await fetch("/api/services", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newService = await response.json();
          // Redirect back to services list page
          router.push("/dashboard/services");
        } else {
          setError("Failed to create service");
        }
      } else {
        // Update existing service
        const response = await fetch(`/api/services/${serviceId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updatedService = await response.json();
          setService(updatedService);
          // Update original form data to reflect saved state
          setOriginalFormData(formData);
          // Redirect back to services list
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
      // No changes, just go back
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
          <div className="p-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackClick}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">
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
            className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">Please fill out all fields marked with a *</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Service details</h2>
            
            {/* Service Image */}
            <div className="mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
                  <span className="text-xl">🌳</span>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Service image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Up to 5 MB in size</p>
                  <div className="flex space-x-2">
                    <button className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors text-gray-700">
                      <Edit className="h-3 w-3 inline mr-1" />
                      Edit
                    </button>
                    <button className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors text-gray-700">
                      <Trash2 className="h-3 w-3 inline mr-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900 text-sm"
                placeholder="Service title"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900 text-sm"
                placeholder="Describe your service to Booking Page visitors"
              />
            </div>

            {/* Duration and Buffer Time */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900"
                />
                <p className="text-sm text-gray-500 mt-1">mins</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Buffer time
                  <Info className="h-4 w-4 ml-1 text-gray-400" />
                </label>
                <input
                  type="number"
                  value={formData.bufferTime}
                  onChange={(e) => setFormData({...formData, bufferTime: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900"
                />
                <p className="text-sm text-gray-500 mt-1">mins</p>
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
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900 text-sm"
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
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900 text-sm"
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
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hidden Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label className="block text-xs font-medium text-gray-700 mr-2">
                  Set to hidden
                </label>
                <Info className="h-3 w-3 text-gray-400" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isHidden}
                  onChange={(e) => setFormData({...formData, isHidden: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Team *</h3>
            <p className="text-xs text-gray-600 mb-3">Who will provide this service?</p>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900 text-sm"
              />
            </div>

            {/* Team Members List */}
            <div className="space-y-1">
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
              <p className="text-xs text-gray-500 text-center py-2">
                No team members found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      {showUnsavedChangesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal content */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Unsaved Changes
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {isNewService 
                  ? "You have unsaved changes. Do you want to save this service before going back?"
                  : "You have unsaved changes. Do you want to save your changes before going back?"
                }
              </p>

              {/* Action buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleDiscardAndGoBack}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveAndGoBack}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
            {/* Close button */}
            <button
              onClick={handleCancelDelete}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal content */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Service
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this service? This action cannot be undone.
              </p>

              {/* Action buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
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