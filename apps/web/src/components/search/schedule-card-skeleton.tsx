const skelClass =
  "animate-pulse rounded-[3px] bg-gradient-to-r from-[#eee] via-[#f5f5f5] to-[#eee] bg-[length:200%_100%]";

export function ScheduleCardSkeleton() {
  return (
    <article
      className="pointer-events-none rounded-[var(--radius-md)] border border-[var(--border)] bg-white shadow-[var(--shadow-xs)]"
      aria-hidden
    >
      <div className="p-4 px-[1.1rem]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className={`${skelClass} h-3.5`} style={{ width: "120px" }} />
          <div className={`${skelClass} h-[22px] w-1/2`} />
        </div>
        <div className="mb-4 grid grid-cols-[1fr_minmax(100px,1.4fr)_1fr] items-center gap-3">
          <div className={`${skelClass} h-3.5 w-4/5`} />
          <div className={`${skelClass} h-2.5`} style={{ width: "60%" }} />
          <div className={`${skelClass} h-3.5 w-4/5`} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className={`${skelClass} h-2.5`} style={{ width: "50%" }} />
          <div className={`${skelClass} h-[34px]`} style={{ width: "120px" }} />
        </div>
      </div>
      <div className={`${skelClass} h-7`} />
    </article>
  );
}
