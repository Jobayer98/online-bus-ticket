import type { Metadata } from "next";
import { HomeHeader } from "@/components/home-header";
import { LoginForm } from "@/components/auth/login-form";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Login — Bus Booking",
  description: "Sign in or create an account to manage your bus bookings.",
};

export default function LoginPage() {
  return (
    <div className="m-0 flex min-h-screen flex-col bg-[#f0f0f0] p-0">
      <HomeHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-8 pb-12">
        <div className="grid w-full max-w-[920px] overflow-hidden rounded border border-[#e5e7eb] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.1)] max-md:grid-cols-1 md:grid-cols-2">
          <section
            className="flex flex-col justify-center gap-4 bg-gradient-to-br from-[#1b5e20] via-[#2e7d32] to-[#388e3c] p-8 text-white max-md:p-7"
            aria-hidden={false}
          >
            <h1 className="m-0 text-[1.75rem] leading-tight font-bold tracking-wide max-md:text-[1.4rem]">
              Welcome back
            </h1>
            <p className="m-0 text-[0.95rem] leading-relaxed opacity-92">
              Book intercity bus tickets online, track your trips, and download
              tickets anytime.
            </p>
            <ul className="mt-2 mb-0 list-disc pl-5 text-[0.88rem] leading-relaxed opacity-90 max-md:hidden">
              <li>View upcoming and past bookings</li>
              <li>Faster checkout when signed in</li>
              <li>Secure ticket download with PNR</li>
            </ul>
          </section>
          <section className="flex items-center justify-center p-7 max-md:p-5">
            <LoginForm />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
