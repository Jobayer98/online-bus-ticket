import { Suspense } from "react";
import { BookingConfirmationContent } from "@/components/booking/booking-confirmation-content";
import "../../booking-ticket.css";
import "../../../search/search.css";
import "../../../home.css";

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="confirmation-page" style={{ padding: "2rem" }}>
          Loading confirmation…
        </div>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}
