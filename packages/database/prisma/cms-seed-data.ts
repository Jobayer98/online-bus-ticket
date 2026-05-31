/** Static CMS content migrated from hardcoded web pages (Shahzadpur Travels). */

export const CMS_PROFILE = {
  companyName: "Shahzadpur Travels",
  tagline: "TRAVELS",
  logoUrl: "/images/logo/logo.png",
  faviconUrl: null as string | null,
  tradeLicenseNo: "08-032-01046",
};

export const CMS_THEME = {
  primaryColor: "#2e7d32",
  fontFamily: "Inter" as const,
};

export const CMS_FOOTER = {
  contactLines: [
    { icon: "pin" as const, text: "Dawriapur Bazar" },
    { icon: "home" as const, text: "Shahzadpur-6770" },
    { icon: "building" as const, text: "Shahzadpur" },
    { icon: "globe" as const, text: "Sirajganj" },
  ],
  email: "shahzadpurtravels1980@gmail.com",
  paymentBannerUrl: "/images/home/ssl-commerz-inline.png",
  barLinks: [
    { label: "About Us", href: "/about" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
  poweredByText: "Powered By: Shahzadpur Travels",
};

export const CMS_MEDIA = [
  { kind: "HERO" as const, url: "/images/home/hero.jpg", alt: "Shahzadpur Travels coach on the highway", sortOrder: 0 },
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

/** Row-major order from home-routes-data.ts → route slug parts. */
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
    title: "About Shahzadpur Travels",
    bodyMarkdown: `Founded in 1985 by Abdul Oli Khan, Shahzadpur Travels has been a trusted name in Bangladesh's transportation sector for nearly four decades. Headquartered in Shahzadpur, Sirajganj, our company is dedicated to providing safe, comfortable, and reliable travel experiences with a focus on luxury and convenience.

As a non-profit organization, Shahzadpur Travels operates with the mission of serving the community by ensuring accessible and high-quality transportation. With a workforce of approximately 500 employees, we play a crucial role in connecting people across major routes, including Pabna, Dhaka, Chattogram, Sylhet, Cox's Bazar, Narayanganj, Ishwardi, Chatmohor, and beyond.

Our commitment to excellence is reflected in our modern fleet of 35 buses, categorized into four distinct service classes:

- **Green Class (Premium AC Sleeper & Coach Service)** – Includes 2 Scania AC buses and 3 Hino RM2 AC Sleeper buses for a first-class, luxurious travel experience.
- **Luxury Class (Comfortable AC Coach Service)** – Features 6 Hino RM2 AC buses, ensuring a smooth and relaxing journey with enhanced amenities.
- **Premium Econo (Affordable AC & Non-AC Options)** – Comprises 3 Hino AC, 2 Eicher AC, and 1 Eicher Non-AC (Business Class) bus, offering budget-friendly yet comfortable travel choices.
- **Standard Class (Economical Non-AC Travel)** – Consists of 24 Hino Non-AC buses, providing an affordable and reliable travel option for passengers.

At Shahzadpur Travels, "Ensuring a Safe Journey" is our motto. We are deeply committed to maintaining the highest standards of safety, punctuality, luxury, and passenger comfort.`,
  },
  {
    slug: "contact",
    title: "Contact Us",
    bodyMarkdown: `## Contact Information

Visit us or reach out by email for booking support and general inquiries.

### Address

- Dawriapur Bazar
- Shahzadpur-6770
- Shahzadpur, Sirajganj

### Email

[shahzadpurtravels1980@gmail.com](mailto:shahzadpurtravels1980@gmail.com)

### Trade License

Trade License No: 08-032-01046`,
  },
  {
    slug: "return-policy",
    title: "Return Policy",
    bodyMarkdown: `**টিকেট ফেরতের নিয়মাবলীঃ**

- All tickets are non-refundable and non-changeable once purchased.

Refunds for eligible cases may only be processed at the counter desk before departure, per operational policy.`,
  },
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    bodyMarkdown: `Welcome to Shahzadpur Travels. By accessing or using this website and our online bus ticket booking services, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully before making a booking.

These Terms & Conditions should be read together with our [Privacy Policy](/privacy-policy) and [Return Policy](/return-policy).

## Use of the Website

You agree to use this website only for lawful purposes and in a manner that does not infringe the rights of others or restrict their use of the website. You must provide accurate and complete information when booking tickets or creating an account.

Shahzadpur Travels reserves the right to refuse service, cancel bookings, or restrict access to the website at its discretion, including for suspected fraud, abuse, or violation of these terms.

## Bookings and Tickets

A booking is confirmed only after successful payment and issuance of a ticket with a valid PNR (passenger number). You are responsible for verifying journey details, travel date, boarding point, and passenger information before completing payment.

Tickets are issued subject to seat availability and schedule confirmation. Shahzadpur Travels may change schedules, routes, or coaches due to operational requirements.

## Payment

All fares are displayed in Bangladeshi Taka unless stated otherwise. Payment must be completed through the payment methods offered on this website.

## Cancellation, Refund and Changes

Please refer to our [Return Policy](/return-policy). Unless otherwise stated in writing by Shahzadpur Travels, all tickets are non-refundable and non-changeable once purchased.

## Limitation of Liability

Shahzadpur Travels shall not be liable for indirect, incidental, or consequential losses arising from use of the website or travel services, except where liability cannot be excluded under applicable law.

## Governing Law

These Terms & Conditions are governed by the laws of Bangladesh. Any dispute shall be subject to the exclusive jurisdiction of the courts in Dhaka, Bangladesh.

## Changes to Terms

Shahzadpur Travels may update these Terms & Conditions at any time without prior notice. Continued use of the website after changes are posted constitutes acceptance of the revised terms.`,
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    bodyMarkdown: `We, at Shahzadpur Travels, ensure to maintain the highest standards of transactional security and quality so that your information and details are secure.

**Note:** Our privacy policy is subject to change at any time without prior notice. Please review this policy at regular intervals.

By visiting this website you agree to be bound by the terms and conditions of this Privacy Policy. Any disagreement will be subject to the jurisdiction of Dhaka, Bangladesh.

## Collection of Personally Identifiable Information

When you use our Website, we store your browsing information so that we can provide services and features that meet your needs.

In general, you can browse the Website without telling us who you are or revealing any personal information about yourself. Once you give us your personal information, you are not anonymous to us.

We collect personally identifiable information (email address, name, and phone number) from you when you set up a free account with us or complete a booking.

## Sharing of Personal Information

We will only share personal information with companies, organizations or individuals outside Shahzadpur Travels when we have a good-faith belief that access, use, preservation or disclosure of the information is reasonably necessary to:

- Meet any applicable law, regulation, legal process or enforceable governmental request.
- Enforce applicable Terms of Service, including investigation of potential violations.
- Detect, prevent, or otherwise address fraud, security or technical issues.
- Protect against harm to the rights, property or safety of Shahzadpur Travels, our users or the public.

## Security Precautions

Our Website has stringent security measures in place to protect the loss, misuse, and alteration of the information under our control. We use SSL security to protect users against identity theft and spyware.

## Your Consent

By using the Website and/or by providing your information, you consent to the collection and use of the information you disclose on the Website in accordance with this Privacy Policy.

If you have any questions about this Privacy Policy, contact us by email: [shahzadpurtravels1980@gmail.com](mailto:shahzadpurtravels1980@gmail.com).`,
  },
];
