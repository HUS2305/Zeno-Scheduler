"use client";

import { useState, useEffect } from "react";
import DateTimePicker from "./DateTimePicker";

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

// Helper function to get color values
const getColorValues = (colorName: string) => {
  const color = colorOptions.find(c => c.name === colorName);
  return color ? { main: color.value, light: color.light, medium: color.medium, dark: color.dark } : { main: "#3B82F6", light: "#DBEAFE", medium: "#93C5FD", dark: "#1E40AF" };
};

interface Service {
  id: string;
  name: string;
  duration: number;
  price?: number;
  colorTheme?: string;
  teamLinks?: {
    teamMember: {
      id: string;
      name: string;
    };
  }[];
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Booking {
  id: string;
  date: Date;
  time?: string;
  service: {
    id: string;
    name: string;
    duration: number;
    price?: number;
    colorTheme?: string;
  };
  user: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  teamMember?: {
    id: string;
    name: string;
  };
  note?: string;
}

interface AppointmentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onAppointmentUpdated: () => void;
}

export default function AppointmentEditModal({
  isOpen,
  onClose,
  booking,
  onAppointmentUpdated,
}: AppointmentEditModalProps) {
  
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedService, setSelectedService] = useState<string>(booking.service.id);
  const [selectedCustomer, setSelectedCustomer] = useState<string>(booking.user.id);

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Date and time state
  const [currentDate, setCurrentDate] = useState(booking.date);
  const [currentTime, setCurrentTime] = useState(booking.time || "00:00");

  // Dropdown states
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);

  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch services and customers on mount
  useEffect(() => {
    if (isOpen) {
      fetchServices();
      fetchCustomers();
      // Reset date and time to the booking's values
      setCurrentDate(booking.date);
      setCurrentTime(booking.time || "00:00");
    }
  }, [isOpen, booking.date, booking.time]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.dropdown-container')) {
        setServiceDropdownOpen(false);
        setCustomerDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleUpdateAppointment = async () => {
    if (!selectedService || !selectedCustomer) {
      alert("Please select a service and customer");
      return;
    }

    setIsLoading(true);
    try {
      const appointmentData = {
        serviceId: selectedService,
        customerId: selectedCustomer,
        date: currentDate,
        time: currentTime,
      };

      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        onAppointmentUpdated();
        onClose();
        // Dispatch event to update stats
        console.log("Dispatching appointment-changed event from AppointmentEditModal (update)");
        window.dispatchEvent(new CustomEvent('appointment-changed'));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAppointment = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onAppointmentUpdated();
        onClose();
        setShowDeleteModal(false);
        // Dispatch event to update stats
        console.log("Dispatching appointment-changed event from AppointmentEditModal (delete)");
        window.dispatchEvent(new CustomEvent('appointment-changed'));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete appointment");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Failed to delete appointment");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h2 className="text-base font-semibold text-gray-900">Edit Appointment</h2>
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
          <>
            {/* Service Selection */}
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              
              {/* Custom Service Dropdown */}
              <div className="flex-1 relative dropdown-container">
                <button
                  onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-full text-xs text-left focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white flex items-center justify-between"
                >
                  <div className="flex items-center">
                    {selectedServiceData && (
                      <div
                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                        style={{ backgroundColor: getColorValues(selectedServiceData.colorTheme || "blue").main }}
                      ></div>
                    )}
                    <span className={selectedService ? "text-gray-900" : "text-gray-500"}>
                      {selectedService 
                        ? `${selectedServiceData?.name} (${selectedServiceData?.duration} min • $${selectedServiceData?.price || 0})`
                        : "Select a service"
                      }
                    </span>
                  </div>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {serviceDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                    {services.map((service) => {
                      const colors = getColorValues(service.colorTheme || "blue");
                      return (
                        <button
                          key={service.id}
                          onClick={() => {
                            setSelectedService(service.id);
                            setServiceDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-gray-900 hover:bg-gray-50 flex items-center"
                        >
                          <div
                            className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                            style={{ backgroundColor: colors.main }}
                          ></div>
                          {service.name} ({service.duration} min • ${service.price || 0})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <DateTimePicker
                selectedDate={currentDate}
                selectedTime={currentTime}
                onDateChange={setCurrentDate}
                onTimeChange={setCurrentTime}
                className="flex-1"
              />
            </div>



            {/* Attendees */}
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              
              {/* Custom Customer Dropdown */}
              <div className="flex-1 relative dropdown-container">
                <button
                  onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-full text-xs text-left focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white flex items-center justify-between"
                >
                  <span className={selectedCustomer ? "text-gray-900" : "text-gray-500"}>
                    {selectedCustomer 
                      ? `${selectedCustomerData?.name} ${selectedCustomerData?.email ? `(${selectedCustomerData.email})` : ''}`
                      : "Select a customer"
                    }
                  </span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {customerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                    {customers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer.id);
                          setCustomerDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-gray-900 hover:bg-gray-50"
                      >
                        {customer.name} {customer.email ? `(${customer.email})` : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>






          </>
        </div>

                 {/* Footer */}
         <div className="flex justify-between px-6 pb-6">
           <button
             onClick={handleDeleteAppointment}
             disabled={isDeleting}
             className="px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed text-xs font-medium flex items-center"
           >
             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
             </svg>
             {isDeleting ? "Deleting..." : "Delete"}
           </button>
          <button
            onClick={handleUpdateAppointment}
            disabled={isLoading || !selectedService || !selectedCustomer}
            className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-xs font-medium"
          >
            {isLoading ? "Updating..." : "Update"}
          </button>
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
                Delete Appointment?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                You'll permanently delete this appointment. This action cannot be undone.
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
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 