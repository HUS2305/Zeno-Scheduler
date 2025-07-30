"use client";

import { useState, useEffect } from "react";
import DateTimePicker from "./DateTimePicker";

interface Service {
  id: string;
  name: string;
  duration: number;
  price?: number;
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
  const [selectedProvider, setSelectedProvider] = useState<string>(booking.teamMember?.id || "");
  const [notes, setNotes] = useState(booking.note || "");
  const [videoLink, setVideoLink] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Date and time state
  const [currentDate, setCurrentDate] = useState(booking.date);
  const [currentTime, setCurrentTime] = useState(booking.time || "00:00");

  // Dropdown states
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [recurrenceDropdownOpen, setRecurrenceDropdownOpen] = useState(false);

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
        setRecurrenceDropdownOpen(false);
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
        providerId: selectedProvider || undefined,
        date: currentDate,
        time: currentTime,
        notes: notes.trim() || undefined,
        videoLink: videoLink.trim() || undefined,
        recurrence,
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

  const handleDeleteAppointment = async () => {
    if (!confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onAppointmentUpdated();
        onClose();
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

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  const getRecurrenceText = (value: string) => {
    switch (value) {
      case "none": return "Does not repeat";
      case "daily": return "Daily";
      case "weekly": return "Weekly";
      case "monthly": return "Monthly";
      default: return "Does not repeat";
    }
  };

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
                  <span className={selectedService ? "text-gray-900" : "text-gray-500"}>
                    {selectedService 
                      ? `${selectedServiceData?.name} (${selectedServiceData?.duration} min • $${selectedServiceData?.price || 0})`
                      : "Select a service"
                    }
                  </span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {serviceDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setSelectedService(service.id);
                          setServiceDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-gray-900 hover:bg-gray-50"
                      >
                        {service.name} ({service.duration} min • ${service.price || 0})
                      </button>
                    ))}
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

            {/* Recurrence */}
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              
              {/* Custom Recurrence Dropdown */}
              <div className="flex-1 relative dropdown-container">
                <button
                  onClick={() => setRecurrenceDropdownOpen(!recurrenceDropdownOpen)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-full text-xs text-left focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white flex items-center justify-between"
                >
                  <span className="text-gray-900">{getRecurrenceText(recurrence)}</span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {recurrenceDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                    {[
                      { value: "none", label: "Does not repeat" },
                      { value: "daily", label: "Daily" },
                      { value: "weekly", label: "Weekly" },
                      { value: "monthly", label: "Monthly" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setRecurrence(option.value);
                          setRecurrenceDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-gray-900 hover:bg-gray-50"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

            {/* Video Link */}
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <input
                type="text"
                placeholder="Add video link"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Notes */}
            <div className="flex items-start space-x-2">
              <svg className="w-3 h-3 text-gray-400 mt-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <textarea
                placeholder="Notes to provider and guest(s)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Provider */}
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs text-gray-900">hussain aljarrah</span>
            </div>
          </>
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 pb-6">
          <button
            onClick={handleDeleteAppointment}
            disabled={isDeleting}
            className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-xs font-medium"
          >
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
    </div>
  );
} 