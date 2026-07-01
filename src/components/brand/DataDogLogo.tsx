import datadogLogoAsset from "@/assets/dd_logo_v_rgb.png.asset.json";

/** Original Datadog logo asset supplied for the Datadog Log Profile. */
export function DataDogLogo({
  size = 32,
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <img
      src={datadogLogoAsset.url}
      alt="Datadog logo"
      width={size}
      height={size}
      className={className ?? "object-contain"}
      loading="eager"
      decoding="async"
    />
  );
}
