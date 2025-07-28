"use client";

import { useState } from "react";
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
  description: string;
  icon: string;
  isActive: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "30 Minutes Meeting",
      duration: 30,
      price: 0,
      description: "Quick consultation and discussion",
      icon: "🌳",
      isActive: true,
    },
    {
      id: "2", 
      name: "1 Hour Meeting",
      duration: 60,
      price: 0,
      description: "Comprehensive consultation and planning",
      icon: "🌳",
      isActive: true,
    },
    {
      id: "3",
      name: "Consultation Call",
      duration: 45,
      price: 50,
      description: "Professional consultation and advice",
      icon: "📞",
      isActive: true,
    },
    {
      id: "4",
      name: "Strategy Session",
      duration: 90,
      price: 150,
      description: "In-depth strategy planning and analysis",
      icon: "🎯",
      isActive: true,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleUpdateService = (updatedService: Service) => {
    setServices(services.map(service => 
      service.id === updatedService.id ? updatedService : service
    ));
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const handleCreateService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: "New Service",
      duration: 30,
      price: 0,
      description: "Service description",
      icon: "🌳",
      isActive: true,
    };
    setServices([...services, newService]);
    setSelectedService(newService);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <p className="text-gray-600">Manage your business services</p>
      </div>

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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                isHighlighted={index === 1} // Highlight the second service like in the image
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Service Detail Modal */}
      {isModalOpen && selectedService && (
        <ServiceModal
          service={selectedService}
          onUpdate={handleUpdateService}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}

function SortableServiceBlock({ service, onClick, isHighlighted }: { 
  service: Service; 
  onClick: () => void;
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
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${
        isHighlighted ? 'border-yellow-300 border-l-4' : 'border-gray-200'
      } ${isDragging ? 'shadow-lg' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center p-4">
        {/* Drag Handle */}
        <div className="mr-3 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </div>
        
        {/* Icon */}
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
          <span className="text-lg">{service.icon}</span>
        </div>

        {/* Service Details */}
        <div className="flex-1">
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceModal({ service, onUpdate, onClose }: {
  service: Service;
  onUpdate: (service: Service) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(service);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Service</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 