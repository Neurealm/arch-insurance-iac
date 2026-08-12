import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

/**
 * Single reusable renderer for a Technology's branding asset.
 *
 * Rules:
 *  - one master image is stored per Technology; this component decides how to render it
 *  - always object-contain, aspect-ratio preserved, centered
 *  - never stretches, distorts or clips the image
 *  - falls back to a neutral tile with 1–2 initials when no asset exists
 */

export type TechnologyBrandMode = "logo" | "icon";
export type TechnologyBrandBackground = "transparent" | "white" | "dark";

export interface TechnologyBrandInput {
  id?: string;
  technology_name?: string | null;
  short_name?: string | null;
  technology_image_url?: string | null;
  technology_image_storage_path?: string | null;
  technology_image_type?: string | null;
  technology_image_last_updated?: string | null;
}

interface Props {
  technology: TechnologyBrandInput | null | undefined;
  size?: number; // pixel size of the square container
  mode?: TechnologyBrandMode;
  background?: TechnologyBrandBackground;
  className?: string;
  rounded?: boolean;
  /** For static preview from a local File (used inside the upload editor). */
  overrideSrc?: string | null;
}

const STOPWORDS = new Set(["the", "of", "and", "for", "a", "an"]);

export function computeInitials(name?: string | null): string {
  if (!name) return "?";
  const tokens = name
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t && !STOPWORDS.has(t.toLowerCase()));
  if (tokens.length === 0) return name.trim().slice(0, 2).toUpperCase() || "?";
  if (tokens.length === 1) return tokens[0].slice(0, 1).toUpperCase();
  return (tokens[0][0] + tokens[1][0]).toUpperCase();
}

function backgroundClass(bg: TechnologyBrandBackground): string {
  switch (bg) {
    case "white":
      return "bg-white";
    case "dark":
      return "bg-slate-900";
    case "transparent":
    default:
      return "bg-transparent";
  }
}

/**
 * Resolves a signed URL for a private `etdm-assets` object.
 * Cached via react-query so the same asset isn't re-signed on every render.
 */
export function useBrandSignedUrl(
  storagePath: string | null | undefined,
  cacheKey?: string | null,
) {
  return useQuery({
    enabled: !!storagePath,
    queryKey: ["etdm-brand-signed-url", storagePath, cacheKey],
    staleTime: 45 * 60 * 1000, // 45 minutes
    gcTime: 60 * 60 * 1000,
    queryFn: async () => {
      if (!storagePath) return null;
      const { data, error } = await supabase.storage
        .from("etdm-assets")
        .createSignedUrl(storagePath, 60 * 60); // 1 hour
      if (error) throw error;
      return data.signedUrl;
    },
  });
}

export function TechnologyBrand({
  technology,
  size = 32,
  mode = "logo",
  background = "transparent",
  className,
  rounded = true,
  overrideSrc,
}: Props) {
  const name = technology?.technology_name ?? technology?.short_name ?? "";
  const initials = computeInitials(name);
  const storagePath = technology?.technology_image_storage_path ?? null;
  const cacheKey = technology?.technology_image_last_updated ?? null;

  const { data: signedUrl } = useBrandSignedUrl(overrideSrc ? null : storagePath, cacheKey);
  const [errored, setErrored] = useState(false);
  useEffect(() => {
    setErrored(false);
  }, [signedUrl, overrideSrc]);

  const src = overrideSrc ?? signedUrl ?? null;
  const hasImage = !!src && !errored;

  const style = { width: size, height: size } as const;
  const bgClass = backgroundClass(background);
  const shape = rounded ? "rounded-md" : "";

  if (!hasImage) {
    // Neutral placeholder with initials — never a broken-image icon.
    const fontSize = Math.max(9, Math.round(size * (mode === "icon" ? 0.42 : 0.38)));
    return (
      <div
        style={style}
        className={cn(
          "flex items-center justify-center shrink-0 border border-border bg-muted text-muted-foreground font-semibold select-none",
          shape,
          className,
        )}
        aria-label={name ? `${name} logo` : "Technology logo"}
        role="img"
      >
        <span style={{ fontSize }}>{initials}</span>
      </div>
    );
  }

  return (
    <div
      style={style}
      className={cn("flex items-center justify-center shrink-0 overflow-hidden", bgClass, shape, className)}
    >
      <img
        src={src!}
        alt={name ? `${name} logo` : ""}
        loading="lazy"
        decoding="async"
        onError={() => setErrored(true)}
        className="max-w-full max-h-full object-contain"
        draggable={false}
      />
    </div>
  );
}

export default TechnologyBrand;
