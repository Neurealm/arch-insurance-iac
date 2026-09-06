/** SHA-256 format retained for existing HCP plan and source-archive evidence. */
export async function digest(value: ArrayBuffer | Uint8Array | string): Promise<string> {
  // Copy typed-array input to an ArrayBuffer-backed view. A generic Uint8Array
  // may wrap SharedArrayBuffer, which Web Crypto's BufferSource excludes.
  // Copying the view (not its whole backing buffer) preserves slice offsets.
  const bytes = new Uint8Array(typeof value === "string" ? new TextEncoder().encode(value) : value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
