'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  paramName: string;
  options: FilterOption[];
  defaultValue?: string;
  placeholder?: string;
}

export default function FilterDropdown({ paramName, options, defaultValue = '', placeholder = 'Filter...' }: FilterDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentVal = searchParams.get(paramName) || defaultValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      const params = new URLSearchParams(searchParams.toString());
      if (val && val !== defaultValue && val !== 'All') {
        params.set(paramName, val);
      } else {
        params.delete(paramName);
      }
      
      // When a filter changes, we typically want to reset the page to 1
      // We look for any param ending in "Page" or exactly "page" and reset it
      for (const key of Array.from(params.keys())) {
        if (key.toLowerCase().includes('page')) {
          params.set(key, '1');
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [paramName, pathname, router, searchParams, defaultValue]
  );

  return (
    <div className="flex items-center gap-2">
      {placeholder && (
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sys-text-muted)' }}>
          {placeholder}
        </label>
      )}
      <select 
        value={currentVal} 
        onChange={handleChange}
        className="text-sm font-medium px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon cursor-pointer shadow-sm transition-all min-w-[140px]"
        style={{
          backgroundColor: 'var(--sys-input-bg)',
          borderColor: 'var(--sys-border)',
          color: 'var(--sys-text-primary)',
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
