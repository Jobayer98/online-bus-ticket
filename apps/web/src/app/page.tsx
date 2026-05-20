import Image from "next/image";
import { HomeAvailableRoutes } from "@/components/home-available-routes";
import { HomeHeader } from "@/components/home-header";
import { HomeSearchWidget } from "@/components/home-search-widget";
import { SiteFooter } from "@/components/site-footer";
import "./home.css";

const GALLERY = [
  { src: "/images/home/bus-1.jpg", alt: "Coach fleet 1" },
  { src: "/images/home/bus-2.jpg", alt: "Coach fleet 2" },
  { src: "/images/home/bus-3.jpg", alt: "Coach fleet 3" },
  { src: "/images/home/bus-4.jpg", alt: "Coach fleet 4" },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <HomeHeader />
      <section
        className="home-hero"
        style={{ backgroundImage: "url(/images/home/hero.jpg)" }}
      >
        <div className="home-search-wrap">
          <HomeSearchWidget />
        </div>
      </section>

      <div className="home-spacer" aria-hidden />

      <section className="home-gallery">
        <div className="home-gallery-inner">
          {GALLERY.map((img) => (
            <div className="home-gallery-item" key={img.src}>
              <Image
                src={img.src}
                alt={img.alt}
                width={480}
                height={320}
                sizes="(max-width: 900px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </section>

      <HomeAvailableRoutes />
      <SiteFooter />
    </div>
  );
}

