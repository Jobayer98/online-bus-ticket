import { Suspense } from "react";
import { SearchResultsContent } from "@/components/search/search-results-content";
import "../../search.css";
import "../../../home.css";

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="search-page sp-empty" style={{ padding: "2rem" }}>
          Loading…
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
