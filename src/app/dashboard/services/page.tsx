"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Users, Share, Link, MoreVertical, Clock, DollarSign, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  icon?: string;
  isActive?: boolean;
  isHidden?: boolean;
  categoryLinks?: Array<{
    categoryId: string;
    category: {
      id: string;
      name: string;
    };
  }>;
  teamLinks?: Array<{
    teamMemberId: string;
    teamMember: {
      id: string;
      name: string;
      email?: string;
    };
  }>;
}

interface Category {
  id: string;
  name: string;
  serviceCount: number;
}

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState<string | null>(null);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [selectedServicesForEdit, setSelectedServicesForEdit] = useState<string[]>([]);
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch services from API
  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownOpen) {
        setCategoryDropdownOpen(null);
      }
      if (serviceDropdownOpen) {
        setServiceDropdownOpen(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [categoryDropdownOpen, serviceDropdownOpen]);

  // Update category counts when services change
  useEffect(() => {
    if (categories.length > 0) {
      const updatedCategories = categories.map(category => ({
        ...category,
        serviceCount: services.filter(service => service.categoryLinks?.some(link => link.categoryId === category.id)).length
      }));
      setCategories(updatedCategories);
    }
  }, [services]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        setError("Failed to fetch services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setError("Failed to fetch services");
    } finally {
      setIsLoading(false);
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

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || service.categoryLinks?.some(link => link.categoryId === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setServices((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleServiceClick = (service: Service) => {
    router.push(`/dashboard/services/${service.id}`);
  };

  const handleCreateService = () => {
    router.push("/dashboard/services/new");
  };

  const handleDeleteService = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      const response = await fetch(`/api/services?id=${serviceToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh both services and categories to update counts
        await fetchServices();
        await fetchCategories();
        setShowDeleteModal(false);
        setServiceToDelete(null);
      } else {
        setError("Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      setError("Failed to delete service");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setServiceToDelete(null);
  };

  const handleDuplicateService = async (serviceId: string) => {
    try {
      const response = await fetch("/api/services/duplicate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serviceId }),
      });

      if (response.ok) {
        // Refresh services to show the new duplicated service
        await fetchServices();
        setServiceDropdownOpen(null);
      } else {
        setError("Failed to duplicate service");
      }
    } catch (error) {
      console.error("Error duplicating service:", error);
      setError("Failed to duplicate service");
    }
  };

  const handleToggleHidden = async (serviceId: string) => {
    try {
      const response = await fetch("/api/services/toggle-hidden", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serviceId }),
      });

      if (response.ok) {
        // Refresh services to show updated hidden status
        await fetchServices();
        setServiceDropdownOpen(null);
      } else {
        setError("Failed to toggle service visibility");
      }
    } catch (error) {
      console.error("Error toggling service visibility:", error);
      setError("Failed to toggle service visibility");
    }
  };

  const handleEditService = (service: Service) => {
    router.push(`/dashboard/services/${service.id}`);
    setServiceDropdownOpen(null);
  };

  const handleCreateCategory = async () => {
    setShowCreateCategoryModal(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Check if the category has any services
    const categoryServices = services.filter(service => service.categoryLinks?.some(link => link.categoryId === categoryId));
    
    if (categoryServices.length > 0) {
      setError("Cannot delete category that has services. Please reassign or delete the services first.");
      return;
    }
    
    setCategoryToDelete(categoryId);
    setShowCategoryDeleteModal(true);
  };

  const handleConfirmCategoryDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`/api/categories?id=${categoryToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete));
        if (selectedCategory === categoryToDelete) {
          setSelectedCategory(null);
        }
        setShowCategoryDeleteModal(false);
        setCategoryToDelete(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setError("Failed to delete category");
    }
  };

  const handleCancelCategoryDelete = () => {
    setShowCategoryDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleOpenCreateCategoryModal = () => {
    setShowCreateCategoryModal(true);
    setNewCategoryName("");
  };

  const handleCloseCreateCategoryModal = () => {
    setShowCreateCategoryModal(false);
    setNewCategoryName("");
  };

  const handleSubmitCreateCategory = async () => {
    if (!newCategoryName || !newCategoryName.trim()) return;

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories(prev => [...prev, newCategory]);
        handleCloseCreateCategoryModal();
      } else {
        setError("Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      setError("Failed to create category");
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    
    // Get services that are currently assigned to this category
    const categoryServices = services.filter(service => 
      service.categoryLinks?.some(link => link.categoryId === category.id)
    );
    setSelectedServicesForEdit(categoryServices.map(service => service.id));
    
    setShowEditCategoryModal(true);
    setCategoryDropdownOpen(null);
  };

  const handleCloseEditCategoryModal = () => {
    setShowEditCategoryModal(false);
    setEditingCategory(null);
    setEditCategoryName("");
    setSelectedServicesForEdit([]);
    setServiceSearchQuery("");
  };

  const handleServiceToggleForEdit = (serviceId: string) => {
    setSelectedServicesForEdit(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectAllServices = () => {
    const filteredServices = services.filter(service =>
      service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
    );
    setSelectedServicesForEdit(filteredServices.map(service => service.id));
  };

  const handleDeselectAllServices = () => {
    setSelectedServicesForEdit([]);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    try {
      // First update the category name
      const updateResponse = await fetch(`/api/categories?id=${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editCategoryName.trim() }),
      });

      if (!updateResponse.ok) {
        setError("Failed to update category name");
        return;
      }

      // Then update the service assignments
      const servicesResponse = await fetch(`/api/categories/${editingCategory.id}/services`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serviceIds: selectedServicesForEdit }),
      });

      if (servicesResponse.ok) {
        // Refresh data
        await fetchServices();
        await fetchCategories();
        handleCloseEditCategoryModal();
      } else {
        setError("Failed to update service assignments");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      setError("Failed to update category");
    }
  };

  const clearError = () => {
    setError("");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading services...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Services</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your services and organize them by categories to streamline your booking process.</p>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg relative">
          <button
            onClick={clearError}
            className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-red-600 pr-6 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-gray-900 text-left">Categories ({categories.length})</h2>
          </div>

          {/* Categories List */}
          <div className="space-y-1">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`w-full text-left px-1.5 py-1 rounded-md transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'border border-gray-900 text-gray-900'
                    : 'text-gray-700 hover:border hover:border-gray-900 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center">
                      <span className="text-xs font-medium">{category.name}</span>
                      <span className="text-xs text-gray-500 ml-1">({category.serviceCount})</span>
                    </div>
                  </button>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryDropdownOpen(categoryDropdownOpen === category.id ? null : category.id);
                      }}
                      className="ml-1 p-0.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {categoryDropdownOpen === category.id && (
                      <div className="absolute right-0 top-6 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px]">
                                                 <button
                           onClick={(e) => {
                             e.stopPropagation();
                             handleEditCategory(category);
                           }}
                           className="w-full text-left px-3 py-2 text-xs text-gray-900 hover:bg-gray-50 flex items-center"
                         >
                          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoryDropdownOpen(null);
                            handleDeleteCategory(category.id);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-gray-900 hover:bg-gray-50 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Category */}
          <button 
            onClick={handleOpenCreateCategoryModal}
            className="w-8 h-8 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center mx-auto mt-3"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Services List */}
        <div className="lg:col-span-5 lg:pl-4">
          {/* Services Header */}
          <div className="mb-3">
            <h2 className="text-sm font-bold text-gray-900 text-left">
              {selectedCategory 
                ? `${(() => {
                    const category = categories.find(cat => cat.id === selectedCategory);
                    const categoryServices = services.filter(service => service.categoryLinks?.some(link => link.categoryId === selectedCategory));
                    return category?.name || 'Category';
                  })()} (${(() => {
                    const categoryServices = services.filter(service => service.categoryLinks?.some(link => link.categoryId === selectedCategory));
                    return categoryServices.length;
                  })()})`
                : `Services (${services.length})`
              }
            </h2>
          </div>

          {/* Search and Create Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900 text-sm"
                />
              </div>
            </div>
                         <button
               onClick={handleCreateService}
               className="ml-3 flex items-center px-3 py-1.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm"
             >
               <Plus className="h-3.5 w-3.5 mr-1.5" />
               Create Service
             </button>
          </div>

          {/* Services List */}
          {services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-3 text-sm">No services found</p>
              <button
                onClick={handleCreateService}
                className="px-3 py-1.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm"
              >
                Create your first service
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredServices.map(service => service.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {filteredServices.map((service, index) => (
                    <SortableServiceBlock
                      key={service.id}
                      service={service}
                      onClick={() => handleServiceClick(service)}
                      onDelete={() => handleDeleteService(service.id)}
                      onDuplicate={handleDuplicateService}
                      onToggleHidden={handleToggleHidden}
                      onEdit={handleEditService}
                      serviceDropdownOpen={serviceDropdownOpen}
                      setServiceDropdownOpen={setServiceDropdownOpen}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
            <button
              onClick={handleCancelDelete}
              className="absolute top-4 right-4 text-black hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3 mt-0">
                Delete Service?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                You'll permanently delete this service. This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Delete Confirmation Modal */}
      {showCategoryDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
            <button
              onClick={handleCancelCategoryDelete}
              className="absolute top-4 right-4 text-black hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3 mt-0">
                Delete '{(() => {
                  const category = categories.find(cat => cat.id === categoryToDelete);
                  return category?.name || 'category';
                })()}'?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                You'll permanently delete this category but the associated services will remain in your account.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelCategoryDelete}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCategoryDelete}
                  className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCreateCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
            <button
              onClick={handleCloseCreateCategoryModal}
              className="absolute top-4 right-4 text-black hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3 mt-0">
                Enter category name:
              </h3>
              <div className="mb-6">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => {
                    const value = e.target.value;
                    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
                    setNewCategoryName(capitalizedValue);
                  }}
                  placeholder="Category name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmitCreateCategory();
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseCreateCategoryModal}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCreateCategory}
                  className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
                 </div>
       )}

       {/* Edit Category Modal */}
       {showEditCategoryModal && editingCategory && (
         <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-hidden">
             <button
               onClick={handleCloseEditCategoryModal}
               className="absolute top-4 right-4 text-black hover:text-gray-700 transition-colors"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
             <div className="p-6">
               <h3 className="text-base font-semibold text-gray-900 mb-3 mt-0">
                 Edit category
               </h3>
               
               {/* Category Title Section */}
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Title *
                 </label>
                 <input
                   type="text"
                   value={editCategoryName}
                   onChange={(e) => {
                     const value = e.target.value;
                     const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
                     setEditCategoryName(capitalizedValue);
                   }}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900 text-sm"
                   placeholder="Category name"
                 />
               </div>

               {/* Services Section */}
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Services
                 </label>
                 
                 {/* Search Bar */}
                 <div className="relative mb-3">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                   <input
                     type="text"
                     placeholder="Search"
                     value={serviceSearchQuery}
                     onChange={(e) => setServiceSearchQuery(e.target.value)}
                     className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900 text-sm"
                   />
                 </div>

                                           {/* Select All Checkbox */}
                          <div className="flex items-center mb-3">
                            <div 
                              className="flex items-center mr-2 cursor-pointer"
                              onClick={services.filter(service => service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())).length > 0 &&
                                       services.filter(service => service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())).every(service => selectedServicesForEdit.includes(service.id))
                                ? handleDeselectAllServices
                                : handleSelectAllServices}
                            >
                              <div className={`h-4 w-4 rounded-sm border border-gray-300 flex items-center justify-center ${
                                services.filter(service => service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())).length > 0 &&
                                services.filter(service => service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())).every(service => selectedServicesForEdit.includes(service.id))
                                  ? 'bg-black border-black'
                                  : 'bg-white'
                              }`}>
                                {services.filter(service => service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())).length > 0 &&
                                 services.filter(service => service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())).every(service => selectedServicesForEdit.includes(service.id)) && (
                                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={services.filter(service => service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())).length > 0 &&
                                       services.filter(service => service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())).every(service => selectedServicesForEdit.includes(service.id))
                                ? handleDeselectAllServices
                                : handleSelectAllServices}
                              className="text-sm text-gray-700 hover:text-gray-900"
                            >
                              Select all
                            </button>
                            <span className="ml-2 text-sm text-gray-500">
                              {selectedServicesForEdit.length}/{services.length}
                            </span>
                          </div>

                                           {/* Services List */}
                          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                            {services
                              .filter(service => service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()))
                              .map((service) => (
                                                                 <div
                                   key={service.id}
                                   onClick={() => handleServiceToggleForEdit(service.id)}
                                   className="flex items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                                 >
                                  <div className="flex items-center mr-3">
                                    <div className={`h-4 w-4 rounded-sm border border-gray-300 flex items-center justify-center ${
                                      selectedServicesForEdit.includes(service.id)
                                        ? 'bg-black border-black'
                                        : 'bg-white'
                                    }`}>
                                      {selectedServicesForEdit.includes(service.id) && (
                                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center mr-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                      <span className="text-sm">{service.icon || '📋'}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{service.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {service.duration} mins · {service.price === 0 ? 'Free' : `$${service.price}`}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
               </div>

               {/* Modal Footer */}
               <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                 <button
                   onClick={handleCloseEditCategoryModal}
                   className="px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleUpdateCategory}
                   disabled={!editCategoryName.trim()}
                   className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                     editCategoryName.trim()
                       ? 'bg-black text-white hover:bg-gray-800'
                       : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                   }`}
                 >
                   Update
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }

function SortableServiceBlock({ 
  service, 
  onClick, 
  onDelete, 
  onDuplicate,
  onToggleHidden,
  onEdit,
  isHighlighted,
  serviceDropdownOpen,
  setServiceDropdownOpen
}: {
  service: Service;
  onClick: () => void;
  onDelete: () => void;
  onDuplicate: (serviceId: string) => void;
  onToggleHidden: (serviceId: string) => void;
  onEdit: (service: Service) => void;
  isHighlighted?: boolean;
  serviceDropdownOpen: string | null;
  setServiceDropdownOpen: (serviceId: string | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-md shadow-sm border transition-all hover:shadow-md ${
        isHighlighted ? 'border-yellow-300 border-l-4' : 'border-gray-200'
      } ${isDragging ? 'shadow-lg' : ''} ${service.isHidden ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center p-3">
        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className="mr-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        
        {/* Icon */}
        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-3">
          <span className="text-lg">{service.icon}</span>
        </div>

        {/* Service Details */}
        <div 
          className="flex-1 cursor-pointer"
          onClick={onClick}
        >
          <h3 className="font-medium text-gray-900 text-sm">{service.name}</h3>
          <p className="text-xs text-gray-500">
            {service.duration} mins · {service.price === 0 ? 'Free' : `$${service.price}`}
          </p>
          {/* Display multiple categories */}
          {service.categoryLinks && service.categoryLinks.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {service.categoryLinks.slice(0, 2).map((link, index) => (
                <span 
                  key={link.categoryId}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-black text-white"
                >
                  {link.category.name}
                </span>
              ))}
              {service.categoryLinks.length > 2 && (
                <span 
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 text-gray-700"
                  title={service.categoryLinks.slice(2).map(link => link.category.name).join(', ')}
                >
                  +{service.categoryLinks.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Team Member Profiles */}
        <div className="flex items-center mr-3">
          {service.teamLinks && service.teamLinks.length > 0 && (
            <div className="flex items-center -space-x-1">
              {service.teamLinks.slice(0, 2).map((link, index) => (
                <div
                  key={link.teamMemberId}
                  className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white"
                  title={link.teamMember.name}
                >
                  <span className="text-xs font-medium text-gray-700">
                    {link.teamMember.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ))}
              {service.teamLinks.length > 2 && (
                <div
                  className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white"
                  title={service.teamLinks.slice(2).map(link => link.teamMember.name).join(', ')}
                >
                  <span className="text-xs font-medium text-gray-600">
                    +{service.teamLinks.length - 2}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Three-dot Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setServiceDropdownOpen(serviceDropdownOpen === service.id ? null : service.id);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <MoreVertical className="h-3.5 w-3.5 text-gray-500" />
          </button>
          
          {/* Dropdown Menu */}
          {serviceDropdownOpen === service.id && (
            <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(service);
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-900 hover:bg-gray-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(service.id);
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-900 hover:bg-gray-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-900 hover:bg-gray-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHidden(service.id);
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-900 hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                  Set to hidden
                </div>
                <div className={`w-4 h-2 rounded-full transition-colors ${
                  service.isHidden ? 'bg-black' : 'bg-gray-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full bg-white transition-transform ${
                    service.isHidden ? 'translate-x-2' : 'translate-x-0'
                  }`}></div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

 