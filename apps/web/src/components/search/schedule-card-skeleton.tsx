export function ScheduleCardSkeleton() {
  return (
    <article className="sp-card sp-card--skeleton" aria-hidden>
      <div className="sp-card-row">
        <div className="sp-card-col">
          <div className="sp-skel sp-skel-label" />
          <div className="sp-skel sp-skel-text" />
          <div className="sp-skel sp-skel-label" style={{ marginTop: "0.5rem" }} />
          <div className="sp-skel sp-skel-text" />
          <div className="sp-skel sp-skel-time" />
        </div>
        <div className="sp-card-col">
          <div className="sp-skel sp-skel-label" />
          <div className="sp-skel sp-skel-text" />
          <div className="sp-skel sp-skel-label" style={{ marginTop: "0.5rem" }} />
          <div className="sp-skel sp-skel-text" />
        </div>
        <div className="sp-card-col sp-card-price">
          <div className="sp-skel sp-skel-text" />
          <div className="sp-skel sp-skel-fare" />
          <div className="sp-skel sp-skel-label" />
        </div>
        <div className="sp-card-col">
          <div className="sp-skel sp-skel-btn" />
        </div>
      </div>
      <div className="sp-skel sp-skel-route" />
    </article>
  );
}
