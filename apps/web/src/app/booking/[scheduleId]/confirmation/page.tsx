import { Suspense } from "react";
import { BookingConfirmationContent } from "@/components/booking/booking-confirmation-content";
import "../../booking-ticket.css";
import "../../../search/search.css";
import "../../../home.css";

export default function ConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <BookingConfirmationContent />
    </Suspense>
  );
}
