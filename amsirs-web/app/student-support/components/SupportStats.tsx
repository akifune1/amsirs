import React from 'react';
import { Heart, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface StatData {
  activeCases: number;
  highRisk: number;
  pendingFollowUps: number;
  resolvedCases: number;
}

interface SupportStatsProps {
  data: StatData;
}

export default function SupportStats({ data }: SupportStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {/* Active Cases */}
      <div className="stat-card group hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="sys-label">Active Cases</p>
            <p className="stat-value">{data.activeCases}</p>
          </div>
          <Heart className="text-cavite-maroon/30 w-8 h-8 group-hover:text-cavite-maroon transition-colors" />
        </div>
      </div>

      {/* High-Risk Students */}
      <div className="stat-card group hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="sys-label">High-Risk</p>
            <p className="stat-value-danger">{data.highRisk}</p>
          </div>
          <AlertTriangle className="text-red-400/50 w-8 h-8 group-hover:text-red-600 transition-colors" />
        </div>
      </div>

      {/* Pending Follow-Ups */}
      <div className="stat-card group hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="sys-label">Pending Follow-Ups</p>
            <p className="stat-value">{data.pendingFollowUps}</p>
          </div>
          <Clock className="text-yellow-400/50 w-8 h-8 group-hover:text-yellow-600 transition-colors" />
        </div>
      </div>

      {/* Resolved Cases */}
      <div className="stat-card group hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="sys-label">Resolved</p>
            <p className="stat-value-success">{data.resolvedCases}</p>
          </div>
          <CheckCircle className="text-green-400/50 w-8 h-8 group-hover:text-green-600 transition-colors" />
        </div>
      </div>
    </div>
  );
}
