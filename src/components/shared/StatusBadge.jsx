/**
 * StatusBadge Component
 * Color-coded badge for duty status display
 */
export default function StatusBadge({ status }) {
    const getStatusStyles = () => {
        switch (status) {
            case 'on-time':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-700',
                    label: 'ON TIME'
                };
            case 'late':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-700',
                    label: 'LATE'
                };
            case 'pending':
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    label: 'Pending'
                };
        }
    };

    const styles = getStatusStyles();

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${styles.bg} ${styles.text}`}>
            {styles.label}
        </span>
    );
}
