import React from 'react';

type RiskLevel = 'Low' | 'Medium' | 'High';

interface RiskBadgeProps {
  level: RiskLevel;
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const baseStyles = 'text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter inline-block';
  
  const styles = {
    Low: `${baseStyles} bg-green-100 text-green-700 border border-green-300`,
    Medium: `${baseStyles} bg-yellow-100 text-yellow-700 border border-yellow-300`,
    High: `${baseStyles} bg-red-100 text-red-700 border border-red-300`,
  };

  return (
    <span className={styles[level]}>
      {level} Risk
    </span>
  );
}
