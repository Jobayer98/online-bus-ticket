import {
  HomeAvailableRoutes,
  HomeHero,
} from "@/components/home-available-routes";
import { HomeCtaBand } from "@/components/home-cta-band";
import { HomeHeader } from "@/components/home-header";
import { HomePaymentStrip } from "@/components/home-payment-strip";
import { HomePromos } from "@/components/home-promos";
import { HomeSearchWidget } from "@/components/home-search-widget";
import { HomeStats } from "@/components/home-stats";
import { HomeValueProps } from "@/components/home-value-props";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <div className="m-0 flex min-h-screen flex-col p-0">
      <HomeHeader />
      <HomeHero>
        <HomeSearchWidget />
      </HomeHero>
      <div className="h-[120px] bg-[#fafaf9] max-[900px]:h-40 max-md:h-[180px]" aria-hidden />
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
