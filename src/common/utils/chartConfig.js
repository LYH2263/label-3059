import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
    RadialLinearScale
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
    RadialLinearScale
);

export const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                    family: 'Inter, sans-serif',
                    size: 12
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            padding: 12,
            cornerRadius: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 14 }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#64748B' }
        },
        y: {
            grid: { color: '#F1F5F9', borderDash: [4, 4] },
            ticks: { color: '#64748B' }
        }
    }
};

export const chartColors = {
    primary: '#FF8A3D',
    secondary: '#4F46E5',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
    orange: '#FF8A3D'
};

export const chartGradients = (ctx, color) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, `${color}44`);
    gradient.addColorStop(1, `${color}00`);
    return gradient;
};
