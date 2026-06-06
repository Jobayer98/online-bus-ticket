import type { Metadata } from "next";
import { HomeHeader } from "@/components/home-header";
import { LoginForm } from "@/components/auth/login-form";
import { SiteFooter } from "@/components/site-footer";
import "../home.css";
import "./login.css";

export const metadata: Metadata = {
  title: "Login — Bus Booking",
  description: "Sign in or create an account to manage your bus bookings.",
};

export default function LoginPage() {
  return (
    <div className="home-page auth-page">
      <HomeHeader />
      <main className="auth-main">
        <div className="auth-layout">
          <section className="auth-panel-brand" aria-hidden={false}>
            <h1>Welcome back</h1>
            <p>
              Book intercity bus tickets online, track your trips, and download
              tickets anytime.
            </p>
            <ul>
              <li>View upcoming and past bookings</li>
              <li>Faster checkout when signed in</li>
              <li>Secure ticket download with PNR</li>
            </ul>
          </section>
          <section className="auth-panel-form">
            <LoginForm />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
