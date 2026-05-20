import type { Metadata } from "next";
import { HomeHeader } from "@/components/home-header";
import { SiteFooter } from "@/components/site-footer";
import "../home.css";
import "./about.css";

export const metadata: Metadata = {
  title: "About Us — Shahzadpur Travels",
  description:
    "Learn about Shahzadpur Travels — serving Bangladesh since 1985 with safe, comfortable bus travel.",
};

const FLEET_CLASSES = [
  {
    name: "Green Class (Premium AC Sleeper & Coach Service)",
    detail:
      "Includes 2 Scania AC buses and 3 Hino RM2 AC Sleeper buses for a first-class, luxurious travel experience.",
  },
  {
    name: "Luxury Class (Comfortable AC Coach Service)",
    detail:
      "Features 6 Hino RM2 AC buses, ensuring a smooth and relaxing journey with enhanced amenities.",
  },
  {
    name: "Premium Econo (Affordable AC & Non-AC Options)",
    detail:
      "Comprises 3 Hino AC, 2 Eicher AC, and 1 Eicher Non-AC (Business Class) bus, offering budget-friendly yet comfortable travel choices.",
  },
  {
    name: "Standard Class (Economical Non-AC Travel)",
    detail:
      "Consists of 24 Hino Non-AC buses, providing an affordable and reliable travel option for passengers.",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="home-page about-page">
      <HomeHeader />

      <section className="about-hero">
        <h1>About Shahzadpur Travels</h1>
      </section>

      <article className="about-content">
        <p>
          Founded in 1985 by Abdul Oli Khan, Shahzadpur Travels has been a trusted
          name in Bangladesh&apos;s transportation sector for nearly four decades.
          Headquartered in Shahzadpur, Sirajganj, our company is dedicated to
          providing safe, comfortable, and reliable travel experiences with a focus
          on luxury and convenience.
        </p>

        <p>
          As a non-profit organization, Shahzadpur Travels operates with the
          mission of serving the community by ensuring accessible and high-quality
          transportation. With a workforce of approximately 500 employees, we play
          a crucial role in connecting people across major routes, including Pabna,
          Dhaka, Chattogram, Sylhet, Cox&apos;s Bazar, Narayanganj, Ishwardi,
          Chatmohor, and beyond. Over the years, we have expanded our network to
          offer efficient and seamless travel experiences for thousands of passengers
          daily.
        </p>

        <p>
          Our commitment to excellence is reflected in our modern fleet of 35
          buses, which are categorized into four distinct service classes to
          accommodate diverse passenger needs:
        </p>

        <ul className="about-fleet-list">
          {FLEET_CLASSES.map((item) => (
            <li key={item.name}>
              <strong>{item.name}</strong> – {item.detail}
            </li>
          ))}
        </ul>

        <p>
          At Shahzadpur Travels, &quot;Ensuring a Safe Journey&quot; is our motto,
          and we are deeply committed to maintaining the highest standards of safety,
          punctuality, luxury, and passenger comfort. Our dedication to quality
          service, well-maintained buses, and professional staff ensures a superior
          travel experience.
        </p>

        <p>
          Whether for business, leisure, or long-distance travel, Shahzadpur
          Travels guarantees a smooth, secure, and comfortable journey. We continue
          to improve and innovate, upholding our commitment to serving the people
          with excellence.
        </p>
      </article>

      <SiteFooter />
    </div>
  );
}
