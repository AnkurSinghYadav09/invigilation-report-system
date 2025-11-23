/**
 * Workload Distribution Intelligence
 * Analyzes duty distribution and suggests instructors for fair assignment
 */

/**
 * Analyzes workload distribution across all instructors
 * Flags overloaded (>20% above avg) and underutilized (<20% below avg)
 * 
 * @param {Array} instructors - Array of instructor objects with total_duties
 * @returns {Array} Analysis with variance and status for each instructor
 */
export function analyzeWorkload(instructors) {
    if (!instructors || instructors.length === 0) return [];

    // Calculate average duties
    const totalDuties = instructors.reduce((sum, i) => sum + (i.total_duties || 0), 0);
    const average = totalDuties / instructors.length;

    // Analyze each instructor
    return instructors.map(instructor => {
        const variance = (instructor.total_duties || 0) - average;
        const percentageVariance = average > 0 ? (variance / average) * 100 : 0;

        let status = 'balanced';
        if (percentageVariance > 20) {
            status = 'overloaded';
        } else if (percentageVariance < -20) {
            status = 'underutilized';
        }

        return {
            ...instructor,
            variance: Math.round(variance * 10) / 10, // Round to 1 decimal
            percentageVariance: Math.round(percentageVariance),
            status,
            average: Math.round(average * 10) / 10
        };
    });
}

/**
 * Suggests the best instructor for a new duty assignment
 * Prioritizes instructors with the least current duties
 * 
 * @param {Array} instructors - Array of instructor objects
 * @param {string} department - Optional department filter
 * @returns {Object|null} Suggested instructor with recommendation text
 */
export function suggestInstructor(instructors, department = null) {
    if (!instructors || instructors.length === 0) return null;

    // Filter by department if specified
    let candidates = department
        ? instructors.filter(i => i.department === department)
        : instructors;

    if (candidates.length === 0) return null;

    // Analyze workload
    const analysis = analyzeWorkload(candidates);

    // Sort by total duties (ascending) - least duties first
    const sorted = [...analysis].sort((a, b) =>
        (a.total_duties || 0) - (b.total_duties || 0)
    );

    const suggested = sorted[0];
    const average = suggested.average;

    // Create recommendation text
    let recommendation = `${suggested.name} - Currently has ${suggested.total_duties || 0} duties`;

    if (suggested.variance < 0) {
        recommendation += ` (${Math.abs(suggested.variance)} below average)`;
    } else if (suggested.variance > 0) {
        recommendation += ` (${suggested.variance} above average)`;
    } else {
        recommendation += ` (at average)`;
    }

    return {
        instructor: suggested,
        recommendation,
        reason: suggested.status === 'underutilized'
            ? 'Underutilized - good candidate for balancing workload'
            : suggested.status === 'balanced'
                ? 'Balanced workload'
                : 'Note: This instructor is already overloaded'
    };
}

/**
 * Flags instructors with workload imbalances
 * Returns alerts for admin dashboard
 * 
 * @param {Array} analysis - Workload analysis from analyzeWorkload()
 * @returns {Array} Array of alert objects
 */
export function flagImbalances(analysis) {
    const alerts = [];

    const overloaded = analysis.filter(a => a.status === 'overloaded');
    const underutilized = analysis.filter(a => a.status === 'underutilized');

    if (overloaded.length > 0) {
        alerts.push({
            type: 'warning',
            title: 'Overloaded Instructors',
            message: `${overloaded.length} instructor(s) have >20% more duties than average`,
            instructors: overloaded.map(i => i.name)
        });
    }

    if (underutilized.length > 0) {
        alerts.push({
            type: 'info',
            title: 'Underutilized Instructors',
            message: `${underutilized.length} instructor(s) have <20% fewer duties than average`,
            instructors: underutilized.map(i => i.name)
        });
    }

    return alerts;
}

/**
 * Calculates department-wise statistics
 * @param {Array} instructors - Array of instructors with duties
 * @returns {Object} Department statistics
 */
export function getDepartmentStats(instructors) {
    const deptMap = {};

    instructors.forEach(instructor => {
        const dept = instructor.department || 'Unknown';
        if (!deptMap[dept]) {
            deptMap[dept] = {
                department: dept,
                instructorCount: 0,
                totalDuties: 0,
                avgDuties: 0
            };
        }

        deptMap[dept].instructorCount++;
        deptMap[dept].totalDuties += instructor.total_duties || 0;
    });

    // Calculate averages
    Object.values(deptMap).forEach(dept => {
        dept.avgDuties = dept.instructorCount > 0
            ? Math.round((dept.totalDuties / dept.instructorCount) * 10) / 10
            : 0;
    });

    return Object.values(deptMap);
}
