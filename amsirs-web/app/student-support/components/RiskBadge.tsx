import React from 'react';

type RiskLevel = 'Low' | 'Medium' | 'High';

interface RiskBadgeProps {
  level: RiskLevel;
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const baseStyles = 'text-xs font-semibold px-2.5 py-1 rounded-md inline-block';
  
  // Since we removed severity, all flagged students are currently under investigation
  const style = `${baseStyles} bg-red-50 text-red-700 border border-red-200`;

  return (
    <span className={style}>
      Under Investigation
    </span>
  );
}
