export function ScheduleCardSkeleton() {
  return (
    <article className="sp-card sp-card--skeleton" aria-hidden>
      <div className="sp-card-main">
        <div className="sp-card-head">
          <div className="sp-skel sp-skel-text" style={{ width: "120px" }} />
          <div className="sp-skel sp-skel-fare" />
        </div>
        <div className="sp-card-route-row">
          <div className="sp-skel sp-skel-text" />
          <div className="sp-skel sp-skel-label" style={{ width: "60%" }} />
          <div className="sp-skel sp-skel-text" />
        </div>
        <div className="sp-card-footer-row">
          <div className="sp-skel sp-skel-label" style={{ width: "50%" }} />
          <div className="sp-skel sp-skel-btn" style={{ width: "120px" }} />
        </div>
      </div>
      <div className="sp-skel sp-skel-route" />
    </article>
  );
}
