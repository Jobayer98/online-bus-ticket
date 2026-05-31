import { Suspense } from "react";
import { PaymentPageContent } from "@/components/payment/payment-page-content";
import "../../payment.css";
import "../../../search/search.css";
import "../../../home.css";

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentPageContent />
    </Suspense>
  );
}
