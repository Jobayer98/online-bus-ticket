import { HomeAvailableRoutes, HomeHero } from "@/components/home-available-routes";
import { HomeCtaBand } from "@/components/home-cta-band";
import { HomeHeader } from "@/components/home-header";
import { HomePaymentStrip } from "@/components/home-payment-strip";
import { HomePromos } from "@/components/home-promos";
import { HomeSearchWidget } from "@/components/home-search-widget";
import { HomeStats } from "@/components/home-stats";
import { HomeValueProps } from "@/components/home-value-props";
import { SiteFooter } from "@/components/site-footer";
import "./home.css";

export default function HomePage() {
  return (
    <div className="home-page">
      <HomeHeader />
      <HomeHero>
        <div className="home-search-wrap" id="home-search">
          <HomeSearchWidget />
        </div>
      </HomeHero>
      <div className="home-spacer" aria-hidden />
      <HomePromos />
      <HomeAvailableRoutes />
      <HomeStats />
      <HomeValueProps />
      <HomePaymentStrip />
      <HomeCtaBand />
      <SiteFooter />
    </div>
  );
}
