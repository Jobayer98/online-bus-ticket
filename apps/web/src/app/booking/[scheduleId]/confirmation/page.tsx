import { Suspense } from "react";
import { BookingConfirmationContent } from "@/components/booking/booking-confirmation-content";

export default function ConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <BookingConfirmationContent />
    </Suspense>
  );
}
