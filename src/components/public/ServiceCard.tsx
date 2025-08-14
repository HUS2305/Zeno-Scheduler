"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number | null;
  colorTheme: string;
  teamLinks: Array<{
    teamMember: {
      id: string;
      name: string;
    };
  }>;
}

interface ServiceCardProps {
  service: Service;
  theme: string;
  brandColor: string;
}

export default function ServiceCard({ service, theme, brandColor }: ServiceCardProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    return `${hours} hr ${remainingMinutes} mins`;
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === 0) {
      return "Free";
    }
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all duration-200 border ${
      theme === 'dark' 
        ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' 
        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
    }`}
    style={{
      borderColor: theme === 'dark' ? undefined : (brandColor !== '#000000' ? brandColor : undefined),
      '--tw-border-opacity': theme === 'dark' ? undefined : (brandColor !== '#000000' ? '0.3' : undefined),
    } as React.CSSProperties}
    onMouseEnter={(e) => {
      if (brandColor !== '#000000' && theme !== 'dark') {
        e.currentTarget.style.borderColor = brandColor;
        e.currentTarget.style.borderOpacity = '0.6';
      }
    }}
    onMouseLeave={(e) => {
      if (brandColor !== '#000000' && theme !== 'dark') {
        e.currentTarget.style.borderColor = brandColor;
        e.currentTarget.style.borderOpacity = '0.3';
      }
    }}>
      {/* Service Icon */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
        theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'
      }`}
      style={{
        backgroundColor: theme === 'dark' ? undefined : (brandColor !== '#000000' ? `${brandColor}20` : undefined),
      }}>
        <svg className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Service Details */}
      <div className="flex-1">
        <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{service.name}</h3>
        <div className={`flex items-center space-x-3 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          <span>{formatDuration(service.duration)}</span>
          <span>{formatPrice(service.price)}</span>
        </div>
      </div>

      {/* Arrow */}
      <ArrowRightIcon className={`h-4 w-4 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
    </div>
  );
} 