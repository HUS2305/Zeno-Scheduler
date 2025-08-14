"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
}

interface TeamMemberCardProps {
  member: TeamMember;
  theme: string;
  brandColor: string;
}

export default function TeamMemberCard({ member, theme, brandColor }: TeamMemberCardProps) {
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
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
        theme === 'dark' ? 'bg-indigo-200' : 'bg-indigo-100'
      }`}
      style={{
        backgroundColor: theme === 'dark' ? undefined : (brandColor !== '#000000' ? `${brandColor}20` : undefined),
      }}>
        <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-indigo-800' : 'text-indigo-600'}`}
        style={{
          color: theme === 'dark' ? undefined : (brandColor !== '#000000' ? brandColor : undefined),
        }}>
          {member.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Member Details */}
      <div className="flex-1">
        <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{member.name}</h3>
        {member.email && (
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{member.email}</p>
        )}
      </div>

      {/* Arrow */}
      <ArrowRightIcon className={`h-4 w-4 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
    </div>
  );
} 