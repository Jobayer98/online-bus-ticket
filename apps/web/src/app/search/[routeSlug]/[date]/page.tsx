import { Suspense } from "react";
import { SearchResultsContent } from "@/components/search/search-results-content";

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg)] p-8 text-center text-[#666]">
          Loading…
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
