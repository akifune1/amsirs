"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  totalPages: number;
  paramName?: string;
}

export default function Pagination({ totalPages, paramName = "page" }: PaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentPage = Number(searchParams.get(paramName)) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set(paramName, pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  const btnClass =
    "px-4 py-1.5 text-sm font-medium rounded-md transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed border";

  return (
    <div
      className="flex items-center justify-between px-5 py-3 rounded-b-lg"
      style={{
        backgroundColor: 'var(--sys-surface)',
        borderTop: '1px solid var(--sys-border)',
      }}
    >
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => router.push(createPageURL(currentPage - 1))}
          disabled={currentPage <= 1}
          className={btnClass}
          style={{
            backgroundColor: 'var(--sys-surface-muted)',
            borderColor: 'var(--sys-border)',
            color: 'var(--sys-text-primary)',
          }}
        >
          Previous
        </button>
        <button
          onClick={() => router.push(createPageURL(currentPage + 1))}
          disabled={currentPage >= totalPages}
          className={`ml-3 ${btnClass}`}
          style={{
            backgroundColor: 'var(--sys-surface-muted)',
            borderColor: 'var(--sys-border)',
            color: 'var(--sys-text-primary)',
          }}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--sys-text-muted)' }}>
            Page{" "}
            <span className="font-semibold" style={{ color: 'var(--sys-text-primary)' }}>{currentPage}</span>
            {" "}of{" "}
            <span className="font-semibold" style={{ color: 'var(--sys-text-primary)' }}>{totalPages}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(createPageURL(currentPage - 1))}
            disabled={currentPage <= 1}
            className={btnClass}
            style={{
              backgroundColor: 'var(--sys-surface-muted)',
              borderColor: 'var(--sys-border)',
              color: 'var(--sys-text-primary)',
            }}
          >
            Previous
          </button>
          <button
            onClick={() => router.push(createPageURL(currentPage + 1))}
            disabled={currentPage >= totalPages}
            className={btnClass}
            style={{
              backgroundColor: 'var(--sys-surface-muted)',
              borderColor: 'var(--sys-border)',
              color: 'var(--sys-text-primary)',
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
