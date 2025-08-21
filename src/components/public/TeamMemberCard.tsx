"use client";

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
    <div className="flex items-center space-x-2 -ml-2">
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-200' : 'bg-gray-300'
      }`}
      style={{
        backgroundColor: theme === 'dark' ? undefined : '#d1d5db',
      }}>
        <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-800' : 'text-gray-700'}`}
        style={{
          color: theme === 'dark' ? undefined : '#374151',
        }}>
          {member.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Member Details */}
      <div className="flex-1">
        <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{member.name}</h3>
      </div>
    </div>
  );
} 