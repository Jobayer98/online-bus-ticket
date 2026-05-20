import { Suspense } from "react";
import { PaymentPageContent } from "@/components/payment/payment-page-content";
import "../../payment.css";
import "../../../search/search.css";
import "../../../home.css";

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="search-page payment-page" style={{ padding: "2rem" }}>
          Loading secure checkout…
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
