"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

// Settings categories data
const settingsCategories = [
  {
    id: "brand",
    name: "Your brand",
  },
  {
    id: "profile",
    name: "Your profile",
  },
  {
    id: "team",
    name: "Your team",
  },
  {
    id: "services",
    name: "Services",
  },
  {
    id: "general",
    name: "General",
  },
];

const manageCategories = [
  {
    id: "booking-page",
    name: "Booking Page",
    hasDropdown: true,
  },
  {
    id: "branded-app",
    name: "Your branded app",
  },
  {
    id: "payments",
    name: "Payments",
    hasDropdown: true,
  },
  {
    id: "reports",
    name: "Reports",
  },
  {
    id: "billing",
    name: "Billing",
  },
  {
    id: "notifications",
    name: "Notifications",
    hasDropdown: true,
  },
  {
    id: "reviews",
    name: "Reviews",
  },
  {
    id: "security",
    name: "Security",
  },
];

const moreCategories = [
  {
    id: "download-apps",
    name: "Download apps",
  },
  {
    id: "activity",
    name: "Activity",
  },
  {
    id: "refer-friend",
    name: "Refer a friend",
  },
  {
    id: "log-out",
    name: "Log out",
  },
];

export default function SettingsClient() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState("profile");
  const [expandedManageCategories, setExpandedManageCategories] = useState<string[]>([]);
  
  // Profile edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    name: "hussain aljarrah",
    email: session?.user?.email || "hussainaljarrah45@gmail.com",
    phone: "",
    company: "FJ ApS",
    address: "Gunnekær 4, Rødovre, 2610",
  });
  
  const [originalProfileData, setOriginalProfileData] = useState({
    name: "hussain aljarrah",
    email: session?.user?.email || "hussainaljarrah45@gmail.com",
    phone: "",
    company: "FJ ApS",
    address: "Gunnekær 4, Rødovre, 2610",
  });

  // Update email when session loads
  useEffect(() => {
    if (session?.user?.email) {
      setProfileData(prev => ({ ...prev, email: session.user.email || "" }));
      setOriginalProfileData(prev => ({ ...prev, email: session.user.email || "" }));
    }
  }, [session?.user?.email]);

  const toggleManageCategory = (categoryId: string) => {
    setExpandedManageCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Check if form has been modified
  const hasChanges = () => {
    return JSON.stringify(profileData) !== JSON.stringify(originalProfileData);
  };

  // Add validation function
  const isFormValid = () => {
    // Full name is mandatory
    if (profileData.name.trim() === "") {
      return false;
    }
    
    // If phone is provided, it must have actual number (not just country code)
    if (profileData.phone && profileData.phone.length <= 5) {
      return false;
    }
    
    return true;
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(""); // Clear any previous errors

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the original data to reflect the changes
      setOriginalProfileData(profileData);
      setShowEditModal(false);
      setIsEditing(false);
      setError(""); // Clear error on success
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = () => {
    const currentData = {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      company: profileData.company,
      address: profileData.address,
    };
    setOriginalProfileData(currentData);
    setIsEditing(true);
    setError(""); // Clear error when opening edit modal
    setShowEditModal(true);
  };

  const handleSaveAndClose = async () => {
    setShowUnsavedChangesModal(false);
    await handleEditProfile(new Event('submit') as any);
  };

  const handleDiscardAndClose = () => {
    setShowUnsavedChangesModal(false);
    setShowEditModal(false);
    setIsEditing(false);
    setError(""); // Clear error when discarding
    setProfileData(originalProfileData); // Reset to original data
  };

  const handleCloseUnsavedModal = () => {
    setShowUnsavedChangesModal(false);
  };

  return (
    <div className="flex h-full bg-white">
      {/* Middle Column - Settings Menu */}
      <div className="w-56 bg-gray-50 border-r border-gray-200 p-3">
        <h1 className="text-base font-semibold text-gray-900 mb-4">Settings</h1>

        {/* Main Categories */}
        <div className="space-y-0.5 mb-4">
          {settingsCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`w-full text-left py-1.5 px-2 rounded text-xs transition-colors ${
                selectedCategory === category.id
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Manage Section */}
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">MANAGE</div>
          <div className="space-y-0.5">
            {manageCategories.map((category) => (
              <div key={category.id}>
                <button
                  onClick={() => category.hasDropdown ? toggleManageCategory(category.id) : handleCategoryClick(category.id)}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded text-xs transition-colors ${
                    selectedCategory === category.id
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{category.name}</span>
                  {category.hasDropdown && (
                    expandedManageCategories.includes(category.id) ? (
                      <ChevronDownIcon className="w-3 h-3" />
                    ) : (
                      <ChevronRightIcon className="w-3 h-3" />
                    )
                  )}
                </button>
                {category.hasDropdown && expandedManageCategories.includes(category.id) && (
                  <div className="ml-3 mt-0.5 space-y-0.5">
                    <div className="py-0.5 px-2 text-xs text-gray-500">Sub-options coming soon</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* More Section */}
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">MORE</div>
          <div className="space-y-0.5">
            {moreCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full text-left py-1.5 px-2 rounded text-xs transition-colors ${
                  selectedCategory === category.id
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Content Area */}
      <div className="flex-1 p-4 pl-8">
        {selectedCategory === "profile" && (
          <div className="max-w-xl">
            {/* Profile Header */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600 mr-3">
                H
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">{profileData.name}</h2>
                <p className="text-xs text-gray-500">Sydals, 83, DK • 11:39 PM</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-6">
                <button className="py-1.5 px-1 border-b-2 border-gray-900 text-xs font-medium text-gray-900">
                  About
                </button>
                <button className="py-1.5 px-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                  Integrations
                </button>
                <button className="py-1.5 px-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                  Services
                </button>
                <button className="py-1.5 px-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                  Working hours
                </button>
                <button className="py-1.5 px-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                  Breaks
                </button>
                <button className="py-1.5 px-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                  Time off
                </button>
                <button className="py-1.5 px-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                  Updates
                </button>
              </nav>
            </div>

                         {/* Profile Information - Sleek Style */}
             <div className="space-y-4">
               {/* Phone */}
               <div className="flex items-center space-x-3 text-xs">
                 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                 </svg>
                 {profileData.phone && profileData.phone.trim() !== "" ? (
                   <span className="text-gray-900">{profileData.phone}</span>
                 ) : (
                   <span 
                     onClick={handleEditClick}
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
                 {profileData.email && profileData.email.trim() !== "" ? (
                   <span className="text-gray-900">{profileData.email}</span>
                 ) : (
                   <span 
                     onClick={handleEditClick}
                     className="text-gray-600 underline cursor-pointer hover:text-gray-800"
                   >
                     Add email
                   </span>
                 )}
               </div>
               
               {/* Company - only show if exists */}
               {profileData.company && profileData.company.trim() !== "" && (
                 <div className="flex items-center space-x-3 text-xs">
                   <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                   </svg>
                   <span className="text-gray-900">{profileData.company}</span>
                 </div>
               )}
               
               {/* Address - only show if exists */}
               {profileData.address && profileData.address.trim() !== "" && (
                 <div className="flex items-center space-x-3 text-xs">
                   <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                   <span className="text-gray-900">{profileData.address}</span>
                 </div>
               )}

              {/* Edit Button */}
              <div className="pt-2">
                <button
                  onClick={handleEditClick}
                  className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-xs font-medium"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedCategory !== "profile" && (
          <div className="max-w-xl">
            {/* Category Header */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600 mr-3">
                ⚙️
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace('-', ' ')}
                </h2>
                <p className="text-xs text-gray-500">Configuration and settings</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-6">
                <button className="py-1.5 px-1 border-b-2 border-gray-900 text-xs font-medium text-gray-900">
                  General
                </button>
                <button className="py-1.5 px-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                  Advanced
                </button>
                <button className="py-1.5 px-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                  Security
                </button>
              </nav>
            </div>

            {/* Category Information */}
            <div className="space-y-3">
              <div className="flex items-center py-1.5">
                <div className="w-3 h-3 text-gray-500 mr-2">📋</div>
                <span className="text-xs text-gray-900">Configuration options coming soon</span>
              </div>

              <div className="flex items-center py-1.5">
                <div className="w-3 h-3 text-gray-500 mr-2">🔧</div>
                <span className="text-xs text-gray-900">Settings will be available in the next update</span>
              </div>

              <div className="flex items-center py-1.5">
                <div className="w-3 h-3 text-gray-500 mr-2">📊</div>
                <span className="text-xs text-gray-900">Manage your {selectedCategory.replace('-', ' ')} preferences</span>
              </div>

              <div className="flex items-center py-1.5">
                <div className="w-3 h-3 text-gray-500 mr-2">⚡</div>
                <span className="text-xs text-gray-900">Quick access to common settings</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 relative">
            <button
              onClick={() => {
                if (isEditing && hasChanges()) {
                  setShowUnsavedChangesModal(true);
                } else {
                  setShowEditModal(false);
                  setIsEditing(false);
                  setError(""); // Clear error when closing
                  setProfileData(originalProfileData); // Reset to original data
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
                Edit Profile
              </h3>
              
              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                </div>
              )}
             
              <div className="flex gap-8 max-h-96 overflow-hidden">
                {/* Left Section - Profile Picture and Name */}
                <div className="w-1/4 flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-3">
                    <span className="text-xl font-semibold text-gray-600">
                      {profileData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {profileData.name}
                    </p>
                  </div>
                </div>
                
                {/* Right Section - Form Fields */}
                <div className="w-3/4 overflow-y-auto pr-2 pl-4">
                  <form onSubmit={handleEditProfile} className="space-y-8">
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
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
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
                            value={profileData.phone}
                            onChange={(value) => setProfileData({ ...profileData, phone: value || "" })}
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
                             value={profileData.email}
                             disabled
                             className="w-full px-3 py-1 border border-gray-200 rounded-md bg-gray-50 text-xs text-gray-500 cursor-not-allowed"
                             placeholder="Email from login"
                           />
                           <p className="text-xs text-gray-400 mt-1">Email address is linked to your login account</p>
                         </div>
                        
                        <div>
                          <label htmlFor="company" className="block text-xs text-gray-700 mb-1">
                            Company name
                          </label>
                          <input
                            type="text"
                            id="company"
                            value={profileData.company}
                            onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
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
                          <label htmlFor="address" className="block text-xs text-gray-700 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            id="address"
                            value={profileData.address}
                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                            placeholder="Enter full address"
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
                      setShowEditModal(false);
                      setIsEditing(false);
                      setProfileData(originalProfileData); // Reset to original data
                    }
                  }}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditProfile}
                  disabled={submitting || !isFormValid()}
                  className={`px-4 py-1.5 rounded-md transition-colors text-sm ${
                    isFormValid() 
                      ? 'bg-black text-white hover:bg-gray-800' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  } disabled:opacity-50`}
                >
                  {submitting ? "Saving..." : "Update"}
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
    </div>
  );
} 