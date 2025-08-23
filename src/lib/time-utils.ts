/**
 * Utility functions for time formatting based on business preferences
 */

/**
 * Format a time string (HH:MM) based on the business time format preference
 * @param time - Time string in HH:MM format (24-hour)
 * @param timeFormat - Business time format preference ("12" or "24")
 * @returns Formatted time string
 */
export function formatTime(time: string, timeFormat: string = "24"): string {
  if (timeFormat === "12") {
    // Convert 24-hour format to 12-hour format
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }
  
  // Return 24-hour format as is
  return time;
}

/**
 * Format a time string for display in the calendar and other UI components
 * @param time - Time string in HH:MM format (24-hour)
 * @param timeFormat - Business time format preference ("12" or "24")
 * @returns Formatted time string
 */
export function formatTimeForDisplay(time: string, timeFormat: string = "24"): string {
  return formatTime(time, timeFormat);
}

/**
 * Format a time range (start - end) based on the business time format preference
 * @param startTime - Start time string in HH:MM format (24-hour)
 * @param endTime - End time string in HH:MM format (24-hour)
 * @param timeFormat - Business time format preference ("12" or "24")
 * @returns Formatted time range string
 */
export function formatTimeRange(startTime: string, endTime: string, timeFormat: string = "24"): string {
  if (timeFormat === "12") {
    const startFormatted = formatTime(startTime, "12");
    const endFormatted = formatTime(endTime, "12");
    return `${startFormatted} - ${endFormatted}`;
  }
  
  // Return 24-hour format as is
  return `${startTime} - ${endTime}`;
}

/**
 * Get the default time format for a business
 * @returns Default time format ("24")
 */
export function getDefaultTimeFormat(): string {
  return "24";
}
