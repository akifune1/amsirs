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
      <div className="stat-card-primary">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl z-0"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1">
            <p className="stat-label-light">Active Cases</p>
            <p className="stat-value-light">{data.activeCases}</p>
          </div>
          <Heart className="text-white/30 w-8 h-8" />
        </div>
      </div>

      {/* High-Risk Students */}
      <div className="stat-card-orange">
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1">
            <p className="stat-label-light">High-Risk</p>
            <p className="stat-value-light">{data.highRisk}</p>
          </div>
          <AlertTriangle className="text-white/30 w-8 h-8" />
        </div>
      </div>

      {/* Pending Follow-Ups */}
      <div className="stat-card group">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="stat-label">Pending Follow-Ups</p>
            <p className="stat-value">{data.pendingFollowUps}</p>
          </div>
          <Clock className="text-gray-300 w-8 h-8 group-hover:text-gray-500 transition-colors" />
        </div>
      </div>

      {/* Resolved Cases */}
      <div className="stat-card group">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="stat-label">Resolved</p>
            <p className="stat-value text-green-500">{data.resolvedCases}</p>
          </div>
          <CheckCircle className="text-gray-300 w-8 h-8 group-hover:text-green-500 transition-colors" />
        </div>
      </div>
    </div>
  );
}
