/**
 * DataDog paw-mark logo (stylized) rendered as inline SVG.
 * Uses the DataDog brand purple (#632CA6).
 */
export function DataDogLogo({
  size = 32,
  color = "#632CA6",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Datadog"
      role="img"
    >
      {/* Palm pad */}
      <ellipse cx="32" cy="42" rx="15" ry="12" fill={color} />
      {/* Toe beans */}
      <ellipse cx="15" cy="30" rx="5.5" ry="7" fill={color} />
      <ellipse cx="24" cy="20" rx="5" ry="6.5" fill={color} />
      <ellipse cx="40" cy="20" rx="5" ry="6.5" fill={color} />
      <ellipse cx="49" cy="30" rx="5.5" ry="7" fill={color} />
    </svg>
  );
}
