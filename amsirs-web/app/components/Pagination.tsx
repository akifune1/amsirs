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

  return (
    <div className="flex items-center justify-between border-t border-cavite-border bg-white px-5 py-3 rounded-b-lg">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => router.push(createPageURL(currentPage - 1))}
          disabled={currentPage <= 1}
          className="bg-zinc-100 border border-cavite-border text-cavite-black px-4 py-1.5 text-sm font-medium rounded-md hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => router.push(createPageURL(currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="ml-3 bg-zinc-100 border border-cavite-border text-cavite-black px-4 py-1.5 text-sm font-medium rounded-md hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500 font-medium">
            Page <span className="font-semibold text-cavite-black">{currentPage}</span> of{" "}
            <span className="font-semibold text-cavite-black">{totalPages}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(createPageURL(currentPage - 1))}
            disabled={currentPage <= 1}
            className="bg-zinc-100 border border-cavite-border text-cavite-black px-4 py-1.5 text-sm font-medium rounded-md hover:bg-zinc-200 hover:border-zinc-300 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => router.push(createPageURL(currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="bg-zinc-100 border border-cavite-border text-cavite-black px-4 py-1.5 text-sm font-medium rounded-md hover:bg-zinc-200 hover:border-zinc-300 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
