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
  categoryId?: string;
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

  // Update category counts when services change
  useEffect(() => {
    if (categories.length > 0) {
      const updatedCategories = categories.map(category => ({
        ...category,
        serviceCount: services.filter(service => service.categoryId === category.id).length
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
        // Fallback to mock data
        const mockCategories: Category[] = [
          { id: "1", name: "Consultations", serviceCount: 0 },
          { id: "2", name: "Meetings", serviceCount: 0 },
          { id: "3", name: "Training", serviceCount: 0 },
        ];
        setCategories(mockCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to mock data
      const mockCategories: Category[] = [
        { id: "1", name: "Consultations", serviceCount: 0 },
        { id: "2", name: "Meetings", serviceCount: 0 },
        { id: "3", name: "Training", serviceCount: 0 },
      ];
      setCategories(mockCategories);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || service.categoryId === selectedCategory;
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

  const handleCreateCategory = async () => {
    const categoryName = prompt("Enter category name:");
    if (!categoryName || !categoryName.trim()) return;

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: categoryName.trim() }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories(prev => [...prev, newCategory]);
      } else {
        setError("Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      setError("Failed to create category");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? Services in this category will be unassigned.")) {
      return;
    }

    try {
      const response = await fetch(`/api/categories?id=${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        if (selectedCategory === categoryId) {
          setSelectedCategory(null);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setError("Failed to delete category");
    }
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Services & classes</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service categories ({categories.length})</h2>
            
            {/* Category Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900 text-sm"
              />
            </div>

            {/* Categories List */}
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{category.name}</span>
                        <span className="text-xs text-gray-500">({category.serviceCount})</span>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                      className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Category */}
            <button 
              onClick={handleCreateCategory}
              className="w-full mt-4 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              + New service category
            </button>
          </div>
        </div>

        {/* Services List */}
        <div className="lg:col-span-2">
          {/* Category Header */}
          {selectedCategory && (
            <div className="mb-4">
              {(() => {
                const category = categories.find(cat => cat.id === selectedCategory);
                const categoryServices = services.filter(service => service.categoryId === selectedCategory);
                return (
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category?.name} ({categoryServices.length})
                  </h3>
                );
              })()}
            </div>
          )}

          {/* Search and Create Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900"
                />
              </div>
            </div>
            <button
              onClick={handleCreateService}
              className="ml-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Service
            </button>
          </div>

          {/* Services List */}
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No services found</p>
              <button
                onClick={handleCreateService}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                <div className="space-y-3">
                  {filteredServices.map((service, index) => (
                    <SortableServiceBlock
                      key={service.id}
                      service={service}
                      onClick={() => handleServiceClick(service)}
                      onDelete={() => handleDeleteService(service.id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
            <button
              onClick={handleCancelDelete}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Service
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this service? This action cannot be undone.
              </p>
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

function SortableServiceBlock({ service, onClick, onDelete, isHighlighted }: {
  service: Service;
  onClick: () => void;
  onDelete: () => void;
  isHighlighted?: boolean;
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
      className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
        isHighlighted ? 'border-yellow-300 border-l-4' : 'border-gray-200'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-center p-4">
        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className="mr-3 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        
        {/* Icon */}
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
          <span className="text-lg">{service.icon}</span>
        </div>

        {/* Service Details */}
        <div 
          className="flex-1 cursor-pointer"
          onClick={onClick}
        >
          <h3 className="font-medium text-gray-900">{service.name}</h3>
          <p className="text-sm text-gray-500">
            {service.duration} mins · {service.price === 0 ? 'Free' : `$${service.price}`}
          </p>
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Users className="h-4 w-4 text-gray-500" />
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Share className="h-4 w-4 text-gray-500" />
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Link className="h-4 w-4 text-gray-500" />
          </button>
          <button 
            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

 