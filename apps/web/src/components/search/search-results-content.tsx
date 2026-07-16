"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { resolveStopIdForCity } from "@repo/shared";
import { apiGet } from "@/lib/api-client";
import {
  addDaysIso,
  compareIsoDates,
  getTodayIso,
  parseIsoDate,
} from "@/lib/trip-date";
import { slugToRouteTitle } from "@/lib/format";
import { buildSearchUrl, cityPairToRouteSlug } from "@/lib/search-url";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { HomeHeader } from "@/components/home-header";
import { SearchFooter } from "./search-footer";
import { SearchFilterBar } from "./search-filter-bar";
import { ScheduleCard } from "./schedule-card";
import { ScheduleCardSkeleton } from "./schedule-card-skeleton";
import { useSearchPageHoldCleanup } from "@/hooks/use-search-page-hold-cleanup";
import { releaseActiveHold } from "@/lib/active-hold";
import { buildPaymentUrl } from "@/lib/booking-access";
import type {
  ScheduleCardDto,
  SearchSchedulesFacets,
  SearchSchedulesMeta,
} from "@repo/shared";
import { emptySearchFacets } from "@repo/shared";

type Stop = { id: string; name: string; city: string; code: string };
type RouteInfo = {
  slug: string;
  fromStopId: string;
  toStopId: string;
  fromStop: { name: string; city: string };
  toStop: { name: string; city: string };
};

