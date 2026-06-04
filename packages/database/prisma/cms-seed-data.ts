/** Demo tenant CMS seed — rich generic content for local development. */

export const CMS_PROFILE = {
  companyName: "Demo Bus Company",
  tagline: "DEMO TRAVELS",
  logoUrl: "/images/logo/logo.png",
  faviconUrl: null as string | null,
  tradeLicenseNo: "DEMO-2026-0001",
};

export const CMS_THEME = {
  primaryColor: "#2e7d32",
  fontFamily: "Inter" as const,
};

export const CMS_FOOTER = {
  contactLines: [
    { icon: "pin" as const, text: "123 Demo Terminal Road" },
    { icon: "home" as const, text: "Dhaka-1200" },
    { icon: "building" as const, text: "Dhaka" },
    { icon: "globe" as const, text: "Bangladesh" },
  ],
  email: "hello@demobus.example",
  paymentBannerUrl: "/images/home/ssl-commerz-inline.png",
  barLinks: [
    { label: "About Us", href: "/about" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
  poweredByText: "Powered by Demo Bus Company",
};

export const CMS_MEDIA = [
  {
    kind: "HERO" as const,
    url: "/images/home/hero.jpg",
    alt: "Demo Bus Company coach on the highway",
    sortOrder: 0,
  },
  { kind: "FEATURED" as const, url: "/images/home/bus-1.jpg", alt: "Coach fleet 1", sortOrder: 0 },
  { kind: "FEATURED" as const, url: "/images/home/bus-2.jpg", alt: "Coach fleet 2", sortOrder: 1 },
  { kind: "FEATURED" as const, url: "/images/home/bus-3.jpg", alt: "Coach fleet 3", sortOrder: 2 },
  { kind: "FEATURED" as const, url: "/images/home/bus-4.jpg", alt: "Coach fleet 4", sortOrder: 3 },
  {
    kind: "FOOTER_PAYMENT" as const,
    url: "/images/home/ssl-commerz-inline.png",
    alt: "Pay with Visa, Mastercard, bKash, Nagad, and other methods. Verified by SSLCommerz",
    sortOrder: 0,
  },
];

export const CMS_FEATURED_ROUTE_SLUGS = [
  "dhaka-pabna",
  "dhaka-shahzadpur",
  "dhaka-iswardi",
  "dhaka-chatmohor",
  "dhaka-chattogram",
  "narayangonj-pabna",
  "narayangonj-shahzadpur",
  "pabna-narayangonj",
  "pabna-chattogram",
  "pabna-coxs-bazar",
  "pabna-sylhet",
  "sylhet-iswardi",
];

export const CMS_PAGES: {
  slug: string;
  title: string;
  bodyMarkdown: string;
}[] = [
  {
    slug: "about",
    title: "About Demo Bus Company",
    bodyMarkdown: `Demo Bus Company is a **sample tenant** for the Online Bus Ticket platform. Use this environment to explore scheduling, booking, counter sales, and CMS branding without affecting production data.

We operate intercity routes across Bangladesh with a modern fleet and online ticketing. This demo includes realistic schedules, seat maps, and published CMS content so you can test the full customer journey.

Our service classes (labels only — fares are flat per schedule):

- **Green Class** — Premium AC sleeper and coach service
- **Luxury Class** — Comfortable AC coaches
- **Premium Econo** — Budget-friendly AC and non-AC options
- **Standard Class** — Economical non-AC travel

**Ensuring a Safe Journey** is our demo motto. Customize this page in Admin → Content → Pages.`,
  },
  {
    slug: "contact",
    title: "Contact Us",
    bodyMarkdown: `## Contact Information

Reach our demo support team for booking help and general inquiries.

### Address

- 123 Demo Terminal Road
- Dhaka-1200
- Dhaka, Bangladesh

### Email

[hello@demobus.example](mailto:hello@demobus.example)

### Trade License

Trade License No: DEMO-2026-0001`,
  },
  {
    slug: "return-policy",
    title: "Return Policy",
    bodyMarkdown: `**Ticket return rules (demo):**

- All tickets are non-refundable and non-changeable once purchased unless stated otherwise at the counter.

Refunds for eligible cases may only be processed at the counter desk before departure, per operational policy.`,
  },
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    bodyMarkdown: `Welcome to Demo Bus Company. By using this website and our online bus ticket booking services, you agree to these Terms & Conditions.

Read them together with our [Privacy Policy](/privacy-policy) and [Return Policy](/return-policy).

## Use of the Website

You agree to use this website only for lawful purposes. Provide accurate information when booking or creating an account.

Demo Bus Company may refuse service, cancel bookings, or restrict access for suspected fraud or abuse.

## Bookings and Tickets

A booking is confirmed only after successful payment and a valid PNR. Verify journey details before paying.

Schedules, routes, or coaches may change for operational reasons.

## Payment

Fares are shown in Bangladeshi Taka. Complete payment using the methods offered on this site.

## Cancellation, Refund and Changes

See our [Return Policy](/return-policy). Unless stated in writing, tickets are non-refundable and non-changeable once purchased.

## Governing Law

These terms are governed by the laws of Bangladesh. Disputes are subject to the courts in Dhaka.

## Changes

We may update these terms at any time. Continued use after changes constitutes acceptance.`,
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    bodyMarkdown: `Demo Bus Company maintains reasonable security standards so your booking information stays protected.

This policy may change without prior notice. Review it periodically.

By using this website you agree to this Privacy Policy.

## Information We Collect

We store browsing and booking data to provide services. You may browse without an account; bookings require personal details (name, phone, and optional email).

## Sharing

We share information only when required by law, to enforce our terms, prevent fraud, or protect users and the public.

## Security

We use industry-standard practices including TLS for sensitive flows.

## Contact

Questions? Email [hello@demobus.example](mailto:hello@demobus.example).`,
  },
];
