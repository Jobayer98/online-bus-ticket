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
      className={`home-section-header home-section-header--${align}`}
      id={id}
    >
      <h2 className="home-section-header__title">{title}</h2>
      {subtitle ? (
        <p className="home-section-header__subtitle">{subtitle}</p>
      ) : null}
    </header>
  );
}
