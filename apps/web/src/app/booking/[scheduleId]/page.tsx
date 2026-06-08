import { Suspense } from "react";
import { BookingPageContent } from "@/components/booking/booking-page-content";

export default function BookingPage() {
  return (
    <Suspense fallback={null}>
      <BookingPageContent />
    </Suspense>
  );
}
