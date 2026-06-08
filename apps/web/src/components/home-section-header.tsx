type HomeSectionHeaderProps = {
  id?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
};

export function HomeSectionHeader({
  id,
  title,
  subtitle,
  align = "center",
}: HomeSectionHeaderProps) {
  return (
    <header
      className={`mb-8 ${align === "center" ? "text-center" : ""}`}
      id={id}
    >
      <h2 className="m-0 mb-2 text-[clamp(1.35rem,2.5vw,1.75rem)] font-bold tracking-tight text-[var(--text)]">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`m-0 max-w-xl text-[0.975rem] leading-relaxed text-[var(--muted)] ${align === "center" ? "mx-auto" : ""}`}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
