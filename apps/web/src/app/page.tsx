import { HomeAvailableRoutes, HomeGallery, HomeHero } from "@/components/home-available-routes";
import { HomeHeader } from "@/components/home-header";
import { HomeSearchWidget } from "@/components/home-search-widget";
import { SiteFooter } from "@/components/site-footer";
import "./home.css";

export default function HomePage() {
  return (
    <div className="home-page">
      <HomeHeader />
      <HomeHero>
        <div className="home-search-wrap">
          <HomeSearchWidget />
        </div>
      </HomeHero>
      <div className="home-spacer" aria-hidden />
      <HomeGallery />
      <HomeAvailableRoutes />
      <SiteFooter />
    </div>
  );
}
