'use client';

import Papa from 'papaparse';
import { Download, Printer } from 'lucide-react';

export function ExportButtons({ 
  data, 
  filename = 'export', 
  title = 'Document'
}: { 
  data: any[], 
  filename?: string,
  title?: string
}) {
  
  const handleExportCSV = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    // A clean print relies on @media print CSS hiding navigation elements
    window.print();
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <button 
        onClick={handlePrint}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md shadow-sm transition-colors border"
        style={{
          backgroundColor: 'var(--sys-surface)',
          borderColor: 'var(--sys-border)',
          color: 'var(--sys-text-secondary)',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--sys-surface-muted)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--sys-surface)')}
      >
        <Printer className="w-3.5 h-3.5" />
        Print PDF
      </button>
      <button 
        onClick={handleExportCSV}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-cavite-maroon hover:bg-cavite-maroon/90 border border-transparent rounded-md shadow-sm transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Export CSV
      </button>
    </div>
  );
}
