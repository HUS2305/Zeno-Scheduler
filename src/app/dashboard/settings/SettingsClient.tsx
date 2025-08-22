"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import ColorPicker from "../../../components/dashboard/ColorPicker";

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
  const [selectedCategory, setSelectedCategory] = useState("brand");
  const [selectedBrandTab, setSelectedBrandTab] = useState("brand-details");
  const [expandedManageCategories, setExpandedManageCategories] = useState<string[]>([]);
  
  // Contact details state
  const [contactData, setContactData] = useState({
    email: "",
    phone: "",
  });
  const [originalContactData, setOriginalContactData] = useState({
    email: "",
    phone: "",
  });
  const [hasContactChanges, setHasContactChanges] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [contactError, setContactError] = useState("");

  // Location details state
  const [locationData, setLocationData] = useState({
    country: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [originalLocationData, setOriginalLocationData] = useState({
    country: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Working hours state - Default to 8:00-17:00 for all days
  const [workingHoursData, setWorkingHoursData] = useState([
    { dayOfWeek: 1, dayName: "Monday", isEnabled: true, openTime: "08:00", closeTime: "17:00" },
    { dayOfWeek: 2, dayName: "Tuesday", isEnabled: true, openTime: "08:00", closeTime: "17:00" },
    { dayOfWeek: 3, dayName: "Wednesday", isEnabled: true, openTime: "08:00", closeTime: "17:00" },
    { dayOfWeek: 4, dayName: "Thursday", isEnabled: true, openTime: "08:00", closeTime: "17:00" },
    { dayOfWeek: 5, dayName: "Friday", isEnabled: true, openTime: "08:00", closeTime: "17:00" },
    { dayOfWeek: 6, dayName: "Saturday", isEnabled: true, openTime: "08:00", closeTime: "17:00" },
    { dayOfWeek: 0, dayName: "Sunday", isEnabled: true, openTime: "08:00", closeTime: "17:00" },
  ]);
  const [originalWorkingHoursData, setOriginalWorkingHoursData] = useState([
    { dayOfWeek: 1, dayName: "Monday", isEnabled: true, openTime: "08:00", closeTime: "17:00" },
    { dayOfWeek: 2, dayName: "Tuesday", isEnabled: true, openTime: "08:00", closeTime: "17:00" },
    { dayOfWeek: 3, dayName: "Wednesday", isEnabled: true, openTime: "08:00", closeTime: "17:00" },
    { dayOfWeek: 4, dayName: "Thursday", isEnabled: true, openTime: "08:00", closeTime: "17:00" },
    { dayOfWeek: 5, dayName: "Friday", isEnabled: true, openTime: "08:00", closeTime: "17:00" },
    { dayOfWeek: 6, dayName: "Saturday", isEnabled: true, openTime: "08:00", closeTime: "17:00" },
    { dayOfWeek: 0, dayName: "Sunday", isEnabled: true, openTime: "08:00", closeTime: "17:00" },
  ]);
  const [hasLocationChanges, setHasLocationChanges] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Working hours state
  const [hasWorkingHoursChanges, setHasWorkingHoursChanges] = useState(false);
  const [isSavingWorkingHours, setIsSavingWorkingHours] = useState(false);
  const [workingHoursSaved, setWorkingHoursSaved] = useState(false);
  const [workingHoursError, setWorkingHoursError] = useState("");

  // Slot size state
  const [slotSizeData, setSlotSizeData] = useState({
    value: 30,
    unit: "minutes"
  });
  const [originalSlotSizeData, setOriginalSlotSizeData] = useState({
    value: 30,
    unit: "minutes"
  });
  const [hasSlotSizeChanges, setHasSlotSizeChanges] = useState(false);

  // Double booking state
  const [doubleBookingData, setDoubleBookingData] = useState({
    allowDoubleBooking: true
  });
  const [originalDoubleBookingData, setOriginalDoubleBookingData] = useState({
    allowDoubleBooking: true
  });
  const [hasDoubleBookingChanges, setHasDoubleBookingChanges] = useState(false);
  
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
  
  // Appearance settings state
  const [appearanceData, setAppearanceData] = useState({
    theme: "light",
    brandColor: "#000000",
  });
  const [originalAppearanceData, setOriginalAppearanceData] = useState({
    theme: "light",
    brandColor: "#000000",
  });
  const [hasAppearanceChanges, setHasAppearanceChanges] = useState(false);
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);
  const [appearanceSaved, setAppearanceSaved] = useState(false);
  const [appearanceError, setAppearanceError] = useState("");
  
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
          
          // Set contact data
          const contactIncoming = {
            email: business?.contactEmail || "",
            phone: business?.contactPhone || "",
          };
          setContactData(contactIncoming);
          setOriginalContactData(contactIncoming);
          
          // Set location data
          const locationIncoming = {
            country: business?.country || "",
            address: business?.address || "",
            city: business?.city || "",
            state: business?.state || "",
            zipCode: business?.zipCode || "",
          };
          setLocationData(locationIncoming);
          setOriginalLocationData(locationIncoming);

          // Set working hours data
          if (business?.openingHours) {
            // Create a map of existing hours by day of week
            const existingHoursMap = new Map();
            business.openingHours.forEach((hour: any) => {
              existingHoursMap.set(hour.dayOfWeek, {
                openTime: hour.openTime,
                closeTime: hour.closeTime,
              });
            });
            
            // Update working hours data with existing hours or defaults
            // Days that don't exist in openingHours are considered disabled (closed)
            const updatedWorkingHours = workingHoursData.map(day => {
              const existingHour = existingHoursMap.get(day.dayOfWeek);
              if (existingHour) {
                return {
                  ...day,
                  isEnabled: true, // Day is open
                  openTime: existingHour.openTime,
                  closeTime: existingHour.closeTime,
                };
              } else {
                return {
                  ...day,
                  isEnabled: false, // Day is closed (disabled)
                  // Keep the current open/close times for when they re-enable it
                };
              }
            });
            
            setWorkingHoursData(updatedWorkingHours);
            setOriginalWorkingHoursData(updatedWorkingHours);
          }

          // Set appearance data
          const appearanceIncoming = {
            theme: business?.theme || "light",
            brandColor: business?.brandColor || "#000000",
          };
          setAppearanceData(appearanceIncoming);
          setOriginalAppearanceData(appearanceIncoming);

          // Set slot size data
          if (business?.slotSize) {
            setSlotSizeData(business.slotSize);
            setOriginalSlotSizeData(business.slotSize);
          }

          // Set double booking data
          setDoubleBookingData({ allowDoubleBooking: business?.allowDoubleBooking ?? true });
          setOriginalDoubleBookingData({ allowDoubleBooking: business?.allowDoubleBooking ?? true });
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

  // Check if contact details have been modified
  const isContactDirty = () => JSON.stringify(contactData) !== JSON.stringify(originalContactData);

  // Check if location details have been modified
  const isLocationDirty = () => JSON.stringify(locationData) !== JSON.stringify(originalLocationData);

  // Check if working hours have been modified
  const isWorkingHoursDirty = () => JSON.stringify(workingHoursData) !== JSON.stringify(originalWorkingHoursData);

  // Check if appearance has been modified
  const isAppearanceDirty = () => JSON.stringify(appearanceData) !== JSON.stringify(originalAppearanceData);

  // Contact details validation
  const isContactFormValid = () => {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // If email is provided, it must be valid
    if (contactData.email && !emailRegex.test(contactData.email.trim())) {
      return false;
    }
    
    // If phone is provided, it must be a valid phone number (PhoneInput handles format)
    if (contactData.phone && contactData.phone.length < 8) {
      return false;
    }
    
    // Both fields can be empty (owner can choose to hide contact details)
    // But if provided, they must be valid
    return true;
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
        
        // NextAuth now always fetches fresh data from the database
        // Just refresh the page to get the updated session data
        setTimeout(() => {
          window.location.reload();
        }, 500);
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

  // Working hours save function
  const handleSaveWorkingHours = async () => {
    setWorkingHoursError('');
    setIsSavingWorkingHours(true);
    setWorkingHoursSaved(false);
    
    try {
      // Convert working hours data to the format expected by the API
      const openingHours = workingHoursData
        .filter(day => day.isEnabled)
        .map(day => ({
          dayOfWeek: day.dayOfWeek,
          openTime: day.openTime,
          closeTime: day.closeTime,
        }));

      // Debug: Log what we're sending
      console.log('Saving business hours with slot size:', {
        name: brandData.name,
        openingHours: openingHours,
        slotSize: slotSizeData
      });

      const res = await fetch('/api/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: brandData.name, // Include current business name to avoid validation error
          openingHours: openingHours,
          slotSize: slotSizeData, // Include slot size configuration
          allowDoubleBooking: doubleBookingData.allowDoubleBooking, // Include double booking setting
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setWorkingHoursError(err.error || 'Failed to save working hours');
        return;
      }

      // Debug: Log the response
      const responseData = await res.json().catch(() => ({}));
      console.log('API response after saving:', responseData);

      // Update the original data to reflect the saved state
      setOriginalWorkingHoursData(workingHoursData);
      setOriginalSlotSizeData(slotSizeData);
      setOriginalDoubleBookingData(doubleBookingData);
      setHasWorkingHoursChanges(false);
      setHasSlotSizeChanges(false);
      setHasDoubleBookingChanges(false);
      setWorkingHoursSaved(true);
      
      // Reload business data to ensure sync with public page
      try {
        const refreshResponse = await fetch('/api/business');
        if (refreshResponse.ok) {
          const refreshedBusiness = await refreshResponse.json();
          // Update working hours with the refreshed data
          if (refreshedBusiness?.openingHours) {
            const existingHoursMap = new Map();
            refreshedBusiness.openingHours.forEach((hour: any) => {
              existingHoursMap.set(hour.dayOfWeek, {
                openTime: hour.openTime,
                closeTime: hour.closeTime,
              });
            });
            
                      // Update working hours while preserving the current state
          const updatedWorkingHours = workingHoursData.map(day => {
            const existingHour = existingHoursMap.get(day.dayOfWeek);
            if (existingHour) {
              return {
                ...day,
                isEnabled: true, // Day is open
                openTime: existingHour.openTime,
                closeTime: existingHour.closeTime,
              };
            } else {
              return {
                ...day,
                isEnabled: false, // Day is closed (disabled)
                // Keep the current open/close times for when they re-enable it
              };
            }
          });
          
          setWorkingHoursData(updatedWorkingHours);
          setOriginalWorkingHoursData(updatedWorkingHours);

          // Update slot size with the refreshed data
          if (refreshedBusiness?.slotSize) {
            console.log('Refreshed slot size from API:', refreshedBusiness.slotSize);
            setSlotSizeData(refreshedBusiness.slotSize);
            setOriginalSlotSizeData(refreshedBusiness.slotSize);
          }

          // Update double booking with the refreshed data
          setDoubleBookingData({ allowDoubleBooking: refreshedBusiness?.allowDoubleBooking ?? true });
          setOriginalDoubleBookingData({ allowDoubleBooking: refreshedBusiness?.allowDoubleBooking ?? true });
          }
        }
      } catch (refreshError) {
        console.warn('Failed to refresh business data after save:', refreshError);
      }
      
      setTimeout(() => setWorkingHoursSaved(false), 1500);
    } catch (e) {
      console.error(e);
      setWorkingHoursError('Failed to save working hours');
    } finally {
      setIsSavingWorkingHours(false);
    }
  };

  // Appearance save function
  const handleSaveAppearance = async () => {
    setAppearanceError('');
    setIsSavingAppearance(true);
    setAppearanceSaved(false);
    
    try {
      const res = await fetch('/api/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: brandData.name, // Include current business name to avoid validation error
          theme: appearanceData.theme,
          brandColor: appearanceData.brandColor,
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAppearanceError(err.error || 'Failed to save appearance settings');
        return;
      }

      setOriginalAppearanceData(appearanceData);
      setHasAppearanceChanges(false);
      setAppearanceSaved(true);
      setTimeout(() => setAppearanceSaved(false), 1500);
    } catch (e) {
      console.error(e);
      setAppearanceError('Failed to save appearance settings');
    } finally {
      setIsSavingAppearance(false);
    }
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
              <nav className="flex space-x-3 flex-nowrap overflow-x-auto">
                <button 
                  onClick={() => setSelectedBrandTab('brand-details')}
                  className={`py-1.5 px-1 border-b-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedBrandTab === 'brand-details'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Brand details
                </button>
                <button 
                  onClick={() => setSelectedBrandTab('contact-details')}
                  className={`py-1.5 px-1 border-b-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedBrandTab === 'contact-details'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Contact details
                </button>
                <button 
                  onClick={() => setSelectedBrandTab('location')}
                  className={`py-1.5 px-1 border-b-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedBrandTab === 'location'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Location
                </button>
                <button 
                  onClick={() => setSelectedBrandTab('business-hours')}
                  className={`py-1.5 px-1 border-b-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedBrandTab === 'business-hours'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Business hours
                </button>
                <button 
                  onClick={() => setSelectedBrandTab('appearance')}
                  className={`py-1.5 px-1 border-b-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedBrandTab === 'appearance'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Appearance
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
                  <>
                    {/* Brand Details Tab */}
                    {selectedBrandTab === 'brand-details' && (
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

                    {/* Contact Details Tab */}
                    {selectedBrandTab === 'contact-details' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-700 mb-2">Contact Email</label>
                          <input
                            type="email"
                            value={contactData.email}
                            onChange={(e) => {
                              setContactData(prev => ({ ...prev, email: e.target.value }));
                              setHasContactChanges(true);
                            }}
                            className="w-80 px-2 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="Enter contact email"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-700 mb-2">Contact Phone</label>
                          <PhoneInput
                            international
                            defaultCountry="DK"
                            value={contactData.phone}
                            onChange={(value) => {
                              setContactData(prev => ({ ...prev, phone: value || "" }));
                              setHasContactChanges(true);
                            }}
                            className="w-80"
                            style={{
                              '--PhoneInputCountryFlag-borderColor': 'transparent',
                              '--PhoneInputCountryFlag-borderWidth': '0',
                            } as React.CSSProperties}
                          />
                        </div>

                        {contactError && (
                          <div className="text-xs text-red-600">{contactError}</div>
                        )}

                        {/* Save Changes Button */}
                        <div className="mt-8 flex justify-start">
                          <button
                            type="button"
                            disabled={!hasContactChanges || isSavingContact || !isContactFormValid()}
                            className={`px-4 py-1.5 rounded-md transition-colors text-sm ${
                              !hasContactChanges || isSavingContact || !isContactFormValid()
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-black text-white hover:bg-gray-800'
                            }`}
                            onClick={async () => {
                              if (!isContactFormValid()) {
                                setContactError('Please fix the validation errors before saving');
                                return;
                              }
                              setContactError('');
                              setIsSavingContact(true);
                              try {
                                const res = await fetch('/api/business', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  credentials: 'include',
                                  body: JSON.stringify({
                                    name: brandData.name, // Include current business name to avoid validation error
                                    contactEmail: contactData.email,
                                    contactPhone: contactData.phone,
                                  })
                                });
                                if (!res.ok) {
                                  const err = await res.json().catch(() => ({}));
                                  setContactError(err.error || 'Failed to save changes');
                                  return;
                                }
                                setOriginalContactData(contactData);
                                setHasContactChanges(false);
                                setContactSaved(true);
                                setTimeout(() => setContactSaved(false), 1500);
                              } catch (e) {
                                console.error(e);
                                setContactError('Failed to save changes');
                              } finally {
                                setIsSavingContact(false);
                              }
                            }}
                          >
                            {isSavingContact ? 'Saving…' : hasContactChanges ? 'Save changes' : (contactSaved ? 'Saved' : 'Save changes')}
                          </button>
                          {!hasContactChanges && contactSaved && (
                            <span className="text-xs text-green-600">Changes saved</span>
                          )}
                        </div>
                      </div>
                    )}

                                         {/* Appearance Tab */}
                     {selectedBrandTab === 'appearance' && (
                       <div className="space-y-4">
                         {/* Coming Soon Message - No Background Box */}
                         <div className="text-center py-8">
                           <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                             <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                             </svg>
                           </div>
                           <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                           <p className="text-sm text-gray-500 max-w-md mx-auto">
                             We're working on some amazing appearance customization features. 
                             You'll be able to customize your brand colors, themes, and styling options soon.
                           </p>
                         </div>
                       </div>
                     )}



                    {/* Location Tab */}
                    {selectedBrandTab === 'location' && (
                      <div className="space-y-4">
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                          {locationError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-xs text-red-700">{locationError}</p>
                            </div>
                          )}

                          <div>
                            <label htmlFor="location-country" className="block text-xs text-gray-700 mb-1">Country</label>
                            <select 
                              id="location-country"
                              value={locationData.country}
                              onChange={(e) => {
                                setLocationData(prev => ({ ...prev, country: e.target.value }));
                                setHasLocationChanges(true);
                              }}
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
                            <label htmlFor="location-address" className="block text-xs text-gray-700 mb-1">Address</label>
                            <input
                              type="text"
                              id="location-address"
                              value={locationData.address}
                              onChange={(e) => {
                                setLocationData(prev => ({ ...prev, address: e.target.value }));
                                setHasLocationChanges(true);
                              }}
                              className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                              placeholder="Enter street name, apt, suite, floor"
                            />
                          </div>

                          <div>
                            <label htmlFor="location-city" className="block text-xs text-gray-700 mb-1">City</label>
                            <input
                              type="text"
                              id="location-city"
                              value={locationData.city}
                              onChange={(e) => {
                                setLocationData(prev => ({ ...prev, city: e.target.value }));
                                setHasLocationChanges(true);
                              }}
                              className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                              placeholder="Enter city"
                            />
                          </div>

                          <div>
                            <label htmlFor="location-state" className="block text-xs text-gray-700 mb-1">State</label>
                            <input
                              type="text"
                              id="location-state"
                              value={locationData.state}
                              onChange={(e) => {
                                setLocationData(prev => ({ ...prev, state: e.target.value }));
                                setHasLocationChanges(true);
                              }}
                              className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                              placeholder="Enter state"
                            />
                          </div>

                          <div>
                            <label htmlFor="location-zipCode" className="block text-xs text-gray-700 mb-1">Zip code</label>
                            <input
                              type="text"
                              id="location-zipCode"
                              value={locationData.zipCode}
                              onChange={(e) => {
                                setLocationData(prev => ({ ...prev, zipCode: e.target.value }));
                                setHasLocationChanges(true);
                              }}
                              className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 text-xs text-gray-900"
                              placeholder="Enter zip code"
                            />
                          </div>

                          {/* Save Changes Button */}
                          <div className="pt-2 flex items-center gap-3">
                            <button
                              type="button"
                              disabled={!hasLocationChanges || isSavingLocation}
                              className={`px-4 py-1.5 rounded-md transition-colors text-sm ${
                                !hasLocationChanges || isSavingLocation
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-black text-white hover:bg-gray-800'
                              }`}
                              onClick={async () => {
                                setLocationError('');
                                setIsSavingLocation(true);
                                try {
                                  const res = await fetch('/api/business', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                      name: brandData.name, // Include current business name to avoid validation error
                                      country: locationData.country,
                                      address: locationData.address,
                                      city: locationData.city,
                                      state: locationData.state,
                                      zipCode: locationData.zipCode,
                                    })
                                  });
                                  if (!res.ok) {
                                    const err = await res.json().catch(() => ({}));
                                    setLocationError(err.error || 'Failed to save changes');
                                    return;
                                  }
                                  setOriginalLocationData(locationData);
                                  setHasLocationChanges(false);
                                  setLocationSaved(true);
                                  setTimeout(() => setLocationSaved(false), 1500);
                                } catch (e) {
                                  console.error(e);
                                  setLocationError('Failed to save changes');
                                } finally {
                                  setIsSavingLocation(false);
                                }
                              }}
                            >
                              {isSavingLocation ? 'Saving…' : hasLocationChanges ? 'Save changes' : (locationSaved ? 'Saved' : 'Save changes')}
                            </button>
                            {!hasLocationChanges && locationSaved && (
                              <span className="text-xs text-green-600">Changes saved</span>
                            )}
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Business Hours Tab */}
                    {selectedBrandTab === 'business-hours' && (
                      <div className="space-y-4">
                        <div className="space-y-4">
                          {workingHoursData.map((day, index) => (
                            <div key={day.dayName} className="flex items-center space-x-6">
                              {/* Toggle Switch */}
                              <button
                                onClick={() => {
                                  const updated = [...workingHoursData];
                                  updated[index].isEnabled = !updated[index].isEnabled;
                                  setWorkingHoursData(updated);
                                  setHasWorkingHoursChanges(true);
                                }}
                                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                                  day.isEnabled ? 'bg-black' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                                    day.isEnabled ? 'translate-x-4' : 'translate-x-0.5'
                                  }`}
                                />
                              </button>

                              {/* Day Name */}
                              <span className="text-xs text-gray-900 w-20">{day.dayName}</span>

                              {/* Time Inputs or Closed Text */}
                              {day.isEnabled ? (
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="time"
                                    value={day.openTime}
                                    onChange={(e) => {
                                      const updated = [...workingHoursData];
                                      updated[index].openTime = e.target.value;
                                      setWorkingHoursData(updated);
                                      setHasWorkingHoursChanges(true);
                                    }}
                                    className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                  />
                                  <span className="text-gray-400 text-xs">-</span>
                                  <input
                                    type="time"
                                    value={day.closeTime}
                                    onChange={(e) => {
                                      const updated = [...workingHoursData];
                                      updated[index].closeTime = e.target.value;
                                      setWorkingHoursData(updated);
                                      setHasWorkingHoursChanges(true);
                                    }}
                                    className="px-1.5 py-0.5 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent"
                                  />
                                </div>
                              ) : (
                                <span className="text-gray-500 text-xs font-medium">Closed</span>
                              )}

                              {/* Saved indicator for Monday (as shown in the image) */}
                              {day.dayName === "Monday" && !hasWorkingHoursChanges && workingHoursSaved && (
                                <div className="w-3 h-3 bg-green-500 rounded flex items-center justify-center ml-2">
                                  <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Error Display */}
                        {workingHoursError && (
                          <div className="text-xs text-red-600">{workingHoursError}</div>
                        )}

                        {/* Slot Size Configuration */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                          <h3 className="text-sm font-medium text-gray-900 mb-4">Booking slot size</h3>
                          <p className="text-xs text-gray-600 mb-4">
                            How often should available booking slots appear?
                          </p>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              max="120"
                              value={slotSizeData.value}
                              onChange={(e) => {
                                const newValue = parseInt(e.target.value) || 1;
                                setSlotSizeData(prev => ({ ...prev, value: newValue }));
                                setHasSlotSizeChanges(true);
                                setHasWorkingHoursChanges(true);
                              }}
                              className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                            <select
                              value={slotSizeData.value}
                              onChange={(e) => {
                                setSlotSizeData(prev => ({ ...prev, unit: e.target.value }));
                                setHasSlotSizeChanges(true);
                                setHasWorkingHoursChanges(true);
                              }}
                              className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            >
                              <option value="minutes">Minutes</option>
                              <option value="hours">Hours</option>
                            </select>
                          </div>
                        </div>

                        {/* Double Booking Control */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                          <h3 className="text-sm font-medium text-gray-900 mb-4">Double booking control</h3>
                          <p className="text-xs text-gray-600 mb-4">
                            Allow customers to book overlapping time slots?
                          </p>
                          <div className="flex items-center space-x-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={doubleBookingData.allowDoubleBooking}
                                onChange={(e) => {
                                  setDoubleBookingData(prev => ({ ...prev, allowDoubleBooking: e.target.checked }));
                                  setHasDoubleBookingChanges(true);
                                  setHasWorkingHoursChanges(true);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                              <span className="ml-3 text-xs text-gray-900">
                                {doubleBookingData.allowDoubleBooking ? 'Allowed' : 'Prevented'}
                              </span>
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            When disabled, customers cannot book time slots that overlap with existing bookings. Business owners can always create overlapping bookings from the dashboard.
                          </p>
                        </div>

                        {/* Save Changes Button */}
                        <div className="mt-8 flex justify-start">
                          <button
                            type="button"
                            disabled={!hasWorkingHoursChanges || isSavingWorkingHours}
                            className={`px-4 py-2 rounded-md transition-colors text-sm ${
                              !hasWorkingHoursChanges || isSavingWorkingHours
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-black text-white hover:bg-gray-800'
                            }`}
                            onClick={handleSaveWorkingHours}
                          >
                            {isSavingWorkingHours ? 'Saving…' : hasWorkingHoursChanges ? 'Save changes' : (workingHoursSaved ? 'Saved' : 'Save changes')}
                          </button>
                          {!hasWorkingHoursChanges && workingHoursSaved && (
                            <span className="text-xs text-green-600 ml-2">Changes saved</span>
                          )}
                        </div>
                      </div>
                    )}


                  </>
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