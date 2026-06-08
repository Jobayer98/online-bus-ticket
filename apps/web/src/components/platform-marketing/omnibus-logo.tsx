export function OmniBusLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="#059669" />
      <path
        d="M7 20h18v2H7v-2zm2-8h14a2 2 0 012 2v4H7v-4a2 2 0 012-2z"
        fill="white"
      />
      <circle cx="10" cy="22" r="2" fill="white" />
      <circle cx="22" cy="22" r="2" fill="white" />
      <rect x="11" y="10" width="10" height="4" rx="1" fill="white" opacity="0.85" />
    </svg>
  );
}
