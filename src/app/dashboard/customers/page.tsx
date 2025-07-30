"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import AppointmentModal from "@/components/dashboard/AppointmentModal";

interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  country?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: string;
  bookings: Array<{
    id: string;
    date: string;
    service: {
      name: string;
      duration: number;
      price?: number;
    };
    teamMember?: {
      name: string;
    };
  }>;
}

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    address: "",
    city: "",
    state: "",
    zipCode: ""
  });
  const [originalCustomerData, setOriginalCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    address: "",
    city: "",
    state: "",
    zipCode: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState<string | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState("");

  // Check if form has been modified
  const hasChanges = () => {
    return JSON.stringify(newCustomer) !== JSON.stringify(originalCustomerData);
  };

  // Add validation function
  const isFormValid = () => {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Full name is mandatory
    if (newCustomer.name.trim() === "") {
      return false;
    }
    
    // If email is provided, it must be valid
    if (newCustomer.email.trim() !== "" && !emailRegex.test(newCustomer.email.trim())) {
      return false;
    }
    
    // If phone is provided, it must have actual number (not just country code)
    if (newCustomer.phone && newCustomer.phone.length <= 5) {
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    fetchCustomers();
  }, [session, status, router]);

  // Close dropdown when clicking outside
              useEffect(() => {
              const handleClickOutside = (event: MouseEvent) => {
                if (customerDropdownOpen && !(event.target as Element).closest('.relative')) {
                  setCustomerDropdownOpen(null);
                }
              };

              document.addEventListener('mousedown', handleClickOutside);
              return () => {
                document.removeEventListener('mousedown', handleClickOutside);
              };
            }, [customerDropdownOpen]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
        // Auto-select first customer if available
        if (data.length > 0 && !selectedCustomer) {
          setSelectedCustomer(data[0]);
        }
      } else {
        console.error("Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      });

             if (response.ok) {
         setShowAddModal(false);
         setNewCustomer({ name: "", email: "", phone: "", company: "", country: "", address: "", city: "", state: "", zipCode: "" });
         fetchCustomers(); // Refresh the list
       } else {
        const error = await response.json();
        alert(error.error || "Failed to create customer");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("Failed to create customer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/customers/${selectedCustomer?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      });

      if (response.ok) {
        const updatedCustomer = await response.json();
        
        // Update the selected customer with the new data
        setSelectedCustomer(updatedCustomer);
        
        setShowAddModal(false);
        setIsEditing(false);
        setNewCustomer({ name: "", email: "", phone: "", company: "", country: "", address: "", city: "", state: "", zipCode: "" });
        fetchCustomers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update customer");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = () => {
    if (selectedCustomer) {
      const customerData = {
        name: selectedCustomer.name || "",
        email: selectedCustomer.email || "",
        phone: selectedCustomer.phone || "",
        company: selectedCustomer.company || "",
        country: selectedCustomer.country || "",
        address: selectedCustomer.address || "",
        city: selectedCustomer.city || "",
        state: selectedCustomer.state || "",
        zipCode: selectedCustomer.zipCode || ""
      };
      setNewCustomer(customerData);
      setOriginalCustomerData(customerData);
      setIsEditing(true);
      setShowAddModal(true);
    }
  };

  const handleSaveAndClose = async () => {
    setShowUnsavedChangesModal(false);
    await handleEditCustomer(new Event('submit') as any);
  };

  const handleDiscardAndClose = () => {
    setShowUnsavedChangesModal(false);
    setShowAddModal(false);
    setIsEditing(false);
    setNewCustomer({ name: "", email: "", phone: "", company: "", country: "", address: "", city: "", state: "", zipCode: "" });
  };

  const handleCloseUnsavedModal = () => {
    setShowUnsavedChangesModal(false);
  };

  const handleAddPhoneClick = () => {
    if (selectedCustomer) {
      const customerData = {
        name: selectedCustomer.name || "",
        email: selectedCustomer.email || "",
        phone: "", // Clear phone to focus on adding it
        company: selectedCustomer.company || "",
        country: selectedCustomer.country || "",
        address: selectedCustomer.address || "",
        city: selectedCustomer.city || "",
        state: selectedCustomer.state || "",
        zipCode: selectedCustomer.zipCode || ""
      };
      setNewCustomer(customerData);
      setOriginalCustomerData(customerData);
      setIsEditing(true);
      setShowAddModal(true);
    }
  };

  const handleAddEmailClick = () => {
    if (selectedCustomer) {
      const customerData = {
        name: selectedCustomer.name || "",
        email: "", // Clear email to focus on adding it
        phone: selectedCustomer.phone || "",
        company: selectedCustomer.company || "",
        country: selectedCustomer.country || "",
        address: selectedCustomer.address || "",
        city: selectedCustomer.city || "",
        state: selectedCustomer.state || "",
        zipCode: selectedCustomer.zipCode || ""
      };
      setNewCustomer(customerData);
      setOriginalCustomerData(customerData);
      setIsEditing(true);
      setShowAddModal(true);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    
    try {
      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setCustomerDropdownOpen(null);
        setSelectedCustomer(null);
        fetchCustomers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer");
    }
  };

  const handleBookAppointment = () => {
    if (selectedCustomer) {
      // Set today's date as default
      const today = new Date();
      setSelectedDate(today);
      setSelectedTime("09:00"); // Default time
      setShowAppointmentModal(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Free";
    return `$${price}`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left Panel - Customer List */}
      <div className="w-1/4 border-r border-gray-200 bg-white">
        <div className="p-6">
                     <div className="mb-6">
             <div>
               <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
               <p className="text-sm text-gray-600 mt-1">Manage your customer relationships and view booking history.</p>
             </div>
           </div>

                                {/* Filter Tabs */}
           <div className="flex items-center justify-between mb-3">
             <div className="flex space-x-3">
               <button className="text-xs font-medium text-black border-b-2 border-black pb-1">
                 All
               </button>
             </div>
             <button
               onClick={() => setShowAddModal(true)}
               className="w-6 h-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center"
             >
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
               </svg>
             </button>
           </div>

                     {/* Search */}
           <div className="mb-3">
             <div className="relative">
               <svg className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
               <input
                 type="text"
                 placeholder="Search"
                 className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-xs"
               />
             </div>
           </div>

                     {/* Customer List */}
           <div className="space-y-1.5">
             {customers.length === 0 ? (
               <div className="text-center py-6">
                 <p className="text-gray-500 mb-2 text-xs">No customers yet</p>
                 <button
                   onClick={() => setShowAddModal(true)}
                   className="px-2.5 py-1 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-xs"
                 >
                   Add Customer
                 </button>
               </div>
             ) : (
               customers.map((customer) => (
                 <div
                   key={customer.id}
                   onClick={() => setSelectedCustomer(customer)}
                   className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                     selectedCustomer?.id === customer.id
                       ? 'bg-gray-100'
                       : 'hover:bg-gray-50'
                   }`}
                 >
                   <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                     <span className="text-xs font-medium text-gray-700">
                       {(customer.name || customer.email).charAt(0).toUpperCase()}
                     </span>
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-xs font-medium text-gray-900 truncate">
                       {customer.name || "No name"}
                     </p>
                     <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                   </div>
                   
                 </div>
               ))
             )}
           </div>
        </div>
      </div>

      {/* Right Panel - Customer Details */}
      <div className="flex-1 bg-gray-50">
        {selectedCustomer ? (
          <div className="h-full">
                         {/* Customer Header */}
             <div className="bg-white border-b border-gray-200 p-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                   <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                     <span className="text-lg font-medium text-gray-700">
                       {(selectedCustomer.name || selectedCustomer.email).charAt(0).toUpperCase()}
                     </span>
                   </div>
                   <div>
                     <h2 className="text-base font-semibold text-gray-900">
                       {selectedCustomer.name || "No name"}
                     </h2>
                   </div>
                 </div>
                                   <div className="flex items-center space-x-2">
                                                     <div className="relative">
                <button
                  onClick={() => setCustomerDropdownOpen(customerDropdownOpen === selectedCustomer.id ? null : selectedCustomer.id)}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg className="h-3.5 w-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {customerDropdownOpen === selectedCustomer.id && (
                  <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                    <button
                      onClick={handleEditClick}
                      className="w-full text-left px-3 py-2 text-xs text-gray-900 hover:bg-gray-50 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteModal(true);
                        setCustomerDropdownOpen(null);
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
                   <button 
                     onClick={handleBookAppointment}
                     className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                   >
                     Book appointment
                   </button>
                 </div>
               </div>
             </div>

                         {/* Tabs */}
             <div className="bg-white border-b border-gray-200">
               <div className="flex space-x-6 px-4">
                 <button className="text-xs font-medium text-black border-b-2 border-black py-3">
                   About
                 </button>
                 <button className="text-xs font-medium text-gray-600 hover:text-gray-800 py-3">
                   Notes
                 </button>
                 <button className="text-xs font-medium text-gray-600 hover:text-gray-800 py-3">
                   Appointments
                 </button>
                 <button className="text-xs font-medium text-gray-600 hover:text-gray-800 py-3">
                   Updates
                 </button>
               </div>
             </div>

                                                   {/* Content */}
                             <div className="p-4">
                 <div className="space-y-4">
                   {/* Phone */}
                   <div className="flex items-center space-x-3 text-xs">
                     <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                     </svg>
                     {selectedCustomer.phone && selectedCustomer.phone.trim() !== "" ? (
                       <span className="text-gray-900">{selectedCustomer.phone}</span>
                     ) : (
                       <span 
                         onClick={handleAddPhoneClick}
                         className="text-gray-600 underline cursor-pointer hover:text-gray-800"
                       >
                         Add phone
                       </span>
                     )}
                   </div>
                   
                   {/* Email */}
                   <div className="flex items-center space-x-3 text-xs">
                     <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                     </svg>
                     {selectedCustomer.email && selectedCustomer.email.trim() !== "" ? (
                       <span className="text-gray-900">{selectedCustomer.email}</span>
                     ) : (
                       <span 
                         onClick={handleAddEmailClick}
                         className="text-gray-600 underline cursor-pointer hover:text-gray-800"
                       >
                         Add email
                       </span>
                     )}
                   </div>
                   
                   {/* Company - only show if exists */}
                   {selectedCustomer.company && selectedCustomer.company.trim() !== "" && (
                     <div className="flex items-center space-x-3 text-xs">
                       <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                       </svg>
                       <span className="text-gray-900">{selectedCustomer.company}</span>
                     </div>
                   )}
                   
                                      {/* Address - only show if exists */}
                    {(selectedCustomer.address || selectedCustomer.city || selectedCustomer.state || selectedCustomer.zipCode) && (
                      <div className="flex items-center space-x-3 text-xs">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-900">
                          {[
                            selectedCustomer.address,
                            selectedCustomer.city,
                            selectedCustomer.state,
                            selectedCustomer.zipCode
                          ].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                 </div>
               </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-3 text-sm">Select a customer to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 relative">
                                                   <button
                onClick={() => {
                  if (isEditing && hasChanges()) {
                    setShowUnsavedChangesModal(true);
                  } else {
                    setShowAddModal(false);
                    setIsEditing(false);
                    setNewCustomer({ name: "", email: "", phone: "", company: "", country: "", address: "", city: "", state: "", zipCode: "" });
                  }
                }}
                className="absolute top-4 right-4 text-black hover:text-gray-700 transition-colors z-10"
              >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
                         <div className="p-6">
               <h3 className="text-base font-semibold text-gray-900 mb-4">
                 {isEditing ? "Edit customer" : "Add customer"}
               </h3>
              
              <div className="flex gap-8 max-h-96 overflow-hidden">
                {/* Left Section - Profile Picture and Name */}
                <div className="w-1/4 flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {newCustomer.name}
                    </p>
                  </div>
                </div>
                
                                 {/* Right Section - Form Fields */}
                 <div className="w-3/4 overflow-y-auto pr-2 pl-4">
                   <form onSubmit={isEditing ? handleEditCustomer : handleAddCustomer} className="space-y-8">
                    {/* Main details section */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Main details</h4>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="name" className="block text-xs text-gray-700 mb-1">
                            Full name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                            placeholder="Enter name"
                            required
                          />
                        </div>
                        
                                                 <div>
                           <label htmlFor="phone" className="block text-xs text-gray-700 mb-1">
                             Primary phone
                           </label>
                          <PhoneInput
                            international
                            defaultCountry="DK"
                            value={newCustomer.phone}
                            onChange={(value) => setNewCustomer({ ...newCustomer, phone: value || "" })}
                            className="w-full"
                            style={{
                              '--PhoneInputCountryFlag-borderColor': 'transparent',
                              '--PhoneInputCountryFlag-borderWidth': '0',
                            } as React.CSSProperties}
                          />
                        </div>
                        
                                                 <div>
                           <label htmlFor="email" className="block text-xs text-gray-700 mb-1">
                             Primary email
                           </label>
                                                     <input
                             type="email"
                             id="email"
                             value={newCustomer.email}
                             onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                             className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                             placeholder="Enter email address"
                           />
                        </div>
                        
                                                 <div>
                           <label htmlFor="company" className="block text-xs text-gray-700 mb-1">
                             Company name
                           </label>
                           <input
                             type="text"
                             id="company"
                             value={newCustomer.company}
                             onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
                             className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                             placeholder="Enter company name"
                           />
                         </div>
                      </div>
                    </div>
                    
                    {/* Address section */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Address</h4>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="country" className="block text-xs text-gray-700 mb-1">
                            Country
                          </label>
                                                     <select 
                             value={newCustomer.country}
                             onChange={(e) => setNewCustomer({ ...newCustomer, country: e.target.value })}
                             className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-xs text-gray-900"
                           >
                            <option value="">Select a country</option>
                            <option value="AF">Afghanistan</option>
                            <option value="AL">Albania</option>
                            <option value="DZ">Algeria</option>
                            <option value="AS">American Samoa</option>
                            <option value="AD">Andorra</option>
                            <option value="AO">Angola</option>
                            <option value="AI">Anguilla</option>
                            <option value="AQ">Antarctica</option>
                            <option value="AG">Antigua and Barbuda</option>
                            <option value="AR">Argentina</option>
                            <option value="AM">Armenia</option>
                            <option value="AW">Aruba</option>
                            <option value="AU">Australia</option>
                            <option value="AT">Austria</option>
                            <option value="AZ">Azerbaijan</option>
                            <option value="BS">Bahamas</option>
                            <option value="BH">Bahrain</option>
                            <option value="BD">Bangladesh</option>
                            <option value="BB">Barbados</option>
                            <option value="BY">Belarus</option>
                            <option value="BE">Belgium</option>
                            <option value="BZ">Belize</option>
                            <option value="BJ">Benin</option>
                            <option value="BM">Bermuda</option>
                            <option value="BT">Bhutan</option>
                            <option value="BO">Bolivia</option>
                            <option value="BA">Bosnia and Herzegovina</option>
                            <option value="BW">Botswana</option>
                            <option value="BV">Bouvet Island</option>
                            <option value="BR">Brazil</option>
                            <option value="IO">British Indian Ocean Territory</option>
                            <option value="BN">Brunei Darussalam</option>
                            <option value="BG">Bulgaria</option>
                            <option value="BF">Burkina Faso</option>
                            <option value="BI">Burundi</option>
                            <option value="KH">Cambodia</option>
                            <option value="CM">Cameroon</option>
                            <option value="CA">Canada</option>
                            <option value="CV">Cape Verde</option>
                            <option value="KY">Cayman Islands</option>
                            <option value="CF">Central African Republic</option>
                            <option value="TD">Chad</option>
                            <option value="CL">Chile</option>
                            <option value="CN">China</option>
                            <option value="CX">Christmas Island</option>
                            <option value="CC">Cocos (Keeling) Islands</option>
                            <option value="CO">Colombia</option>
                            <option value="KM">Comoros</option>
                            <option value="CG">Congo</option>
                            <option value="CD">Congo, the Democratic Republic of the</option>
                            <option value="CK">Cook Islands</option>
                            <option value="CR">Costa Rica</option>
                            <option value="CI">Côte d'Ivoire</option>
                            <option value="HR">Croatia</option>
                            <option value="CU">Cuba</option>
                            <option value="CY">Cyprus</option>
                            <option value="CZ">Czech Republic</option>
                            <option value="DK">Denmark</option>
                            <option value="DJ">Djibouti</option>
                            <option value="DM">Dominica</option>
                            <option value="DO">Dominican Republic</option>
                            <option value="EC">Ecuador</option>
                            <option value="EG">Egypt</option>
                            <option value="SV">El Salvador</option>
                            <option value="GQ">Equatorial Guinea</option>
                            <option value="ER">Eritrea</option>
                            <option value="EE">Estonia</option>
                            <option value="ET">Ethiopia</option>
                            <option value="FK">Falkland Islands (Malvinas)</option>
                            <option value="FO">Faroe Islands</option>
                            <option value="FJ">Fiji</option>
                            <option value="FI">Finland</option>
                            <option value="FR">France</option>
                            <option value="GF">French Guiana</option>
                            <option value="PF">French Polynesia</option>
                            <option value="TF">French Southern Territories</option>
                            <option value="GA">Gabon</option>
                            <option value="GM">Gambia</option>
                            <option value="GE">Georgia</option>
                            <option value="DE">Germany</option>
                            <option value="GH">Ghana</option>
                            <option value="GI">Gibraltar</option>
                            <option value="GR">Greece</option>
                            <option value="GL">Greenland</option>
                            <option value="GD">Grenada</option>
                            <option value="GP">Guadeloupe</option>
                            <option value="GU">Guam</option>
                            <option value="GT">Guatemala</option>
                            <option value="GG">Guernsey</option>
                            <option value="GN">Guinea</option>
                            <option value="GW">Guinea-Bissau</option>
                            <option value="GY">Guyana</option>
                            <option value="HT">Haiti</option>
                            <option value="HM">Heard Island and McDonald Islands</option>
                            <option value="VA">Holy See (Vatican City State)</option>
                            <option value="HN">Honduras</option>
                            <option value="HK">Hong Kong</option>
                            <option value="HU">Hungary</option>
                            <option value="IS">Iceland</option>
                            <option value="IN">India</option>
                            <option value="ID">Indonesia</option>
                            <option value="IR">Iran, Islamic Republic of</option>
                            <option value="IQ">Iraq</option>
                            <option value="IE">Ireland</option>
                            <option value="IM">Isle of Man</option>
                            <option value="IL">Israel</option>
                            <option value="IT">Italy</option>
                            <option value="JM">Jamaica</option>
                            <option value="JP">Japan</option>
                            <option value="JE">Jersey</option>
                            <option value="JO">Jordan</option>
                            <option value="KZ">Kazakhstan</option>
                            <option value="KE">Kenya</option>
                            <option value="KI">Kiribati</option>
                            <option value="KP">Korea, Democratic People's Republic of</option>
                            <option value="KR">Korea, Republic of</option>
                            <option value="KW">Kuwait</option>
                            <option value="KG">Kyrgyzstan</option>
                            <option value="LA">Lao People's Democratic Republic</option>
                            <option value="LV">Latvia</option>
                            <option value="LB">Lebanon</option>
                            <option value="LS">Lesotho</option>
                            <option value="LR">Liberia</option>
                            <option value="LY">Libyan Arab Jamahiriya</option>
                            <option value="LI">Liechtenstein</option>
                            <option value="LT">Lithuania</option>
                            <option value="LU">Luxembourg</option>
                            <option value="MO">Macao</option>
                            <option value="MK">Macedonia, the former Yugoslav Republic of</option>
                            <option value="MG">Madagascar</option>
                            <option value="MW">Malawi</option>
                            <option value="MY">Malaysia</option>
                            <option value="MV">Maldives</option>
                            <option value="ML">Mali</option>
                            <option value="MT">Malta</option>
                            <option value="MH">Marshall Islands</option>
                            <option value="MQ">Martinique</option>
                            <option value="MR">Mauritania</option>
                            <option value="MU">Mauritius</option>
                            <option value="YT">Mayotte</option>
                            <option value="MX">Mexico</option>
                            <option value="FM">Micronesia, Federated States of</option>
                            <option value="MD">Moldova, Republic of</option>
                            <option value="MC">Monaco</option>
                            <option value="MN">Mongolia</option>
                            <option value="ME">Montenegro</option>
                            <option value="MS">Montserrat</option>
                            <option value="MA">Morocco</option>
                            <option value="MZ">Mozambique</option>
                            <option value="MM">Myanmar</option>
                            <option value="NA">Namibia</option>
                            <option value="NR">Nauru</option>
                            <option value="NP">Nepal</option>
                            <option value="NL">Netherlands</option>
                            <option value="NC">New Caledonia</option>
                            <option value="NZ">New Zealand</option>
                            <option value="NI">Nicaragua</option>
                            <option value="NE">Niger</option>
                            <option value="NG">Nigeria</option>
                            <option value="NU">Niue</option>
                            <option value="NF">Norfolk Island</option>
                            <option value="MP">Northern Mariana Islands</option>
                            <option value="NO">Norway</option>
                            <option value="OM">Oman</option>
                            <option value="PK">Pakistan</option>
                            <option value="PW">Palau</option>
                            <option value="PS">Palestinian Territory, Occupied</option>
                            <option value="PA">Panama</option>
                            <option value="PG">Papua New Guinea</option>
                            <option value="PY">Paraguay</option>
                            <option value="PE">Peru</option>
                            <option value="PH">Philippines</option>
                            <option value="PN">Pitcairn</option>
                            <option value="PL">Poland</option>
                            <option value="PT">Portugal</option>
                            <option value="PR">Puerto Rico</option>
                            <option value="QA">Qatar</option>
                            <option value="RE">Réunion</option>
                            <option value="RO">Romania</option>
                            <option value="RU">Russian Federation</option>
                            <option value="RW">Rwanda</option>
                            <option value="BL">Saint Barthélemy</option>
                            <option value="SH">Saint Helena</option>
                            <option value="KN">Saint Kitts and Nevis</option>
                            <option value="LC">Saint Lucia</option>
                            <option value="MF">Saint Martin (French part)</option>
                            <option value="PM">Saint Pierre and Miquelon</option>
                            <option value="VC">Saint Vincent and the Grenadines</option>
                            <option value="WS">Samoa</option>
                            <option value="SM">San Marino</option>
                            <option value="ST">Sao Tome and Principe</option>
                            <option value="SA">Saudi Arabia</option>
                            <option value="SN">Senegal</option>
                            <option value="RS">Serbia</option>
                            <option value="SC">Seychelles</option>
                            <option value="SL">Sierra Leone</option>
                            <option value="SG">Singapore</option>
                            <option value="SK">Slovakia</option>
                            <option value="SI">Slovenia</option>
                            <option value="SB">Solomon Islands</option>
                            <option value="SO">Somalia</option>
                            <option value="ZA">South Africa</option>
                            <option value="GS">South Georgia and the South Sandwich Islands</option>
                            <option value="ES">Spain</option>
                            <option value="LK">Sri Lanka</option>
                            <option value="SD">Sudan</option>
                            <option value="SR">Suriname</option>
                            <option value="SJ">Svalbard and Jan Mayen</option>
                            <option value="SZ">Swaziland</option>
                            <option value="SE">Sweden</option>
                            <option value="CH">Switzerland</option>
                            <option value="SY">Syrian Arab Republic</option>
                            <option value="TW">Taiwan, Province of China</option>
                            <option value="TJ">Tajikistan</option>
                            <option value="TZ">Tanzania, United Republic of</option>
                            <option value="TH">Thailand</option>
                            <option value="TL">Timor-Leste</option>
                            <option value="TG">Togo</option>
                            <option value="TK">Tokelau</option>
                            <option value="TO">Tonga</option>
                            <option value="TT">Trinidad and Tobago</option>
                            <option value="TN">Tunisia</option>
                            <option value="TR">Turkey</option>
                            <option value="TM">Turkmenistan</option>
                            <option value="TC">Turks and Caicos Islands</option>
                            <option value="TV">Tuvalu</option>
                            <option value="UG">Uganda</option>
                            <option value="UA">Ukraine</option>
                            <option value="AE">United Arab Emirates</option>
                            <option value="GB">United Kingdom</option>
                            <option value="US">United States</option>
                            <option value="UM">United States Minor Outlying Islands</option>
                            <option value="UY">Uruguay</option>
                            <option value="UZ">Uzbekistan</option>
                            <option value="VU">Vanuatu</option>
                            <option value="VE">Venezuela</option>
                            <option value="VN">Viet Nam</option>
                            <option value="VG">Virgin Islands, British</option>
                            <option value="VI">Virgin Islands, U.S.</option>
                            <option value="WF">Wallis and Futuna</option>
                            <option value="EH">Western Sahara</option>
                            <option value="YE">Yemen</option>
                            <option value="ZM">Zambia</option>
                            <option value="ZW">Zimbabwe</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="address" className="block text-xs text-gray-700 mb-1">
                            Address
                          </label>
                                                     <input
                             type="text"
                             id="address"
                             value={newCustomer.address}
                             onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                             className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                             placeholder="Enter street name, apt, suite, floor"
                           />
                        </div>
                        
                        <div>
                          <label htmlFor="city" className="block text-xs text-gray-700 mb-1">
                            City
                          </label>
                                                     <input
                             type="text"
                             id="city"
                             value={newCustomer.city}
                             onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                             className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                             placeholder="Enter city"
                           />
                        </div>
                        
                        <div>
                          <label htmlFor="state" className="block text-xs text-gray-700 mb-1">
                            State
                          </label>
                                                     <input
                             type="text"
                             id="state"
                             value={newCustomer.state}
                             onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                             className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                             placeholder="Enter state"
                           />
                        </div>
                        
                        <div>
                          <label htmlFor="zipCode" className="block text-xs text-gray-700 mb-1">
                            Zip code
                          </label>
                                                     <input
                             type="text"
                             id="zipCode"
                             value={newCustomer.zipCode}
                             onChange={(e) => setNewCustomer({ ...newCustomer, zipCode: e.target.value })}
                             className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                             placeholder="Enter zip code"
                           />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            {/* Bottom Action Bar */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end items-center rounded-b-xl">
              <div className="flex items-center space-x-3">
                                                                                                                                       <button
                     type="button"
                     onClick={() => {
                       if (isEditing && hasChanges()) {
                         setShowUnsavedChangesModal(true);
                       } else {
                         setShowAddModal(false);
                         setIsEditing(false);
                         setNewCustomer({ name: "", email: "", phone: "", company: "", country: "", address: "", city: "", state: "", zipCode: "" });
                       }
                     }}
                     className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                   >
                     Cancel
                   </button>
                                 <button
                   onClick={isEditing ? handleEditCustomer : handleAddCustomer}
                   disabled={submitting || !isFormValid()}
                   className={`px-4 py-1.5 rounded-md transition-colors text-sm ${
                     isFormValid() 
                       ? 'bg-black text-white hover:bg-gray-800' 
                       : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                   } disabled:opacity-50`}
                 >
                   {submitting ? "Saving..." : (isEditing ? "Update" : "Save")}
                 </button>
              </div>
            </div>
                     </div>
         </div>
       )}

               {/* Unsaved Changes Modal */}
        {showUnsavedChangesModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 relative">
              <button
                onClick={handleCloseUnsavedModal}
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
                    onClick={handleDiscardAndClose}
                    className="px-2 py-1 text-gray-600 hover:text-gray-800 transition-colors text-xs font-medium"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveAndClose}
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
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="absolute top-4 right-4 text-black hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 mt-0">
                      Delete Customer?
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      You'll permanently delete "{selectedCustomer?.name || 'this customer'}". This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteCustomer}
                        className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appointment Modal */}
            {showAppointmentModal && (
              <AppointmentModal
                isOpen={showAppointmentModal}
                onClose={() => setShowAppointmentModal(false)}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                preSelectedCustomer={selectedCustomer?.id}
                onAppointmentCreated={() => {
                  setShowAppointmentModal(false);
                  // Optionally refresh customer data to show new appointments
                }}
              />
            )}
     </div>
   );
 } 