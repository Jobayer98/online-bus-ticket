"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import {
  HOME_AVAILABLE_ROUTES,
  cityToSlugPart,
} from "@/lib/home-routes-data";
import { getTodayIso } from "@/lib/trip-date";

type Stop = { id: string; name: string; city: string; code: string };

function BusIcon() {
  return (
    <svg
      className="home-route-bus"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V9l-1.5-4.5A2 2 0 0 0 17.48 3H6.52A2 2 0 0 0 4.5 4.5L3 9v7zm2.5-8h11L17 9H7l-.5-1zM7.5 18a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    </svg>
  );
}

function normalizeCity(city: string): string {
  return city.toUpperCase().replace(/['']/g, "'");
}

function findStopByCity(stops: Stop[], city: string): Stop | undefined {
  const target = normalizeCity(city);
  return stops.find(
    (s) =>
      normalizeCity(s.city) === target ||
      normalizeCity(s.name) === target ||
      normalizeCity(s.city).replace(/\s+/g, "") === target.replace(/\s+/g, ""),
  );
}

export function HomeAvailableRoutes() {
  const [stops, setStops] = useState<Stop[]>([]);

  useEffect(() => {
    apiGet<Stop[]>("/schedules/stops")
      .then((r) => setStops(r.data))
      .catch(() => setStops([]));
  }, []);

  const today = getTodayIso();

  return (
    <section className="home-routes" aria-labelledby="home-routes-title">
      <h2 id="home-routes-title" className="home-routes-title">
        AVAILABLE ROUTE
      </h2>
      <div className="home-routes-title-accent" aria-hidden />

      <div className="home-routes-panel">
        <ul className="home-routes-grid">
          {HOME_AVAILABLE_ROUTES.map((route) => {
            const fromStop = findStopByCity(stops, route.from);
            const toStop = findStopByCity(stops, route.to);
            const canSearch = Boolean(fromStop && toStop);
            const slug = `${cityToSlugPart(route.from)}-${cityToSlugPart(route.to)}`;
            const href = canSearch ? `/search/${slug}/${today}` : undefined;

            const content = (
              <>
                <span className="home-route-city">{route.from}</span>
                <BusIcon />
                <span className="home-route-city">{route.to}</span>
              </>
            );

            return (
              <li key={`${route.from}-${route.to}`}>
                {canSearch ? (
                  <Link href={href!} className="home-route-card">
                    {content}
                  </Link>
                ) : (
                  <span className="home-route-card home-route-card--static">
                    {content}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
