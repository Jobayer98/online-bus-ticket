import { Suspense } from "react";
import { PaymentPageContent } from "@/components/payment/payment-page-content";

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentPageContent />
    </Suspense>
  );
}
