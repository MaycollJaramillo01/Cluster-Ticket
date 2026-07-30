export function BrandMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 19c3 0 5-4 8-7s5-7 8-7" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="4" cy="19" r="2.3" fill="currentColor" />
      <circle cx="12" cy="12" r="2.3" fill="currentColor" />
      <circle cx="20" cy="5" r="2.3" fill="currentColor" />
    </svg>
  );
}
