'use client';

import { useEffect, useState } from 'react';
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
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { getAttendanceAnalytics } from './analyticsActions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getAttendanceAnalytics();
        if (res.success) {
          setData(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="mb-6">
          <div className="h-6 w-64 bg-gray-200 animate-pulse rounded-md mb-2"></div>
          <div className="h-4 w-96 bg-gray-100 animate-pulse rounded-md"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart Skeleton */}
          <div className="sys-card p-6 flex flex-col h-[400px]">
            <div className="h-5 w-48 bg-gray-200 animate-pulse rounded-md mb-4"></div>
            <div className="flex-1 w-full bg-gray-100/50 rounded-lg border border-dashed border-gray-200 animate-pulse"></div>
          </div>

          {/* Late Chart Skeleton */}
          <div className="sys-card p-6 flex flex-col h-[400px]">
            <div className="h-5 w-56 bg-gray-200 animate-pulse rounded-md mb-4"></div>
            <div className="flex-1 w-full bg-gray-100/50 rounded-lg border border-dashed border-gray-200 animate-pulse"></div>
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="sys-card p-5 bg-white border border-gray-100">
              <div className="h-3 w-24 bg-gray-200 animate-pulse rounded-md mb-2"></div>
              <div className="h-8 w-16 bg-gray-300 animate-pulse rounded-md mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 text-center text-zinc-500">
        Failed to load analytics data.
      </div>
    );
  }

  // Configuration for the Line Chart (Trends)
  const trendChartData = {
    labels: data.trendData.labels,
    datasets: [
      {
        label: 'Entries',
        data: data.trendData.entries,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Exits',
        data: data.trendData.exits,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // Configuration for the Bar Chart (Late Arrivals)
  const lateChartData = {
    labels: data.lateData.labels,
    datasets: [
      {
        label: 'Late Arrivals (Post 8:00 AM)',
        data: data.lateData.counts,
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderRadius: 4
      }
    ]
  };

  const lateChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="sys-label">Attendance Analytics Dashboard</h2>
        <p className="text-sm text-zinc-500 mt-1">High-level insights based on physical access logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Chart */}
        <div className="sys-card p-6 flex flex-col h-[400px]">
          <h3 className="font-bold text-gray-800 mb-4">Daily Volume Trends</h3>
          <div className="flex-1 relative w-full">
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        </div>

        {/* Late Chart */}
        <div className="sys-card p-6 flex flex-col h-[400px]">
          <h3 className="font-bold text-gray-800 mb-4">Late Arrivals by Section</h3>
          <div className="flex-1 relative w-full">
            <Bar data={lateChartData} options={lateChartOptions} />
          </div>
        </div>

      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="sys-card p-5 bg-gradient-to-br from-green-50 to-emerald-100/50 border-green-200/50">
          <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Avg Daily Entries</span>
          <p className="text-3xl font-black text-green-900 mt-2">
            {data.trendData.entries.length > 0 ? Math.round(data.trendData.entries.reduce((a:number,b:number)=>a+b, 0) / data.trendData.entries.length) : 0}
          </p>
        </div>
        <div className="sys-card p-5 bg-gradient-to-br from-amber-50 to-orange-100/50 border-orange-200/50">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Top Late Section</span>
          <p className="text-2xl font-black text-amber-900 mt-2 truncate">
            {data.lateData.labels.length > 0 ? data.lateData.labels[0] : 'N/A'}
          </p>
        </div>
        <div className="sys-card p-5 bg-gradient-to-br from-blue-50 to-indigo-100/50 border-indigo-200/50">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Total Logs Analyzed</span>
          <p className="text-3xl font-black text-indigo-900 mt-2">
            {data.trendData.entries.reduce((a:number,b:number)=>a+b, 0) + data.trendData.exits.reduce((a:number,b:number)=>a+b, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
