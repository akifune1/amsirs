import React from 'react';

type RiskLevel = 'Low' | 'Medium' | 'High';

interface RiskBadgeProps {
  level: RiskLevel;
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const baseStyles = 'text-xs font-semibold px-2.5 py-1 rounded-md inline-block';
  
  const styles = {
    Low: `${baseStyles} bg-green-50 text-green-700 border border-green-200`,
    Medium: `${baseStyles} bg-orange-50 text-orange-700 border border-orange-200`,
    High: `${baseStyles} bg-red-50 text-red-700 border border-red-200`,
  };

  return (
    <span className={styles[level]}>
      {level} Risk
    </span>
  );
}
