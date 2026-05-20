import { Suspense } from "react";
import { BookingPageContent } from "@/components/booking/booking-page-content";
import "../booking.css";
import "../../search/search.css";

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="booking-page" style={{ padding: "2rem" }}>
          Loading…
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
