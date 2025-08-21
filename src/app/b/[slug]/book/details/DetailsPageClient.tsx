"use client";

import { useState } from "react";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number | null;
}

interface Business {
  id: string;
  name: string;
  profilePic: string | null;
  teamMembers: TeamMember[];
  theme?: string | null;
  brandColor?: string | null;
}

interface DetailsPageClientProps {
  business: Business;
  selectedService: Service;
  selectedTeamMember: TeamMember;
  serviceId: string;
  teamMemberId?: string;
  selectedDate: string;
  selectedTime: string;
  slug: string;
}

export default function DetailsPageClient({
  business,
  selectedService,
  selectedTeamMember,
  serviceId,
  teamMemberId,
  selectedDate,
  selectedTime,
  slug,
}: DetailsPageClientProps) {
  // Debug: Log the received date and time to confirm they're correct
  console.log('Received selectedDate:', selectedDate);
  console.log('Received selectedTime:', selectedTime);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    country: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    comments: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Validation function to check if required fields are filled
  const isFormValid = () => {
    return formData.name.trim() !== '' && 
           formData.email.trim() !== '' && 
           formData.phone.trim() !== '';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} mins`;
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Free';
    return `kr ${price}`;
  };

  const formatDate = (dateString: string) => {
    // Parse date string and ensure it's treated as local time, not UTC
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    
    // Debug: Log the parsing process
    console.log('formatDate input:', dateString);
    console.log('Parsed year, month, day:', year, month, day);
    console.log('Created Date object:', date);
    console.log('Date.toDateString():', date.toDateString());
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "is required";
    }
    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = "is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "is required";
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      const requestBody = {
        businessId: business.id,
        serviceId,
        teamMemberId: teamMemberId || null,
        date: selectedDate,
        time: selectedTime,
        customerDetails: formData,
      };
      
      try {
        const response = await fetch("/api/public/booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
        
        if (response.ok) {
          const result = await response.json();
          
          // Show confirmation modal instead of alert
          setShowConfirmationModal(true);
        } else {
          const errorData = await response.json();
          console.error("Booking failed:", errorData);
          alert(`Booking failed: ${errorData.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error submitting booking:", error);
        alert("An error occurred while submitting your booking. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={`min-h-screen ${business.theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`${business.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-10">
            <button
              onClick={() => router.back()}
              className={`flex items-center ${business.theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'} mr-3`}
            >
              <ArrowLeftIcon className="h-4 w-4 font-bold" />
            </button>
            <h1 className={`text-base font-semibold ${business.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your details</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - Form */}
          <div className={`${business.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4`}>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Main details section */}
              <div>
                <h4 className={`text-xs font-medium ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Main details</h4>
                <div className="space-y-3">
                  {/* Full Name */}
                  <div>
                    <label className={`block text-xs ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Full name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 text-xs ${
                        business.theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-gray-500' 
                          : 'border-gray-300 text-gray-900 focus:ring-black'
                      } ${
                        errors.name ? "border-red-500" : ""
                      }`}
                      placeholder="Enter name"
                      required
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={`block text-xs ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Primary phone
                    </label>
                    <PhoneInput
                      international
                      defaultCountry="DK"
                      value={formData.phone}
                      onChange={(value) => handleInputChange("phone", value || "")}
                      className={`w-full ${errors.phone ? "border-red-500" : ""}`}
                      style={{
                        '--PhoneInputCountryFlag-borderColor': 'transparent',
                        '--PhoneInputCountryFlag-borderWidth': '0',
                      } as React.CSSProperties}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`block text-xs ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Primary email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 text-xs ${
                        business.theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-gray-500' 
                          : 'border-gray-300 text-gray-900 focus:ring-black'
                      } ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Company */}
                  <div>
                    <label className={`block text-xs ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Company name
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 text-xs ${
                        business.theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-gray-500' 
                          : 'border-gray-300 text-gray-900 focus:ring-black'
                      }`}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>
              </div>

              {/* Address section */}
              <div>
                <h4 className={`text-xs font-medium ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Address</h4>
                <div className="space-y-3">
                  {/* Country */}
                  <div>
                    <label className={`block text-xs ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Country
                    </label>
                    <select 
                      value={formData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent text-xs ${
                        business.theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-black'
                      }`}
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

                  {/* Address */}
                  <div>
                    <label className={`block text-xs ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 text-xs ${
                        business.theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-gray-500' 
                          : 'border-gray-300 text-gray-900 focus:ring-black'
                      }`}
                      placeholder="Enter street name, apt, suite, floor"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className={`block text-xs ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 text-xs ${
                        business.theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-gray-500' 
                          : 'border-gray-300 text-gray-900 focus:ring-black'
                      }`}
                      placeholder="Enter city"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className={`block text-xs ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 text-xs ${
                        business.theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-gray-500' 
                          : 'border-gray-300 text-gray-900 focus:ring-black'
                      }`}
                      placeholder="Enter state"
                    />
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label className={`block text-xs ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Zip code
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 text-xs ${
                        business.theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-gray-500' 
                          : 'border-gray-300 text-gray-900 focus:ring-black'
                      }`}
                      placeholder="Enter zip code"
                    />
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className={`block text-xs font-medium ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Comments
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => handleInputChange("comments", e.target.value)}
                  rows={2}
                  className={`w-full p-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:border-transparent ${
                    business.theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-gray-500' 
                      : 'border-gray-300 text-gray-900 focus:ring-black'
                  }`}
                  placeholder="Any additional information..."
                />
              </div>

                             {/* Submit Button */}
               <button
                 type="submit"
                 disabled={isSubmitting || !isFormValid()}
                 className={`w-full mt-4 py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                   isFormValid() 
                     ? 'text-white hover:opacity-90' 
                     : 'text-white bg-gray-400 cursor-not-allowed'
                 } disabled:opacity-50 disabled:cursor-not-allowed`}
                 style={{
                   backgroundColor: isFormValid() 
                     ? '#000000' // Black background when form is valid
                     : '#9CA3AF' // Gray background when form is invalid
                 }}
               >
                 {isSubmitting ? "Creating Booking..." : "Confirm"}
               </button>
            </form>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-4">
            {/* Business Info */}
            <div className={`${business.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4`}>
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 ${business.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                  {business.profilePic ? (
                    <img
                      src={business.profilePic}
                      alt={business.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className={`text-lg font-bold ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {business.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className={`text-base font-semibold ${business.theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>{business.name}</h3>
              </div>
            </div>

            {/* Summary */}
            <div className={`${business.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4`}>
              <h3 className={`text-base font-semibold ${business.theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Service</span>
                  <span className={`text-sm font-medium ${business.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedService.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Duration</span>
                  <span className={`text-sm font-medium ${business.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatDuration(selectedService.duration)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Provider</span>
                  <span className={`text-sm font-medium ${business.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTeamMember.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Date & Time</span>
                  <div className="flex items-center">
                    <button
                      onClick={() => router.back()}
                      className={`p-1 rounded transition-colors mr-2 ${
                        business.theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                      title="Go back to edit date and time"
                    >
                      <PencilIcon className={`h-3 w-3 ${business.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    <span className={`text-sm font-medium ${business.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(selectedDate)} at {formatTime(selectedTime)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Price</span>
                  <span className={`text-sm font-medium ${business.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatPrice(selectedService.price)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

             {/* Booking Confirmation Modal */}
       {showConfirmationModal && (
         <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
           <div className={`${business.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full mx-4 relative border`}>
             {/* Close button (X) in top right corner */}
             <button
               onClick={() => {
                 setShowConfirmationModal(false);
                 router.push(`/public`);
               }}
               className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${
                 business.theme === 'dark' 
                   ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                   : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
               }`}
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
             
             <div className="p-6">
               <div className="text-center mb-4">
                 <div className={`w-12 h-12 mx-auto mb-3 ${business.theme === 'dark' ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center`}>
                   <svg className={`w-6 h-6 ${business.theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                 </div>
                 <h3 className={`text-lg font-semibold ${business.theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                   Booking Confirmed!
                 </h3>
                 <p className={`text-sm ${business.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                   Thank you for your booking. We'll see you soon!
                 </p>
               </div>

              {/* Booking Summary */}
              <div className={`${business.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
                <h4 className={`text-sm font-medium ${business.theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={business.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Service:</span>
                    <span className={`font-medium ${business.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={business.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Date:</span>
                    <span className={`font-medium ${business.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={business.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Time:</span>
                    <span className={`font-medium ${business.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatTime(selectedTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={business.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Provider:</span>
                    <span className={`font-medium ${business.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTeamMember.name}</span>
                  </div>
                </div>
              </div>

                             <div className="flex justify-center">
                 <button
                   onClick={() => {
                     setShowConfirmationModal(false);
                     router.push(`/public`);
                   }}
                   className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors text-sm font-medium"
                   style={{
                     backgroundColor: '#000000' // Black background
                   }}
                 >
                   OK
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 