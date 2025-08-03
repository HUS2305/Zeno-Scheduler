"use client";

interface OpeningHour {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

interface BusinessHoursProps {
  openingHours: OpeningHour[];
}

export default function BusinessHours({ openingHours }: BusinessHoursProps) {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const formatTime = (time: string) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayHours = (dayIndex: number) => {
    return openingHours.find(hour => hour.dayOfWeek === dayIndex);
  };

  return (
    <div className="space-y-3">
      {dayNames.map((dayName, index) => {
        const dayHours = getDayHours(index);
        const isToday = new Date().getDay() === index;

        return (
          <div key={dayName} className="flex justify-between items-center text-xs">
            <span className={`${isToday ? 'text-black font-medium' : 'text-gray-700'}`}>
              {dayName}
            </span>
            <span className={`${isToday ? 'text-black font-medium' : 'text-gray-600'}`}>
              {dayHours ? `${formatTime(dayHours.openTime)} - ${formatTime(dayHours.closeTime)}` : 'Closed'}
            </span>
          </div>
        );
      })}
    </div>
  );
} 