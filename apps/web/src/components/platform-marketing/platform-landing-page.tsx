import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Bus,
  CheckCircle2,
  Globe,
  Layers,
  Mail,
  Palette,
  Quote,
  Share2,
  Store,
  Ticket,
  Wrench,
  XCircle,
} from "lucide-react";
import { OmniBusLogo } from "./omnibus-logo";
import { PlatformPricing } from "./platform-pricing";

const DASHBOARD_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDwS5X6yRY0d9reKpD3d5nyNXM7KAmo1XTRim5Bv9t8r1Pmn1RoBWDkOVINA7IHGjGmlqY_blFrDR4aQc-XYnZmx0rY_K2J4ppSWLWo6GzVAxIT4TY3jsgmnrIhEdQV2cWMN1TrojVB2GWcn15uKnJos6-mZHXRSvEX5r6APpUG2nCmxisldYPvwyDWZz2nPwvpH2b5zgwXValYQa88n7wF4rj91tq51vuWGaFyANTwe-OHrVU93sJuv6sHUdU0FXvYY5Bcod2Es-I";

const SEAT_BUILDER_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCnemb3pUTfhYQYvThCsD-iFALAmWnHdONeiOh2D3RE3nXDEJdM0ltUfZ4WR77x0nLjE-DwMFnBkYPG5LChHLxgf5FwtEmyQDPQ8hT4-rWuK86Isd0QluzLF6altXFlRf7KXrDqOnP8GtEiKC8U7548ppPswzvhMJIkJ0AQr5vIik9e8oNBSSVI2BO75XS2QHDnU8s-_GfegHe2rpckfC_hpxCyUUQOL6xAh156cWInR2fa6g8JKfmgg5jstqRxQ5f0w5BLkdpaUY0";

const TRUST_OPERATORS = [
  "Greenline",
  "Shohagh",
  "Hanif",
  "Ena",
  "Desh Travels",
] as const;

const OLD_WAY = [
  "Paper-based booking leading to overbooking and disputes.",
  "Revenue leakages due to unrecorded ticket sales.",
  "No visibility into fleet health or driver performance.",
] as const;

const OMNIBUS_WAY = [
  "Cloud-syncing ensures 100% accurate real-time inventory.",
  "Integrated digital payments with automated reconciliation.",
  "Full telemetry and performance dashboards for every bus.",
] as const;

const FEATURES = [
  {
    title: "Online Ticket Booking",
    description:
      "Real-time seat selection with dynamic pricing and instant digital ticket delivery via SMS and WhatsApp.",
    icon: Ticket,
    large: true,
    visual: "seats" as const,
  },
  {
    title: "Counter POS",
    description:
      "Fast walk-in ticket sales with thermal printer integration and multi-counter sync.",
    icon: Store,
    large: false,
  },
  {
    title: "Fleet & Bus Mgt",
    description:
      "Manage driver assignments, maintenance schedules, and fuel logs in one place.",
    icon: Wrench,
    large: false,
  },
  {
    title: "Analytics & Reporting",
    description:
      "Beautiful revenue charts, passenger analytics, and route profitability reports delivered to your inbox.",
    icon: BarChart3,
    large: true,
    visual: "chart" as const,
  },
  {
    title: "Seat Layout Builder",
    description:
      "Drag-and-drop builder for custom seat layouts, cabin types, and specialized configurations.",
    icon: Layers,
    large: false,
  },
] as const;

