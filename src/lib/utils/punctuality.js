/**
 * Punctuality Detection Utilities
 * Handles automatic status calculation based on arrival time
 */

/**
 * Validates if an instructor arrived on time
 * 
 * Logic: Must arrive before the deadline (exam start - buffer minutes)
 * - On-time: Arrive BEFORE the deadline time
 * - Late: Arrive AT or AFTER the deadline time
 * 
 * Example: Exam at 1:00 PM, buffer 5 min → Deadline 12:55 PM
 * - Arrive at 12:54 PM → ON TIME
 * - Arrive at 12:55 PM or later → LATE
 * 
 * @param {string} reportingTime - Exam start time in HH:MM format (e.g., "13:00")
 * @param {Date} arrivalTime - Actual arrival timestamp
 * @param {number} deadlineMinutes - Buffer minutes before exam start (default: 30)
 * @returns {'on-time' | 'late'} Status based on arrival
 */
export function validateArrival(reportingTime, arrivalTime, deadlineMinutes = 30) {
    // Parse exam start time (format: "HH:MM")
    const [hours, minutes] = reportingTime.split(':').map(Number);

    // Create exam start time using the arrival date
    const examStartTime = new Date(arrivalTime);
    examStartTime.setHours(hours, minutes, 0, 0);

    // Calculate deadline (exam start - buffer minutes)
    const deadline = new Date(examStartTime.getTime() - deadlineMinutes * 60 * 1000);

    // On-time: arrived BEFORE deadline
    // Late: arrived AT or AFTER deadline
    return arrivalTime < deadline ? 'on-time' : 'late';
}

/**
 * Calculates punctuality percentage for an instructor
 * 
 * @param {Array} duties - Array of duty objects with status field
 * @returns {number} Percentage of on-time arrivals (0-100)
 */
export function calculatePunctualityRate(duties) {
    if (!duties || duties.length === 0) return 0;

    const completedDuties = duties.filter(d => d.status !== 'pending');
    if (completedDuties.length === 0) return 0;

    const onTimeDuties = completedDuties.filter(d => d.status === 'on-time');
    return Math.round((onTimeDuties.length / completedDuties.length) * 100);
}

/**
 * Formats time for display
 * @param {string} time24 - Time in 24-hour format (HH:MM)
 * @returns {string} Time in 12-hour format with AM/PM
 */
export function formatTime(time24) {
    if (!time24) return '';

    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;

    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Calculates the deadline time (configurable min before reporting)
 * @param {string} reportingTime - Time in HH:MM format
 * @param {number} deadlineMinutes - Minutes before reporting time (default: 30)
 * @returns {string} Deadline time in 12-hour format
 */
export function getDeadlineTime(reportingTime, deadlineMinutes = 30) {
    const [hours, minutes] = reportingTime.split(':').map(Number);
    const reporting = new Date();
    reporting.setHours(hours, minutes, 0, 0);

    const deadline = new Date(reporting.getTime() - deadlineMinutes * 60 * 1000);
    const deadlineHours = deadline.getHours();
    const deadlineMinutesVal = deadline.getMinutes();

    const period = deadlineHours >= 12 ? 'PM' : 'AM';
    const hours12 = deadlineHours % 12 || 12;

    return `${hours12}:${deadlineMinutesVal.toString().padStart(2, '0')} ${period}`;
}
