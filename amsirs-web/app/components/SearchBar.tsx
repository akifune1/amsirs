"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function SearchBar({ placeholder = "Search...", paramName = "q" }: { placeholder?: string, paramName?: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    // Reset page on new search if applicable
    params.delete("page");
    params.delete("staffPage");
    params.delete("studentPage");

    if (term) {
      params.set(paramName, term);
    } else {
      params.delete(paramName);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative flex flex-1 flex-shrink-0 max-w-sm">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-cavite-border py-2 pl-9 text-sm outline-none placeholder:text-zinc-400 focus:border-cavite-maroon focus:ring-1 focus:ring-cavite-maroon transition-all bg-white text-cavite-black shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get(paramName)?.toString()}
      />
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 peer-focus:text-cavite-maroon transition-colors"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    </div>
  );
}
