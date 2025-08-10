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
  const [isLoading, setIsLoading] = useState(true);
  
  // Brand settings state
  const [brandData, setBrandData] = useState({
    name: "",
    bookingUrl: "",
    industry: "",
    about: "",
    tagline: "",
  });
  const [originalBrandData, setOriginalBrandData] = useState({
    name: "",
    bookingUrl: "",
    industry: "",
    about: "",
    tagline: "",
  });
  const [isLoadingBrand, setIsLoadingBrand] = useState(true);
  const [brandError, setBrandError] = useState("");
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [brandSaved, setBrandSaved] = useState(false);
  
  // Profile data state - initialize with empty values to prevent flash of old data
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  
  const [originalProfileData, setOriginalProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Fetch user profile data when component loads
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const userData = await response.json();
          const profileDataWithDefaults = {
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            company: userData.company || "",
            country: userData.country || "",
            address: userData.address || "",
            city: userData.city || "",
            state: userData.state || "",
            zipCode: userData.zipCode || "",
          };
          setProfileData(profileDataWithDefaults);
          setOriginalProfileData(profileDataWithDefaults);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Fallback to empty data if API call fails
        const defaultData = {
          name: "",
          email: "",
          phone: "",
          company: "",
          country: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
        };
        setProfileData(defaultData);
        setOriginalProfileData(defaultData);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // Fetch business data for brand settings
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch('/api/business');
        if (response.ok) {
          const business = await response.json();
          const incoming = {
            name: business?.name || "",
            bookingUrl: business?.slug || "",
            industry: business?.industry || "",
            about: business?.about || "",
            tagline: business?.tagline || "",
          };
          setBrandData(incoming);
          setOriginalBrandData(incoming);
        }
      } catch (error) {
        console.error('Error fetching business:', error);
      } finally {
        setIsLoadingBrand(false);
      }
    };

    if (session?.user?.id) {
      fetchBusiness();
    } else {
      setIsLoadingBrand(false);
    }
  }, [session?.user?.id]);

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
  const isBrandDirty = () => JSON.stringify(brandData) !== JSON.stringify(originalBrandData);


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
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          company: profileData.company,
          country: profileData.country,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zipCode: profileData.zipCode,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update the original data to reflect the changes
        setOriginalProfileData(profileData);
        setShowEditModal(false);
        setIsEditing(false);
        setError(""); // Clear error on success
        
        // Force a session refresh to update the sidebar name
        // Dispatch a custom event that the sidebar can listen to
        window.dispatchEvent(new CustomEvent('profileUpdated', { 
          detail: { name: profileData.name } 
        }));
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update profile");
      }
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
      country: profileData.country,
      address: profileData.address,
      city: profileData.city,
      state: profileData.state,
      zipCode: profileData.zipCode,
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
      <div className="flex-1 p-4 pl-8 relative">
        {/* Edit Profile Button - Top Right Corner */}
        {selectedCategory === "profile" && (
          <button
            onClick={handleEditClick}
            className="absolute top-4 right-4 px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-xs font-medium z-10"
          >
            Edit Profile
          </button>
        )}
        
        {selectedCategory === "profile" && (
          <div className="max-w-xl">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2 text-sm text-gray-600">Loading profile...</span>
              </div>
            ) : (
              <>
                {/* Profile Header */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600 mr-3">
                      {profileData.name ? profileData.name.charAt(0).toUpperCase() : "H"}
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">{profileData.name || "Profile"}</h2>
                  </div>
                </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-6">
                <button className="py-1.5 px-1 border-b-2 border-gray-900 text-xs font-medium text-gray-900">
                  About
                </button>
                <button className="py-1.5 px-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                  Services
                </button>
                <button className="py-1.5 px-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                  Working hours
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
               
               {/* Company */}
               <div className="flex items-center space-x-3 text-xs">
                 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                 </svg>
                 {profileData.company && profileData.company.trim() !== "" ? (
                   <span className="text-gray-900">{profileData.company}</span>
                 ) : (
                   <span 
                     onClick={handleEditClick}
                     className="text-gray-600 underline cursor-pointer hover:text-gray-800"
                   >
                     Add company
                   </span>
                 )}
               </div>
               
               {/* Address */}
               <div className="flex items-center space-x-3 text-xs">
                 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
                 {(profileData.address && profileData.address.trim() !== "") || 
                  (profileData.city && profileData.city.trim() !== "") || 
                  (profileData.zipCode && profileData.zipCode.trim() !== "") ? (
                   <span className="text-gray-900">
                     {[profileData.address, profileData.city, profileData.zipCode].filter(Boolean).join(", ")}
                   </span>
                 ) : (
                   <span 
                     onClick={handleEditClick}
                     className="text-gray-600 underline cursor-pointer hover:text-gray-800"
                   >
                     Add address
                   </span>
                 )}
               </div>
            </div>
            </>
          )}
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
                  {selectedCategory === 'brand' ? 'Brand details' : 'General'}
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
            {selectedCategory === 'brand' ? (
              <div className="space-y-4">
                {isLoadingBrand ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading brand...</span>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    {brandError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-700">{brandError}</p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="brand-name" className="block text-xs text-gray-700 mb-1">Business name *</label>
                      <input
                        id="brand-name"
                        type="text"
                        value={brandData.name}
                        onChange={(e) => setBrandData({ ...brandData, name: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                        placeholder="Enter business name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="brand-url" className="block text-xs text-gray-700 mb-1">Your booking page url</label>
                      <input
                        id="brand-url"
                        type="text"
                        value={brandData.bookingUrl}
                        onChange={(e) => setBrandData({ ...brandData, bookingUrl: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                        placeholder="e.g. /b/your-brand"
                      />
                    </div>

                    <div>
                      <label htmlFor="brand-tagline" className="block text-xs text-gray-700 mb-1">Tagline</label>
                      <input
                        id="brand-tagline"
                        type="text"
                        value={brandData.tagline}
                        onChange={(e) => setBrandData({ ...brandData, tagline: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                        placeholder="Short phrase shown under your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="brand-industry" className="block text-xs text-gray-700 mb-1">Industry</label>
                      <input
                        id="brand-industry"
                        type="text"
                        value={brandData.industry}
                        onChange={(e) => setBrandData({ ...brandData, industry: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                        placeholder="Enter industry"
                      />
                    </div>

                    <div>
                      <label htmlFor="brand-about" className="block text-xs text-gray-700 mb-1">About</label>
                      <textarea
                        id="brand-about"
                        value={brandData.about}
                        onChange={(e) => setBrandData({ ...brandData, about: e.target.value })}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                        placeholder="Tell customers about your brand"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        disabled={!isBrandDirty() || brandData.name.trim() === '' || isSavingBrand}
                        className={`px-4 py-1.5 rounded-md transition-colors text-sm ${
                          !isBrandDirty() || brandData.name.trim() === '' || isSavingBrand
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                        onClick={async () => {
                          if (brandData.name.trim() === '') {
                            setBrandError('Business name is required');
                            return;
                          }
                          setBrandError('');
                          setIsSavingBrand(true);
                          setBrandSaved(false);
                          try {
                            const res = await fetch('/api/business', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({
                                name: brandData.name,
                                slug: brandData.bookingUrl,
                                industry: brandData.industry,
                                about: brandData.about,
                                tagline: brandData.tagline,
                              })
                            });
                            if (!res.ok) {
                              const err = await res.json().catch(() => ({}));
                              setBrandError(err.error || 'Failed to save changes');
                              return;
                            }
                            const updated = await res.json();
                            const normalized = {
                              name: updated?.name ?? brandData.name,
                              bookingUrl: updated?.slug ?? brandData.bookingUrl,
                              industry: updated?.industry ?? '',
                              about: updated?.about ?? '',
                              tagline: updated?.tagline ?? '',
                            };
                            setBrandData(normalized);
                            setOriginalBrandData(normalized);
                            setBrandSaved(true);
                            // Clear saved indicator after a short delay
                            setTimeout(() => setBrandSaved(false), 1500);
                          } catch (e) {
                            console.error(e);
                            setBrandError('Failed to save changes');
                          } finally {
                            setIsSavingBrand(false);
                          }
                        }}
                      >
                        {isSavingBrand ? 'Saving…' : isBrandDirty() ? 'Save changes' : (brandSaved ? 'Saved' : 'Save changes')}
                      </button>
                      {!isBrandDirty() && brandSaved && (
                        <span className="text-xs text-green-600">Changes saved</span>
                      )}
                    </div>
                  </form>
                )}
              </div>
            ) : (
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
            )}
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
                           <label htmlFor="country" className="block text-xs text-gray-700 mb-1">
                             Country
                           </label>
                           <select 
                             value={profileData.country}
                             onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
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
                             value={profileData.address}
                             onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
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
                             value={profileData.city}
                             onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
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
                             value={profileData.state}
                             onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
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
                             value={profileData.zipCode}
                             onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
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