export function SearchResultsContent() {
  useSearchPageHoldCleanup();

  const params = useParams<{ routeSlug: string; date: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [stops, setStops] = useState<Stop[]>([]);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [schedules, setSchedules] = useState<ScheduleCardDto[]>([]);
  const [facets, setFacets] = useState<SearchSchedulesFacets>(emptySearchFacets());
  const [loading, setLoading] = useState(true);
  useGlobalLoading(loading);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const timePeriod = searchParams.get("timePeriod") ?? "";
  const seatClass = searchParams.get("seatClass") ?? "";
  const busTypeParam = searchParams.get("busType");

  const [date, setDate] = useState(params.date);
  const [fromDraft, setFromDraft] = useState("");
  const [toDraft, setToDraft] = useState("");
  const [acOn, setAcOn] = useState(!busTypeParam || busTypeParam === "AC");
  const [nonAcOn, setNonAcOn] = useState(!busTypeParam || busTypeParam === "NON_AC");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [clock, setClock] = useState("");

  const resolvedFromStopId = route?.fromStopId ?? "";
  const resolvedToStopId = route?.toStopId ?? "";

  useEffect(() => {
    setDate(params.date);
    setAcOn(!busTypeParam || busTypeParam === "AC");
    setNonAcOn(!busTypeParam || busTypeParam === "NON_AC");
  }, [params.date, busTypeParam]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(
      "last-search-url",
      `${window.location.pathname}${window.location.search}`,
    );
  }, [params.routeSlug, params.date, searchParams]);

  useEffect(() => {
    if (!route || stops.length === 0) return;
    setFromDraft(
      resolveStopIdForCity(stops, route.fromStop.city) ?? route.fromStopId,
    );
    setToDraft(resolveStopIdForCity(stops, route.toStop.city) ?? route.toStopId);
  }, [route, stops]);

  useEffect(() => {
    apiGet<Stop[]>("/schedules/stops")
      .then((r) => setStops(r.data))
      .catch(() => setStops([]));
    apiGet<RouteInfo>(`/schedules/by-route/${params.routeSlug}`)
      .then((r) => setRoute(r.data))
      .catch(() => setRoute(null));
  }, [params.routeSlug]);

  const hasLegacyStopParams =
    searchParams.has("fromStopId") || searchParams.has("toStopId");

  useEffect(() => {
    if (!route || !hasLegacyStopParams) return;

    const clean = buildSearchUrl(params.routeSlug, params.date, {
      busType: busTypeParam ?? undefined,
      timePeriod: timePeriod || undefined,
      seatClass: seatClass || undefined,
    });
    router.replace(clean, { scroll: false });
  }, [
    route,
    hasLegacyStopParams,
    params.routeSlug,
    params.date,
    busTypeParam,
    timePeriod,
    seatClass,
    router,
  ]);

  function apiSearchQuery(): URLSearchParams {
    const q = new URLSearchParams({
      fromStopId: resolvedFromStopId,
      toStopId: resolvedToStopId,
      date: params.date,
    });
    if (busTypeParam) q.set("busType", busTypeParam);
    return q;
  }

  const fetchSchedules = useCallback(() => {
    if (!resolvedFromStopId || !resolvedToStopId) return;
    setLoading(true);
    setError("");
    const q = apiSearchQuery();
    if (timePeriod) q.set("timePeriod", timePeriod);
    if (seatClass) q.set("seatClass", seatClass);

    apiGet<ScheduleCardDto[], SearchSchedulesMeta>(`/schedules/search?${q}`)
      .then((r) => {
        setSchedules(r.data);
        setFacets(r.meta?.facets ?? emptySearchFacets());
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [
    resolvedFromStopId,
    resolvedToStopId,
    params.date,
    busTypeParam,
    timePeriod,
    seatClass,
  ]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Dhaka",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const routeTitle = useMemo(() => {
    if (route) {
      return `${route.fromStop.city.toUpperCase()} To ${route.toStop.city.toUpperCase()}`;
    }
    return slugToRouteTitle(params.routeSlug);
  }, [route, params.routeSlug]);

  const routeCode = params.routeSlug.toUpperCase().replace(/-/g, "_");

  const routeLabel = useMemo(() => {
    if (route) return `${route.fromStop.city} — ${route.toStop.city}`;
    return params.routeSlug.replace(/-/g, " — ");
  }, [route, params.routeSlug]);

  const tripDateLabel = useMemo(() => {
    return parseIsoDate(params.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    });
  }, [params.date]);

  const todayIso = getTodayIso();

  const timePeriodCounts = facets.timePeriod;
  const seatClassCounts = facets.seatClass;

  function resolveBusType(): string {
    if (acOn && !nonAcOn) return "AC";
    if (!acOn && nonAcOn) return "NON_AC";
    return "";
  }

  function buildUrl(
    slug: string,
    newDate: string,
    overrides?: { timePeriod?: string; seatClass?: string },
  ) {
    const busType = resolveBusType();
    return buildSearchUrl(slug, newDate, {
      busType: busType || undefined,
      timePeriod: (overrides?.timePeriod ?? timePeriod) || undefined,
      seatClass: (overrides?.seatClass ?? seatClass) || undefined,
    });
  }

  function handleSearch() {
    setFilterError("");
    if (!fromDraft || !toDraft || !date) {
      setFilterError("Select from, to, and date");
      return;
    }
    if (!acOn && !nonAcOn) {
      setFilterError("Select at least AC or Non AC");
      return;
    }
    const from = stops.find((s) => s.id === fromDraft);
    const to = stops.find((s) => s.id === toDraft);
    if (!from || !to) {
      setFilterError("Invalid route selection");
      return;
    }
    setExpandedId(null);
    void releaseActiveHold();
    const slug = cityPairToRouteSlug(from.city, to.city);
    router.push(buildUrl(slug, date));
  }

  function applyChipFilters(nextTime: string, nextSeat: string) {
    setExpandedId(null);
    void releaseActiveHold();
    router.replace(
      buildUrl(params.routeSlug, params.date, {
        timePeriod: nextTime,
        seatClass: nextSeat,
      }),
      { scroll: false },
    );
  }

  function goDay(delta: number) {
    const next = addDaysIso(params.date, delta);
    if (compareIsoDates(next, todayIso) < 0) return;
    setExpandedId(null);
    void releaseActiveHold();
    router.push(buildUrl(params.routeSlug, next));
  }

  const canPrevDay = compareIsoDates(addDaysIso(params.date, -1), todayIso) >= 0;

  function handleBookingComplete(
    scheduleId: string,
    bookingId: string,
    token: string,
  ) {
    router.push(buildPaymentUrl(scheduleId, bookingId, token));
  }

  const stopsReady = stops.length > 0 && Boolean(route);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <HomeHeader />
      <div
        className="h-[140px] bg-[#333] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/images/home/hero.jpg)" }}
      />

      <SearchFilterBar
        stops={stops}
        fromStopId={fromDraft}
        toStopId={toDraft}
        stopsReady={stopsReady}
        date={date}
        minDate={todayIso}
        timePeriod={timePeriod}
        seatClass={seatClass}
        acOn={acOn}
        nonAcOn={nonAcOn}
        routeTitle={routeTitle}
        routeCode={routeCode}
        tripDateLabel={tripDateLabel}
        clock={clock}
        canPrevDay={canPrevDay}
        filtersExpanded={filtersExpanded}
        filterError={filterError}
        timePeriodCounts={timePeriodCounts}
        seatClassCounts={seatClassCounts}
        totalCount={facets.total}
        onFromChange={setFromDraft}
        onToChange={setToDraft}
        onDateChange={setDate}
        onTimePeriodChange={(v) => applyChipFilters(v, seatClass)}
        onSeatClassChange={(v) => applyChipFilters(timePeriod, v)}
        onAcToggle={() => setAcOn((x) => !x)}
        onNonAcToggle={() => setNonAcOn((x) => !x)}
        onSearch={handleSearch}
        onToggleFilters={() => setFiltersExpanded((e) => !e)}
        onCloseFilters={() => setFiltersExpanded(false)}
        onPrevDay={() => goDay(-1)}
        onNextDay={() => goDay(1)}
      />

      <div className="mx-auto flex max-w-[1200px] flex-col gap-[0.65rem] px-4 pb-6 max-[767px]:px-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <ScheduleCardSkeleton key={i} />
          ))}
        {error && (
          <div className="border border-[var(--border)] bg-white p-8 text-center text-[0.75rem] text-[var(--danger)]">
            {error}
          </div>
        )}
        {!loading && !error && schedules.length === 0 && (
          <div className="border border-[var(--border)] bg-white p-8 text-center text-[#666]">
            No buses found for this date.
          </div>
        )}
        {!loading &&
          !error &&
          schedules.map((s) => (
            <ScheduleCard
              key={s.scheduleId}
              schedule={s}
              tripDate={params.date}
              routeLabel={routeLabel}
              expanded={expandedId === s.scheduleId}
              onToggle={() =>
                setExpandedId((id) =>
                  id === s.scheduleId ? null : s.scheduleId,
                )
              }
              onBookingComplete={handleBookingComplete}
            />
          ))}
      </div>

      <SearchFooter />
    </div>
  );
}
