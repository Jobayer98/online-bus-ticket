import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/images/logo/logo.png";

type Props = {
  className?: string;
};

export function BrandLogo({ className = "brand-logo" }: Props) {
  return (
    <Link href="/" className={className}>
      <Image
        src={LOGO_SRC}
        alt=""
        width={56}
        height={56}
        className="brand-logo__img"
        priority
      />
      <span className="brand-logo__text">
        SHAHZADPUR
        <small>TRAVELS</small>
      </span>
    </Link>
  );
}