function FeatureVisual({ type }: { type: "seats" | "chart" }) {
  if (type === "chart") {
    return (
      <div className="flex-1 bg-primary/5 h-full min-h-40 rounded-2xl border border-primary/20 p-6 flex items-end">
        <div className="flex gap-2 w-full">
          <div className="flex-1 bg-primary h-24 rounded-t-lg" />
          <div className="flex-1 bg-primary/60 h-32 rounded-t-lg" />
          <div className="flex-1 bg-primary h-20 rounded-t-lg" />
          <div className="flex-1 bg-primary/80 h-40 rounded-t-lg" />
          <div className="flex-1 bg-primary h-28 rounded-t-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 flex justify-end">
      <div className="w-2/3 h-48 bg-primary/5 rounded-tl-2xl border-t border-l border-primary/20 p-4">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-8 rounded bg-primary/20" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PlatformLandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface [background-image:radial-gradient(at_0%_0%,rgba(5,150,105,0.05)_0px,transparent_50%),radial-gradient(at_100%_0%,rgba(133,248,196,0.1)_0px,transparent_50%)]">
      <nav className="fixed top-0 z-50 w-full border-b border-outline-variant/20 bg-white/70 backdrop-blur-md">
        <div className="flex justify-between items-center px-4 md:px-10 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <OmniBusLogo className="h-8 w-8" />
              <span className="text-lg font-bold text-primary">OmniBus</span>
            </Link>
            <div className="hidden md:flex gap-6">
              <a
                href="#features"
                className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#solutions"
                className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
              >
                Solutions
              </a>
              <a
                href="#pricing"
                className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
              >
                Pricing
              </a>
              <a
                href="#customers"
                className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
              >
                Customers
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/platform/login"
              className="text-sm font-semibold text-on-surface-variant hover:text-primary px-3 py-2 transition-transform active:scale-95"
            >
              Log In
            </Link>
            <Link
              href="/onboarding"
              className="bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-forest-deep transition-all shadow-sm active:scale-95"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 md:pt-48 md:pb-32 px-4 md:px-10 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-medium mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            The Future of Bus Management
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-on-surface max-w-4xl mx-auto mb-6 tracking-tight leading-tight">
            Run Your Entire Bus Business{" "}
            <span className="text-primary italic">From One Platform</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
            The ultimate operating system for fleet managers. Unified bookings,
            dynamic seat maps, fleet maintenance, and instant payments — all in
            a premium SaaS experience built for Bangladesh.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto bg-primary text-on-primary text-sm font-semibold px-8 py-4 rounded-xl hover:bg-forest-deep transition-all shadow-lg active:scale-95"
            >
              Start Free Trial
            </Link>
            <Link
              href="/onboarding"
              className="w-full sm:w-auto border border-primary text-primary text-sm font-semibold px-8 py-4 rounded-xl hover:bg-primary/5 transition-all active:scale-95"
            >
              Book Live Demo
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-2xl mx-auto border-t border-outline-variant/30 pt-10">
            <div>
              <div className="text-2xl text-primary font-bold">50+</div>
              <div className="text-xs text-on-surface-variant">
                Trusted Operators
              </div>
            </div>
            <div>
              <div className="text-2xl text-primary font-bold">1M+</div>
              <div className="text-xs text-on-surface-variant">
                Tickets Booked
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="text-2xl text-primary font-bold">99.9%</div>
              <div className="text-xs text-on-surface-variant">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 md:px-10 mb-32">
        <div className="max-w-7xl mx-auto relative group">
          <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full opacity-30 group-hover:opacity-50 transition-opacity" />
          <div className="relative bg-inverse-surface rounded-[2rem] p-4 md:p-8 shadow-2xl overflow-hidden border border-white/10">
            <Image
              src={DASHBOARD_IMG}
              alt="OmniBus operator dashboard with revenue analytics and bookings"
              width={1280}
              height={720}
              className="w-full rounded-xl shadow-lg"
              priority
            />
            <div className="hidden lg:block absolute -right-12 top-1/4 w-80 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="rounded-2xl border border-white/20 bg-white/70 p-4 shadow-2xl backdrop-blur-md">
                <Image
                  src={SEAT_BUILDER_IMG}
                  alt="Interactive bus seat layout builder"
                  width={320}
                  height={200}
                  className="rounded-lg mb-3 w-full"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">
                    Interactive Seating
                  </span>
                  <CheckCircle2 className="size-5 text-primary fill-primary/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-10 bg-surface-container-low/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold text-on-surface-variant/70 uppercase tracking-widest mb-10">
            Trusted By Leading Transport Operators
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {TRUST_OPERATORS.map((name) => (
              <div key={name} className="flex items-center gap-2">
                <Bus className="size-7" />
                <span className="font-bold text-lg">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-10" id="solutions">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold text-on-surface mb-4">
              Still Managing Operations Manually?
            </h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">
              Manual systems lead to leakages and inefficiencies. It&apos;s time
              to upgrade to a digital-first solution.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-surface p-8 rounded-3xl border border-outline-variant/30 flex flex-col gap-6">
              <div className="flex items-center gap-3 text-error">
                <AlertTriangle className="size-5" />
                <span className="font-bold">The Old Way</span>
              </div>
              <ul className="space-y-4">
                {OLD_WAY.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <XCircle className="size-5 text-error shrink-0 mt-0.5" />
                    <span className="text-on-surface-variant">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-primary/5 p-8 rounded-3xl border border-primary/20 flex flex-col gap-6">
              <div className="flex items-center gap-3 text-primary">
                <CheckCircle2 className="size-5 fill-primary/20" />
                <span className="font-bold">The OmniBus Way</span>
              </div>
              <ul className="space-y-4">
                {OMNIBUS_WAY.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5 fill-primary/20" />
                    <span className="text-on-surface">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-24 px-4 md:px-10 bg-surface-container-low"
        id="features"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold text-on-surface">
              Advanced Features for Fleet Growth
            </h2>
            <p className="text-on-surface-variant mt-2">
              Everything you need to scale from 1 bus to 1,000.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              const isChart =
                "visual" in feature && feature.visual === "chart";
              const isSeats =
                "visual" in feature && feature.visual === "seats";

              if (feature.large && isChart) {
                return (
                  <div
                    key={feature.title}
                    className="flex flex-col items-center gap-8 rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.01)] md:col-span-2 md:flex-row"
                  >
                    <div className="flex-1">
                      <span className="inline-flex p-3 bg-primary/10 text-primary rounded-xl mb-6">
                        <Icon className="size-6" />
                      </span>
                      <h3 className="text-xl font-semibold mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-on-surface-variant">
                        {feature.description}
                      </p>
                    </div>
                    <FeatureVisual type="chart" />
                  </div>
                );
              }

              return (
                <div
                  key={feature.title}
                  className={`rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.01)] ${
                    feature.large ? "md:col-span-2 flex flex-col justify-between overflow-hidden relative" : ""
                  }`}
                >
                  <div className={feature.large ? "z-10" : undefined}>
                    <span className="inline-flex p-3 bg-primary/10 text-primary rounded-xl mb-6">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="text-xl font-semibold mb-4">
                      {feature.title}
                    </h3>
                    <p
                      className={`text-on-surface-variant ${feature.large ? "max-w-sm" : ""}`}
                    >
                      {feature.description}
                    </p>
                  </div>
                  {isSeats && <FeatureVisual type="seats" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-10 bg-inverse-surface text-on-primary">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="text-primary font-bold mb-4 uppercase tracking-widest text-xs">
              White-Label Branding
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your Brand, Our Engine.
            </h2>
            <p className="text-surface-variant/80 text-lg mb-8">
              Launch your own branded booking website with custom domains,
              themes, and full control over your customer experience.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <Globe className="size-6 text-primary shrink-0" />
                <div>
                  <p className="font-bold">company.omnibus.com</p>
                  <p className="text-xs text-surface-variant/60">
                    Fully custom subdomain or private domain
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <Palette className="size-6 text-primary shrink-0" />
                <div>
                  <p className="font-bold">Brand Customization</p>
                  <p className="text-xs text-surface-variant/60">
                    Logo, brand colors, and email templates
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 relative w-full">
            <div className="bg-gradient-to-br from-primary/20 to-transparent p-8 md:p-12 rounded-[3rem]">
              <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-6 border border-white/20 transform -rotate-2">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 bg-forest-deep rounded-full" />
                  <div className="h-4 w-32 bg-outline-variant/30 rounded-full" />
                </div>
                <div className="space-y-4">
                  <div className="h-2 w-full bg-outline-variant/10 rounded" />
                  <div className="h-2 w-4/5 bg-outline-variant/10 rounded" />
                  <div className="h-12 w-full bg-forest-deep/10 rounded-xl mt-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-10" id="customers">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface-container rounded-[3rem] p-12 md:p-24 relative overflow-hidden">
            <Quote className="absolute top-8 right-8 size-32 opacity-10" />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs mb-8">
                CASE STUDY: EMERALD TRANSIT
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-10 leading-tight">
                &ldquo;Since switching to OmniBus, our monthly revenue grew by
                35% and customer complaints dropped to near zero.&rdquo;
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-primary text-lg">
                  JD
                </div>
                <div>
                  <p className="font-bold text-lg">John Doe</p>
                  <p className="text-on-surface-variant">
                    CEO, Emerald Transit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PlatformPricing />

      <section className="py-24 px-4 md:px-10">
        <div className="max-w-7xl mx-auto bg-primary rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold text-on-primary mb-8 max-w-3xl mx-auto leading-tight">
              Modernize Your Bus Business Today
            </h2>
            <p className="text-primary-fixed-dim text-xl mb-12 max-w-xl mx-auto">
              Join the operators who have transformed their operations with
              OmniBus.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/onboarding"
                className="bg-on-primary text-primary font-bold px-10 py-5 rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95"
              >
                Get Started for Free
              </Link>
              <Link
                href="/onboarding"
                className="bg-primary-container text-on-primary font-bold px-10 py-5 rounded-2xl hover:bg-forest-deep transition-all active:scale-95"
              >
                Book a Live Demo
              </Link>
            </div>
            <p className="mt-8 text-on-primary/60 text-sm">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-inverse-surface text-surface-variant pt-12 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 px-4 md:px-10 py-12 max-w-7xl mx-auto">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <OmniBusLogo className="h-6 w-6" />
              <span className="text-lg font-bold text-primary-fixed-dim">
                OmniBus
              </span>
            </Link>
            <p className="text-sm opacity-80 max-w-xs mb-6">
              The operating system for the next generation of bus travel.
              Efficient, modern, and built for growth.
            </p>
            <div className="flex gap-4">
              <Globe className="size-5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer" />
              <Mail className="size-5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer" />
              <Share2 className="size-5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-on-primary-container mb-6">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-surface-variant/70 hover:text-primary-fixed-dim transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-surface-variant/70 hover:text-primary-fixed-dim transition-colors"
                >
                  Ticketing POS
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-surface-variant/70 hover:text-primary-fixed-dim transition-colors"
                >
                  Fleet Management
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-surface-variant/70 hover:text-primary-fixed-dim transition-colors"
                >
                  Revenue Analytics
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-on-primary-container mb-6">
              Solutions
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#solutions"
                  className="text-surface-variant/70 hover:text-primary-fixed-dim transition-colors"
                >
                  Enterprise Fleet
                </a>
              </li>
              <li>
                <a
                  href="#solutions"
                  className="text-surface-variant/70 hover:text-primary-fixed-dim transition-colors"
                >
                  Regional Operators
                </a>
              </li>
              <li>
                <a
                  href="#solutions"
                  className="text-surface-variant/70 hover:text-primary-fixed-dim transition-colors"
                >
                  White-label Apps
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-surface-variant/70 hover:text-primary-fixed-dim transition-colors"
                >
                  API for Developers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-on-primary-container mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#customers"
                  className="text-surface-variant/70 hover:text-primary-fixed-dim transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#customers"
                  className="text-surface-variant/70 hover:text-primary-fixed-dim transition-colors"
                >
                  Customers
                </a>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-surface-variant/70 hover:text-primary-fixed-dim transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-surface-variant/70 hover:text-primary-fixed-dim transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-10 pt-12 mt-12 border-t border-white/5 text-center md:text-left">
          <p className="text-xs text-surface-variant/40">
            © {new Date().getFullYear()} OmniBus. All rights reserved. Designed
            for the operators of tomorrow.
          </p>
        </div>
      </footer>
    </div>
  );
}
